import "dotenv/config";
import { createPublicClient, createWalletClient, http, formatEther, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { startTelegramNotifier } from "./notifier.js";
import { createRunwayAlerter } from "./runwayAlert.js";
import { startBotListener } from "./bot-listener.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const abi = JSON.parse(
  readFileSync(path.join(__dirname, "../../contracts/WalletOpsVault.abi.json"), "utf8")
);

const {
  RPC_URL,
  CHAIN_ID,
  CONTRACT_ADDRESS,
  AUTOMATION_PRIVATE_KEY,
  POLL_INTERVAL_MS,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
} = process.env;

for (const [name, val] of Object.entries({ RPC_URL, CHAIN_ID, CONTRACT_ADDRESS, AUTOMATION_PRIVATE_KEY })) {
  if (!val) {
    console.error(`Missing required env var: ${name}. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }
}

// Verify chain ID / RPC URL against Monad's docs before running — testnet
// parameters can change.
const monadTestnet = defineChain({
  id: Number(CHAIN_ID),
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
});

const account = privateKeyToAccount(AUTOMATION_PRIVATE_KEY);

const publicClient = createPublicClient({ chain: monadTestnet, transport: http(RPC_URL) });
const walletClient = createWalletClient({ account, chain: monadTestnet, transport: http(RPC_URL) });

const contract = { address: CONTRACT_ADDRESS, abi };
const pollIntervalMs = Number(POLL_INTERVAL_MS || 15000);

// Warn if the automation wallet's own gas balance is running low — this is
// a separate pot of MON from the vault, and if it hits zero, refuels
// silently stop even though the vault itself may be full.
const LOW_GAS_WARNING_THRESHOLD = 10n ** 16n; // 0.01 MON

function log(...args) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

async function checkAutomationWalletGas() {
  const balance = await publicClient.getBalance({ address: account.address });
  if (balance < LOW_GAS_WARNING_THRESHOLD) {
    log(
      `⚠️  Automation wallet ${account.address} is low on gas: ${formatEther(balance)} MON. ` +
        `Refuels will stop once this hits zero — top it up manually (this is separate from the vault balance).`
    );
  }
  return balance;
}

const checkRunway = createRunwayAlerter(
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
  Number(process.env.LOW_RUNWAY_THRESHOLD || 5),
);

async function tick() {
  try {
    await checkAutomationWalletGas();

    const isPaused = await publicClient.readContract({
      ...contract,
      functionName: "paused",
    });
    if (isPaused) {
      log("Vault is paused. Skipping this cycle.");
      return;
    }

    const wallets = await publicClient.readContract({
      ...contract,
      functionName: "getRegisteredWallets",
    });
    if (wallets.length === 0) {
      log("No registered wallets yet.");
      return;
    }

    // Runway check — once per tick, not once per wallet.
    const vaultBalanceWei = await publicClient.readContract({
      ...contract,
      functionName: "vaultBalance",
    });
    const activeRefillAmounts = [];
    for (const w of wallets) {
      const policy = await publicClient.readContract({
        ...contract,
        functionName: "policies",
        args: [w],
      });
      const [active, , refillAmountWei] = policy;
      if (active) activeRefillAmounts.push(refillAmountWei);
    }
    await checkRunway(vaultBalanceWei, activeRefillAmounts);

    for (const wallet of wallets) {
      const [eligible, reason] = await publicClient.readContract({
        ...contract,
        functionName: "isRefuelEligible",
        args: [wallet],
      });

      if (!eligible) {
        log(`${wallet} — not eligible (${reason})`);
        continue;
      }

      log(`${wallet} — eligible, submitting refuel()`);
      try {
        const hash = await walletClient.writeContract({
          ...contract,
          functionName: "refuel",
          args: [wallet],
        });
        log(`  tx submitted: ${hash}`);
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        log(
          `  confirmed in block ${receipt.blockNumber}, status: ${receipt.status}`,
        );
      } catch (err) {
        log(
          `  refuel() reverted or failed: ${err.shortMessage || err.message}`,
        );
      }
    }
  } catch (err) {
    log("Error during poll cycle:", err.shortMessage || err.message);
  }
}

async function main() {
  log(`Wallet Ops automation service starting`);
  log(`  contract: ${CONTRACT_ADDRESS}`);
  log(`  operator: ${account.address}`);
  log(`  poll interval: ${pollIntervalMs}ms`);

  startTelegramNotifier(
    publicClient,
    contract,
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID,
  );

  startBotListener(TELEGRAM_BOT_TOKEN);

  await tick();
  setInterval(tick, pollIntervalMs);
}

main();
