"use client";
import { useCallback } from "react";
import { useAccount, useConnect, useSwitchChain } from "wagmi";
import { monadTestnet } from "./chain";

// Takes an optional toast function — if provided, errors show as toasts
// instead of being returned as a string.
export function useConnectWithNetwork(toast) {
  const { isConnected, chainId } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== monadTestnet.id;
  const isPending = isConnecting || isSwitching;

  function notify(message, type = "error") {
    if (toast) toast({ message, type });
  }

  async function addMonadNetwork() {
    if (typeof window === "undefined" || !window.ethereum) return false;
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: `0x${monadTestnet.id.toString(16)}`,
          chainName: monadTestnet.name,
          nativeCurrency: monadTestnet.nativeCurrency,
          rpcUrls: [monadTestnet.rpcUrls.default.http[0]],
          blockExplorerUrls: monadTestnet.blockExplorers
            ? [monadTestnet.blockExplorers.default.url] : [],
        }],
      });
      notify("Monad Testnet added to your wallet.", "success");
      return true;
    } catch {
      notify("Failed to add Monad Testnet. Please add it manually in MetaMask.", "error");
      return false;
    }
  }

  async function handleSwitchNetwork() {
    try {
      switchChain({ chainId: monadTestnet.id });
    } catch {
      const added = await addMonadNetwork();
      if (added) {
        try { switchChain({ chainId: monadTestnet.id }); } catch {}
      }
    }
  }

  const handleConnect = useCallback(async () => {
    // No wallet detected
    if (typeof window === "undefined" || (!window.ethereum && !connectors.length)) {
      notify("No wallet found. Install MetaMask to continue.", "warn");
      return;
    }

    const connector = connectors.find(c => c.id === "injected") || connectors[0];
    if (!connector) {
      notify("No wallet detected. Please install MetaMask.", "warn");
      return;
    }

    connect(
      { connector, chainId: monadTestnet.id },
      {
        onSuccess() {
          notify("Wallet connected.", "success");
        },
        onError(err) {
          if (
            err.message?.includes("Provider not found") ||
            err.message?.includes("No injected") ||
            err.message?.includes("connector not found")
          ) {
            notify("No wallet detected. Please install MetaMask to continue.", "warn");
          } else if (err.message?.includes("rejected") || err.message?.includes("denied")) {
            notify("Connection cancelled.", "info");
          } else if (err.message?.includes("chain") || err.message?.includes("Chain")) {
            addMonadNetwork().then(added => {
              if (added) connect({ connector, chainId: monadTestnet.id });
            });
          } else {
            notify(err.shortMessage || err.message || "Connection failed.", "error");
          }
        },
      }
    );
  }, [connectors, connect, toast]);

  return { handleConnect, handleSwitchNetwork, isPending, isWrongNetwork };
}