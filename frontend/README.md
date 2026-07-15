# Wallet Ops Frontend

Next.js + wagmi/viem dashboard for the WalletOpsVault contract. Reads are
live-polled (every 4-5s) directly from chain; writes go through the
connected wallet (MetaMask via the injected connector).

## Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Fill in `.env.local` with your deployed contract address and Monad Testnet
RPC details (verify against Monad's docs).

## Run

```bash
npm run dev
```

Open http://localhost:3000. Connect MetaMask (set to Monad Testnet) to
deposit, withdraw, register wallets, pause/resume, or manually trigger
`refuel()` for testing.

## Structure

- `lib/chain.js`, `lib/wagmiConfig.js` — Monad Testnet + wagmi setup
- `lib/contract.js`, `lib/abi.json` — contract address + ABI (compiled from `../contracts/WalletOpsVault.sol`)
- `components/Gauge.jsx`, `Tank.jsx` — the fuel-gauge / depot-tank visuals
- `components/VaultPanel.jsx`, `WalletCard.jsx`, `AddWalletModal.jsx`, `ActivityLog.jsx` — the functional pieces, each independently polling or watching events
- `app/page.js` — assembles everything; uses `useReadContracts` (batched) to summarize all wallets safely even as the list grows/shrinks

## Notes

- All on-chain writes (deposit, withdraw, register, pause, refuel) require the connected account to have the right permission — the contract enforces `onlyOwner` / `onlyAutomationOrOwner` regardless of what the UI allows you to click.
- The "Refuel now" button per wallet card is disabled unless `isRefuelEligible()` currently returns true — same check the automation service uses.
