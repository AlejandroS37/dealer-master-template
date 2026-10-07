# Dealership master template

A reusable React + Vite + TypeScript dealership platform. **Level Up Auto Sales is Demo Dealer #1**, not a hard-coded website. The first version includes 18 sample vehicles, a cinematic shell, inventory discovery, galleries, payment estimates, financing and trade-in journeys, local favorites, sample reviews, and lead forms.

All inventory, prices, specifications, generated photography, testimonials, and submissions are **illustrative demo content**. Dealer contact details have not been verified. Nothing here represents actual vehicle availability, a lender decision, or an appraisal.

## Install, develop, build, test

Use Node 24 (pinned in `.nvmrc` and `.node-version`) and npm. Vite also supports compatible Node 22.12+.

```sh
npm ci
npm run dev
npm run build
npm run preview
npm test
npm run test:e2e
```

In cloud environments with a read-only home directory, use `npm ci --cache /tmp/dealer-npm-cache`. The development server binds to `0.0.0.0` on port 5173. `dist/` contains the production build.

Browser tests use `/usr/bin/chromium` in this cloud machine. Elsewhere, set `PLAYWRIGHT_CHROMIUM_PATH` to your installed Chromium/Chrome executable. Install a compatible browser through your OS package manager or `npx playwright install chromium` and set the executable path accordingly. Vitest tests run independently of the browser suite.

## Architecture

| Location                     | Responsibility                                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `src/config/dealerConfig.ts` | Dealer identity, contact information, CTAs, branding, legal text, financing/lead modes, intro settings, theme colors |
| `src/config/themeConfig.ts`  | Theme activation and supplied manufacturer assets                                                                    |
| `src/data/inventory.ts`      | Replaceable sample inventory and async demo adapter                                                                  |
| `src/data/reviews.ts`        | Clearly identified sample reviews                                                                                    |
| `src/lib/types.ts`           | Vehicle, payment, trade, lead and inventory-adapter contracts                                                        |
| `src/lib/store.tsx`          | Inventory loading, favorites, selected vehicle, in-memory journey state                                              |
| `src/lib/inventory.ts`       | Derived choices, combined filtering, sorting, amortization                                                           |
| `src/lib/leads.ts`           | Demo/API lead submission boundary                                                                                    |
| `src/lib/financing.ts`       | Secure external-provider URL with non-sensitive shopping context                                                     |
| `src/lib/seo.ts`             | Verified dealer/vehicle structured-data boundary                                                                     |
| `src/components/`            | Reusable cards, dialogs, forms, galleries, calculator and cinematic                                                  |
| `src/pages/`                 | Route-level shopping and customer journeys                                                                           |
| `public/images/`             | Optimized generated concept photography and responsive derivatives                                                   |
| `tests/flows.spec.ts`        | Browser interaction and responsive regression checks                                                                 |

### Dealer configuration and theme

Keep dealer-specific content in `dealerConfig`, inventory, review data, and supplied assets. Brand names are not embedded in the reusable JSX. The dealer `id` namespaces browser-local favorites. Set `demoMode = false` after replacing sample content, and set `trade.demo = false` only when a real appraisal/contact backend is configured. Set the verified phone, optional SMS, email, address, business hours, social links, and directions URL. Unverified contact actions are deliberately absent.

Theme colors activate as CSS variables. `src/styles.css` owns the reusable typography, surfaces, layout, and upward motion. Replace the marble/photography assets and colors for another identity. A custom logo goes in `logo.asset`; the crystal-inspired wordmark is a fallback. Customize headings, CTA labels, trust points, legal copy, and the intro through configuration.

### Inventory and adapter interface

`Vehicle` has a stable `id`, unique URL-safe `slug`, `stockNumber`, optional `vin`, year/make/model/trim, price, mileage, body style, engine, transmission, drivetrain, fuel type, colors, description, features, ordered `images`, featured flag, ISO `addedAt`, optional history URL, availability status, and demo flag. Prices and mileage are numbers; image URLs must refer to your licensed photographs. An empty image list gracefully renders a placeholder.

