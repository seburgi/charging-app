import { useState } from "react";
import { MarketItem } from "./types/market";
import { useChargingCalculation } from "./hooks/useChargingCalculation";
import ChartModeToggle, { ViewMode } from "./components/ChartModeToggle";
import LazyPriceChart from "./components/LazyPriceChart";
import ScenarioTable from "./components/ScenarioTable";
import Stack from "./components/ui/Stack";
import Divider from "./components/ui/Divider";

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


  return (
    <Stack gap="sm">
      {/* Chart Mode Toggle */}
      <ChartModeToggle 
        viewMode={viewMode} 
        onViewModeChange={setViewMode} 
      />

      {/* Content Area */}
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
    </Stack>
  );
}