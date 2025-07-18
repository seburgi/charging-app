interface ChargingMetricsProps {
  totalChargingCost: number; // in cents
  totalChargedKwh: number;   // in kWh
}

export default function ChargingMetrics({ totalChargingCost, totalChargedKwh }: ChargingMetricsProps) {
  return (
    <div className="mb-4 font-semibold text-gray-700 text-base md:text-lg">
      Total Charging Cost (until full or end of timeline):{" "}
      {(totalChargingCost / 100).toFixed(2)} € 
      {" — "}
      Total kWh Charged: {totalChargedKwh.toFixed(2)} kWh
    </div>
  );
}