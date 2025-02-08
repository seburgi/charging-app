import React from "react";
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
} from "recharts";

const MAX_BATTERY_CAPACITY = 75; // kWh
const CHARGING_RATE_KWH_PER_HOUR = 11; // kW AC, for example

export default function ChartSection({
  marketData,
  networkCosts,
  willingToPay,
  currentCharge,
  shouldCharge,
}) {
  // The battery’s starting capacity in kWh based on currentCharge%
  let batteryLevel = (Number(currentCharge) / 100) * MAX_BATTERY_CAPACITY;

  // For convenience, get the current time (in ms)
  const now = Date.now();

  // Sort market data by timestamp if not already sorted
  const sortedData = [...marketData].sort((a, b) => a.start - b.start);

  const chartData = sortedData.map((item) => {
    const date = new Date(item.start);
    const hourLabel = date.getHours().toString().padStart(2, "0") + ":00";

    const pricePerKwh = item.marketPriceCents; // from your fetch
    const totalCost = pricePerKwh + Number(networkCosts);

    // Check if this hour is in the past
    const isPast = item.start < now;

    let newBatteryLevel = batteryLevel;
    let charging = false;
    let batterySoC = null; // We'll keep SoC null if it's in the past

    // If it's future (or current hour), we apply charging logic
    if (!isPast) {
      charging = shouldCharge(pricePerKwh);
      if (charging) {
        const spaceLeft = MAX_BATTERY_CAPACITY - batteryLevel;
        const canCharge = Math.min(spaceLeft, CHARGING_RATE_KWH_PER_HOUR);
        newBatteryLevel += canCharge;
      }
      // Convert batteryLevel to 0–100 for SoC
      batterySoC = (newBatteryLevel / MAX_BATTERY_CAPACITY) * 100;
    }

    // Update batteryLevel for next iteration
    batteryLevel = newBatteryLevel;

    // Bar color logic
    // - Gray for past
    // - Green if charging (future)
    // - Orange if not charging (future)
    let barColor = "#ccc"; // default for past
    if (!isPast) {
      barColor = charging ? "#80ef80" : "#ffb27f";
    }

    return {
      hour: hourLabel,
      totalCostCents: totalCost,
      charging,
      batterySoC,
      barColor,
    };
  });

  return (
    <div className="border border-gray-200 p-4 rounded h-[600px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          
          {/* Y-axis for cost */}
          <YAxis
            yAxisId="left"
            label={{
              value: "Cost (cents/kWh)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          
          {/* Y-axis for SoC (%) */}
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

          <Tooltip />
          <Legend />

          {/* The Bar for cost, referencing "left" axis */}
          <Bar
            dataKey="totalCostCents"
            yAxisId="left"
            name="Cost (cents/kWh)"
            // Use a custom shape so we can color each bar individually
            shape={(props) => {
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
            }}
          />

          {/* The Line for Battery SoC, referencing "right" axis */}
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
