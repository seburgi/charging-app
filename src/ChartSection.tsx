import { useState } from "react";
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

import { MarketItem } from "./types/market";
import { useChargingCalculation } from "./hooks/useChargingCalculation";

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
  currentCharge,
  shouldCharge,
  onSetWillingToPay,
}: ChartSectionProps) {
  // View mode: "graph" or "table"
  const [viewMode, setViewMode] = useState<"graph" | "table">("table");

  // Use the charging calculation hook
  const { chartData, totalChargingCost, totalChargedKwh, scenarios } = useChargingCalculation(
    marketData,
    currentCharge,
    networkCosts,
    shouldCharge
  );


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

      {viewMode === "table" && (
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
      )}
    </>
  );
}