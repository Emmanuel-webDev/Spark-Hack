"use client";
import { useEffect, useState, useCallback } from "react";
import { useAccount, useConnect, useSwitchChain } from "wagmi";
import { monadTestnet } from "./chain";

export function useConnectWithNetwork() {
  const { isConnected, chainId } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [error, setError] = useState(null);
  const [addingNetwork, setAddingNetwork] = useState(false);

  const isWrongNetwork = isConnected && chainId !== monadTestnet.id;
  const isPending = isConnecting || isSwitching || addingNetwork;

  // Auto-switch when connected on wrong network
  useEffect(() => {
    if (isWrongNetwork && !isSwitching) {
      handleSwitchNetwork();
    }
  }, [isWrongNetwork]);

  async function addMonadNetwork() {
    if (typeof window === "undefined" || !window.ethereum) return false;
    setAddingNetwork(true);
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: `0x${monadTestnet.id.toString(16)}`,
          chainName: monadTestnet.name,
          nativeCurrency: monadTestnet.nativeCurrency,
          rpcUrls: [monadTestnet.rpcUrls.default.http[0]],
          blockExplorerUrls: monadTestnet.blockExplorers
            ? [monadTestnet.blockExplorers.default.url]
            : [],
        }],
      });
      return true;
    } catch (err) {
      setError("Failed to add Monad Testnet to your wallet.");
      return false;
    } finally {
      setAddingNetwork(false);
    }
  }

  async function handleSwitchNetwork() {
    setError(null);
    try {
      switchChain({ chainId: monadTestnet.id });
    } catch (err) {
      // Chain not in wallet — try adding it first
      const added = await addMonadNetwork();
      if (added) {
        try { switchChain({ chainId: monadTestnet.id }); } catch {}
      }
    }
  }

  const handleConnect = useCallback(async () => {
    setError(null);
    const connector = connectors.find((c) => c.id === "injected") || connectors[0];
    if (!connector) {
      setError("No wallet found. Please install MetaMask.");
      return;
    }
    try {
      connect(
        { connector, chainId: monadTestnet.id },
        {
          onError(err) {
            if (err.message?.includes("Chain not configured") || err.message?.includes("chain")) {
              addMonadNetwork().then(added => {
                if (added) connect({ connector, chainId: monadTestnet.id });
              });
            } else {
              setError(err.message || "Connection failed.");
            }
          },
        }
      );
    } catch (err) {
      setError(err.message || "Connection failed.");
    }
  }, [connectors, connect]);

  return { handleConnect, handleSwitchNetwork, isPending, isWrongNetwork, error };
}