"use client";
import { C, NEU, fmt } from "../lib/tokens";

export default function Tank({ balance, capacity, runway }) {
  const pct = Math.max(0, Math.min(1, balance / (capacity || 1))) * 100;
  const critical = runway < 5;
  const fillColor = critical ? C.amber : C.accent;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      {/* neumorphic vertical bar */}
      <div style={{
        width: 14, height: 110, background: C.base,
        borderRadius: 8, boxShadow: NEU.inset,
        position: "relative", overflow: "hidden", flexShrink: 0,
      }}>
        <div style={{
          position: "absolute", left: 2, right: 2, bottom: 2,
          height: `calc(${pct}% - 4px)`,
          background: fillColor,
          borderRadius: 6,
          transition: "height 600ms cubic-bezier(0.16,1,0.3,1)",
          boxShadow: `0 0 6px ${fillColor}88`,
        }} />
      </div>

      <div>
        <div style={{ fontFamily: "'Ragot',sans-serif", fontSize: 34, color: C.text1, letterSpacing: -1, lineHeight: 1 }}>
          {fmt(balance, 3)}
        </div>
        <div style={{ fontSize: 12, color: C.text3, marginTop: 4, fontWeight: 500 }}>MON in vault</div>
        <div style={{
          marginTop: 10, display: "inline-flex", alignItems: "center", gap: 7,
          fontSize: 12, color: critical ? C.amber : C.text2, fontWeight: 600,
          background: C.base, boxShadow: NEU.flat,
          borderRadius: 20, padding: "5px 12px",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: critical ? C.amber : C.green, display: "inline-block" }} />
          ~{runway} refuels left
        </div>
      </div>
    </div>
  );
}