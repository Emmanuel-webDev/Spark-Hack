"use client";
import { useState, useMemo } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import { Pause, Play } from "lucide-react";
import { contract } from "../lib/contract";
import { C } from "../lib/tokens";
import Tank from "./Tank";
import { Stat, Field, NumInput, ActionBtn } from "./UI";

export default function VaultPanel({ wallets }) {
  const { isConnected } = useAccount();
  const [depositInput, setDepositInput] = useState("0.5");
  const [withdrawInput, setWithdrawInput] = useState("0.5");

  const { data: vaultBalanceWei, refetch: refetchVault } = useReadContract({
    ...contract,
    functionName: "vaultBalance",
    query: { refetchInterval: 4000 },
  });
  const { data: paused, refetch: refetchPaused } = useReadContract({
    ...contract,
    functionName: "paused",
    query: { refetchInterval: 4000 },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
    query: { enabled: !!hash },
  });

  const vaultBalance = vaultBalanceWei ? Number(formatEther(vaultBalanceWei)) : 0;
  const activeWallets = wallets.filter((w) => w.active);
  const belowThreshold = wallets.filter((w) => w.balance < w.threshold).length;
  const refillsToday = wallets.reduce((a, w) => a + w.refillsInWindow, 0);

  const runway = useMemo(() => {
    if (!activeWallets.length) return 0;
    const avg = activeWallets.reduce((a, w) => a + w.refillAmount, 0) / activeWallets.length;
    return avg > 0 ? Math.max(0, Math.floor(vaultBalance / avg)) : 0;
  }, [vaultBalance, activeWallets]);

  const tankCapacity = Math.max(vaultBalance * 1.15, 1);

  function deposit() {
    const amt = parseFloat(depositInput);
    if (!amt || amt <= 0) return;
    writeContract({ ...contract, functionName: "deposit", value: parseEther(depositInput) });
  }
  function withdraw() {
    const amt = parseFloat(withdrawInput);
    if (!amt || amt <= 0) return;
    writeContract({ ...contract, functionName: "withdraw", args: [parseEther(withdrawInput)] });
  }
  function toggleVault() {
    writeContract({ ...contract, functionName: paused ? "resumeVault" : "pauseVault" });
  }

  const busy = isPending || isConfirming;

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}` }} className="rounded-2xl p-6 grid md:grid-cols-[auto_1fr] gap-8">
      <div>
        <div style={{ color: C.textFaint, fontFamily: "'JetBrains Mono',monospace" }} className="text-[11px] tracking-wider mb-3">
          DEPOT TANK
        </div>
        <Tank balance={vaultBalance} capacity={tankCapacity} runway={runway} />
      </div>
      <div className="flex flex-col justify-between">
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Fleet" value={wallets.length} sub="registered wallets" />
          <Stat label="Below threshold" value={belowThreshold} sub="need refuel" warn />
          <Stat label="Refuels today" value={refillsToday} sub="across fleet" />
        </div>

        <div className="flex flex-wrap items-end gap-3 mt-6">
          <Field label="Deposit MON">
            <div className="flex gap-1.5">
              <NumInput value={depositInput} onChange={setDepositInput} />
              <ActionBtn onClick={deposit} primary disabled={!isConnected || busy}>
                Deposit
              </ActionBtn>
            </div>
          </Field>
          <Field label="Withdraw MON">
            <div className="flex gap-1.5">
              <NumInput value={withdrawInput} onChange={setWithdrawInput} />
              <ActionBtn onClick={withdraw} disabled={!isConnected || busy}>
                Withdraw
              </ActionBtn>
            </div>
          </Field>
          <ActionBtn onClick={toggleVault} danger={!paused} disabled={!isConnected || busy}>
            {paused ? <Play size={13} /> : <Pause size={13} />}
            {paused ? "Resume vault" : "Pause vault"}
          </ActionBtn>
        </div>
        {!isConnected && (
          <div style={{ color: C.textFaint }} className="text-[11px] mt-2">
            Connect a wallet to deposit, withdraw, or pause the vault.
          </div>
        )}
      </div>
    </div>
  );
}
