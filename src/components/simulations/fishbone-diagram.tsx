"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";

/** Fishbone (Ishikawa) Diagram — 6M root cause analysis (Method, Machine, Material, Man, Measurement, Environment). */
export function FishboneSimulation() {
  const [effect, setEffect] = React.useState("Pump bearing failure");
  const [categories, setCategories] = React.useState({
    Method: "No PM procedure; planning gaps",
    Machine: "Misalignment; vibration; wear",
    Material: "Lubricant degradation; contamination",
    Man: "Training gaps; wrong installation",
    Measurement: "No vibration monitoring; blind failures",
    Environment: "Humidity; temperature cycling",
  });
  const colors = ["#10b981", "#0ea5e9", "#f59e0b", "#8b5cf6", "#f43f5e", "#14b8a6"];
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2"><Info className="h-4 w-4 text-emerald-600" /><h3 className="text-sm font-semibold">Fishbone Diagram — 6M Root Cause Analysis</h3></div>
      <div className="mb-3"><Input value={effect} onChange={(e) => setEffect(e.target.value)} className="text-sm" placeholder="Effect / problem statement" /></div>
      {/* Fishbone SVG visual */}
      <div className="relative overflow-x-auto">
        <svg viewBox="0 0 700 280" className="w-full" style={{ minWidth: 500 }}>
          {/* Spine */}
          <line x1="50" y1="140" x2="600" y2="140" stroke="#475569" strokeWidth="2" />
          {/* Effect box */}
          <rect x="600" y="125" width="90" height="30" rx="6" fill="#f43f5e" opacity="0.15" stroke="#f43f5e" strokeWidth="1.5" />
          <text x="645" y="144" textAnchor="middle" fontSize="9" fill="#f43f5e" fontWeight="bold">{effect.slice(0, 14)}{effect.length > 14 ? "…" : ""}</text>
          {/* Categories (bones) */}
          {Object.entries(categories).map(([cat, val], i) => {
            const isTop = i % 2 === 0;
            const y = isTop ? 30 : 250;
            const yEnd = isTop ? 140 : 140;
            const x = 100 + i * 90;
            const boneX = x + 45;
            return (
              <g key={cat}>
                <line x1={boneX} y1={y} x2={x} y2={yEnd} stroke={colors[i]} strokeWidth="1.5" />
                <text x={boneX} y={isTop ? 20 : 265} textAnchor="middle" fontSize="9" fill={colors[i]} fontWeight="bold">{cat}</text>
                <foreignObject x={boneX - 35} y={isTop ? 25 : 210} width="70" height="80">
                  <div style={{ fontSize: 7, color: "#64748b", overflow: "hidden" }}>{val}</div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>
      {/* Editable causes */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Object.entries(categories).map(([cat, val], i) => (
          <div key={cat}>
            <label className="text-[10px] font-medium" style={{ color: colors[i] }}>{cat}</label>
            <Input value={val} onChange={(e) => setCategories({ ...categories, [cat]: e.target.value })} className="h-7 text-xs" />
          </div>
        ))}
      </div>
    </Card>
  );
}
