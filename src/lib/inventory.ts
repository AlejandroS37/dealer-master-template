import type { Vehicle } from "./types";
export interface Filters {
  keyword: string;
  make: string;
  model: string;
  yearMin: string;
  yearMax: string;
  priceMin: string;
  priceMax: string;
  mileage: string;
  bodyStyle: string;
  drivetrain: string;
  transmission: string;
  fuelType: string;
  sort: string;
  saved: boolean;
}
export const emptyFilters: Filters = {
  keyword: "",
  make: "",
  model: "",
  yearMin: "",
  yearMax: "",
  priceMin: "",
  priceMax: "",
  mileage: "",
  bodyStyle: "",
  drivetrain: "",
  transmission: "",
  fuelType: "",
  sort: "recent",
  saved: false,
};
export function options(vehicles: Vehicle[], key: keyof Vehicle): string[] {
  return [...new Set(vehicles.map((v) => String(v[key])))].sort();
}
export function filterVehicles(
  vehicles: Vehicle[],
  f: Filters,
  saved: string[] = [],
) {
  return vehicles
    .filter(
      (v) =>
        v.status !== "sold" &&
        (!f.keyword ||
          `${v.year} ${v.make} ${v.model} ${v.trim} ${v.stockNumber}`
            .toLowerCase()
            .includes(f.keyword.toLowerCase())) &&
        (!f.make || v.make === f.make) &&
        (!f.model || v.model === f.model) &&
        (!f.yearMin || v.year >= +f.yearMin) &&
        (!f.yearMax || v.year <= +f.yearMax) &&
        (!f.priceMin || v.price >= +f.priceMin) &&
        (!f.priceMax || v.price <= +f.priceMax) &&
        (!f.mileage || v.mileage <= +f.mileage) &&
        (!f.bodyStyle || v.bodyStyle === f.bodyStyle) &&
        (!f.drivetrain || v.drivetrain === f.drivetrain) &&
        (!f.transmission || v.transmission === f.transmission) &&
        (!f.fuelType || v.fuelType === f.fuelType) &&
        (!f.saved || saved.includes(v.id)),
    )
    .sort((a, b) =>
      f.sort === "price-asc"
        ? a.price - b.price
        : f.sort === "price-desc"
          ? b.price - a.price
          : f.sort === "mileage"
            ? a.mileage - b.mileage
            : f.sort === "year-desc"
              ? b.year - a.year
              : f.sort === "year-asc"
                ? a.year - b.year
                : b.addedAt.localeCompare(a.addedAt),
    );
}
export const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
export function calculatePayment(
  price: number,
  plan: {
    down: number;
    trade: number;
    fees: number;
    term: number;
    apr: number;
  },
) {
  const principal = Math.max(
    0,
    price +
      Math.max(0, plan.fees) -
      Math.min(price, Math.max(0, plan.down)) -
      Math.max(0, plan.trade),
  );
  const rate = Math.max(0, plan.apr) / 1200;
  const term = Math.max(1, plan.term);
  return {
    principal,
    monthly: rate
      ? (principal * rate) / (1 - Math.pow(1 + rate, -term))
      : principal / term,
  };
}
