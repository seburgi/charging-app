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
  LabelList,
} from "recharts";

const MAX_BATTERY_CAPACITY = 75; // kWh
const CHARGING_RATE_KWH_PER_HOUR = 11; // e.g., 11kW

export default function ChartSection({
  marketData,
  networkCosts,
  willingToPay,
  currentCharge,
  shouldCharge,
}) {
  let batteryLevel = (Number(currentCharge) / 100) * MAX_BATTERY_CAPACITY;
  const now = Date.now();

  // Ensure data is sorted
  const sortedData = [...marketData].sort((a, b) => a.start - b.start);

  const chartData = sortedData.map((item) => {
    const date = new Date(item.start);
    const hourLabel = date.getHours().toString().padStart(2, "0") + ":00";
    const pricePerKwh = item.marketPriceCents; 
    const totalCost = pricePerKwh + Number(networkCosts);

    let isCurrentHour = item.start <= now && now < item.end;
    let minutesOfHourRemaining = 60.0;
    if(isCurrentHour) {
      minutesOfHourRemaining = (item.end - now) / 1000.0 / 60.0;
    }

    // Should I consider this hour as past?
    let d = new Date(item.start).setMinutes(date.getMinutes() + 30);
    const isPast = d < now;

    // Default: no charging or SoC for past hours
    // let newBatteryLevel = batteryLevel;
    let charging = false;
    let batterySoC = (batteryLevel / MAX_BATTERY_CAPACITY) * 100;

    if (!isPast) {
      const spaceLeft = MAX_BATTERY_CAPACITY - batteryLevel;
      const canCharge = Math.min(spaceLeft, CHARGING_RATE_KWH_PER_HOUR / 60.0 * minutesOfHourRemaining);

      charging = shouldCharge(pricePerKwh) && canCharge > 0;
      if (charging) {
        batteryLevel += canCharge;
      }
    }

    // batteryLevel = newBatteryLevel;

    // Bar color logic
    let barColor = "#ccc"; // gray for past
    if (!isPast) {
      barColor = charging ? "#80ef80" : "#ffb27f"; // green if charging, orange if not
    }

    return {
      hour: hourLabel,
      totalCostCents: totalCost,
      charging,
      batterySoC,
      barColor,
    };
  });

  // A custom shape to color each bar individually
  const CustomBar = (props) => {
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

          <Tooltip
            formatter={(value, name) => {
              if (name === "State of Charge (%)") {
                // Round to 2 decimals, add a "%"
                return [`${parseFloat(value).toFixed(2)}%`, name];
              } else {
                // e.g. cost
                return [`${parseFloat(value).toFixed(2)} cents/kWh`, name];
              }
            }}
          />
          <Legend />

          <Bar
            dataKey="totalCostCents"
            yAxisId="left"
            name="Cost (cents/kWh)"
            shape={<CustomBar />}
          >
            <LabelList
                dataKey="totalCostCents"
                position="top"
                formatter={(value) => `${value.toFixed(2)}`}
            />
          </Bar>

          {/* LINE for SoC */}
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
