// Minimal Telegram Bot API wrapper — no extra dependency needed since
// Node 18+ has global fetch.

export async function sendTelegramMessage(token, chatId, text) {
  if (!token || !chatId) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[telegram] send failed (${res.status}): ${body}`);
    }
  } catch (err) {
    console.error("[telegram] send error:", err.message);
  }
}
