"use client";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { C, short } from "../lib/tokens";

export default function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        style={{ background: C.panel2, color: C.text, border: `1px solid ${C.border}` }}
        className="text-xs font-medium px-3.5 py-2 rounded-lg transition hover:opacity-85"
      >
        {short(address)}
      </button>
    );
  }

  const injectedConnector = connectors.find((c) => c.id === "injected") || connectors[0];

  return (
    <button
      onClick={() => injectedConnector && connect({ connector: injectedConnector })}
      disabled={isPending || !injectedConnector}
      style={{ background: C.violet, color: "#0A0A12", border: `1px solid ${C.violet}` }}
      className="text-xs font-medium px-3.5 py-2 rounded-lg transition hover:opacity-85 disabled:opacity-60"
    >
      {isPending ? "Connecting…" : injectedConnector ? "Connect wallet" : "No wallet found"}
    </button>
  );
}
