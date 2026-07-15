import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../data");
const FILE = path.join(DATA_DIR, "subscribers.json");

// Flat-file store, fine for a hackathon. Swap for a real DB (sqlite/postgres)
// if this needs to survive a redeploy on a platform with an ephemeral disk.

function load() {
  if (!existsSync(FILE)) return [];
  try {
    return JSON.parse(readFileSync(FILE, "utf8"));
  } catch {
    return [];
  }
}
function save(list) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(list, null, 2));
}

export function addSubscriber(chatId, address) {
  const list = load();
  const addr = address.toLowerCase();
  if (!list.some((s) => s.chatId === chatId && s.address === addr)) {
    list.push({ chatId, address: addr, subscribedAt: Date.now() });
    save(list);
  }
  return list;
}

export function getSubscribersForAddress(address) {
  const addr = (address || "").toLowerCase();
  return load().filter((s) => s.address === addr).map((s) => s.chatId);
}

export function getAllSubscriberChatIds() {
  return [...new Set(load().map((s) => s.chatId))];
}
