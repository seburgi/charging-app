import { memo } from 'react';
import Card from './ui/Card';
import { ChargingScenario } from "../types/charging";

interface ScenarioTableProps {
  scenarios: ChargingScenario[];
  onPriceClick: (price: number) => void;
}

function ScenarioTable({ scenarios, onPriceClick }: ScenarioTableProps) {
  return (
    <Card variant="outlined" padding="lg" className="flex flex-col h-[400px] md:h-[600px]">
      <div className="mb-6 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          💡 Compare Different Price Thresholds
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Click any row to select that price threshold
        </p>
      </div>
      <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Price (c/kWh)
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Final SoC (%)
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Time Until Stop
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Total Cost (€)
              </th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((row, idx) => (
              <tr 
                key={idx} 
                className="
                  border-b border-gray-100 dark:border-gray-700 
                  hover:bg-primary-50 dark:hover:bg-primary-900/20 
                  cursor-pointer transition-colors duration-150
                "
                onClick={() => onPriceClick(row.price)}
              >
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                  {row.price.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {row.finalSoC.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {row.hoursUntilStop}
                </td>
                <td className="px-4 py-3 font-medium text-secondary-600 dark:text-secondary-400">
                  €{row.totalCost.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default memo(ScenarioTable);