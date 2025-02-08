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
}: ChartSectionProps) {
  // We'll store the final chart data for Recharts
  const [chartData, setChartData] = useState<any[]>([]);

  // We'll also track total cost of all charging (in cents)
  const [totalChargingCost, setTotalChargingCost] = useState(0);

  // We'll track total kWh charged as well
  const [totalChargedKwh, setTotalChargedKwh] = useState(0);

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
    <div className="border border-gray-200 p-4 rounded h-[600px]">
      {/* Display total charging cost (converted from cents to euros),
          plus total kWh charged */}
      <div className="mb-4 font-semibold text-gray-700">
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
  );
}