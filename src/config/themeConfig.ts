import { dealerConfig } from "./dealerConfig";
export function applyTheme() {
  const root = document.documentElement;
  const theme = dealerConfig.theme;
  for (const key of ["background", "surface", "accent"] as const)
    root.style.setProperty(`--${key}`, theme[key]);
  for (const [key, value] of [
    ["primary-background-image", theme.primaryBackground],
    ["surface-background-image", theme.surfaceBackground],
  ] as const)
    root.style.setProperty(
      `--${key}`,
      value ? `url(${JSON.stringify(value)})` : "none",
    );
  root.style.setProperty(
    "--background-overlay",
    `${Math.min(100, Math.max(0, theme.backgroundOverlay * 100))}%`,
  );
  root.style.setProperty(
    "--surface-overlay",
    `${Math.min(100, Math.max(0, theme.surfaceOverlay * 100))}%`,
  );
  const icon = document.querySelector('link[rel="icon"]');
  if (icon && dealerConfig.logo.asset)
    icon.setAttribute("href", dealerConfig.logo.asset);
}
// Supply licensed manufacturer assets here. Unlisted makes receive an elegant monogram.
export const manufacturerAssets: Record<string, string> = {};
