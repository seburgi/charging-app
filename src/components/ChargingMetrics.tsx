import { memo } from 'react';
import Card from './ui/Card';

interface ChargingMetricsProps {
  totalChargingCost: number; // in cents
  totalChargedKwh: number;   // in kWh
}

function ChargingMetrics({ totalChargingCost, totalChargedKwh }: ChargingMetricsProps) {
  return (
    <Card variant="outlined" padding="none" className="mb-4 md:mb-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 p-3 md:p-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-8">
        <div className="flex-1">
          <div className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Total Charging Cost
          </div>
          <div className="text-lg md:text-2xl font-bold text-primary-600 dark:text-white">
            €{(totalChargingCost / 100).toFixed(2)}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Total kWh Charged
          </div>
          <div className="text-lg md:text-2xl font-bold text-secondary-600 dark:text-white">
            {totalChargedKwh.toFixed(2)} kWh
          </div>
        </div>
      </div>
    </Card>
  );
}

export default memo(ChargingMetrics);