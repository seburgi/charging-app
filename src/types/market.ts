export interface RawMarketItem {
  start_timestamp: number;
  end_timestamp: number;
  marketprice: number; // EUR/MWh
}

export interface MarketItem {
  start: number;
  end: number;
  marketPriceCents: number; // cents/kWh
}

export interface MarketDataResponse {
  data: RawMarketItem[];
}

export interface UseMarketDataReturn {
  marketData: MarketItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}