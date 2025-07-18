import { useState, useEffect, useCallback } from 'react';
import { MarketItem, MarketDataResponse, UseMarketDataReturn } from '../types/market';

const AWATTAR_API_URL = 'https://api.awattar.at/v1/marketdata';

export function useMarketData(): UseMarketDataReturn {
  const [marketData, setMarketData] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const now = Date.now();
      const startTimestamp = now - 5 * 60 * 60 * 1000; // 5 hours ago
      const endTimestamp = now + 36 * 60 * 60 * 1000; // 36 hours from now

      const url = `${AWATTAR_API_URL}?start=${startTimestamp}&end=${endTimestamp}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json: MarketDataResponse = await response.json();
      const rawData = json.data || [];

      // Convert EUR/MWh to Euro cents/kWh
      // 1 MWh = 1000 kWh, so EUR/MWh * 0.1 = Euro cents/kWh
      const processedData: MarketItem[] = rawData.map((item) => ({
        start: item.start_timestamp,
        end: item.end_timestamp,
        marketPriceCents: parseFloat((item.marketprice * 0.1).toFixed(2)),
      }));

      setMarketData(processedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch market data';
      setError(errorMessage);
      console.error('Error fetching market data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  return {
    marketData,
    isLoading,
    error,
    refetch: fetchMarketData,
  };
}