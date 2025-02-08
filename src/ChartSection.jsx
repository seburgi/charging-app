import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// For simplicity, let’s assume Tesla Model Y battery is around 75 kWh.
// We'll do a naive "if we decide to charge, we add up to X kWh in that hour" approach.
// More advanced logic can incorporate actual charging curves.
const MAX_BATTERY_CAPACITY = 75;
const CHARGING_RATE_KWH_PER_HOUR = 11; 
// e.g., 11 kW 3-phase home charger. Adjust as needed.

export default function ChartSection({
  marketData,
  networkCosts,
  willingToPay,
  currentCharge,
  shouldCharge,
}) {
  // Let's track how many kWh we have in the battery at each hour.
  // Start with "currentCharge" % of 75 kWh. 
  let batteryLevel = (Number(currentCharge) / 100) * MAX_BATTERY_CAPACITY;

  // Create a new array to pass to Recharts. We’ll accumulate data hour by hour.
  const chartData = marketData.map((item) => {
    // Convert timestamp to local hour string for the X-axis:
    const date = new Date(item.start);
    const hourLabel = date.getHours().toString().padStart(2, "0") + ":00";

    // Market price in cents
    const pricePerKwh = item.marketPriceCents;
    const totalCost = pricePerKwh + Number(networkCosts);

    // Decide if we charge:
    const charging = shouldCharge(pricePerKwh);

    // If we charge, add up to CHARGING_RATE_KWH_PER_HOUR
    // but don't exceed full battery (75 kWh).
    let newBatteryLevel = batteryLevel;
    if (charging) {
      const spaceLeft = MAX_BATTERY_CAPACITY - batteryLevel;
      const canCharge = Math.min(spaceLeft, CHARGING_RATE_KWH_PER_HOUR);
      newBatteryLevel += canCharge;
    }

    // Prepare data for the chart
    const dataPoint = {
      hour: hourLabel,
      marketPriceCents: pricePerKwh,
      totalCostCents: totalCost,
      charging, // we’ll use this to color the bar
      batteryLevelAfter: newBatteryLevel,
    };

    // Update the batteryLevel for the next iteration
    batteryLevel = newBatteryLevel;

    return dataPoint;
  });

  // Now we can render a bar chart of the "totalCostCents" with dynamic colors.
  // We'll show the X-axis as hours, Y-axis as cost in cents.
  return (
    <div className="border border-gray-200 p-4 rounded h-[600px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="totalCostCents"
            name="Cost (cents/kWh)"
            // We'll dynamically color the bar based on "charging" property
            fill="#8884d8"
            // Provide a function that sets color
            fillOpacity={1}
            shape={(props) => {
              const { x, y, width, height, payload } = props;
              const barColor = payload.charging ? "#80ef80" : "#ffb27f"; 
              // green if charging, orange if not
              return <rect x={x} y={y} width={width} height={height} fill={barColor} />;
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
