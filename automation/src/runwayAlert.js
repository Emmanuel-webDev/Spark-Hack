import { formatEther } from "viem";
import { sendTelegramMessage } from "./telegram.js";
import { getAllSubscriberChatIds } from "./subscribers.js";

// Runway = vaultBalance / average refillAmount across active wallets —
// same calculation the dashboard's Depot Tank uses, so the alert threshold
// matches what users see in the UI.
//
// Alerts once when runway drops below `minRefills`, then stays quiet until
// it recovers back above the threshold (sends a "topped up" message when it
// does) — this avoids spamming an alert every poll cycle while the vault
// sits low.
export function createRunwayAlerter(token, adminChatId, minRefills = 5) {
  let lowState = false;

  function recipients() {
    const set = new Set(getAllSubscriberChatIds().map(String));
    if (adminChatId) set.add(String(adminChatId));
    return [...set];
  }

  return async function checkRunway(vaultBalanceWei, activeRefillAmountsWei) {
    if (!token) return;
    if (activeRefillAmountsWei.length === 0) return;

    const avgWei = activeRefillAmountsWei.reduce((a, b) => a + b, 0n) / BigInt(activeRefillAmountsWei.length);
    if (avgWei === 0n) return;
    const runway = Number(vaultBalanceWei / avgWei);

    if (runway < minRefills && !lowState) {
      lowState = true;
      const text =
        `⚠️ *Low vault balance* — only ~${runway} refuel${runway === 1 ? "" : "s"} of runway left ` +
        `(${formatEther(vaultBalanceWei)} MON in vault). Consider depositing more MON soon.`;
      for (const chatId of recipients()) await sendTelegramMessage(token, chatId, text);
    } else if (runway >= minRefills && lowState) {
      lowState = false;
      const text = `✅ *Vault topped up* — runway back to ~${runway} refuels (${formatEther(vaultBalanceWei)} MON).`;
      for (const chatId of recipients()) await sendTelegramMessage(token, chatId, text);
    }
  };
}