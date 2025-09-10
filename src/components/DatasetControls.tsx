"use client";
import React from "react";
import { normalizeDataset, type Dataset } from "@/lib/dataset";

export function DatasetControls({ onLoaded }: { onLoaded: (ds: Dataset) => void }) {
  const onUpload = async (file: File) => {
    try {
      const txt = await file.text();
      const raw = JSON.parse(txt);
      onLoaded(normalizeDataset(raw));
    } catch (e) {
      alert("Failed to read dataset JSON. Make sure it's valid JSON.");
    }
  };

  const loadSample = async () => {
    try {
      const res = await fetch("/objectMap.sample.json");
      const raw = await res.json();
      onLoaded(normalizeDataset(raw));
    } catch {
      alert("Couldn't load sample dataset.");
    }
  };

  return (
    <div className="rounded-xl bg-white/70 border border-emerald-200 p-4 flex items-center gap-3">
      <div className="font-semibold">Dataset:</div>
      <button onClick={loadSample} className="rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-sm font-semibold hover:bg-emerald-700">Load sample</button>
      <label className="text-sm text-emerald-900">
        or upload JSON
        <input type="file" accept="application/json" className="ml-2" onChange={(e) => e.target.files && e.target.files[0] && onUpload(e.target.files[0])} />
      </label>
    </div>
  );
}
