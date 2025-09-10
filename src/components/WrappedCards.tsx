"use client";
import React, { useRef } from "react";
import { StatCard } from "./StatCard";
import type { WrappedMetrics } from "@/lib/types";
import * as htmlToImage from "html-to-image";

function Highlight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-emerald-900 text-sm">
      <span className="font-semibold">{label}:</span> {value}
    </div>
  );
}

export function WrappedCards({ metrics }: { metrics: WrappedMetrics }) {
  const ref = useRef<HTMLDivElement>(null);

  const onSaveImage = async () => {
    if (!ref.current) return;
    const dataUrl = await htmlToImage.toPng(ref.current, { pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = "stardew-wrapped.png";
    link.href = dataUrl;
    link.click();
  };

  const {
    farmerName, farmName, date, moneyEarned, seedsSown, itemsCookedCount, timesFished,
    topMonster, mostShipped, mostCookedRecipe, mostCaughtFish, friendsTop,
    uniqueItemsShipped, uniqueRecipesCooked, fishTypesCaught, topGrossingItem, mostShippedByCategory
  } = metrics;

  return (
    <div className="mt-8">
      <div className="flex justify-end mb-2">
        <button onClick={onSaveImage} className="rounded-xl bg-emerald-600 text-white px-4 py-2 font-semibold shadow hover:bg-emerald-700">
          Save as image
        </button>
      </div>

      <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-white p-6 flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <div className="text-sm/none uppercase tracking-widest opacity-90">Your Save</div>
            <div className="text-3xl md:text-5xl font-black ">{farmerName} @ {farmName}</div>
            <div className="opacity-90">{date}</div>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2 flex-wrap">
            {moneyEarned != null && <Highlight label="Total Earned" value={`${moneyEarned.toLocaleString()}g`} />}
            {seedsSown != null && <Highlight label="Seeds Sown" value={`${seedsSown.toLocaleString()}`} />}
            {itemsCookedCount != null && <Highlight label="Items Cooked" value={`${itemsCookedCount.toLocaleString()}`} />}
            {timesFished != null && <Highlight label="Times Fished" value={`${timesFished.toLocaleString()}`} />}
            {uniqueItemsShipped != null && <Highlight label="Unique Items Shipped" value={`${uniqueItemsShipped}`} />}
            {uniqueRecipesCooked != null && <Highlight label="Recipes Cooked (unique)" value={`${uniqueRecipesCooked}`} />}
            {fishTypesCaught != null && <Highlight label="Fish Types Caught" value={`${fishTypesCaught}`} />}
          </div>
        </div>

        <StatCard
          title="Most Shipped"
          value={mostShipped ? (
            <div>
              {mostShipped.name}
              <div className="text-base font-medium text-slate-600">{mostShipped.count.toLocaleString()} shipped</div>
            </div>
          ) : "—"}
        />

        <StatCard
          title="Top Grossing Item"
          value={topGrossingItem ? (
            <div>
              {topGrossingItem.name}
              <div className="text-base font-medium text-slate-600">{topGrossingItem.gross.toLocaleString()}g earned</div>
            </div>
          ) : "—"}
        />

        <StatCard
          title="Most Cooked Recipe"
          value={mostCookedRecipe ? (
            <div>
              {mostCookedRecipe.name}
              <div className="text-base font-medium text-slate-600">{mostCookedRecipe.count.toLocaleString()} cooked</div>
            </div>
          ) : "—"}
        />

        <StatCard
          title="Most Caught Fish"
          value={mostCaughtFish ? (
            <div>
              {mostCaughtFish.name}
              <div className="text-base font-medium text-slate-600">{mostCaughtFish.count.toLocaleString()} caught</div>
            </div>
          ) : "—"}
        />

        <StatCard
          title="Top Monster Slayer"
          value={topMonster ? (
            <div>
              {topMonster.name}
              <div className="text-base font-medium text-slate-600">{topMonster.count.toLocaleString()} defeated</div>
            </div>
          ) : "—"}
        />

        {/* Category Tops */}
        {mostShippedByCategory && (
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(mostShippedByCategory).map(([cat, entry]) => (
              <StatCard
                key={cat}
                title={`Top ${cat}`}
                value={entry ? (
                  <div>
                    {entry.name}
                    <div className="text-base font-medium text-slate-600">{entry.count.toLocaleString()} shipped</div>
                  </div>
                ) : "—"}
              />
            ))}
          </div>
        )}

        <div className="md:col-span-2 rounded-2xl bg-white shadow-md p-6">
          <div className="text-sm uppercase tracking-widest text-slate-500 mb-3">Besties</div>
          {!friendsTop?.length ? (
            <div className="text-slate-600">No friendships found.</div>
          ) : (
            <ol className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {friendsTop.map((f) => (
                <li key={f.name} className="rounded-xl border border-slate-200 p-3">
                  <div className="font-semibold">{f.name}</div>
                  <div className="text-slate-600">{f.hearts} ❤</div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="md:col-span-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900">
          <div className="font-semibold mb-1">Make it extra</div>
          <ul className="list-disc list-inside text-sm">
            <li>Load a full dataset to unlock accurate names, categories, and base prices.</li>
            <li>Create themed slides and animations for a true "Wrapped" feel.</li>
            <li>Add year-over-year comparisons when multiple saves are loaded.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
