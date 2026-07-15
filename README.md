# Refilr — Monad Spark Hack

Automated gas-refill vault: deposit MON, register operational wallets with
refill policies, and let the automation service keep them topped up. The
contract validates every rule itself — automation only proposes.

## Structure

```
contracts/    WalletOpsVault.sol + compiled ABI (Remix-ready, no imports)
automation/   Node.js service that polls wallets and calls refuel()
frontend/     Next.js + wagmi dashboard (depot tank + fuel gauges)
```

## Quick start

1. **Contract**: paste `contracts/WalletOpsVault.sol` into Remix, compile
   (0.8.24), deploy to Monad Testnet with `_owner` = your address and
   `_automationOperator` = your automation wallet's address.
2. **Automation**: `cd automation && npm install`, fill in `.env` (see
   `.env.example`), `npm start`. Fund the automation wallet with a little
   MON for gas — separate from the vault's balance.
3. **Frontend**: `cd frontend && npm install`, fill in `.env.local`, `npm
   run dev`.

Each subfolder has its own README with details.
