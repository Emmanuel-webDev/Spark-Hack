"use client";
import { useAccount, useDisconnect } from "wagmi";
import { C, NEU, short } from "../lib/tokens";
import { useConnectWithNetwork } from "../lib/useConnectWithNetwork";

export default function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { handleConnect, handleSwitchNetwork, isPending, isWrongNetwork } =
    useConnectWithNetwork();

  const base = {
    border: "none",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 10,
    cursor: "pointer",
    transition: "box-shadow 150ms, transform 120ms, opacity 150ms",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };

  if (isConnected && isWrongNetwork) {
    return (
      <button
        onClick={handleSwitchNetwork}
        disabled={isPending}
        style={{
          ...base,
          background: "#8a5a00",
          color: "#fff",
          padding: "8px 16px",
          opacity: isPending ? 0.7 : 1,
          boxShadow: "4px 4px 10px #c4b0d0, -2px -2px 8px #ffffff",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {isPending ? "Switching…" : "⚠ Switch to Monad"}
      </button>
    );
  }

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        style={{
          ...base,
          background: C.base,
          color: C.text2,
          boxShadow: NEU.raisedSm,
          padding: "7px 16px",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = NEU.insetSm)}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = NEU.raisedSm)}
      >
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12 }}>
          {short(address)}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isPending}
      style={{
        ...base,
        background: C.accent,
        color: "#fff",
        padding: "8px 20px",
        opacity: isPending ? 0.6 : 1,
        boxShadow: "4px 4px 10px #3a1848, -2px -2px 8px #7a4490",
      }}
      onMouseEnter={(e) => {
        if (!isPending) e.currentTarget.style.transform = "scale(0.97)";
      }}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {isPending ? "Connecting…" : "Connect"}
    </button>
  );
}
