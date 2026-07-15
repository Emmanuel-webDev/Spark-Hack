"use client";
import { C } from "../lib/tokens";

export function Stat({ label, value, sub, warn }) {
  return (
    <div>
      <div style={{ color: warn && value > 0 ? C.amber : C.text, fontFamily: "'JetBrains Mono',monospace" }} className="text-2xl font-semibold">
        {value}
      </div>
      <div style={{ color: C.textDim }} className="text-[11px] mt-0.5">
        {label}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div>
      <div style={{ color: C.textFaint }} className="text-[11px] mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}

export function NumInput({ value, onChange, width = 84 }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ background: C.panel2, border: `1px solid ${C.border}`, color: C.text, width }}
      className="rounded-lg px-2.5 py-2 text-xs outline-none"
    />
  );
}

export function ActionBtn({ children, onClick, primary, danger, small, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: primary ? C.violet : danger ? "transparent" : C.panel2,
        color: primary ? "#0A0A12" : danger ? C.red : C.text,
        border: `1px solid ${primary ? C.violet : danger ? C.red + "66" : C.border}`,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      className={`rounded-lg font-medium flex items-center gap-1.5 justify-center transition hover:opacity-85 ${
        small ? "text-[11px] px-2 py-1.5 flex-1" : "text-xs px-3 py-2"
      }`}
    >
      {children}
    </button>
  );
}

export function LabeledInput({ label, value, onChange, placeholder, mono }) {
  return (
    <div>
      <div style={{ color: C.textFaint }} className="text-[11px] mb-1">
        {label}
      </div>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          background: C.panel2,
          border: `1px solid ${C.border}`,
          color: C.text,
          fontFamily: mono ? "'JetBrains Mono',monospace" : "inherit",
        }}
        className="w-full rounded-lg px-2.5 py-2 text-xs outline-none"
      />
    </div>
  );
}
