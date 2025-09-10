# Stardew Wrapped (Next.js + Tailwind) — v3

A Spotify Wrapped–style summary generator for Stardew Valley save files. Parsing runs **entirely client-side**. Drop your save `.xml` and get slides like **Most Shipped**, **Top Grossing**, **Top-by-Category**, **Most Cooked**, **Most Caught Fish**, **Top Monster**, plus highlight counters. Includes a **Save as image** button.

## Quick start
```bash
npm install   # or pnpm / yarn
npm run dev
# open http://localhost:3000
```

## Build for deploy (static export)
```bash
npm run build
# outputs static site in ./out (host on Vercel, Netlify, Cloudflare Pages, GitHub Pages, etc.)
```

## Load a complete dataset
Click **Dataset → Load sample** or upload your own JSON mapping ids → { name, category, basePrice }.
To generate your own from the game files:

### Stardew 1.6+ (recommended)
The file `Content/Data/Objects.json` already has DisplayName/Category/Price/SpriteIndex:
```bash
node scripts/make-dataset.mjs "/path/to/Stardew Valley/Content/Data/Objects.json" > public/objectMap.json
```
Then in the app, upload `public/objectMap.json` (or configure it to fetch by default).

### Older (legacy unpacked JSON)
If you have a legacy `objectInformation` JSON (from an XNB unpacker):
```bash
node scripts/make-dataset.mjs "/path/to/unpacked_objectInformation.json" > public/objectMap.json
```

## Notes
- Everything runs locally in the browser; no uploads.
- Unknown ids show as `Unknown (#1234)` unless your dataset includes them.
- Co-op: currently reads the first `<player>` block; you can extend to select/aggregate.
