"use client";
import React, { useState } from "react";

export function FileDrop({ onXMLLoaded }: { onXMLLoaded: (xml: string) => void }) {
  const [drag, setDrag] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const file = files[0];
    const txt = await file.text();
    setFileName(file.name);
    onXMLLoaded(txt);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
      className={`rounded-2xl border-2 border-dashed ${drag ? "border-emerald-500 bg-white" : "border-emerald-300 bg-white/60"} p-8 text-center shadow-sm`}
    >
      <p className="font-medium">Drag & drop your <code>.xml</code> save here</p>
      <p className="text-sm text-slate-600">or click to browse</p>
      <input type="file" accept=".xml,.txt" onChange={(e) => handleFiles(e.target.files)} className="mt-3" />
      {fileName && <div className="text-xs text-slate-600 mt-2">Loaded: {fileName}</div>}
    </div>
  );
}
