"use client";
import { useState } from "react";
import { useReadContract, useWriteContract, useBalance, useAccount } from "wagmi";
import { formatEther } from "viem";
import { AlertTriangle, Copy, Check, Zap, Pause, Play, Trash2 } from "lucide-react";
import { contract } from "../lib/contract";
import { C, fmt, short, timeAgo } from "../lib/tokens";
import Gauge from "./Gauge";
import { ActionBtn } from "./UI";

export default function WalletCard({ address, onChange }) {
  const { isConnected } = useAccount();
  const [copied, setCopied] = useState(false);
  const { writeContract, isPending } = useWriteContract();

  const { data: policy } = useReadContract({
    ...contract,
    functionName: "policies",
    args: [address],
    query: { refetchInterval: 4000 },
  });

  const { data: nativeBalance } = useBalance({
    address,
    query: { refetchInterval: 4000 },
  });

  const { data: eligibility } = useReadContract({
    ...contract,
    functionName: "isRefuelEligible",
    args: [address],
    query: { refetchInterval: 4000 },
  });

  if (!policy) return null;
  const [active, thresholdWei, refillAmountWei, cooldown, dailyLimit, lastRefillAt, , refillsInWindow] = policy;

  const threshold = Number(formatEther(thresholdWei));
  const refillAmount = Number(formatEther(refillAmountWei));
  const balance = nativeBalance ? Number(formatEther(nativeBalance.value)) : 0;
  const low = balance < threshold;
  const lastRefillMs = Number(lastRefillAt) * 1000;
  const onCooldown = lastRefillMs > 0 && Date.now() - lastRefillMs < Number(cooldown) * 1000;
  const max = (threshold + refillAmount) * 1.4;
  const [eligible, reason] = eligibility || [false, ""];

  function copyAddr() {
    setCopied(true);
    try {
      navigator.clipboard.writeText(address);
    } catch (e) {}
    setTimeout(() => setCopied(false), 1200);
  }

  function refuelNow() {
    writeContract({ ...contract, functionName: "refuel", args: [address] });
  }
  function toggleActive() {
    writeContract({ ...contract, functionName: active ? "pauseWallet" : "resumeWallet", args: [address] });
  }
  function remove() {
    writeContract({ ...contract, functionName: "removeWallet", args: [address] });
    onChange?.();
  }

  return (
    <div
      style={{ background: C.panel, border: `1px solid ${low && active ? C.amber + "55" : C.border}` }}
      className="rounded-2xl p-4 flex flex-col"
    >
      <div className="flex items-start justify-between mb-1">
        <div>
          <button onClick={copyAddr} style={{ color: C.textFaint, fontFamily: "'JetBrains Mono',monospace" }} className="text-[11px] flex items-center gap-1 mt-0.5">
            {short(address)} {copied ? <Check size={10} color={C.green} /> : <Copy size={10} />}
          </button>
        </div>
        <div className="flex items-center gap-1">
          {!active && (
            <span style={{ color: C.textFaint, background: C.panel2 }} className="text-[10px] px-1.5 py-0.5 rounded">
              PAUSED
            </span>
          )}
          {active && low && <AlertTriangle size={14} color={C.amber} />}
        </div>
      </div>

      <div className="flex justify-center py-1">
        <Gauge balance={balance} threshold={threshold} max={max} danger={active && low} />
      </div>

      <div style={{ color: C.textDim }} className="text-[11px] grid grid-cols-2 gap-y-1 mt-1 mb-1">
        <div>
          Threshold <b style={{ color: C.text }}>{fmt(threshold, 3)}</b>
        </div>
        <div>
          Refill <b style={{ color: C.text }}>{fmt(refillAmount, 3)}</b>
        </div>
        <div>
          Cooldown <b style={{ color: C.text }}>{Number(cooldown)}s</b>
        </div>
        <div>
          Daily <b style={{ color: C.text }}>
            {Number(refillsInWindow)}/{Number(dailyLimit)}
          </b>
        </div>
        <div className="col-span-2">
          Last refill <b style={{ color: C.text }}>{timeAgo(lastRefillMs)}</b>
          {onCooldown && <span style={{ color: C.amber }}> · cooling down</span>}
        </div>
      </div>

      <div style={{ color: eligible ? C.green : C.textFaint }} className="text-[11px] mb-3">
        {eligible ? "● eligible for refuel now" : reason ? `not eligible — ${reason}` : ""}
      </div>

      <div className="flex gap-1.5 mt-auto">
        <ActionBtn small onClick={refuelNow} disabled={!isConnected || !eligible || isPending}>
          <Zap size={11} /> Refuel now
        </ActionBtn>
        <ActionBtn small onClick={toggleActive} disabled={!isConnected || isPending}>
          {active ? <Pause size={11} /> : <Play size={11} />}
        </ActionBtn>
        <ActionBtn small danger onClick={remove} disabled={!isConnected || isPending}>
          <Trash2 size={11} />
        </ActionBtn>
      </div>
    </div>
  );
}
