import { memo } from 'react';
import Card from './ui/Card';
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
import { ChartDataItem } from "../types/charging";
import ChargingMetrics from "./ChargingMetrics";

interface PriceChartProps {
  chartData: ChartDataItem[];
  totalChargingCost: number;
  totalChargedKwh: number;
}

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

function PriceChart({ chartData, totalChargingCost, totalChargedKwh }: PriceChartProps) {
  return (
    <div className="space-y-6">
      <ChargingMetrics 
        totalChargingCost={totalChargingCost}
        totalChargedKwh={totalChargedKwh}
      />

      <Card variant="outlined" padding="none" className="h-[400px] md:h-[600px] p-2 md:p-4">
        <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 15, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" tick={{ fontSize: 12 }} />

          {/* Y-axis for cost in c/kWh */}
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            label={{
              value: "Cost (c/kWh)",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: 'middle', fontSize: '12px' }
            }}
          />

          {/* Y-axis for Battery SoC in % */}
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            label={{
              value: "Battery SoC (%)",
              angle: -90,
              position: "insideRight",
              style: { textAnchor: 'middle', fontSize: '12px' }
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
            shape={<CustomBar />}
          >
            <LabelList
              dataKey="totalCostCents"
              position="top"
              formatter={(val: number) => `${val.toFixed(2)}`}
              className="hidden md:block"
              style={{ fontSize: '10px' }}
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
      </Card>
    </div>
  );
}

export default memo(PriceChart);