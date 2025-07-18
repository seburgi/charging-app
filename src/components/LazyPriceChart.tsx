import { lazy, Suspense } from 'react';
import { ChartDataItem } from "../types/charging";

// Lazy load the PriceChart component
const PriceChart = lazy(() => import('./PriceChart'));

interface LazyPriceChartProps {
  chartData: ChartDataItem[];
  totalChargingCost: number;
  totalChargedKwh: number;
}

export default function LazyPriceChart(props: LazyPriceChartProps) {
  return (
    <Suspense fallback={
      <div className="border border-gray-200 p-2 md:p-4 rounded h-[400px] md:h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading chart...</p>
        </div>
      </div>
    }>
      <PriceChart {...props} />
    </Suspense>
  );
}