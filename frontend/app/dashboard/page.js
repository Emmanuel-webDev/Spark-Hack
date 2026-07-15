"use client";
import { useState, useMemo } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { formatEther } from "viem";
import Link from "next/link";
import { Fuel, Radio, Wallet2, Plus } from "lucide-react";
import { contract } from "../../lib/contract";
import { C } from "../../lib/tokens";
import ConnectButton from "../../components/ConnectButton";
import TelegramAlertButton from "../../components/TelegramAlertButton";
import VaultPanel from "../../components/VaultPanel";
import WalletCard from "../../components/WalletCard";
import AddWalletModal from "../../components/AddWalletModal";
import ActivityLog from "../../components/ActivityLog";
import { ActionBtn } from "../../components/UI";

export default function Page() {
  const { isConnected } = useAccount();
  const [showAdd, setShowAdd] = useState(false);

  const { data: walletAddresses, refetch } = useReadContract({
    ...contract,
    functionName: "getRegisteredWallets",
    query: { refetchInterval: 5000 },
  });
  const { data: vaultPaused } = useReadContract({
    ...contract,
    functionName: "paused",
    query: { refetchInterval: 5000 },
  });

  const addresses = walletAddresses || [];

  // Single batched hook for all wallets' policies — safe with a dynamic
  // address list, unlike calling useReadContract in a .map().
  const { data: policyResults } = useReadContracts({
    contracts: addresses.map((addr) => ({ ...contract, functionName: "policies", args: [addr] })),
    query: { enabled: addresses.length > 0, refetchInterval: 5000 },
  });

  const walletSummaries = useMemo(() => {
    if (!policyResults) return [];
    return addresses.map((address, i) => {
      const r = policyResults[i]?.result;
      if (!r) return null;
      const [active, thresholdWei, refillAmountWei, , , , , refillsInWindow] = r;
      return {
        address,
        active,
        threshold: Number(formatEther(thresholdWei)),
        refillAmount: Number(formatEther(refillAmountWei)),
        refillsInWindow: Number(refillsInWindow),
      };
    }).filter(Boolean);
  }, [policyResults, addresses]);

  if (!isConnected) {
    return (
      <div style={{ background: C.void, minHeight: "100vh", color: C.text }} className="flex flex-col items-center justify-center px-5 text-center">
        <div style={{ background: C.violetDim, border: `1px solid ${C.violet}55` }} className="w-12 h-12 rounded-xl flex items-center justify-center mb-4">
          <Fuel size={22} color={C.violet} />
        </div>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="text-lg font-semibold mb-2">
          Connect a wallet to continue
        </div>
        <div style={{ color: C.textDim }} className="text-sm max-w-xs mb-6">
          The dashboard reads and writes directly to the vault contract, so it needs a connected wallet on Monad Testnet.
        </div>
        <ConnectButton />
        <Link href="/" style={{ color: C.textFaint }} className="text-xs mt-6 hover:opacity-80">
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: C.void, minHeight: "100vh" }}>
      <div style={{ borderBottom: `1px solid ${C.borderSoft}` }} className="sticky top-0 z-20">
        <div style={{ background: `${C.void}CC` }} className="px-5 py-3 flex items-center justify-between backdrop-blur">
          <Link href="/" className="flex items-center gap-2.5">
            <div style={{ background: C.violetDim, border: `1px solid ${C.violet}55` }} className="w-8 h-8 rounded-lg flex items-center justify-center">
              <Fuel size={16} color={C.violet} />
            </div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="text-sm font-semibold leading-none">
                Refilr
              </div>
              <div style={{ color: C.textFaint, fontFamily: "'JetBrains Mono',monospace" }} className="text-[10px] tracking-wider mt-0.5">
                MONAD TESTNET
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" style={{ color: vaultPaused ? C.textFaint : C.green }}>
              <Radio size={12} style={{ animation: vaultPaused ? "none" : "pulse 1.6s infinite" }} />
              <span style={{ fontFamily: "'JetBrains Mono',monospace" }} className="text-[11px]">
                {vaultPaused ? "VAULT PAUSED" : "VAULT ACTIVE"}
              </span>
            </div>
            <TelegramAlertButton />
            <ConnectButton />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-6 space-y-6">
        <VaultPanel wallets={walletSummaries} />

        <div>
          <div className="flex items-center justify-between mb-3">
            <div style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="text-sm font-semibold flex items-center gap-2">
              <Wallet2 size={15} color={C.textDim} /> Registered wallets
            </div>
            <ActionBtn onClick={() => setShowAdd(true)} primary>
              <Plus size={13} /> Register wallet
            </ActionBtn>
          </div>

          {addresses.length === 0 ? (
            <div style={{ background: C.panel, border: `1px dashed ${C.border}`, color: C.textDim }} className="rounded-2xl p-10 text-center text-sm">
              No wallets registered yet. Add one to start monitoring balances.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {addresses.map((addr) => (
                <WalletCard key={addr} address={addr} onChange={refetch} />
              ))}
            </div>
          )}
        </div>

        <div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="text-sm font-semibold mb-3">
            Activity
          </div>
          <ActivityLog />
        </div>
      </div>

      {showAdd && (
        <AddWalletModal
          onClose={() => setShowAdd(false)}
          onRegistered={() => {
            refetch();
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}
