"use client";
import { useAccount } from "wagmi";
import { C, NEU } from "../lib/tokens";
import { Bell } from "lucide-react";

const BOT = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

export default function TelegramAlertButton() {
  const { address, isConnected } = useAccount();
  if (!isConnected || !BOT) return null;
  return (
    <a href={`https://t.me/${BOT}?start=${address.slice(2)}`}
      target="_blank" rel="noopener noreferrer"
      style={{
        background: C.base, color: C.text2, border: "none",
        boxShadow: NEU.raisedSm, fontFamily: "inherit", fontSize: 13, fontWeight: 600,
        padding: "7px 16px", borderRadius: 10, textDecoration: "none",
        display: "inline-flex", alignItems: "center", gap: 6,
        transition: "box-shadow 150ms",
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = NEU.insetSm}
      onMouseLeave={e => e.currentTarget.style.boxShadow = NEU.raisedSm}
    >
      <Bell size={13} color={C.accentMid} /> Alerts
    </a>
  );
}