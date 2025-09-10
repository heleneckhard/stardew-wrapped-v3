import type { WrappedMetrics } from "./types";
import type { Dataset } from "./dataset";
import { STUB_DATASET } from "./objectMap";

function getFirst(el: Element | Document, tag: string): Element | null {
  return (
    (el as Element).getElementsByTagName(tag)[0] ||
    (el as Element).getElementsByTagName(tag.toLowerCase())[0] ||
    (el as Element).getElementsByTagName(tag[0].toUpperCase() + tag.slice(1))[0] ||
    null
  );
}
function textOf(el: Element | null): string {
  return el?.textContent?.trim() ?? "";
}
function intOf(el: Element | null): number | undefined {
  const t = textOf(el);
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

function eachItemDict<T = unknown>(dictEl: Element | null, map: (keyEl: Element, valEl: Element) => T): T[] {
  if (!dictEl) return [];
  const items = Array.from(dictEl.getElementsByTagName("item"));
  return items.map((it) => {
    const keyEl = getFirst(it, "key");
    const valEl = getFirst(it, "value");
    if (!keyEl || !valEl) throw new Error("Malformed <item>");
    return map(keyEl, valEl);
  });
}

function parseIntIntDict(dictEl: Element | null): Record<number, number> {
  const out: Record<number, number> = {};
  for (const { k, v } of eachItemDict(dictEl, (kEl, vEl) => {
    const kid = intOf(kEl.querySelector("int"));
    const vid = intOf(vEl.querySelector("int"));
    return { k: kid, v: vid } as { k: number | undefined; v: number | undefined };
  })) {
    // @ts-ignore
    if (typeof k !== "undefined" && typeof v !== "undefined") out[k] = v;
  }
  return out;
}

function parseStringIntDict(dictEl: Element | null): Record<string, number> {
  const out: Record<string, number> = {};
  for (const { k, v } of eachItemDict(dictEl, (kEl, vEl) => {
    const kstr = textOf(kEl.querySelector("string"));
    const vnum = intOf(vEl.querySelector("int"));
    return { k: kstr, v: vnum } as { k: string; v: number | undefined };
  })) {
    // @ts-ignore
    if (k && typeof v !== "undefined") out[k] = v;
  }
  return out;
}

function parseFishCaughtDict(dictEl: Element | null): Record<number, { count: number; maxSize: number }> {
  const out: Record<number, { count: number; maxSize: number }> = {};
  for (const { k, count, size } of eachItemDict(dictEl, (kEl, vEl) => {
    const kid = intOf(kEl.querySelector("int"));
    const arr = vEl.querySelector("ArrayOfInt");
    const arrInts = arr ? Array.from(arr.getElementsByTagName("int")).map((n) => Number(n.textContent)) : [];
    return { k: kid, count: arrInts[0] ?? 0, size: arrInts[1] ?? -1 } as {
      k: number | undefined;
      count: number;
      size: number;
    };
  })) {
    // @ts-ignore
    if (typeof k !== "undefined") out[k] = { count, maxSize: size };
  }
  return out;
}

function topEntry<K extends string | number, V extends number>(obj: Record<K, V>): [K, V] | null {
  const entries = Object.entries(obj) as [K, V][];
  if (!entries.length) return null;
  return entries.reduce((a, b) => (b[1] > a[1] ? b : a));
}

function idToName(dataset: Dataset, id: number | undefined | null, fallback = "Unknown"): string {
  if (id == null) return fallback;
  return dataset[id]?.name ?? `${fallback} (#${id})`;
}

function capitalize(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

export type CategoryTop = Record<string, { id: number; name: string; count: number } | null>;

export function parseSaveToMetrics(xml: string, dataset?: Dataset): WrappedMetrics {
  const data = dataset ?? STUB_DATASET;
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  const root = doc.documentElement; // SaveGame

  const player = getFirst(root, "player")!;
  const stats = getFirst(player, "stats");

  const farmerName = textOf(getFirst(player, "name"));
  const farmName = textOf(getFirst(player, "farmName"));
  const currentSeason = textOf(getFirst(root, "currentSeason"));
  const dayOfMonth = intOf(getFirst(root, "dayOfMonth"));
  const year = intOf(getFirst(root, "year"));
  const date = `${capitalize(currentSeason)} ${dayOfMonth ?? "?"}, Year ${year ?? "?"}`;

  const moneyEarned = intOf(getFirst(player, "totalMoneyEarned"));
  const seedsSown = stats ? intOf(getFirst(stats, "seedsSown")) : undefined;
  const itemsCookedCount = stats ? intOf(getFirst(stats, "itemsCooked")) : undefined;
  const timesFished = stats ? intOf(getFirst(stats, "timesFished")) : undefined;

  // Shipped (overall + by category + top-grossing)
  const basicShipped = parseIntIntDict(getFirst(player, "basicShipped"));
  const uniqueItemsShipped = Object.keys(basicShipped).length;

  const topShipped = topEntry(basicShipped);
  const mostShipped = topShipped
    ? { id: Number(topShipped[0]), name: idToName(data, Number(topShipped[0]), "Item"), count: Number(topShipped[1]) }
    : null;

  // Category tops
  const cats = ["Crop", "Artisan", "Fish", "Forage", "Animal", "Cooking", "Fruit"];
  const catTops: CategoryTop = {};
  for (const c of cats) {
    let best: [number, number] | null = null; // [id, count]
    for (const [idStr, count] of Object.entries(basicShipped)) {
      const id = Number(idStr);
      if (data[id]?.category === c) {
        if (!best || (count as number) > best[1]) best = [id, count as number];
      }
    }
    catTops[c] = best ? { id: best[0], name: idToName(data, best[0], "Item"), count: best[1] } : null;
  }

  // Top grossing item (count * basePrice)
  let topGrossId: number | null = null;
  let topGrossValue = -1;
  for (const [idStr, count] of Object.entries(basicShipped)) {
    const id = Number(idStr);
    const price = data[id]?.basePrice ?? 0;
    const gross = (count as number) * price;
    if (gross > topGrossValue) {
      topGrossValue = gross;
      topGrossId = id;
    }
  }
  const topGrossingItem = topGrossId != null
    ? { id: topGrossId, name: idToName(data, topGrossId, "Item"), gross: topGrossValue }
    : null;

  // Cooking
  const recipesCookedStrInt = parseStringIntDict(getFirst(player, "recipesCooked"));
  const recipesNum: Record<number, number> = Object.fromEntries(
    Object.entries(recipesCookedStrInt).map(([k, v]) => [Number(k), v])
  );
  const uniqueRecipesCooked = Object.keys(recipesNum).filter((k) => (recipesNum[Number(k)] ?? 0) > 0).length;
  const topCooked = topEntry(recipesNum);
  const mostCookedRecipe = topCooked
    ? { id: Number(topCooked[0]), name: idToName(data, Number(topCooked[0]), "Dish"), count: Number(topCooked[1]) }
    : null;

  // Fishing
  const fishCaughtNode =
    Array.from(doc.getElementsByTagName("fishCaught")).find((n) => n.getElementsByTagName("item").length > 0) ?? null;
  const fishCaught = parseFishCaughtDict(fishCaughtNode);
  const fishTypesCaught = Object.values(fishCaught).filter((o) => (o.count ?? 0) > 0).length;
  const topFishEntry = topEntry(Object.fromEntries(Object.entries(fishCaught).map(([id, obj]) => [Number(id), obj.count])));
  const mostCaughtFish = topFishEntry
    ? { id: Number(topFishEntry[0]), name: idToName(data, Number(topFishEntry[0]), "Fish"), count: Number(topFishEntry[1]) }
    : null;

  // Monsters
  const monsters = parseStringIntDict(stats ? getFirst(stats, "specificMonstersKilled") : null);
  const topMonster = (() => {
    const top = topEntry(monsters as Record<string, number>);
    if (!top) return null;
    return { name: top[0], count: Number(top[1]) };
  })();

  // Friendships
  const friendsTop: Array<{ name: string; hearts: number }> = [];
  const friendshipsEl = getFirst(player, "friendships");
  if (friendshipsEl) {
    const items = Array.from(friendshipsEl.getElementsByTagName("item"));
    for (const it of items) {
      const name = textOf(getFirst(getFirst(it, "key")!, "string"));
      const friendship = getFirst(getFirst(it, "value")!, "Friendship");
      const points = friendship ? intOf(getFirst(friendship, "Points")) ?? 0 : 0;
      const hearts = Math.min(14, Math.round((Number(points) / 250) * 10) / 10);
      if (name) friendsTop.push({ name, hearts });
    }
  }
  friendsTop.sort((a, b) => b.hearts - a.hearts);

  const metrics: WrappedMetrics = {
    farmerName,
    farmName,
    date,
    moneyEarned,
    seedsSown,
    itemsCookedCount,
    timesFished,
    topMonster,
    mostShipped,
    mostCookedRecipe,
    mostCaughtFish,
    friendsTop: friendsTop.slice(0, 10),
    uniqueItemsShipped,
    uniqueRecipesCooked,
    fishTypesCaught,
    topGrossingItem,
    mostShippedByCategory: catTops
  };

  return metrics;
}
