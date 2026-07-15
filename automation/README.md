# Refilr Automation Service

Polls every registered wallet on the `Refilr` contract and submits
`refuel()` on-chain whenever the contract's own `isRefuelEligible()` check
says a wallet qualifies. The contract re-validates every rule itself, so
this service only needs to decide *when* to try — it can never bypass a rule.

## Setup

```bash
cd automation
npm install
cp .env.example .env
```

Fill in `.env`:
- `RPC_URL` / `CHAIN_ID` — Monad Testnet values, double-check against Monad's docs
- `CONTRACT_ADDRESS` — your deployed `Refilr` address
- `AUTOMATION_PRIVATE_KEY` — private key of a **dedicated burner wallet**, set as the contract's `automationOperator` (via constructor or `setAutomationOperator`)

Fund that automation wallet with a small amount of testnet MON to pay gas —
this is separate from the vault's balance and is not funded by the vault.

## Run

```bash
npm start
```

The service logs each cycle: which wallets it checked, why any were skipped
(`"above threshold"`, `"cooldown active"`, `"daily limit reached"`, etc. —
straight from the contract's `isRefuelEligible`), and the tx hash + receipt
for any refuel it submits.

## Notes

- Only calls `refuel()` — it holds no permission to withdraw, register
  wallets, or pause the vault. Those stay `onlyOwner` on-chain.
- If the automation wallet's own MON balance drops below 0.01 MON, the
  service logs a warning. It does not top itself up — that's a manual (or
  future roadmap) step.
