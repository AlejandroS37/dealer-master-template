export interface Vehicle {
  id: string;
  slug: string;
  stockNumber: string;
  vin?: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  price: number;
  mileage: number;
  bodyStyle: string;
  engine: string;
  transmission: string;
  drivetrain: string;
  fuelType: string;
  exteriorColor: string;
  interiorColor: string;
  description: string;
  features: string[];
  images: string[];
  featured: boolean;
  addedAt: string;
  vehicleHistoryURL?: string;
  status: "available" | "pending" | "sold";
  demo: boolean;
}
export interface PaymentPlan {
  down: number;
  term: number;
  apr: number;
  trade: number;
  fees: number;
}
export interface TradeDraft {
  vin: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  mileage: string;
  condition: string;
  accidents: string;
  title: string;
  payoff: string;
  modifications: string;
  warningLights: string;
  damage: string;
  estimatedValue: number;
}
export type LeadType =
  "quote" | "availability" | "contact" | "trade" | "financing";
export interface Lead {
  type: LeadType;
  name: string;
  email: string;
  phone: string;
  message: string;
  vehicle?: Pick<
    Vehicle,
    "id" | "stockNumber" | "vin" | "price" | "year" | "make" | "model"
  >;
  payment?: PaymentPlan;
  trade?: TradeDraft;
}
export interface InventoryAdapter {
  list(): Promise<Vehicle[]>;
  getBySlug(slug: string): Promise<Vehicle | undefined>;
}
