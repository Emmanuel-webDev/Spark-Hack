"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useConnect } from "wagmi";
import { Fuel, ShieldCheck, Gauge as GaugeIcon, Zap, ArrowRight } from "lucide-react";
import { C } from "../lib/tokens";

export default function LandingPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();

  useEffect(() => {
    if (isConnected) router.push("/dashboard");
  }, [isConnected, router]);

  function handleConnect() {
    const injectedConnector = connectors.find((c) => c.id === "injected") || connectors[0];
    if (injectedConnector) connect({ connector: injectedConnector });
  }

  return (
    <div style={{ background: C.void, minHeight: "100vh", color: C.text }} className="flex flex-col">
      <div className="max-w-5xl mx-auto w-full px-6 py-6 flex items-center gap-2.5">
        <div style={{ background: C.violetDim, border: `1px solid ${C.violet}55` }} className="w-8 h-8 rounded-lg flex items-center justify-center">
          <Fuel size={16} color={C.violet} />
        </div>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="text-sm font-semibold">
          Refilr
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <div
          style={{ color: C.textFaint, fontFamily: "'JetBrains Mono',monospace", border: `1px solid ${C.border}`, background: C.panel }}
          className="text-[11px] tracking-wider px-3 py-1.5 rounded-full mb-6"
        >
          BUILT ON MONAD TESTNET
        </div>

        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="text-4xl sm:text-5xl font-semibold mb-5 max-w-2xl leading-tight">
          Refilr
        </h1>
        <p style={{ color: C.textDim }} className="text-base sm:text-lg max-w-xl mb-4">
          Automated gas top-ups for your onchain wallets.
        </p>
        <p style={{ color: C.textDim }} className="text-sm max-w-lg mb-10 leading-relaxed">
          Deposit MON into a secure vault, register your trading bots, relayers, and automation
          wallets, and set a refill policy for each one. Refilr's automation service watches
          balances and tops them up the moment they run low — every refill is verified onchain
          by the vault contract itself, so funds only ever move when your rules say they should.
        </p>

        <button
          onClick={handleConnect}
          disabled={isPending}
          style={{ background: C.violet, color: "#0A0A12" }}
          className="flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-xl transition hover:opacity-85 disabled:opacity-60"
        >
          {isPending ? "Connecting…" : "Connect to access dashboard"}
          {!isPending && <ArrowRight size={15} />}
        </button>

        <div className="grid sm:grid-cols-3 gap-5 mt-20 max-w-3xl w-full text-left">
          <Feature icon={<GaugeIcon size={16} color={C.violet} />} title="Live monitoring" text="Every registered wallet's balance is tracked against its own threshold in real time." />
          <Feature icon={<Zap size={16} color={C.violet} />} title="Automatic refuels" text="The automation service submits a refill the moment a wallet drops below threshold." />
          <Feature icon={<ShieldCheck size={16} color={C.violet} />} title="Contract-enforced rules" text="Cooldowns, daily limits, and vault liquidity are checked onchain — automation can only propose, never bypass." />
        </div>
      </div>

      <div style={{ color: C.textFaint, borderTop: `1px solid ${C.borderSoft}` }} className="text-[11px] text-center py-5">
        Monad Testnet · not audited · use test funds only
      </div>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}` }} className="rounded-xl p-4">
      <div className="mb-2">{icon}</div>
      <div style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="text-sm font-medium mb-1">
        {title}
      </div>
      <div style={{ color: C.textDim }} className="text-xs leading-relaxed">
        {text}
      </div>
    </div>
  );
}