Makes, models, body styles, transmissions, fuels, and drivetrains are derived from the inventory array. No manufacturer list is fixed in the UI. Only unsold vehicles appear in filtered results. Search and filter selections are shareable in the inventory URL. `addedAt` controls recently-added sorting.

To add a vehicle, add a typed record with a unique `id` and `slug`. To remove it, remove the record or mark it `sold`. Replace the demo adapter for a CMS, REST API, database, or DMS feed:

```ts
const adapter: InventoryAdapter = {
  async list() {
    const response = await fetch("/api/inventory");
    if (!response.ok) throw new Error("Inventory unavailable");
    return validateAndNormalizeVehicles(await response.json());
  },
  async getBySlug(slug) {
    const vehicles = await this.list();
    return vehicles.find((vehicle) => vehicle.slug === slug);
  },
};
// Supply adapter to DealerProvider in src/App.tsx.
```

`validateAndNormalizeVehicles` is your integration's schema validation, not a function included in this demo. Validate remote data at this boundary; normalize missing fields and units. Put credentials, DMS synchronization, caching, and database access on a backend, never in the client bundle. The current client loads the list and resolves detail pages locally; a large production feed should add server-side pagination and get-by-slug loading.

### Photography and manufacturer marks

Generated automotive images are **concept illustrations**, reused across some sample vehicles. They are not verified photos of the named inventory. Replace them with authentic per-vehicle galleries before launch. All images preserve aspect ratio; the detail gallery uses `contain`. Mobile swiping, keyboard-accessible arrows, fullscreen navigation, and thumbnail-to-main upward animation are supported. Card-to-detail View Transitions have a normal-navigation fallback.

Bundled demo images have `-small.jpg` derivatives. `Photo` uses responsive sources only for these known assets; custom image URLs work independently without assuming thumbnails exist. Extend its responsive asset mapping when adding your own optimized derivatives.

`manufacturerAssets` maps make names to **licensed, supplied** local logo assets. Empty/missing assets fall back to a monogram. No logos are scraped at runtime. Fonts are self-hosted through Fontsource packages (SIL Open Font License); there is no runtime Google Fonts request.

### Financing and connected state

**Built-in mode** is a five-step, fictional application demonstration. It does not collect SSNs, dates of birth, credit reports, or real credit applications. Fictional employment/income fields remain in component memory and are not included in lead requests. An estimated payment is not a financing offer.

**External mode:** set `financing.mode = 'external'` and an HTTPS `providerURL`. The template passes vehicle ID, stock, price, optional VIN and non-sensitive payment estimates as query parameters. Confirm that your provider supports those parameter names; adapt `financingURL` to its documented contract. Do not put personal or credit information in URLs.

The payment calculator supports synchronized down-payment slider/input, 0/10/20/30% presets, 36–84 month terms, estimated APR, trade value, and taxes/fees. It uses ordinary loan amortization, handles zero APR, clamps down payment to vehicle price, and never returns a negative financed amount. It does not model lender-specific fees or negative trade equity automatically; include these in transaction fees or integrate lender logic separately.

Selected vehicle, payment choices, and trade details carry between routes **in memory**. Refreshing clears the journey intentionally. Favorites alone persist locally, without an account. No applicant/contact/trade data is written to localStorage or sessionStorage.

### Trade-in

Six stages: VIN/manual identification, details/history, condition, guided photos, fictional contact, and review/request. There is no fabricated valuation or automatic VIN decoding. The optional trade estimate is the shopper's estimate and carries into the payment journey after completing the request. Uploaded photos are local object-URL previews, limited to 10 MB each and revoked on replacement/unmount. They are not uploaded, retained, or attached to API leads. A real integration must implement secure uploads, virus scanning, retention controls, VIN lookup and appraisal processing.

### Lead forms and backend integration

