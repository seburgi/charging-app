import React, { useState, useEffect } from "react";
import ChartSection from "./ChartSection";

export default function App() {
  // -- State for user inputs --
  const [currentCharge, setCurrentCharge] = useState(10); // in %
  const [willingToPay, setWillingToPay] = useState(10); // in Euro cents/kWh
  const [networkCosts, setNetworkCosts] = useState(11); // in Euro cents/kWh

  // We’ll calculate timestamps around "now"
  const now = Date.now();

  // Start: "now" minus 12 hours (in milliseconds)
  const startTimestamp = now - 12 * 60 * 60 * 1000;
  // End: "now" plus 36 hours
  const endTimestamp = now + 36 * 60 * 60 * 1000;

  // -- State for day-ahead market data (hourly) --
  const [marketData, setMarketData] = useState([]);

  useEffect(() => {
    // We'll fetch data from awattar (Austria) as an example
    const fetchMarketData = async () => {
      try {
        const url = `https://api.awattar.at/v1/marketdata?start=${startTimestamp}&end=${endTimestamp}`;
        const res = await fetch(url);
        const json = await res.json();
        // "data" is an array of objects with start_timestamp, end_timestamp, marketprice (EUR/MWh), etc.
        const rawData = json.data || [];

        // Convert EUR/MWh --> Euro cents/kWh
        //   1 MWh = 1000 kWh
        //   Price in EUR/MWh = price_in_EUR_MWh / 1000 = price_in_EUR_kWh
        //   Then to Euro cents/kWh = price_in_EUR_kWh * 100
        // => effectively, price_in_EUR_MWh * 0.1 = Euro cents/kWh
        const processedData = rawData.map((item) => {
          const priceInCents = item.marketprice * 0.1; // from EUR/MWh to Euro cents/kWh
          return {
            start: item.start_timestamp,
            end: item.end_timestamp,
            marketPriceCents: parseFloat(priceInCents.toFixed(2)), // round to 2 decimals
          };
        });

        setMarketData(processedData);
      } catch (error) {
        console.error("Error fetching market data:", error);
      }
    };

    fetchMarketData();
  }, [startTimestamp, endTimestamp]);

  // This function determines whether we’ll charge in a given hour
  // based on total cost (market price + network costs) vs. willingToPay.
  // We’ll do more advanced logic for partial charging later.
  const shouldCharge = (marketPriceCents) => {
    const totalCost = marketPriceCents + Number(networkCosts);
    return totalCost <= Number(willingToPay);
  };

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
            onChange={(e) => setCurrentCharge(e.target.value)}
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
            onChange={(e) => setWillingToPay(e.target.value)}
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
            onChange={(e) => setNetworkCosts(e.target.value)}
          />
        </div>
      </div>

      {/* Chart Area: grows to fill remaining space */}
      <div className="flex-1 p-4">
        <h2 className="text-lg font-semibold mb-4">Cost Overview & Charging Plan</h2>
        <ChartSection
          marketData={marketData}
          networkCosts={networkCosts}
          willingToPay={willingToPay}
          currentCharge={currentCharge}
          shouldCharge={shouldCharge}
        />
      </div>

    </div>
  );
}
