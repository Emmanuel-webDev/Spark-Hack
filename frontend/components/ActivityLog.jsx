"use client";
import { useState } from "react";
import { useWatchContractEvent } from "wagmi";
import { formatEther } from "viem";
import { contract } from "../lib/contract";
import { C, fmt, short } from "../lib/tokens";

function describe(log) {
  const { eventName, args } = log;
  switch (eventName) {
    case "Refueled":
      return {
        kind: "refuel",
        text: `${short(args.wallet)} refueled ${fmt(formatEther(args.amount), 3)} MON (was ${fmt(formatEther(args.walletBalanceBefore), 3)})`,
      };
    case "Deposited":
      return { kind: "info", text: `${short(args.from)} deposited ${fmt(formatEther(args.amount), 3)} MON into the vault` };
    case "Withdrawn":
      return { kind: "info", text: `Withdrew ${fmt(formatEther(args.amount), 3)} MON to ${short(args.to)}` };
    case "WalletRegistered":
      return { kind: "info", text: `Registered ${short(args.wallet)} — threshold ${fmt(formatEther(args.threshold), 3)}, refill ${fmt(formatEther(args.refillAmount), 3)}` };
    case "WalletRemoved":
      return { kind: "info", text: `Removed ${short(args.wallet)} from monitoring` };
    case "WalletPaused":
      return { kind: "info", text: `${short(args.wallet)} paused` };
    case "WalletResumed":
      return { kind: "info", text: `${short(args.wallet)} resumed` };
    case "VaultPaused":
      return { kind: "info", text: "Vault paused — automation suspended" };
    case "VaultResumed":
      return { kind: "info", text: "Vault resumed — automation active" };
    case "PolicyUpdated":
      return { kind: "info", text: `Policy updated for ${short(args.wallet)}` };
    default:
      return { kind: "info", text: eventName };
  }
}

export default function ActivityLog() {
  const [entries, setEntries] = useState([]);

  useWatchContractEvent({
    ...contract,
    onLogs(logs) {
      const mapped = logs.map((log) => ({
        id: `${log.transactionHash}-${log.logIndex}`,
        ts: Date.now(),
        txHash: log.transactionHash,
        ...describe(log),
      }));
      setEntries((prev) => [...mapped.reverse(), ...prev].slice(0, 80));
    },
  });

  return (
    <div style={{ background: "#000", border: `1px solid ${C.border}` }} className="rounded-2xl p-4 h-64 overflow-y-auto">
      {entries.length === 0 && (
        <div style={{ color: C.textFaint }} className="text-xs">
          Waiting for on-chain events…
        </div>
      )}
      {entries.map((e) => (
        <div key={e.id} style={{ fontFamily: "'JetBrains Mono',monospace" }} className="text-[12px] py-1.5 flex items-start gap-2 border-b" >
          <span style={{ color: C.textFaint, flexShrink: 0 }}>{new Date(e.ts).toLocaleTimeString()}</span>
          <span style={{ color: e.kind === "refuel" ? C.green : C.textDim }}>
            {e.kind === "refuel" ? "● " : ""}
            {e.text}
          </span>
        </div>
      ))}
    </div>
  );
}
