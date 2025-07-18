import { useState, useMemo } from "react";
import ChartSection from "./ChartSection";
import { useMarketData } from "./hooks/useMarketData";
import { useDebounce } from "./hooks/useDebounce";

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
    <div className="flex flex-col md:flex-row min-h-screen">
      
      {/* Sidebar: full width on mobile, 1/4 width on md+ */}
      <div className="w-full md:w-1/4 bg-white p-4 shadow-md">
        <h1 className="text-xl font-bold mb-4">EV Charging Setup</h1>
        
        <div className="mb-4">
          <label className="block mb-1" htmlFor="currentCharge">
            Current Charge Level (%)
          </label>
          <input
            id="currentCharge"
            type="number"
            placeholder="e.g., 30"
            className="w-full border rounded p-2"
            value={currentCharge}
            onChange={(e) => setCurrentCharge(Number(e.target.value))}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1" htmlFor="willingToPay">
            Willing to Pay (c/kWh)
          </label>
          <input
            id="willingToPay"
            type="number"
            placeholder="e.g., 30"
            className="w-full border rounded p-2"
            value={willingToPay}
            onChange={(e) => setWillingToPay(Number(e.target.value))}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1" htmlFor="networkCosts">
            Network Costs (c/kWh)
          </label>
          <input
            id="networkCosts"
            type="number"
            placeholder="e.g., 10"
            className="w-full border rounded p-2"
            value={networkCosts}
            onChange={(e) => setNetworkCosts(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Chart Area: grows to fill remaining space */}
      <div className="flex-1 p-4">
        <h2 className="text-lg font-semibold mb-4">Cost Overview & Charging Plan</h2>
        
        {/* Loading state with spinner */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading market data...</p>
            </div>
          </div>
        )}

        {/* Error state with retry button */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center justify-between">
              <div>
                <strong>Error:</strong> {error}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
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
      </div>
    </div>
  );
}
