export interface Appliance {
  id: string;
  category: ApplianceCategory;
  name: string;
  defaultWatts: number;
  defaultQty: number;
  defaultHours: number;
  watts: number;
  qty: number;
  hours: number;
  included: boolean;
  custom: boolean;
}

export type ApplianceCategory =
  | 'Lighting'
  | 'Fans & Cooling'
  | 'Kitchen'
  | 'Entertainment'
  | 'Other';

export interface CategorySummary {
  name: ApplianceCategory;
  totalWatts: number;
  dailyKWh: number;
  applianceCount: number;
}

export interface CalculationResult {
  totalWatts: number;
  totalKW: number;
  loadPercent: number;
  dailyKWh: number;
  monthlyKWh: number;
  monthlyBill: number;
  topConsumerName: string;
  topConsumerWatts: number;
  loadLevel: 'light' | 'moderate' | 'heavy';
  categorySummaries: CategorySummary[];
}
