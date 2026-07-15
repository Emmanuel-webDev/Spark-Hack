"use client";
import { useState } from "react";
import { useReadContract, useWriteContract, useBalance, useAccount } from "wagmi";
import { formatEther } from "viem";
import { Copy, Check, Zap, Pause, Play, Trash2 } from "lucide-react";
import { contract } from "../lib/contract";
import { C, NEU, fmt, short, timeAgo } from "../lib/tokens";
import Gauge from "./Gauge";
import { Btn } from "./UI";

export default function WalletCard({ address, onChange }) {
  const { isConnected } = useAccount();
  const [copied, setCopied] = useState(false);
  const { writeContract, isPending } = useWriteContract();

  const { data: policy }     = useReadContract({ ...contract, functionName: "policies",         args: [address], query: { refetchInterval: 4000 } });
  const { data: nativeBal }  = useBalance({ address, query: { refetchInterval: 4000 } });
  const { data: eligibility} = useReadContract({ ...contract, functionName: "isRefuelEligible", args: [address], query: { refetchInterval: 4000 } });

  if (!policy) return (
    <div style={{ background: C.base, borderRadius: 20, boxShadow: NEU.raised, padding: 20, minHeight: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: C.text3, fontSize: 13 }}>Loading…</span>
    </div>
  );

  const [active, thresholdWei, refillAmountWei, cooldown, dailyLimit, lastRefillAt,, refillsInWindow] = policy;
  const threshold    = Number(formatEther(thresholdWei));
  const refillAmount = Number(formatEther(refillAmountWei));
  const balance      = nativeBal ? Number(formatEther(nativeBal.value)) : 0;
  const low          = balance < threshold;
  const lastRefillMs = Number(lastRefillAt) * 1000;
  const onCooldown   = lastRefillMs > 0 && Date.now() - lastRefillMs < Number(cooldown) * 1000;
  const [eligible, reason] = eligibility || [false, ""];

  const status = !active
    ? { text: "paused", color: C.text3 }
    : low
    ? { text: "low balance", color: C.amber }
    : eligible
    ? { text: "● ready", color: C.green }
    : { text: "ok", color: C.text3 };

  function copy() {
    setCopied(true);
    try { navigator.clipboard.writeText(address); } catch {}
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div style={{
      background: C.base, borderRadius: 20,
      boxShadow: low && active ? `8px 8px 16px #c4b0d0, -8px -8px 16px #ffffff, inset 0 0 0 2px ${C.amber}44` : NEU.raised,
      padding: 20, display: "flex", flexDirection: "column", gap: 16,
      animation: "fadeup 220ms ease",
      transition: "box-shadow 400ms",
    }}>
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={copy} style={{
          background: "none", border: "none", cursor: "pointer", padding: 0,
          fontFamily: "'DM Mono',monospace", fontSize: 12, color: C.text3,
          display: "flex", alignItems: "center", gap: 5,
        }}>
          {short(address)} {copied ? <Check size={10} color={C.green} /> : <Copy size={10} />}
        </button>
        <span style={{ fontSize: 11, fontWeight: 700, color: status.color, letterSpacing: "0.03em" }}>
          {status.text}
        </span>
      </div>

      {/* gauge in neumorphic inset well */}
      <div style={{
        background: C.base, borderRadius: 16,
        boxShadow: NEU.inset,
        padding: "12px 8px 8px",
        display: "flex", justifyContent: "center",
      }}>
        <Gauge balance={balance} threshold={threshold} max={(threshold + refillAmount) * 1.4} />
      </div>

      {/* policy rows */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 0", fontSize: 12 }}>
        {[
          ["threshold", `${fmt(threshold, 3)} MON`],
          ["refill",    `${fmt(refillAmount, 3)} MON`],
          ["cooldown",  `${Number(cooldown)}s`],
          ["today",     `${Number(refillsInWindow)} / ${Number(dailyLimit)}`],
        ].map(([k, v]) => (
          <div key={k}>
            <span style={{ color: C.text3 }}>{k} </span>
            <span style={{ color: C.text1, fontWeight: 600 }}>{v}</span>
          </div>
        ))}
        <div style={{ gridColumn: "1/-1", marginTop: 2 }}>
          <span style={{ color: C.text3 }}>last refuel </span>
          <span style={{ color: C.text1, fontWeight: 600 }}>{timeAgo(lastRefillMs)}</span>
          {onCooldown && <span style={{ color: C.amber }}> · cooling</span>}
        </div>
      </div>

      {/* action buttons in inset tray */}
      <div style={{
        background: C.base, borderRadius: 12,
        boxShadow: NEU.insetSm,
        padding: "8px 10px",
        display: "flex", gap: 8,
      }}>
        <Btn small accent
          onClick={() => writeContract({ ...contract, functionName: "refuel", args: [address] })}
          disabled={!isConnected || !eligible || isPending}>
          <Zap size={11} /> Refuel
        </Btn>
        <Btn small
          onClick={() => writeContract({ ...contract, functionName: active ? "pauseWallet" : "resumeWallet", args: [address] })}
          disabled={!isConnected || isPending}>
          {active ? <Pause size={11} /> : <Play size={11} />}
        </Btn>
        <Btn small danger
          onClick={() => { writeContract({ ...contract, functionName: "removeWallet", args: [address] }); onChange?.(); }}
          disabled={!isConnected || isPending}>
          <Trash2 size={11} />
        </Btn>
      </div>
    </div>
  );
}