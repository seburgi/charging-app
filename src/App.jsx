import React from "react";

export default function App() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-white p-4 shadow-md">
        <h1 className="text-xl font-bold mb-4">EV Charging Setup</h1>
        {/* Here we'll add inputs for:
            - current charge level
            - cost threshold in Euro cents
            - network cost in Euro cents
        */}
        <div className="mb-4">
          <label className="block mb-1" htmlFor="currentCharge">
            Current Charge Level (%)
          </label>
          <input
            id="currentCharge"
            type="number"
            placeholder="e.g., 30"
            className="w-full border rounded p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1" htmlFor="willingToPay">
            Willing to Pay (Euro cents per kWh)
          </label>
          <input
            id="willingToPay"
            type="number"
            placeholder="e.g., 30"
            className="w-full border rounded p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1" htmlFor="networkCosts">
            Network Costs (Euro cents per kWh)
          </label>
          <input
            id="networkCosts"
            type="number"
            placeholder="e.g., 10"
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 p-4">
        <h2 className="text-lg font-semibold mb-4">Cost Overview & Charging Plan</h2>
        {/* We'll add the bar chart here in future steps. */}
        <div className="border border-gray-200 p-4 rounded">
          {/* This area will show a chart of the next hours with bars in orange or green */}
          <p className="text-gray-600">Chart goes here...</p>
        </div>
      </div>
    </div>
  );
}
