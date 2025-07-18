import { useState, useEffect, useMemo } from 'react';
import { MarketItem } from '../types/market';
import { 
  ChargingCalculationParams, 
  ChargingCalculationResult, 
  ChartDataItem, 
  ChargingScenario,
  UseChargingCalculationReturn,
  MAX_BATTERY_CAPACITY,
  CHARGING_RATE_KWH_PER_HOUR,
  CHART_COLORS
} from '../types/charging';

function calculateChargingData(params: ChargingCalculationParams): ChargingCalculationResult {
  const { marketData, currentCharge, networkCosts, shouldCharge } = params;
  
  // Sort the data by start timestamp
  const sorted = [...marketData].sort((a, b) => a.start - b.start);

  // Track the battery (in kWh) and a running cost (in cents),
  // plus how many total kWh we've charged.
  let batteryLevel = (currentCharge / 100) * MAX_BATTERY_CAPACITY; // kWh
  let runningCost = 0;        // cents
  let runningKwh = 0;         // kWh
  const now = Date.now();

  // Build up the new chart data
  const chartData: ChartDataItem[] = sorted.map((item) => {
    // Build an hour label like "03:00"
    const date = new Date(item.start);
    const hourLabel = date.getHours().toString().padStart(2, "0") + ":00";

    // Combined cost = (market price + network cost) in c/kWh
    const costPerKwh = item.marketPriceCents + networkCosts;

    // Partial-hour logic:
    // If we're currently in this hour, only charge for the remaining minutes
    let minutesRemaining = 60.0;
    if (item.start <= now && now < item.end) {
      minutesRemaining = (item.end - now) / (1000 * 60);
    }

    // Past vs future logic:
    // We'll treat it as "past" if half the hour has passed
    const halfHourMark = new Date(item.start).setMinutes(date.getMinutes() + 30);
    const isPast = halfHourMark < now;

    // SoC before charging
    const batterySoC = (batteryLevel / MAX_BATTERY_CAPACITY) * 100;

    // Decide if we charge
    let charging = false;
    let chargedKwh = 0;

    // If battery isn't full and it's not "completely past"
    if (batteryLevel < MAX_BATTERY_CAPACITY && !isPast) {
      // 11 kW => 11/60 kWh per minute => multiply by minutesRemaining
      const spaceLeft = MAX_BATTERY_CAPACITY - batteryLevel;
      const possibleKwh = (CHARGING_RATE_KWH_PER_HOUR / 60) * minutesRemaining;

      if (shouldCharge(item.marketPriceCents)) {
        charging = true;
        chargedKwh = Math.min(spaceLeft, possibleKwh);
        batteryLevel += chargedKwh;

        // Accumulate cost: chargedKwh × costPerKwh
        runningCost += chargedKwh * costPerKwh;

        // Accumulate kWh
        runningKwh += chargedKwh;
      }
    }

    // Bar color logic: gray if past, otherwise green if charging, orange if not
    let barColor = CHART_COLORS.PAST;
    if (!isPast) {
      barColor = charging ? CHART_COLORS.CHARGING : CHART_COLORS.NOT_CHARGING;
    }

    return {
      start: new Date(item.start),
      end: new Date(item.end),
      hour: hourLabel,
      totalCostCents: costPerKwh, // cost in c/kWh for the bar height
      charging,
      batterySoC,                // SoC at the start of this slot
      chargedKwh,
      barColor,
    };
  });

  return {
    chartData,
    totalChargingCost: runningCost,
    totalChargedKwh: runningKwh,
  };
}

