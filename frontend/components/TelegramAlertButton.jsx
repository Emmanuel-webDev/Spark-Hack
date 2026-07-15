"use client";
import { useAccount } from "wagmi";
import { Bell } from "lucide-react";
import { C } from "../lib/tokens";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

export default function TelegramAlertButton() {
  const { address, isConnected } = useAccount();

  if (!isConnected || !BOT_USERNAME) return null;

  const deepLink = `https://t.me/${BOT_USERNAME}?start=${address.slice(2)}`;

  return (
    <a
      href={deepLink}
      target="_blank"
      rel="noopener noreferrer"
      style={{ background: C.panel2, color: C.text, border: `1px solid ${C.border}` }}
      className="text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition hover:opacity-85"
    >
      <Bell size={13} /> Get Telegram alerts
    </a>
  );
}
