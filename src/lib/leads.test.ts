import { afterEach, describe, it, expect, vi } from "vitest";
import { dealerConfig } from "../config/dealerConfig";
import { submitLead } from "./leads";
import { financingURL } from "./financing";
import { structuredData } from "./seo";
import { inventory } from "../data/inventory";
const lead = {
  type: "quote" as const,
  name: "Sample",
  email: "sample@example.com",
  phone: "5550100",
  message: "Demo",
};
afterEach(() => {
  dealerConfig.leads.mode = "demo";
  dealerConfig.leads.endpoint = "";
  dealerConfig.financing.providerURL = "";
  vi.restoreAllMocks();
});
describe("integration boundaries", () => {
  it("never transmits a demo lead", async () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    expect(await submitLead(lead)).toEqual({ demo: true });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("sends a configured API lead and surfaces failures", async () => {
    dealerConfig.leads.mode = "api";
    dealerConfig.leads.endpoint = "https://example.com/leads";
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200 }));
    expect(await submitLead(lead)).toEqual({ demo: false });
    expect(fetch).toHaveBeenCalledWith(
      "https://example.com/leads",
      expect.objectContaining({ method: "POST", body: JSON.stringify(lead) }),
    );
    fetch.mockResolvedValue(new Response("", { status: 503 }));
    await expect(submitLead(lead)).rejects.toThrow("Submission failed");
  });
  it("rejects insecure lead endpoints", async () => {
    dealerConfig.leads.mode = "api";
    dealerConfig.leads.endpoint = "http://example.com";
    await expect(submitLead(lead)).rejects.toThrow("secure lead endpoint");
  });
  it("external provider receives non-sensitive vehicle and payment context", () => {
    dealerConfig.financing.providerURL = "https://example.com/apply";
    const url = new URL(
      financingURL(inventory[0], {
        down: 10000,
        term: 60,
        apr: 7.9,
        trade: 5000,
        fees: 0,
      }),
    );
    expect(url.searchParams.get("stock")).toBe("DEMO-001");
    expect(url.searchParams.get("down")).toBe("10000");
    expect(url.searchParams.has("email")).toBe(false);
  });
  it("does not publish sample offers or unverified dealer structured data", () => {
    expect(structuredData()).toBeNull();
    expect(structuredData(inventory[0])).toBeNull();
  });
});
