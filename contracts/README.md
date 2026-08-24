# XSOLLA Token

XsollaVerse native ERC-20, modeled on Mini Games’ **TILE** token.

## Contracts

| Contract | Role |
|---|---|
| `XsollaToken` | ERC-20 `XSOLLA` with restricted minter |
| `XsollaTreasury` | Buy, deposit/escrow, withdraw, stake, swap, demo rewards |

### Parity with TILE / TileManager

| Mini Games | XsollaVerse |
|---|---|
| `buyTile()` | `buyXsolla()` — 1 native wei → 1 XSOLLA wei |
| `claimTile()` | `claimPlayReward()` (demo capped) |
| `swapTileForRose()` | `swapXsollaForNative()` / **`swapXsollaForUsdc()`** |
| Play escrow | `deposit()` / `withdrawPlayCredits()` or operator `release()` |
| Future stake | `stake()` / `unstake()` |

### USDC / USDT swap

- Rate default: **1 XSOLLA = 1 USDC** and **1 XSOLLA = 1 USDT** (`usdcPerXsolla` / `usdtPerXsolla = 1e6`)
- `swapUsdcForXsolla` / `buyXsollaWithUsdc` — mint XSOLLA from USDC
- `swapXsollaForUsdc` — pay from treasury USDC liquidity
- `swapUsdtForXsolla` / `buyXsollaWithUsdt` — mint XSOLLA from USDT
- `swapXsollaForUsdt` — pay from treasury USDT liquidity
- Local deploy uses `MockUSDC` + `MockUSDT` (6 decimals) and seeds 100k of each into the treasury
- Polygon: set `USDC_ADDRESS` and `USDT_ADDRESS` before `deploy:polygon` / `deploy:amoy`

### Item shop (XSOLLA only)

| Contract | Role |
|---|---|
| `XsollaItems` | ERC-1155 cosmetics / game items |
| `XsollaShop` | Listings + `buy(itemId, qty)` paid in **XSOLLA only** |

Deploy seeds starter cosmetics grouped by video game (Hold’em, Blackjack, XsollaVerse).

Hardhat 3 compiles from **`chain/contracts/`** (a real folder, not a symlink — Windows cannot follow Linux symlinks). `npm start` copies these `.sol` files into `chain/contracts/` before compile.

## Commands

```bash
# Full local stack (chain + deploy + backend + frontend)
npm start

# Or contracts only:
npm install
npm run compile
npm run test:contracts
# terminal A
npm run node
# terminal B
npm run deploy:local
```

Deploy writes addresses to:

- `deployments/<network>.json`
- `client/src/contracts/addresses.json`

Polygon:

```bash
DEPLOYER_PRIVATE_KEY=0x... POLYGON_RPC_URL=... npm run deploy:polygon
# or Amoy testnet
DEPLOYER_PRIVATE_KEY=0x... npm run deploy:amoy
```

## In-game rate

`1 XSOLLA = 1000 chips` (`CHIPS_PER_XSOLLA` in `config.js`).

Lobby flow: **Buy → Deposit** (credits bankroll) → sit at tables → **Withdraw** (debits bankroll + unlocks escrow).
