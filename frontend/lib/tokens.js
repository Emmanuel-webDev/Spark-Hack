export const C = {
  void: "#08090D",
  panel: "#12151C",
  panel2: "#171B24",
  border: "#242A38",
  borderSoft: "#1B2029",
  violet: "#8677F2",
  violetDim: "#8677F233",
  green: "#3ED598",
  amber: "#F5A623",
  red: "#EF5A5A",
  text: "#E9EBF2",
  textDim: "#8890A4",
  textFaint: "#565E70",
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
  return `${m}m ${s % 60}s ago`;
}
