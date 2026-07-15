import { addSubscriber } from "./subscribers.js";
import { sendTelegramMessage } from "./telegram.js";

// Telegram bots only receive messages via webhook or long-polling getUpdates.
// Long-polling needs no public URL, which is easiest for a hackathon deploy.
export function startBotListener(token) {
  if (!token) return () => {};
  let offset = 0;
  let stopped = false;

  async function loop() {
    while (!stopped) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?timeout=25&offset=${offset}`);
        const data = await res.json();
        if (data.ok) {
          for (const update of data.result) {
            offset = update.update_id + 1;
            const msg = update.message;
            if (!msg?.text) continue;
            const chatId = msg.chat.id;
            const text = msg.text.trim();

            if (text.startsWith("/start")) {
              const payload = text.split(" ")[1];
              if (payload && /^[0-9a-fA-F]{40}$/.test(payload)) {
                const address = "0x" + payload.toLowerCase();
                addSubscriber(chatId, address);
                await sendTelegramMessage(
                  token,
                  chatId,
                  `✅ Linked. You'll get alerts for \`${address}\` plus vault-wide events (pause/resume, low runway).`
                );
              } else {
                await sendTelegramMessage(
                  token,
                  chatId,
                  `👋 Use the "Get Telegram alerts" button on the Refilr dashboard to link this chat to your wallet.`
                );
              }
            }
          }
        }
      } catch (err) {
        console.error("[telegram] bot listener error:", err.message);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  loop();
  console.log("[telegram] bot listener started (long polling)");
  return () => {
    stopped = true;
  };
}