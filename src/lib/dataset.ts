export interface ItemInfo {
  name: string;
  category?: string;
  basePrice?: number;
}
export type Dataset = Record<number, ItemInfo>;

export function normalizeDataset(raw: Record<string | number, any>): Dataset {
  const out: Dataset = {};
  for (const [k, v] of Object.entries(raw)) {
    const id = Number(k);
    if (!Number.isFinite(id)) continue;
    if (typeof v === "string") {
      out[id] = { name: v };
    } else if (v && typeof v === "object") {
      out[id] = { name: String(v.name ?? `Unknown (#${id})`), category: v.category, basePrice: v.basePrice };
    }
  }
  return out;
}
