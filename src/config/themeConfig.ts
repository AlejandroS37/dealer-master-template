import { dealerConfig } from "./dealerConfig";
export function applyTheme() {
  for (const [key, value] of Object.entries(dealerConfig.theme))
    document.documentElement.style.setProperty(`--${key}`, value);
}
// Supply licensed manufacturer assets here. Unlisted makes receive an elegant monogram.
export const manufacturerAssets: Record<string, string> = {};
