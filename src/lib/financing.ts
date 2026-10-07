import { dealerConfig } from "../config/dealerConfig";
import type { PaymentPlan, Vehicle } from "./types";
/** Non-sensitive shopping context only. Provider must support these query parameters. */
export function financingURL(vehicle?: Vehicle, payment?: PaymentPlan): string {
  const configured = dealerConfig.financing.providerURL;
  if (!configured) return "";
  const url = new URL(configured);
  if (url.protocol !== "https:")
    throw new Error("Financing provider must use HTTPS.");
  if (vehicle) {
    url.searchParams.set("vehicle", vehicle.id);
    url.searchParams.set("stock", vehicle.stockNumber);
    url.searchParams.set("price", String(vehicle.price));
    if (vehicle.vin) url.searchParams.set("vin", vehicle.vin);
  }
  if (payment) {
    url.searchParams.set("down", String(payment.down));
    url.searchParams.set("term", String(payment.term));
    url.searchParams.set("estimatedApr", String(payment.apr));
    url.searchParams.set("tradeEstimate", String(payment.trade));
  }
  return url.toString();
}
