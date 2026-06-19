/** Typed JSON-LD schema node — replaces any[] in layout schemaGraph props */
export type SchemaNode = Record<string, unknown>;

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
  custom: boolean;
  hidden?: boolean;
}

export type ApplianceCategory =
  | 'Lighting'
  | 'Fans & Cooling'
  | 'Kitchen'
  | 'Entertainment'
  | 'Office & IT'
  | 'Industrial'
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
