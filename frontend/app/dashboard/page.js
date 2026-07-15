"use client";
import { useState, useMemo, useEffect } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { formatEther } from "viem";
import Link from "next/link";
import { Plus, Fuel } from "lucide-react";
import { contract } from "../../lib/contract";
import { C, NEU } from "../../lib/tokens";
import ConnectButton from "../../components/ConnectButton";
import VaultPanel from "../../components/VaultPanel";
import WalletCard from "../../components/WalletCard";
import AddWalletModal from "../../components/AddWalletModal";
import ActivityLog from "../../components/ActivityLog";
import TelegramAlertButton from "../../components/TelegramAlertButton";
import { Btn, SectionHeader } from "../../components/UI";
export const dynamic = "force-dynamic";

export default function Page() {
  const { isConnected } = useAccount();
  const [showAdd, setShowAdd] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: walletAddresses, refetch } = useReadContract({
    ...contract, functionName: "getRegisteredWallets", query: { refetchInterval: 5000 },
  });
  const { data: vaultPaused } = useReadContract({
    ...contract, functionName: "paused", query: { refetchInterval: 5000 },
  });

  const addresses = walletAddresses || [];

  const { data: policyResults } = useReadContracts({
    contracts: addresses.map(addr => ({ ...contract, functionName: "policies", args: [addr] })),
    query: { enabled: addresses.length > 0, refetchInterval: 5000 },
  });

  const walletSummaries = useMemo(() => {
    if (!policyResults) return [];
    return addresses.map((address, i) => {
      const r = policyResults[i]?.result;
      if (!r) return null;
      const [active, thresholdWei, refillAmountWei,,,,, refillsInWindow] = r;
      return {
        address, active,
        threshold: Number(formatEther(thresholdWei)),
        refillAmount: Number(formatEther(refillAmountWei)),
        refillsInWindow: Number(refillsInWindow),
      };
    }).filter(Boolean);
  }, [policyResults, addresses]);

  if (!mounted) return null;

  if (!isConnected) {
    return (
      <div style={{
        minHeight: "100vh", background: C.base,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 24, textAlign: "center", gap: 20,
      }}>
        <div style={{ background: C.base, width: 64, height: 64, borderRadius: 20, boxShadow: NEU.raised, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Fuel size={28} color={C.accent} />
        </div>
        <div>
          <div style={{ fontFamily: "'Ragot',sans-serif", fontSize: 32, color: C.text1, letterSpacing: -0.5, marginBottom: 8 }}>Refilr</div>
          <p style={{ color: C.text3, fontSize: 14, maxWidth: 300, lineHeight: 1.6 }}>
            Connect your wallet to manage your vault and monitor your registered wallets.
          </p>
        </div>
        <ConnectButton />
        <Link href="/" style={{ color: C.text3, fontSize: 12, textDecoration: "none" }}>← Back to home</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.base }}>
      {/* topbar */}
      <header style={{ background: C.base, boxShadow: "0 4px 12px #c4b0d055", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{
          maxWidth: 1160, margin: "0 auto", padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link href="/" style={{ fontFamily: "'Ragot',sans-serif", fontSize: 22, color: C.text1, textDecoration: "none", letterSpacing: -0.5 }}>
              Refilr
            </Link>
            {/* status pill */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: C.base, boxShadow: NEU.insetSm,
              padding: "5px 12px", borderRadius: 20,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: vaultPaused ? C.amber : C.green,
                display: "inline-block",
                animation: vaultPaused ? "none" : "blink 2.5s infinite",
              }} />
              <span style={{ fontSize: 11, color: C.text3, fontWeight: 600 }}>
                {vaultPaused ? "paused" : "live"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TelegramAlertButton />
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* main */}
      <main style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 24px 56px" }}>
        <VaultPanel wallets={walletSummaries} />

        {/* wallets */}
        <div style={{ marginBottom: 32 }}>
          <SectionHeader
            title="Wallets"
            action={
              <Btn accent onClick={() => setShowAdd(true)}>
                <Plus size={14} /> Register wallet
              </Btn>
            }
          />

          {addresses.length === 0 ? (
            <div style={{
              background: C.base, borderRadius: 20, boxShadow: NEU.inset,
              padding: "48px 24px", textAlign: "center",
            }}>
              <div style={{ color: C.text3, fontSize: 14, lineHeight: 1.7 }}>
                No wallets registered yet.<br />
                <span style={{ fontSize: 13 }}>Register a wallet to start monitoring its balance.</span>
              </div>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
              gap: 20,
            }}>
              {addresses.map(addr => (
                <WalletCard key={addr} address={addr} onChange={refetch} />
              ))}
            </div>
          )}
        </div>

        {/* activity */}
        <SectionHeader title="Activity" />
        <ActivityLog />
      </main>

      <style>{`
        @media (max-width: 600px) {
          main { padding: 20px 14px 48px !important; }
          header > div { padding: 12px 16px !important; }
        }
      `}</style>

      {showAdd && (
        <AddWalletModal
          onClose={() => setShowAdd(false)}
          onRegistered={() => { refetch(); setShowAdd(false); }}
        />
      )}
    </div>
  );
}