import { useState } from "react";
import { MarketItem } from "./types/market";
import { useChargingCalculation } from "./hooks/useChargingCalculation";
import ChartModeToggle, { ViewMode } from "./components/ChartModeToggle";
import PriceChart from "./components/PriceChart";
import ScenarioTable from "./components/ScenarioTable";

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
    <>
      <ChartModeToggle 
        viewMode={viewMode} 
        onViewModeChange={setViewMode} 
      />

      {viewMode === "graph" && (
        <PriceChart 
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
    </>
  );
}