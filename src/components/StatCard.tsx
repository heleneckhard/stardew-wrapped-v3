import React from "react";

export function StatCard({ title, value, subtitle }: { title: string; value: React.ReactNode; subtitle?: string }) {
  return (
    <div className="rounded-2xl bg-white shadow-md p-6 flex flex-col gap-2">
      <div className="text-sm uppercase tracking-widest text-slate-500">{title}</div>
      <div className="text-3xl md:text-4xl font-black">{value}</div>
      {subtitle && <div className="text-slate-600">{subtitle}</div>}
    </div>
  );
}
