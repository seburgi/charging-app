import { useState, useMemo } from "react";
import ChartSection from "./ChartSection";
import { useMarketData } from "./hooks/useMarketData";
import { useDebounce } from "./hooks/useDebounce";
import Card from "./components/ui/Card";
import Input from "./components/ui/Input";
import Button from "./components/ui/Button";
import Logo from "./components/ui/Logo";
import ThemeToggle from "./components/ui/ThemeToggle";
import Container from "./components/ui/Container";
import Stack from "./components/ui/Stack";
import Section from "./components/ui/Section";
import Divider from "./components/ui/Divider";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar: full width on mobile, fixed width on lg+ */}
        <aside className="w-full lg:w-80 xl:w-96 bg-white dark:bg-gray-800 shadow-xl lg:border-r dark:border-gray-700 lg:shadow-none border-b lg:border-b-0">
          <Container padding="md">
            <Stack gap="md lg:gap-lg">
              {/* Header */}
              <Stack direction="horizontal" justify="between" align="center">
                <Logo size="md" />
                <ThemeToggle />
              </Stack>
              
              <Divider spacing="none" />
              
              {/* Configuration Section */}
              <Section 
                title="Configuration" 
                subtitle="Set your charging preferences"
                spacing="none"
                headerSpacing="md"
                className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4"
              >
        
                <Stack gap="lg">
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
                </Stack>
              </Section>
            </Stack>
          </Container>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          <Container maxWidth="7xl" padding="md" className="h-full">
            <Section 
              title="Cost Overview & Charging Plan" 
              subtitle="Optimize your EV charging schedule based on real-time market data"
              spacing="none"
              headerSpacing="lg"
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <Stack gap="lg">
                {/* Loading state with spinner */}
                {isLoading && (
                  <Card variant="elevated" padding="lg" className="text-center">
                    <Stack gap="md" align="center">
                      <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-primary-500"></div>
                      <Stack gap="sm" align="center">
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                          Loading Market Data
                        </h3>
                        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                          Fetching the latest electricity prices...
                        </p>
                      </Stack>
                    </Stack>
                  </Card>
                )}

                {/* Error state with retry button */}
                {error && (
                  <Card variant="outlined" padding="md" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <Stack gap="md">
                      <div>
                        <h3 className="text-base md:text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                          Unable to Load Data
                        </h3>
                        <p className="text-sm md:text-base text-red-700 dark:text-red-300">{error}</p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.location.reload()}
                        className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 self-start"
                      >
                        🔄 Retry
                      </Button>
                    </Stack>
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
              </Stack>
            </Section>
          </Container>
        </main>
      </div>
    </div>
  );
}
