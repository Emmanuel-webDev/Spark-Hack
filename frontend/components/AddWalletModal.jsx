"use client";
import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { X } from "lucide-react";
import { contract } from "../lib/contract";
import { C, NEU } from "../lib/tokens";
import { Btn, LabeledInput } from "./UI";

export default function AddWalletModal({ onClose, onRegistered }) {
  const [form, setForm] = useState({ address: "", threshold: "0.02", refillAmount: "0.1", cooldown: "1800", dailyLimit: "5" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash, query: { enabled: !!hash } });
  if (isSuccess) onRegistered?.(form.address);
  const busy = isPending || isConfirming;

  function submit() {
    if (!form.address || !form.address.startsWith("0x") || form.address.length !== 42) return;
    writeContract({
      ...contract, functionName: "registerWallet",
      args: [form.address, parseEther(form.threshold || "0"), parseEther(form.refillAmount || "0"),
             BigInt(form.cooldown || "0"), BigInt(form.dailyLimit || "0")],
    });
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#49225B44", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{
        background: C.base, borderRadius: 24, boxShadow: NEU.raised,
        padding: 28, width: "100%", maxWidth: 400, maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <span style={{ fontFamily: "'Ragot',sans-serif", fontSize: 22, color: C.text1, letterSpacing: -0.5 }}>Register wallet</span>
          <button onClick={onClose} style={{
            background: C.base, border: "none", cursor: "pointer", padding: 8,
            borderRadius: 8, boxShadow: NEU.raisedSm, display: "flex", alignItems: "center",
          }}>
            <X size={15} color={C.text3} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <LabeledInput label="Wallet address" value={form.address} onChange={set("address")} placeholder="0x…" mono />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <LabeledInput label="Threshold (MON)" value={form.threshold} onChange={set("threshold")} mono />
            <LabeledInput label="Refill (MON)"    value={form.refillAmount} onChange={set("refillAmount")} mono />
            <LabeledInput label="Cooldown (sec)"  value={form.cooldown} onChange={set("cooldown")} mono />
            <LabeledInput label="Daily limit"     value={form.dailyLimit} onChange={set("dailyLimit")} mono />
          </div>
        </div>

        {error && (
          <div style={{ color: C.red, fontSize: 12, marginTop: 14, padding: "8px 12px", background: C.redSoft, borderRadius: 8 }}>
            {error.shortMessage || error.message}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <Btn onClick={onClose} disabled={busy}>Cancel</Btn>
          <Btn accent onClick={submit} disabled={busy} fullWidth>
            {busy ? "Confirming…" : "Register wallet"}
          </Btn>
        </div>
      </div>
    </div>
  );
}