"use client";
import { useState } from "react";
import { useWatchContractEvent } from "wagmi";
import { formatEther } from "viem";
import { contract } from "../lib/contract";
import { C, NEU, fmt, short } from "../lib/tokens";

function describe(log) {
  const { eventName, args } = log;
  switch (eventName) {
    case "Refueled":         return { kind: "refuel", text: `${short(args.wallet)} received ${fmt(formatEther(args.amount), 3)} MON` };
    case "Deposited":        return { kind: "info",   text: `Deposited ${fmt(formatEther(args.amount), 3)} MON` };
    case "Withdrawn":        return { kind: "info",   text: `Withdrew ${fmt(formatEther(args.amount), 3)} MON` };
    case "WalletRegistered": return { kind: "info",   text: `Registered ${short(args.wallet)}` };
    case "WalletRemoved":    return { kind: "warn",   text: `Removed ${short(args.wallet)}` };
    case "WalletPaused":     return { kind: "warn",   text: `${short(args.wallet)} paused` };
    case "WalletResumed":    return { kind: "info",   text: `${short(args.wallet)} resumed` };
    case "VaultPaused":      return { kind: "warn",   text: "Vault paused" };
    case "VaultResumed":     return { kind: "info",   text: "Vault resumed" };
    default:                 return { kind: "info",   text: eventName };
  }
}

const DOT_COLOR = { refuel: C.green, warn: C.amber, info: C.accentSoft };

export default function ActivityLog() {
  const [entries, setEntries] = useState([]);

  useWatchContractEvent({
    ...contract,
    onLogs(logs) {
      const mapped = logs.map(log => ({
        id: `${log.transactionHash}-${log.logIndex}`,
        ts: Date.now(), ...describe(log),
      }));
      setEntries(p => [...mapped.reverse(), ...p].slice(0, 60));
    },
  });

  return (
    <div style={{ background: C.base, borderRadius: 20, boxShadow: NEU.raised, overflow: "hidden" }}>
      {/* header */}
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.shadowDark}33`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.text1 }}>Activity</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block", animation: "blink 2.2s infinite" }} />
          <span style={{ fontSize: 11, color: C.text3, fontWeight: 500 }}>
            {entries.length > 0 ? `${entries.length} events` : "watching"}
          </span>
        </div>
      </div>

      {/* inset scroll area */}
      <div style={{ background: C.base, boxShadow: NEU.inset, margin: "12px 16px 16px", borderRadius: 12, height: 230, overflowY: "auto" }}>
        {entries.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, display: "block", animation: "blink 2.2s infinite" }} />
            <span style={{ color: C.text3, fontSize: 13 }}>Watching for onchain events</span>
          </div>
        ) : entries.map((e, i) => (
          <div key={e.id} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
            borderBottom: i < entries.length - 1 ? `1px solid ${C.shadowDark}22` : "none",
            animation: "fadeup 200ms ease",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: DOT_COLOR[e.kind], flexShrink: 0 }} />
            <span style={{ color: C.text2, fontSize: 13, flex: 1 }}>{e.text}</span>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: C.text3, flexShrink: 0 }}>
              {new Date(e.ts).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}