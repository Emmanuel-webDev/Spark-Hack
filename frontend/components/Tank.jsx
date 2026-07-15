"use client";
import { C, fmt } from "../lib/tokens";

export default function Tank({ balance, capacity, runway }) {
  const pct = Math.max(0, Math.min(1, balance / (capacity || 1))) * 100;
  const ticks = Math.min(runway, 12);
  return (
    <div className="flex items-end gap-4">
      <div
        className="relative rounded-md overflow-hidden"
        style={{ width: 64, height: 168, background: C.panel2, border: `1px solid ${C.border}` }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${(i + 1) * 16.6}%`, borderTop: `1px dashed ${C.borderSoft}` }} />
        ))}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: `${pct}%`,
            background: `linear-gradient(180deg, ${C.violet}, #5B4CC4)`,
            transition: "height 700ms cubic-bezier(.4,1.2,.4,1)",
          }}
        />
      </div>
      <div className="flex flex-col justify-end pb-1">
        <div style={{ fontFamily: "'JetBrains Mono',monospace" }} className="text-3xl font-semibold">
          <span style={{ color: C.text }}>{fmt(balance, 3)}</span>
        </div>
        <div style={{ color: C.textFaint }} className="text-xs mb-3">
          MON in depot tank
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: ticks }).map((_, i) => (
            <div key={i} style={{ width: 5, height: 5, borderRadius: 99, background: C.violet }} />
          ))}
          {runway > 12 && (
            <span style={{ color: C.textFaint }} className="text-xs ml-1">
              +{runway - 12}
            </span>
          )}
        </div>
        <div style={{ color: C.textDim }} className="text-xs mt-1">
          ≈ {runway} refuels of runway left
        </div>
      </div>
    </div>
  );
}