`leads.mode = 'demo'` simulates completion **without sending data**. Quote/availability forms attach selected vehicle ID, stock, optional VIN, price, and lead type automatically. Contact, financing-contact, and trade requests use the same submission boundary.

To connect a real contact backend, set `leads.mode = 'api'` and an HTTPS `endpoint`. `submitLead` posts a JSON `Lead` and reports failures. The endpoint must implement validation, consent/privacy requirements, spam protection, rate limiting, secure transport, delivery/CRM integration and appropriate storage. Client code must never hold secret API keys. This is a contact-lead integration seam, not a secure credit application system. Use an audited lender/provider integration for actual credit applications.

### Cinematic asset

Place the licensed, prerendered production asset at **`public/cinematic-intro.mp4`**, then set `intro.videoAvailable = true`. Configure the poster, path, duration and enabled flag in `dealerConfig`. The default is a 4.4-second static concept fallback with atmospheric overlay and a centered brand that rises to the actual navbar coordinates; the underlying layer rises independently. An immediate skip control, once-per-session behavior, video error fallback, and reduced-motion bypass are included. Intro duration is capped at five seconds.

The final McLaren doors/burnout/smoke production video is **not included**. Author its timing to match the logo reveal (approximately halfway through) and final upward reveal (last quarter). No browser WebGL or fake vehicle simulation is used.

### Routes, SEO and deployment

Routes: `/`, `/inventory`, `/inventory/:slug`, `/financing`, `/trade-in`, `/about`, `/contact`; unknown routes have a useful fallback. Route changes set unique vehicle titles/descriptions. Set `siteURL` to the canonical HTTPS public origin and `verifiedDealerData = true` only after replacing unverified content. Structured data intentionally excludes sample vehicle offers and invented ratings.

This is a **client-rendered SPA**. Search engines and social crawlers that do not execute JavaScript may see only the base HTML metadata. For a live dealership with strong inventory SEO, add server rendering or prerendering per vehicle plus Open Graph data and a sitemap at the integration/deployment layer.

Static hosts must serve `index.html` for application paths while serving images/fonts/assets normally. `public/_redirects` supports Netlify's SPA fallback. For Nginx use `try_files $uri $uri/ /index.html;`. Serve HTTPS and configure appropriate security headers. `vite preview` is for build validation, not a production server.

## CREATING A NEW DEALER FROM THIS TEMPLATE

1. Duplicate the repository and install with `npm ci`.
2. Set a unique dealer `id`; replace name, wordmark/logo, hero copy, contact information, hours, links and legal text in `dealerConfig`.
3. Change theme colors, surface assets and photography for the dealer's identity.
4. Replace sample inventory with validated real records or implement an `InventoryAdapter`.
5. Supply licensed manufacturer/logo assets and authentic reviews, preserving source attribution.
6. Configure the secure financing provider and contact-lead backend. Keep built-in financing in demonstration mode until a real secure provider is integrated.
7. Replace the cinematic MP4/poster, or disable the intro.
8. Set the public canonical origin and verified-data flag only after verifying dealer/inventory information.
9. Run unit tests, browser tests and `npm run build`; review desktop, tablet, mobile and reduced-motion behavior.
10. Deploy `dist/` with an SPA fallback. Add server/prerendering and real provider integrations as needed for the production business.

## Current verification and limits

Automated coverage includes combined inventory filters, derived makes/models, empty results, sorting, saved vehicles, lead context, gallery transitions/fullscreen/swipe, live and zero-APR payments, input clamping, slider keyboard controls, financing state carry-over, complete trade journey with photo preview, mobile sheets, focus continuity, missing-image fallback, reduced motion, intro skipping, external-provider routing, and demo/API submission boundaries.

The repository has no backend, real dealer credentials, secure credit integration, vehicle-history subscription, automatic appraisal, admin dashboard or DMS integration. Those are explicit extension points rather than simulated production services. Level Up's reference site was inaccessible from the setup network, so real contact information remains unverified instead of invented.
