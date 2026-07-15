"use client";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { C, NEU, short } from "../lib/tokens";

export default function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const base = {
    border: "none", fontFamily: "inherit", fontSize: 13,
    fontWeight: 600, borderRadius: 10, cursor: "pointer",
    transition: "box-shadow 150ms, transform 120ms",
    display: "inline-flex", alignItems: "center",
  };

  if (isConnected) return (
    <button onClick={() => disconnect()}
      style={{ ...base, background: C.base, color: C.text2, boxShadow: NEU.raisedSm, padding: "7px 16px" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = NEU.insetSm}
      onMouseLeave={e => e.currentTarget.style.boxShadow = NEU.raisedSm}
    >
      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12 }}>{short(address)}</span>
    </button>
  );

  const connector = connectors.find(c => c.id === "injected") || connectors[0];
  return (
    <button onClick={() => connector && connect({ connector })}
      disabled={isPending || !connector}
      style={{ ...base, background: C.accent, color: "#fff", padding: "8px 20px", opacity: isPending ? 0.6 : 1,
        boxShadow: "4px 4px 10px #3a1848, -2px -2px 8px #7a4490" }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(0.97)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >{isPending ? "Connecting…" : "Connect"}</button>
  );
}