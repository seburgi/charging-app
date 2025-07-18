import { memo } from 'react';
import { ChargingScenario } from "../types/charging";

interface ScenarioTableProps {
  scenarios: ChargingScenario[];
  onPriceClick: (price: number) => void;
}

function ScenarioTable({ scenarios, onPriceClick }: ScenarioTableProps) {
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
              <tr 
                key={idx} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => onPriceClick(row.price)}
              >
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
}

export default memo(ScenarioTable);