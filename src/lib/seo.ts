import { dealerConfig as d } from "../config/dealerConfig";
import type { Vehicle } from "./types";
/** Demo content never produces real dealer offers or fabricated ratings. */
export function structuredData(
  vehicle?: Vehicle,
): Record<string, unknown> | null {
  if (!d.verifiedDealerData || !d.siteURL) return null;
  if (vehicle) {
    if (vehicle.demo) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Car",
      name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      brand: { "@type": "Brand", name: vehicle.make },
      model: vehicle.model,
      vehicleModelDate: String(vehicle.year),
      vehicleIdentificationNumber: vehicle.vin,
      image: vehicle.images,
      mileageFromOdometer: {
        "@type": "QuantitativeValue",
        value: vehicle.mileage,
        unitCode: "SMI",
      },
      offers: {
        "@type": "Offer",
        price: vehicle.price,
        priceCurrency: "USD",
        availability:
          vehicle.status === "available"
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        url: `${d.siteURL}/inventory/${vehicle.slug}`,
      },
    };
  }
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: d.name,
    url: d.siteURL,
    telephone: d.contact.phone || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: d.contact.address,
      addressLocality: d.contact.city,
      addressRegion: d.contact.state,
      postalCode: d.contact.zip,
    },
  };
}
