import { formatEther } from "viem";
import { sendTelegramMessage } from "./telegram.js";
import { getSubscribersForAddress, getAllSubscriberChatIds } from "./subscribers.js";

function short(addr) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

function formatEvent(log) {
  const { eventName, args } = log;
  switch (eventName) {
    case "Refueled":
      return `⛽ *Refuel* — ${short(args.wallet)} received ${formatEther(args.amount)} MON (was ${formatEther(args.walletBalanceBefore)})`;
    case "Deposited":
      return `💰 *Deposit* — ${short(args.from)} deposited ${formatEther(args.amount)} MON`;
    case "Withdrawn":
      return `📤 *Withdraw* — ${formatEther(args.amount)} MON sent to ${short(args.to)}`;
    case "WalletRegistered":
      return `➕ *Wallet registered* — ${short(args.wallet)} (threshold ${formatEther(args.threshold)} MON, refill ${formatEther(args.refillAmount)} MON)`;
    case "WalletRemoved":
      return `🗑️ *Wallet removed* — ${short(args.wallet)}`;
    case "PolicyUpdated":
      return `✏️ *Policy updated* — ${short(args.wallet)}`;
    case "WalletPaused":
      return `⏸️ *Wallet paused* — ${short(args.wallet)}`;
    case "WalletResumed":
      return `▶️ *Wallet resumed* — ${short(args.wallet)}`;
    case "VaultPaused":
      return `🛑 *Vault paused* — automation suspended`;
    case "VaultResumed":
      return `✅ *Vault resumed* — automation active`;
    case "AutomationOperatorUpdated":
      return `🤖 *Automation operator updated* — ${short(args.operator)}`;
    default:
      return `ℹ️ *${eventName}*`;
  }
}

const WALLET_SCOPED_EVENTS = new Set([
  "Refueled",
  "WalletRegistered",
  "WalletRemoved",
  "PolicyUpdated",
  "WalletPaused",
  "WalletResumed",
]);

// Subscribes to every event on the contract and routes each one:
//  - wallet-scoped events (refuel, register, pause, etc.) go to whoever
//    linked that specific wallet address via the "Get Telegram alerts" button
//  - vault-wide events (deposit, withdraw, vault pause/resume) go to everyone
//    who's linked at least one wallet, since they affect the whole fleet
//  - the admin chat (TELEGRAM_CHAT_ID, if set) always gets everything
// Returns an unwatch() function for clean shutdown.
export function startTelegramNotifier(publicClient, contract, token, adminChatId) {
  if (!token) {
    console.log("[telegram] TELEGRAM_BOT_TOKEN not set — alerts disabled");
    return () => {};
  }

  const unwatch = publicClient.watchContractEvent({
    ...contract,
    onLogs(logs) {
      for (const log of logs) {
        const text = `${formatEvent(log)}\ntx: \`${log.transactionHash}\``;
        const recipients = new Set();
        if (adminChatId) recipients.add(String(adminChatId));

        if (WALLET_SCOPED_EVENTS.has(log.eventName) && log.args.wallet) {
          for (const chatId of getSubscribersForAddress(log.args.wallet)) recipients.add(String(chatId));
        } else {
          for (const chatId of getAllSubscriberChatIds()) recipients.add(String(chatId));
        }

        for (const chatId of recipients) sendTelegramMessage(token, chatId, text);
      }
    },
    onError(err) {
      console.error("[telegram] watcher error:", err.message);
    },
  });

  console.log("[telegram] alerts enabled");
  return unwatch;
}
