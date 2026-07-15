"use client";
import { useState, useMemo } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import { Pause, Play, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { contract } from "../lib/contract";
import { C, NEU } from "../lib/tokens";
import Tank from "./Tank";
import { MetricCard, Field, NumInput, Btn } from "./UI";

export default function VaultPanel({ wallets }) {
  const { isConnected } = useAccount();
  const [depositVal, setDepositVal] = useState("0.5");
  const [withdrawVal, setWithdrawVal] = useState("0.5");

  const { data: vaultBalWei } = useReadContract({ ...contract, functionName: "vaultBalance", query: { refetchInterval: 4000 } });
  const { data: paused }      = useReadContract({ ...contract, functionName: "paused",        query: { refetchInterval: 5000 } });
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash, query: { enabled: !!hash } });

  const vaultBalance  = vaultBalWei ? Number(formatEther(vaultBalWei)) : 0;
  const activeWallets = wallets.filter(w => w.active);
  const belowThreshold = wallets.filter(w => w.balance !== undefined && w.balance < w.threshold).length;
  const refillsToday  = wallets.reduce((a, w) => a + (w.refillsInWindow || 0), 0);
  const busy = isPending || isConfirming;

  const runway = useMemo(() => {
    if (!activeWallets.length) return 0;
    const avg = activeWallets.reduce((a, w) => a + w.refillAmount, 0) / activeWallets.length;
    return avg > 0 ? Math.max(0, Math.floor(vaultBalance / avg)) : 0;
  }, [vaultBalance, activeWallets]);

  return (
    <div style={{ marginBottom: 32 }}>
      {/* metric cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
        gap: 16, marginBottom: 24,
      }}>
        <MetricCard label="Vault balance" value={`${Number(vaultBalance.toFixed(3))} MON`}
          sub={runway < 5 ? "⚠ top up soon" : `~${runway} refuels left`}
          status={runway < 5 ? "warn" : "good"} />
        <MetricCard label="Wallets" value={wallets.length}
          sub={`${activeWallets.length} active`} />
        <MetricCard label="Need refuel" value={belowThreshold}
          sub={belowThreshold > 0 ? "below threshold" : "all healthy"}
          status={belowThreshold > 0 ? "warn" : "good"} />
        <MetricCard label="Refuels today" value={refillsToday}
          sub="across fleet" status="good" />
      </div>

      {/* vault controls card */}
      <div style={{
        background: C.base, borderRadius: 20, boxShadow: NEU.raised,
        padding: "24px 28px",
        display: "flex", flexWrap: "wrap", alignItems: "center",
        gap: 28, justifyContent: "space-between",
      }}>
        <Tank balance={vaultBalance} capacity={Math.max(vaultBalance * 1.15, 1)} runway={runway} />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "flex-end" }}>
          <Field label="Deposit MON">
            <div style={{ display: "flex", gap: 8 }}>
              <NumInput value={depositVal} onChange={setDepositVal} />
              <Btn accent onClick={() => writeContract({ ...contract, functionName: "deposit", value: parseEther(depositVal) })}
                disabled={!isConnected || busy}>
                <ArrowDownToLine size={13} /> Deposit
              </Btn>
            </div>
          </Field>
          <Field label="Withdraw MON">
            <div style={{ display: "flex", gap: 8 }}>
              <NumInput value={withdrawVal} onChange={setWithdrawVal} />
              <Btn onClick={() => writeContract({ ...contract, functionName: "withdraw", args: [parseEther(withdrawVal)] })}
                disabled={!isConnected || busy}>
                <ArrowUpFromLine size={13} /> Withdraw
              </Btn>
            </div>
          </Field>
          <Btn danger onClick={() => writeContract({ ...contract, functionName: paused ? "resumeVault" : "pauseVault" })}
            disabled={!isConnected || busy}>
            {paused ? <Play size={13} /> : <Pause size={13} />}
            {paused ? "Resume vault" : "Pause vault"}
          </Btn>
        </div>
      </div>
    </div>
  );
}