import { describe, it, expect } from "vitest";
import { dealerConfig } from "../config/dealerConfig";
import { mapLocation } from "./location";
import { introStorageKey, shouldShowIntro } from "./intro";
describe("location configuration", () => {
  it("uses the supplied address and directions without fabricated coordinates", () => {
    const location = mapLocation();
    expect(new URL(location.embedURL).searchParams.get("q")).toBe(
      "604 Broadway, Newark, NJ 07104",
    );
    expect(location.directionsURL).toBe(dealerConfig.contact.directionsURL);
    expect(dealerConfig.contact.map.coordinates).toBeNull();
    expect(location.verified).toBe(true);
  });
  it("uses coordinates only when explicitly supplied and valid", () => {
    const contact = {
      ...dealerConfig.contact,
      map: {
        ...dealerConfig.contact.map,
        coordinates: { latitude: 40, longitude: -74 },
      },
    };
    expect(mapLocation(contact).query).toBe("40,-74");
    contact.map.coordinates = { latitude: 100, longitude: -74 };
    expect(mapLocation(contact).query).toBe(dealerConfig.contact.map.query);
  });
  it("generates safely encoded directions if the configured URL is unsafe", () => {
    const contact = {
      ...dealerConfig.contact,
      directionsURL: "javascript:alert(1)",
      map: {
        ...dealerConfig.contact.map,
        query: "Dealer & Partners, 123 Main Street",
      },
    };
    const location = mapLocation(contact),
      url = new URL(location.directionsURL);
    expect(url.protocol).toBe("https:");
    expect(url.searchParams.get("destination")).toBe(contact.map.query);
    expect(url.searchParams.get("api")).toBe("1");
  });
  it("falls back to a verified address when map query is absent", () => {
    const contact = {
      ...dealerConfig.contact,
      map: { ...dealerConfig.contact.map, query: "" },
    };
    expect(mapLocation(contact).query).toContain("604 Broadway");
    expect(mapLocation(contact).query).toContain("07104");
  });
});
describe("intro visit policy", () => {
  it("plays first visits, skips returning visitors and supports replay", () => {
    expect(
      shouldShowIntro({
        enabled: true,
        reducedMotion: false,
        replay: false,
        seen: false,
      }),
    ).toBe(true);
    expect(
      shouldShowIntro({
        enabled: true,
        reducedMotion: false,
        replay: false,
        seen: true,
      }),
    ).toBe(false);
    expect(
      shouldShowIntro({
        enabled: true,
        reducedMotion: false,
        replay: true,
        seen: true,
      }),
    ).toBe(true);
  });
  it("reduced motion and disabled intros take priority over replay", () => {
    expect(
      shouldShowIntro({
        enabled: true,
        reducedMotion: true,
        replay: true,
        seen: false,
      }),
    ).toBe(false);
    expect(
      shouldShowIntro({
        enabled: false,
        reducedMotion: false,
        replay: true,
        seen: false,
      }),
    ).toBe(false);
  });
  it("namespaces repeat-visit state by dealership and cinematic version", () => {
    expect(introStorageKey("one", "v1")).not.toBe(introStorageKey("two", "v1"));
    expect(introStorageKey("one", "v1")).not.toBe(introStorageKey("one", "v2"));
  });
});
