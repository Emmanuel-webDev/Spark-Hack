"use client";
import { C, NEU } from "../lib/tokens";

export function NeuCard({ children, style, inset }) {
  return (
    <div style={{
      background: C.base,
      borderRadius: 16,
      boxShadow: inset ? NEU.inset : NEU.raised,
      padding: 20,
      ...style,
    }}>
      {children}
    </div>
  );
}

export function MetricCard({ label, value, sub, status }) {
  const statusColor = status === "warn" ? C.amber : status === "good" ? C.green : status === "danger" ? C.red : C.accentMid;
  return (
    <div style={{
      background: C.base, borderRadius: 16,
      boxShadow: NEU.raised,
      padding: "20px 20px 16px",
      flex: 1, minWidth: 0,
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ fontSize: 11, color: C.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontFamily: "'Ragot',sans-serif", fontSize: 28, color: C.text1, letterSpacing: -0.5, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: statusColor, fontFamily: "inherit", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 11, color: C.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      {children}
    </div>
  );
}

export function NumInput({ value, onChange, width = 88 }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)}
      style={{
        background: C.base, border: "none",
        boxShadow: NEU.insetSm,
        color: C.text1, fontSize: 13, width,
        padding: "8px 12px", borderRadius: 8, outline: "none",
        fontFamily: "inherit",
      }} />
  );
}

export function Btn({ children, onClick, accent, danger, small, disabled, fullWidth }) {
  const bg = accent ? C.accent : C.base;
  const col = accent ? "#fff" : danger ? C.red : C.text1;
  const shadow = disabled ? "none" : accent ? "4px 4px 10px #3a1848, -2px -2px 8px #7a4490" : NEU.raisedSm;

  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        background: bg, color: col, border: "none",
        boxShadow: shadow,
        fontFamily: "inherit", fontSize: small ? 12 : 13, fontWeight: 600,
        padding: small ? "6px 12px" : "9px 18px", borderRadius: 10,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        display: "inline-flex", alignItems: "center", gap: 6,
        transition: "box-shadow 150ms, transform 120ms",
        whiteSpace: "nowrap",
        width: fullWidth ? "100%" : undefined,
        justifyContent: fullWidth ? "center" : undefined,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.boxShadow = accent ? "inset 2px 2px 6px #3a1848" : NEU.insetSm; }}
      onMouseUp={e => { e.currentTarget.style.boxShadow = shadow; }}
    >{children}</button>
  );
}

export function LabeledInput({ label, value, onChange, placeholder, mono }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 11, color: C.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <input value={value} onChange={onChange} placeholder={placeholder}
        style={{
          width: "100%", background: C.base, border: "none",
          boxShadow: NEU.insetSm,
          color: C.text1,
          fontFamily: mono ? "'DM Mono',monospace" : "inherit",
          fontSize: 13, padding: "9px 12px", borderRadius: 8, outline: "none",
        }} />
    </div>
  );
}

export function SectionHeader({ title, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <h2 style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize: 16, fontWeight: 700, color: C.text1, letterSpacing: -0.3 }}>{title}</h2>
      {action}
    </div>
  );
}