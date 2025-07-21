import { memo } from 'react';
import Card from './ui/Card';
import { ChargingScenario } from "../types/charging";

interface ScenarioTableProps {
  scenarios: ChargingScenario[];
  onPriceClick: (price: number) => void;
}

function ScenarioTable({ scenarios, onPriceClick }: ScenarioTableProps) {
  return (
    <Card variant="outlined" padding="none" className="flex flex-col h-[400px] md:h-[600px] p-3 md:p-6">
      <div className="mb-4 md:mb-6 flex-shrink-0">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-1 md:mb-2">
          💡 Compare Different Price Thresholds
        </h3>
        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
          Click any row to select that price threshold
        </p>
      </div>
      <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs md:text-sm">
                <span className="hidden md:inline">Price (c/kWh)</span><span className="md:hidden">Price</span>
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs md:text-sm">
                <span className="hidden md:inline">Final SoC (%)</span><span className="md:hidden">SoC (%)</span>
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs md:text-sm">
                <span className="hidden md:inline">Time Until Stop</span><span className="md:hidden">Time</span>
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs md:text-sm">
                <span className="hidden md:inline">Total Cost (€)</span><span className="md:hidden">Cost (€)</span>
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
                  active:bg-primary-100 dark:active:bg-primary-900/40
                  cursor-pointer transition-colors duration-150
                  touch-manipulation select-none
                "
                onClick={() => {
                  // Haptic feedback on row selection
                  if ('vibrate' in navigator) {
                    navigator.vibrate(30);
                  }
                  onPriceClick(row.price);
                }}
              >
                <td className="px-2 md:px-4 py-3 md:py-3 font-medium text-gray-900 dark:text-white text-xs md:text-sm">
                  {row.price.toFixed(2)}
                </td>
                <td className="px-2 md:px-4 py-3 md:py-3 text-gray-700 dark:text-gray-300 text-xs md:text-sm">
                  {row.finalSoC.toFixed(2)}%
                </td>
                <td className="px-2 md:px-4 py-3 md:py-3 text-gray-700 dark:text-gray-300 text-xs md:text-sm">
                  {row.hoursUntilStop}
                </td>
                <td className="px-2 md:px-4 py-3 md:py-3 font-medium text-secondary-600 dark:text-white text-xs md:text-sm">
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