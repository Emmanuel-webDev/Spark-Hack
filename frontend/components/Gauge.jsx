"use client";
import { C, NEU, fmt } from "../lib/tokens";

function polar(cx, cy, r, deg) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function arc(cx, cy, r, s, e) {
  const p1 = polar(cx, cy, r, e), p2 = polar(cx, cy, r, s);
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${e - s <= 180 ? "0" : "1"} 0 ${p2.x} ${p2.y}`;
}

export default function Gauge({ balance, threshold, max, size = 120 }) {
  const cx = size / 2, cy = size / 2 + 4, r = size / 2 - 14;
  const S = -120, E = 120;
  const safe = max > 0 ? max : 1;
  const frac = Math.max(0, Math.min(1, balance / safe));
  const needle = S + frac * (E - S);
  const tAngle = S + Math.max(0, Math.min(1, threshold / safe)) * (E - S);
  const tip = polar(cx, cy, r - 12, needle);
  const low = balance < threshold;
  const color = low ? C.amber : C.green;

  return (
    <svg width={size} height={size / 2 + 32} viewBox={`0 0 ${size} ${size / 2 + 32}`}
      style={{ filter: "drop-shadow(2px 2px 4px #c4b0d0)" }}>
      {/* inset track feel */}
      <path d={arc(cx, cy, r, S, E)} stroke={C.shadowDark} strokeWidth="8" fill="none" strokeLinecap="butt" opacity="0.4" />
      <path d={arc(cx, cy, r, S, E)} stroke={C.shadowLight} strokeWidth="6" fill="none" strokeLinecap="butt" opacity="0.6" />
      {/* zones */}
      <path d={arc(cx, cy, r, S, tAngle)} stroke={C.red} strokeOpacity="0.45" strokeWidth="6" fill="none" strokeLinecap="butt" />
      <path d={arc(cx, cy, r, tAngle, E)} stroke={C.green} strokeOpacity="0.35" strokeWidth="6" fill="none" strokeLinecap="butt" />
      {/* threshold tick */}
      <line x1={polar(cx, cy, r - 10, tAngle).x} y1={polar(cx, cy, r - 10, tAngle).y}
            x2={polar(cx, cy, r + 4, tAngle).x}  y2={polar(cx, cy, r + 4, tAngle).y}
            stroke={C.text3} strokeWidth="1.5" />
      {/* needle */}
      <line x1={cx} y1={cy} x2={tip.x} y2={tip.y}
        stroke={color} strokeWidth="2.5" strokeLinecap="round"
        style={{ transition: "all 500ms cubic-bezier(0.16,1,0.3,1)" }} />
      <circle cx={cx} cy={cy} r="4" fill={color} style={{ transition: "fill 500ms" }} />
      <text x={cx} y={cy + 18} textAnchor="middle"
        fill={C.text1} fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif" fontSize="13" fontWeight="600">
        {fmt(balance, 3)}
      </text>
      <text x={cx} y={cy + 30} textAnchor="middle"
        fill={C.text3} fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif" fontSize="10">MON</text>
    </svg>
  );
}