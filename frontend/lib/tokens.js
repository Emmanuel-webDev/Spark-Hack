export const C = {
  base: "#f0e6f6",
  baseDeep: "#e8daf0",
  shadowDark: "#c4b0d0",
  shadowLight: "#ffffff",
  accent: "#49225B",
  accentMid: "#6E3482",
  accentSoft: "#d4b8e0",
  text1: "#49225B",
  text2: "#6E3482",
  text3: "#9a7aaa",
  green: "#2d7a50",
  greenSoft: "#d4ede0",
  red: "#8b2a2a",
  redSoft: "#f5dada",
  amber: "#8a5a00",
  amberSoft: "#f5e8cc",
};

// Neumorphic shadow helpers
export const NEU = {
  raised: "8px 8px 16px #c4b0d0, -8px -8px 16px #ffffff",
  raisedSm: "4px 4px 10px #c4b0d0, -4px -4px 10px #ffffff",
  inset: "inset 4px 4px 10px #c4b0d0, inset -4px -4px 10px #ffffff",
  insetSm: "inset 2px 2px 6px #c4b0d0, inset -2px -2px 6px #ffffff",
  flat: "2px 2px 6px #c4b0d0, -2px -2px 6px #ffffff",
};

export function fmt(n, d = 4) {
  if (n === undefined || n === null || Number.isNaN(Number(n))) return "0";
  return Number(n).toFixed(d);
}
export function short(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}
export function timeAgo(ts) {
  if (!ts) return "never";
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 1) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}
