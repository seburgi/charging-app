import { MarketItem } from './market';

export interface ChartDataItem {
  start: Date;
  end: Date;
  hour: string;
  totalCostCents: number;
  charging: boolean;
  batterySoC: number;
  chargedKwh: number;
  barColor: string;
}

export interface ChargingCalculationParams {
  marketData: MarketItem[];
  currentCharge: number; // percentage
  networkCosts: number; // cents/kWh
  shouldCharge: (marketPriceCents: number) => boolean;
}

export interface ChargingCalculationResult {
  chartData: ChartDataItem[];
  totalChargingCost: number; // cents
  totalChargedKwh: number; // kWh
}

export interface ChargingScenario {
  price: number;
  finalSoC: number;
  hoursUntilStop: string;
  totalCost: number;
}

export interface UseChargingCalculationReturn {
  chartData: ChartDataItem[];
  totalChargingCost: number;
  totalChargedKwh: number;
  scenarios: ChargingScenario[];
}

// Constants
export const MAX_BATTERY_CAPACITY = 75; // kWh
export const CHARGING_RATE_KWH_PER_HOUR = 11; // kW

// Colors
export const CHART_COLORS = {
  PAST: "#ccc",
  CHARGING: "#80ef80",
  NOT_CHARGING: "#ffb27f"
};