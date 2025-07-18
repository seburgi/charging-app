import { memo } from 'react';
import Card from './ui/Card';

interface ChargingMetricsProps {
  totalChargingCost: number; // in cents
  totalChargedKwh: number;   // in kWh
}

function ChargingMetrics({ totalChargingCost, totalChargedKwh }: ChargingMetricsProps) {
  return (
    <Card variant="outlined" padding="md" className="mb-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Total Charging Cost
          </div>
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            €{(totalChargingCost / 100).toFixed(2)}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Total kWh Charged
          </div>
          <div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
            {totalChargedKwh.toFixed(2)} kWh
          </div>
        </div>
      </div>
    </Card>
  );
}

export default memo(ChargingMetrics);