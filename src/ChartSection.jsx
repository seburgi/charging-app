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

// Example constants:
const MAX_BATTERY_CAPACITY = 75; // kWh
const CHARGING_RATE_KWH_PER_HOUR = 11; // approximate

export default function ChartSection({
  marketData,
  networkCosts,
  willingToPay,
  currentCharge,
  shouldCharge,
}) {
  let batteryLevel = (Number(currentCharge) / 100) * MAX_BATTERY_CAPACITY;

  // Build data array for the chart
  const chartData = marketData.map((item) => {
    const date = new Date(item.start);
    const hourLabel = date.getHours().toString().padStart(2, "0") + ":00";

    const pricePerKwh = item.marketPriceCents; // from your fetch
    const totalCost = pricePerKwh + Number(networkCosts);

    // Decide whether we charge
    const charging = shouldCharge(pricePerKwh);

    let newBatteryLevel = batteryLevel;
    if (charging) {
      const spaceLeft = MAX_BATTERY_CAPACITY - batteryLevel;
      const canCharge = Math.min(spaceLeft, CHARGING_RATE_KWH_PER_HOUR);
      newBatteryLevel += canCharge;
    }

    // Convert battery level to % for the line
    const batterySoC = (newBatteryLevel / MAX_BATTERY_CAPACITY) * 100;

    const dataPoint = {
      hour: hourLabel,
      totalCostCents: totalCost,   // For the bar
      charging,                    // Whether it's charging or not
      batterySoC: batterySoC,      // For the line (0–100)
    };

    batteryLevel = newBatteryLevel; // Update for next iteration
    return dataPoint;
  });

  // Custom bar shape to color green if charging, orange if not
  const CustomBar = (props) => {
    const { x, y, width, height, payload } = props;
    const barColor = payload.charging ? "#80ef80" : "#ffb27f"; // green or orange
    return <rect x={x} y={y} width={width} height={height} fill={barColor} />;
  };

  return (
    <div className="border border-gray-200 p-4 rounded h-[600px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          
          {/* Y-axis for cost (in cents) */}
          <YAxis
            yAxisId="left"
            label={{ value: "Cost (cents/kWh)", angle: -90, position: "insideLeft" }}
          />

          {/* Y-axis for SoC (%) on the right side */}
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: "Battery SoC (%)", angle: -90, position: "insideRight" }}
            domain={[0, 100]}
          />

          <Tooltip />
          <Legend />

          {/* Bar for cost, using left y-axis */}
          <Bar
            dataKey="totalCostCents"
            name="Cost (cents/kWh)"
            yAxisId="left"
            shape={<CustomBar />}
          />

          {/* Line for SoC, using right y-axis */}
          <Line
            dataKey="batterySoC"
            name="State of Charge (%)"
            yAxisId="right"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
            type="monotone" // makes it a smoothed curve, remove if you want straight segments
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
