"use client";
import React, { useMemo, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { WrappedCards } from "@/components/WrappedCards";
import { parseSaveToMetrics } from "@/lib/parseSave";
import type { WrappedMetrics } from "@/lib/types";
import type { Dataset } from "@/lib/dataset";
import { STUB_DATASET } from "@/lib/objectMap";
import { DatasetControls } from "@/components/DatasetControls";

export default function Home() {
  const [xml, setXml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataset, setDataset] = useState<Dataset>(STUB_DATASET);

  const metrics: WrappedMetrics | null = useMemo(() => {
    try {
      return xml ? parseSaveToMetrics(xml, dataset) : null;
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
      return null;
    }
  }, [xml, dataset]);

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Stardew Wrapped</h1>
          <p className="text-slate-700">Drop a Stardew Valley save file (.xml) to see a "Wrapped"-style summary.</p>
        </header>

        <div className="grid gap-4 mb-4">
          <FileDrop onXMLLoaded={(t) => { setError(null); setXml(t); }} />
          <DatasetControls onLoaded={(ds) => setDataset(ds)} />
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
            {error}
          </div>
        )}

        {metrics && <WrappedCards metrics={metrics} />}

        <footer className="mt-12 text-xs text-slate-600">
          <p>All processing happens locally in your browser. For accurate names and price math, load a full dataset JSON (try the sample).</p>
        </footer>
      </div>
    </main>
  );
}
