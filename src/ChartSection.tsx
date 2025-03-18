import React, { useState, useEffect } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";

/**
 * Interface for the market data items
 */
interface MarketItem {
  start: number;            // start timestamp in ms
  end: number;              // end timestamp in ms
  marketPriceCents: number; // cost in cents/kWh (converted from EUR/MWh)
}

/**
 * Props for ChartSection
 */
interface ChartSectionProps {
  marketData: MarketItem[];
  networkCosts: number;    // c/kWh
  willingToPay: number;    // c/kWh
  currentCharge: number;   // in %
  shouldCharge: (marketPriceCents: number) => boolean;
  onSetWillingToPay: (price: number) => void;
}

// Example Tesla Model Y specs
const MAX_BATTERY_CAPACITY = 75; // kWh
const CHARGING_RATE_KWH_PER_HOUR = 11; // typical AC charger

/**
 * A custom shape component to color each bar individually
 * based on the `barColor` property in the data object.
 */
const CustomBar = (props: any) => {
  const { x, y, width, height, payload } = props;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={payload.barColor}
    />
  );
};

/**
 * Main ChartSection component
 */
export default function ChartSection({
  marketData,
  networkCosts,
  willingToPay,
  currentCharge,
  shouldCharge,
  onSetWillingToPay,
}: ChartSectionProps) {
  // We'll store the final chart data for Recharts
  const [chartData, setChartData] = useState<any[]>([]);

  // We'll also track total cost of all charging (in cents)
  const [totalChargingCost, setTotalChargingCost] = useState(0);

  // We'll track total kWh charged as well
  const [totalChargedKwh, setTotalChargedKwh] = useState(0);

  // View mode: "graph" or "table"
  const [viewMode, setViewMode] = useState<"graph" | "table">("table");

  useEffect(() => {
    // 1. Sort the data by start timestamp
    const sorted = [...marketData].sort((a, b) => a.start - b.start);

    // 2. Track the battery (in kWh) and a running cost (in cents),
    //    plus how many total kWh we've charged.
    let batteryLevel = (currentCharge / 100) * MAX_BATTERY_CAPACITY; // kWh
    let runningCost = 0;        // cents
    let runningKwh = 0;         // kWh
    const now = Date.now();

    // Build up the new chart data
    const newChartData = sorted.map((item) => {
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
      let barColor = "#ccc";
      if (!isPast) {
        barColor = charging ? "#80ef80" : "#ffb27f";
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

    // Update states
    setChartData(newChartData);
    setTotalChargingCost(runningCost);
    setTotalChargedKwh(runningKwh);

  }, [marketData, currentCharge, networkCosts, shouldCharge]);

  // 3. Render the chart and display the total cost and total kWh
  return (
    <>
      <div className="mb-4">
        <button
          className={`mr-2 px-3 py-1 border rounded ${viewMode === 'table' ? 'bg-blue-200' : 'bg-white'}`}
          onClick={() => setViewMode('table')}
        >
          Table Mode
        </button>
        <button
          className={`px-3 py-1 border rounded ${viewMode === 'graph' ? 'bg-blue-200' : 'bg-white'}`}
          onClick={() => setViewMode('graph')}
        >
          Graph Mode
        </button>
      </div>

      {viewMode === "graph" && (
        <div className="border border-gray-200 p-2 md:p-4 rounded h-[400px] md:h-[600px]">
          {/* Display total charging cost (converted from cents to euros),
              plus total kWh charged */}
          <div className="mb-4 font-semibold text-gray-700 text-base md:text-lg">
            Total Charging Cost (until full or end of timeline):{" "}
            {(totalChargingCost / 100).toFixed(2)} € 
            {" — "}
            Total kWh Charged: {totalChargedKwh.toFixed(2)} kWh
          </div>

          <ResponsiveContainer width="100%" height="90%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />

              {/* Y-axis for cost in c/kWh */}
              <YAxis
                yAxisId="left"
                label={{
                  value: "Cost (c/kWh)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />

              {/* Y-axis for Battery SoC in % */}
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                label={{
                  value: "Battery SoC (%)",
                  angle: -90,
                  position: "insideRight",
                }}
              />

              <Tooltip
                formatter={(value, name) => {
                  if (name === "State of Charge (%)") {
                    return [`${parseFloat(value as string).toFixed(2)}%`, name];
                  }
                  // Otherwise, treat as cost
                  return [`${parseFloat(value as string).toFixed(2)} c/kWh`, name];
                }}
              />
              <Legend />

              {/* Bars: show totalCostCents on the left axis */}
              <Bar
                dataKey="totalCostCents"
                yAxisId="left"
                name="Cost (c/kWh)"
                shape={<CustomBar />}  // Uses our custom shape for per-bar coloring
              >
                <LabelList
                  dataKey="totalCostCents"
                  position="top"
                  formatter={(val: number) => `${val.toFixed(2)}`}
                />
              </Bar>

              {/* SoC line on the right axis */}
              <Line
                dataKey="batterySoC"
                yAxisId="right"
                name="State of Charge (%)"
                stroke="#8884d8"
                strokeWidth={2}
                dot={false}
                type="monotone"
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {viewMode === "table" && (() => {
        // 1) A helper function that simulates partial-hour charging under a given “thresholdPrice”
        function computeChargeScenario(
          thresholdPrice: number,
          sortedData: typeof chartData,
          initialSoC: number,
          nowTime: number
        ) {
          let batteryLevelKwh = (initialSoC / 100) * MAX_BATTERY_CAPACITY;
          let runningCost = 0;
          let stopTime: Date | null = null;

          for (const item of sortedData) {
            const costPerKwh = item.totalCostCents;
            const slotStart = item.start;
            const slotEnd = item.end;

            const dateObj = new Date(slotStart);
            let minutesRemaining = 60.0;
            if (slotStart <= nowTime && nowTime < slotEnd) {
              minutesRemaining = (slotEnd - nowTime) / (1000 * 60);
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
                // Record each charge event’s “stopTime” as this slot’s end
                stopTime = slotEnd;
                //console.log(slotStart, slotEnd, batteryLevelKwh, runningCost);

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
            console.log(stopTime);
            const msDiff = stopTime.getTime() - nowTime;
            const hrDiff = msDiff / 3_600_000;
            hoursUntilStop = hrDiff > 0 ? hrDiff.toFixed(2) : "0.00";

            hoursUntilStop = hoursUntilStop + " (" + stopTime.toLocaleTimeString() + ")";
          } else {
            // Fallback: no recorded stop time if partial calculations ended
            hoursUntilStop = "0.00";
          }

          return {
            finalSoC,
            totalCost: runningCost,
            hoursUntilStop,
          };
        }

        // 2) Get unique ascending list of totalCostCents from chartData
        const uniquePrices = Array.from(new Set(chartData.map((d) => d.totalCostCents))).sort(
          (a, b) => a - b
        );

        // 3) Compute scenario for each unique price
        const scenarios = uniquePrices.map((price) => {
          const result = computeChargeScenario(price, chartData, currentCharge, Date.now());
          return {
            price,
            finalSoC: result.finalSoC,
            hoursUntilStop: result.hoursUntilStop,
            totalCost: result.totalCost / 100.0,
          };
        });

        return (
          <div className="border border-gray-200 p-2 md:p-4 rounded h-[400px] md:h-[600px]">
            <div className="mb-4 font-semibold text-gray-700 text-base md:text-lg">
              <p>Table Mode - Compare Different Price Thresholds</p>
            </div>
            <div className="overflow-auto max-h-full">
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="px-2 py-1 text-left">Price (c/kWh)</th>
                    <th className="px-2 py-1 text-left">Final SoC (%)</th>
                    <th className="px-2 py-1 text-left">Time Until Stop (hrs)</th>
                    <th className="px-2 py-1 text-left">Total Cost (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50"
                      onClick={() => onSetWillingToPay(row.price)}>
                      <td className="px-2 py-1">{row.price.toFixed(2)}</td>
                      <td className="px-2 py-1">{row.finalSoC.toFixed(2)}</td>
                      <td className="px-2 py-1">{row.hoursUntilStop}</td>
                      <td className="px-2 py-1">{row.totalCost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </>
  );
}