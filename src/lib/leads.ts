import { dealerConfig } from "../config/dealerConfig";
import type { Lead } from "./types";
export async function submitLead(lead: Lead): Promise<{ demo: boolean }> {
  if (dealerConfig.leads.mode === "demo") return { demo: true };
  if (!dealerConfig.leads.endpoint.startsWith("https://"))
    throw new Error("A secure lead endpoint must be configured.");
  const response = await fetch(dealerConfig.leads.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
  if (!response.ok)
    throw new Error(
      "Submission failed. Please try again or contact the dealer.",
    );
  return { demo: false };
}
