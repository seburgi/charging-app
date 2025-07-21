import { useState } from "react";
import { MarketItem } from "./types/market";
import { useChargingCalculation } from "./hooks/useChargingCalculation";
import ChartModeToggle, { ViewMode } from "./components/ChartModeToggle";
import LazyPriceChart from "./components/LazyPriceChart";
import ScenarioTable from "./components/ScenarioTable";
import Stack from "./components/ui/Stack";
import { useSwipeGesture } from "./hooks/useSwipeGesture";

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
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Use the charging calculation hook
  const { chartData, totalChargingCost, totalChargedKwh, scenarios } = useChargingCalculation(
    marketData,
    currentCharge,
    networkCosts,
    shouldCharge
  );

  // Swipe gesture handlers
  const handleSwipeLeft = () => {
    if (viewMode === "table") {
      setViewMode("graph");
    }
  };

  const handleSwipeRight = () => {
    if (viewMode === "graph") {
      setViewMode("table");
    }
  };

  // Setup swipe gestures
  const swipeRef = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    minSwipeDistance: 80,
  });

  return (
    <Stack gap="sm">
      {/* Chart Mode Toggle */}
      <div className="flex items-center justify-between">
        <ChartModeToggle 
          viewMode={viewMode} 
          onViewModeChange={setViewMode} 
        />
        <div className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
          Swipe left/right to switch views
        </div>
      </div>

      {/* Content Area with Swipe Support */}
      <div ref={swipeRef} className="touch-pan-y">
        {viewMode === "graph" && (
          <LazyPriceChart 
            chartData={chartData}
            totalChargingCost={totalChargingCost}
            totalChargedKwh={totalChargedKwh}
          />
        )}

        {viewMode === "table" && (
          <ScenarioTable 
            scenarios={scenarios}
            onPriceClick={onSetWillingToPay}
          />
        )}
      </div>
    </Stack>
  );
}