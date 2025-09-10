// Usage:
//   node scripts/make-dataset.mjs /path/to/Objects.json > public/objectMap.json
// Or (legacy unpacked JSON shaped like { "objectInformation": { "16": "Wild Horseradish/50/..."} } ):
//   node scripts/make-dataset.mjs /path/to/unpacked_objectInformation.json > public/objectMap.json
//
// Output shape (Dataset):
//   { "16": { "name": "Wild Horseradish", "category": "Forage", "basePrice": 50 }, ... }

import fs from "node:fs";

function fromSlashDelimitedLegacy(objInfo) {
  const out = {};
  for (const [id, raw] of Object.entries(objInfo)) {
    if (typeof raw !== "string") continue;
    const parts = raw.split("/");
    const name = parts[0] || `Unknown (#${id})`;
    const price = Number(parts[1]) || 0;
    const typeCat = parts[3] || "";
    let category = undefined;
    if (/Fish/i.test(typeCat)) category = "Fish";
    else if (/Cooking/i.test(typeCat)) category = "Cooking";
    else if (/Seeds/i.test(typeCat)) category = "Seeds";
    else if (/Minerals/i.test(typeCat)) category = "Minerals";
    else if (/Arch/i.test(typeCat)) category = "Artifact";
    else if (/Basic/i.test(typeCat)) {
      if (/Honey|Wine|Juice|Mayonnaise|Cheese|Oil|Tea|Coffee|Pickles|Jelly|Syrup/i.test(name)) category = "Artisan";
    }
    out[Number(id)] = { name, category, basePrice: price };
  }
  return out;
}

function fromV16Objects(objectsJson) {
  const out = {};
  for (const [key, v] of Object.entries(objectsJson)) {
    if (!v || typeof v !== "object") continue;
    const id = Number(v.SpriteIndex);
    if (!Number.isFinite(id)) continue;
    const name = v.DisplayName || v.Name || key;
    const category = v.Category || undefined;
    const basePrice = Number(v.Price) || 0;
    out[id] = { name, category, basePrice };
  }
  return out;
}

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Provide path to Objects.json (1.6) or unpacked objectInformation JSON (legacy).");
  process.exit(1);
}
const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));

let dataset = {};
if (raw && typeof raw === "object" && raw["objectInformation"]) {
  dataset = fromSlashDelimitedLegacy(raw["objectInformation"]);
} else {
  dataset = fromV16Objects(raw);
}

process.stdout.write(JSON.stringify(dataset, null, 2));
