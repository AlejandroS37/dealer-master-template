import { dealerConfig } from "../config/dealerConfig";
export function mapLocation(contact = dealerConfig.contact) {
  const coordinates = contact.map.coordinates;
  const validCoordinates =
    coordinates &&
    Number.isFinite(coordinates.latitude) &&
    Math.abs(coordinates.latitude) <= 90 &&
    Number.isFinite(coordinates.longitude) &&
    Math.abs(coordinates.longitude) <= 180;
  const address = [contact.address, contact.city, contact.state, contact.zip]
    .filter(Boolean)
    .join(", ");
  const query = validCoordinates
    ? `${coordinates.latitude},${coordinates.longitude}`
    : contact.map.query.trim() ||
      (contact.map.locationVerified ? address : dealerConfig.name);
  const embed = new URL("https://maps.google.com/maps");
  embed.searchParams.set("q", query);
  embed.searchParams.set(
    "z",
    String(Math.min(20, Math.max(1, contact.map.zoom))),
  );
  embed.searchParams.set("output", "embed");
  const directions = new URL("https://www.google.com/maps/dir/");
  directions.searchParams.set("api", "1");
  directions.searchParams.set("destination", query);
  let configured = "";
  try {
    const supplied = new URL(contact.directionsURL);
    if (supplied.protocol === "https:") configured = supplied.href;
  } catch {
    /* Generate a safe destination if no valid URL is supplied. */
  }
  const external = new URL("https://www.google.com/maps/search/");
  external.searchParams.set("api", "1");
  external.searchParams.set("query", query);
  return {
    query,
    embedURL: embed.href,
    directionsURL: configured || directions.href,
    externalURL: external.href,
    verified: contact.map.locationVerified,
  };
}