function computeChargeScenario(
  thresholdPrice: number,
  sortedData: ChartDataItem[],
  initialSoC: number,
  nowTime: number
): ChargingScenario {
  let batteryLevelKwh = (initialSoC / 100) * MAX_BATTERY_CAPACITY;
  let runningCost = 0;
  let stopTime: Date | null = null;

  for (const item of sortedData) {
    const costPerKwh = item.totalCostCents;
    const slotStart = item.start;
    const slotEnd = item.end;

    const dateObj = new Date(slotStart);
    let minutesRemaining = 60.0;
    if (slotStart.getTime() <= nowTime && nowTime < slotEnd.getTime()) {
      minutesRemaining = (slotEnd.getTime() - nowTime) / (1000 * 60);
    }
    const halfHourMark = new Date(slotStart).setMinutes(dateObj.getMinutes() + 30);
    const isPast = halfHourMark < nowTime;

    // If already full, stop the loop.
    if (batteryLevelKwh >= MAX_BATTERY_CAPACITY) {
      break;
    }

    // Only charge if cost <= threshold
    if (!isPast && costPerKwh <= thresholdPrice) {
      const spaceLeft = MAX_BATTERY_CAPACITY - batteryLevelKwh;
      const possibleKwh = (CHARGING_RATE_KWH_PER_HOUR / 60) * minutesRemaining;
      const chargedKwh = Math.min(spaceLeft, possibleKwh);

      if (chargedKwh > 0) {
        batteryLevelKwh += chargedKwh;
        runningCost += chargedKwh * costPerKwh;
        // Record each charge event's "stopTime" as this slot's end
        stopTime = slotEnd;

        if (batteryLevelKwh >= MAX_BATTERY_CAPACITY) {
          // We reached 100% mid-slot, but we keep stopTime as the slot end for simplicity.
          break;
        }
      }
    }
  }

  // Final SoC
  const finalSoC = (batteryLevelKwh / MAX_BATTERY_CAPACITY) * 100;

  // If we never started charging => "No charge"
  // Otherwise, compute hours until stop from now
  let hoursUntilStop: string;

  if (stopTime) {
    const msDiff = stopTime.getTime() - nowTime;
    const hrDiff = msDiff / 3_600_000;
    hoursUntilStop = hrDiff > 0 ? hrDiff.toFixed(2) : "0.00";
    hoursUntilStop = hoursUntilStop + " (" + stopTime.toLocaleTimeString() + ")";
  } else {
    // Fallback: no recorded stop time if partial calculations ended
    hoursUntilStop = "0.00";
  }

  return {
    price: thresholdPrice,
    finalSoC,
    totalCost: runningCost / 100.0, // Convert cents to euros
    hoursUntilStop,
  };
}

export function useChargingCalculation(
  marketData: MarketItem[],
  currentCharge: number,
  networkCosts: number,
  shouldCharge: (marketPriceCents: number) => boolean
): UseChargingCalculationReturn {
  const [scenarios, setScenarios] = useState<ChargingScenario[]>([]);

  // Memoize the main charging calculation
  const chargingResult = useMemo(() => {
    if (marketData.length === 0) {
      return {
        chartData: [],
        totalChargingCost: 0,
        totalChargedKwh: 0,
      };
    }

    return calculateChargingData({
      marketData,
      currentCharge,
      networkCosts,
      shouldCharge,
    });
  }, [marketData, currentCharge, networkCosts, shouldCharge]);

  // Memoize scenario calculations
  const memoizedScenarios = useMemo(() => {
    if (chargingResult.chartData.length === 0) return [];

    const uniquePrices = Array.from(
      new Set(chargingResult.chartData.map((d) => d.totalCostCents))
    ).sort((a, b) => a - b);

    return uniquePrices.map((price) => 
      computeChargeScenario(price, chargingResult.chartData, currentCharge, Date.now())
    );
  }, [chargingResult.chartData, currentCharge]);

  // Update scenarios when memoized scenarios change
  useEffect(() => {
    setScenarios(memoizedScenarios);
  }, [memoizedScenarios]);

  return {
    chartData: chargingResult.chartData,
    totalChargingCost: chargingResult.totalChargingCost,
    totalChargedKwh: chargingResult.totalChargedKwh,
    scenarios,
  };
}