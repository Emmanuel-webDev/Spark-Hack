"use client";
import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { X, ChevronRight } from "lucide-react";
import { contract } from "../lib/contract";
import { C } from "../lib/tokens";
import { ActionBtn, LabeledInput } from "./UI";

export default function AddWalletModal({ onClose, onRegistered }) {
  const [form, setForm] = useState({
    address: "",
    threshold: "0.02",
    refillAmount: "0.1",
    cooldown: "1800",
    dailyLimit: "5",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    query: { enabled: !!hash },
  });

  function submit() {
    if (!form.address || !form.address.startsWith("0x") || form.address.length !== 42) return;
    writeContract({
      ...contract,
      functionName: "registerWallet",
      args: [
        form.address,
        parseEther(form.threshold || "0"),
        parseEther(form.refillAmount || "0"),
        BigInt(form.cooldown || "0"),
        BigInt(form.dailyLimit || "0"),
      ],
    });
  }

  if (isSuccess) {
    onRegistered?.(form.address);
  }

  const busy = isPending || isConfirming;

  return (
    <div style={{ background: "#000000AA" }} className="fixed inset-0 z-30 flex items-center justify-center p-4">
      <div style={{ background: C.panel, border: `1px solid ${C.border}` }} className="rounded-2xl p-5 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <div style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="text-sm font-semibold">
            Register wallet
          </div>
          <button onClick={onClose}>
            <X size={16} color={C.textDim} />
          </button>
        </div>
        <div className="space-y-3">
          <LabeledInput label="Wallet address" value={form.address} onChange={set("address")} placeholder="0x…" mono />
          <div className="grid grid-cols-2 gap-3">
            <LabeledInput label="Threshold (MON)" value={form.threshold} onChange={set("threshold")} mono />
            <LabeledInput label="Refill amount (MON)" value={form.refillAmount} onChange={set("refillAmount")} mono />
            <LabeledInput label="Cooldown (sec)" value={form.cooldown} onChange={set("cooldown")} mono />
            <LabeledInput label="Daily limit" value={form.dailyLimit} onChange={set("dailyLimit")} mono />
          </div>
        </div>
        {error && (
          <div style={{ color: C.red }} className="text-[11px] mt-3">
            {error.shortMessage || error.message}
          </div>
        )}
        <div className="flex gap-2 mt-5">
          <ActionBtn onClick={onClose} disabled={busy}>
            Cancel
          </ActionBtn>
          <ActionBtn primary onClick={submit} disabled={busy}>
            {busy ? "Confirming…" : "Register"} <ChevronRight size={13} />
          </ActionBtn>
        </div>
      </div>
    </div>
  );
}
