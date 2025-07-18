import { useState, useMemo } from "react";
import ChartSection from "./ChartSection";
import { useMarketData } from "./hooks/useMarketData";
import { useDebounce } from "./hooks/useDebounce";
import Card from "./components/ui/Card";
import Input from "./components/ui/Input";
import Button from "./components/ui/Button";
import Logo from "./components/ui/Logo";
import ThemeToggle from "./components/ui/ThemeToggle";

/**
 * Main application component. Holds state for user inputs, fetches market data,
 * and renders the sidebar plus the ChartSection.
 */
export default function App() {
  // -- State for user inputs --
  const [currentCharge, setCurrentCharge] = useState(20);    // in %
  const [willingToPay, setWillingToPay] = useState(5);      // in Euro cents/kWh
  const [networkCosts, setNetworkCosts] = useState(0);      // in Euro cents/kWh

  // -- Debounce user inputs to prevent excessive recalculations --
  const debouncedCurrentCharge = useDebounce(currentCharge, 300);
  const debouncedWillingToPay = useDebounce(willingToPay, 300);
  const debouncedNetworkCosts = useDebounce(networkCosts, 300);

  // -- Fetch market data using custom hook --
  const { marketData, isLoading, error } = useMarketData();

  // This function determines whether we'll charge in a given hour
  // based on total cost (market price + network costs) vs. willingToPay.
  // Memoize this function to prevent unnecessary re-renders
  const shouldCharge = useMemo(() => {
    return (marketPriceCents: number) => {
      const totalCost = marketPriceCents + Number(debouncedNetworkCosts);
      return totalCost <= Number(debouncedWillingToPay);
    };
  }, [debouncedNetworkCosts, debouncedWillingToPay]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* Sidebar: full width on mobile, 1/4 width on md+ */}
      <div className="w-full md:w-1/4 bg-white dark:bg-gray-800 p-6 shadow-lg border-r dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <Logo size="md" />
          <ThemeToggle />
        </div>
        <h1 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">EV Charging Setup</h1>
        
        <div className="mb-6">
          <Input
            id="currentCharge"
            type="number"
            label="Current Charge Level (%)"
            placeholder="e.g., 30"
            value={currentCharge}
            onChange={(e) => setCurrentCharge(Number(e.target.value))}
            min="0"
            max="100"
            helperText="Enter your current battery charge percentage"
          />
        </div>

        <div className="mb-6">
          <Input
            id="willingToPay"
            type="number"
            label="Willing to Pay (c/kWh)"
            placeholder="e.g., 30"
            value={willingToPay}
            onChange={(e) => setWillingToPay(Number(e.target.value))}
            min="0"
            helperText="Maximum price you're willing to pay for charging"
          />
        </div>

        <div className="mb-6">
          <Input
            id="networkCosts"
            type="number"
            label="Network Costs (c/kWh)"
            placeholder="e.g., 10"
            value={networkCosts}
            onChange={(e) => setNetworkCosts(Number(e.target.value))}
            min="0"
            helperText="Additional network/grid costs per kWh"
          />
        </div>
      </div>

      {/* Chart Area: grows to fill remaining space */}
      <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
        <Card variant="elevated" padding="lg" className="h-full">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Cost Overview & Charging Plan</h2>
          
          {/* Loading state with spinner */}
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading market data...</p>
              </div>
            </div>
          )}

          {/* Error state with retry button */}
          {error && (
            <Card variant="outlined" padding="md" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-red-800 dark:text-red-200">Error:</strong>{' '}
                  <span className="text-red-700 dark:text-red-300">{error}</span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                >
                  Retry
                </Button>
              </div>
            </Card>
          )}

          {/* Chart section - only render when data is available */}
          {!isLoading && !error && (
            <ChartSection
              marketData={marketData}
              networkCosts={debouncedNetworkCosts}
              willingToPay={debouncedWillingToPay}
              currentCharge={debouncedCurrentCharge}
              shouldCharge={shouldCharge}
              onSetWillingToPay={(price) => setWillingToPay(price)}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
