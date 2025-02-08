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

interface ChartSectionProps {
  marketData: {
    start: number;
    end: number;
    marketPriceCents: number;
  }[];
  networkCosts: number;
  willingToPay: number;
  currentCharge: number;
  shouldCharge: (marketPriceCents: number) => boolean;
}

// Tesla Model Y assumptions
const MAX_BATTERY_CAPACITY = 75; // kWh
const CHARGING_RATE_KWH_PER_HOUR = 11; // e.g., 11kW

/**
 * Renders a bar chart for cost plus a line for battery SoC,
 * including partial-hour calculation for the current hour.
 */
export default function ChartSection({
  marketData,
  networkCosts,
  willingToPay,
  currentCharge,
  shouldCharge,
}: ChartSectionProps) {
  // Calculate initial battery level in kWh from the currentCharge (%)
  let batteryLevel = (Number(currentCharge) / 100) * MAX_BATTERY_CAPACITY;
  const now = Date.now();

  // Ensure data is sorted chronologically
  const sortedData = [...marketData].sort((a, b) => a.start - b.start);

  // Build our "chartData" array for Recharts
  const chartData = sortedData.map((item) => {
    const date = new Date(item.start);
    const hourLabel = date.getHours().toString().padStart(2, "0") + ":00";

    const pricePerKwh = item.marketPriceCents;
    const totalCost = pricePerKwh + Number(networkCosts);

    // Figure out if this hour is "currently in progress"
    // e.g., item.start <= now < item.end
    const isCurrentHour = item.start <= now && now < item.end;

    // If it's the current hour, compute how many minutes remain
    let minutesOfHourRemaining = 60.0;
    if (isCurrentHour) {
      minutesOfHourRemaining = (item.end - now) / 1000 / 60;
    }

    // We'll treat an hour as "past" if (start + 30mins) is still < now
    // so that around the half, we consider it functionally past. You can tweak this logic if you want.
    const halfHourIntoThisSlot = new Date(item.start).setMinutes(date.getMinutes() + 30);
    const isPast = halfHourIntoThisSlot < now;

    // For each slot, we keep the batterySoC before we add any new charge
    // so the chart shows the SoC "entering" that hour.
    const batterySoC = (batteryLevel / MAX_BATTERY_CAPACITY) * 100;

    // Decide if we charge in this hour (or partial hour) if not past.
    let charging = false;
    if (!isPast) {
      // e.g., partial hour charging: 11 kWh/h => (11/60) kWh per minute
      // available minutes => canCharge
      const spaceLeft = MAX_BATTERY_CAPACITY - batteryLevel;
      const canCharge = Math.min(
        spaceLeft,
        (CHARGING_RATE_KWH_PER_HOUR / 60.0) * minutesOfHourRemaining
      );

      charging = shouldCharge(pricePerKwh) && canCharge > 0;
      if (charging) {
        batteryLevel += canCharge;
      }
    }

    // Decide bar color:
    // Gray for past hours, green if charging, orange if not (future).
    let barColor = "#ccc"; 
    if (!isPast) {
      barColor = charging ? "#80ef80" : "#ffb27f";
    }

    return {
      hour: hourLabel,
      totalCostCents: totalCost,
      charging,
      batterySoC,   // SoC at start of this hour slot
      barColor,
    };
  });

  // A custom shape to color each bar individually based on "barColor"
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

  return (
    <div className="border border-gray-200 p-4 rounded h-[600px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          {/* Grid, axes, etc. */}
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

          {/* Y-axis for Battery SoC (%) */}
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
                return [`${parseFloat(value as string).toFixed(2)}%`, name];
              } else {
                // e.g. cost
                return [`${parseFloat(value as string).toFixed(2)} c/kWh`, name];
              }
            }}
          />
          <Legend />

          {/* Bar for totalCostCents (left Y-axis) */}
          <Bar
            dataKey="totalCostCents"
            yAxisId="left"
            name="Cost (cents/kWh)"
            shape={<CustomBar />}
          >
            <LabelList
              dataKey="totalCostCents"
              position="top"
              formatter={(value: number) => `${value.toFixed(2)}`}
            />
          </Bar>

          {/* Line for batterySoC (right Y-axis) */}
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
