"use client";
import { C, fmt } from "../lib/tokens";

function polar(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polar(cx, cy, r, endAngle);
  const end = polar(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}

export default function Gauge({ balance, threshold, max, size = 132, danger }) {
  const cx = size / 2;
  const cy = size / 2 + 6;
  const r = size / 2 - 16;
  const START = -125,
    END = 125;
  const span = END - START;
  const safeMax = max > 0 ? max : 1;
  const frac = Math.max(0, Math.min(1, balance / safeMax));
  const needleAngle = START + frac * span;
  const zoneFrac = Math.max(0, Math.min(1, threshold / safeMax));
  const zoneAngle = START + zoneFrac * span;
  const tip = polar(cx, cy, r - 14, needleAngle);
  const color = danger ? C.red : balance < threshold ? C.amber : C.green;

  return (
    <svg width={size} height={size / 2 + 34} viewBox={`0 0 ${size} ${size / 2 + 34}`}>
      <path d={arcPath(cx, cy, r, START, END)} stroke={C.border} strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d={arcPath(cx, cy, r, START, zoneAngle)} stroke={C.red} strokeOpacity="0.55" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d={arcPath(cx, cy, r, zoneAngle, END)} stroke={C.green} strokeOpacity="0.4" strokeWidth="10" fill="none" strokeLinecap="round" />
      <line
        x1={polar(cx, cy, r - 12, zoneAngle).x}
        y1={polar(cx, cy, r - 12, zoneAngle).y}
        x2={polar(cx, cy, r + 8, zoneAngle).x}
        y2={polar(cx, cy, r + 8, zoneAngle).y}
        stroke={C.textDim}
        strokeWidth="2"
      />
      <line
        x1={cx}
        y1={cy}
        x2={tip.x}
        y2={tip.y}
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        style={{ transition: "all 600ms cubic-bezier(.4,1.4,.4,1)" }}
      />
      <circle cx={cx} cy={cy} r="5" fill={color} style={{ transition: "fill 600ms" }} />
      <text x={cx} y={cy + 24} textAnchor="middle" fill={C.text} fontFamily="'JetBrains Mono',monospace" fontSize="15" fontWeight="600">
        {fmt(balance, 3)}
      </text>
      <text x={cx} y={cy + 38} textAnchor="middle" fill={C.textFaint} fontFamily="'JetBrains Mono',monospace" fontSize="9" letterSpacing="1">
        MON
      </text>
    </svg>
  );
}
