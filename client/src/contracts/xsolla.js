import { ethers } from 'ethers'
import abis from './abis.json'
import addresses from './addresses.json'
import { enrichItem } from './itemEcosystem'
import { getDemoSigner } from '../utils/demoWallet'

export const CHIPS_PER_XSOLLA = 1000
export const USDC_DECIMALS = 6
export const USDT_DECIMALS = 6

export function contractsConfigured() {
  return Boolean(addresses.XsollaToken && addresses.XsollaTreasury)
}

function isHexAddress(value) {
  return typeof value === 'string' && /^0x[a-fA-F0-9]{40}$/.test(value)
}

export async function getSigner() {
  const demo = await getDemoSigner()
  if (demo) return demo
  if (!window.ethereum) {
    throw new Error('No wallet found. Install MetaMask.')
  }
  await window.ethereum.request({ method: 'eth_requestAccounts' })
  const provider = new ethers.BrowserProvider(window.ethereum)
  return provider.getSigner()
}

export async function getContracts() {
  if (!contractsConfigured()) {
    throw new Error('Xsolla contracts not deployed. Run npm run deploy:local')
  }
  const required = [
    addresses.XsollaToken,
    addresses.XsollaTreasury,
    addresses.USDC,
    addresses.USDT,
    addresses.XsollaShop,
    addresses.XsollaItems,
  ]
  for (const addr of required) {
    if (addr && !isHexAddress(addr)) {
      throw new Error(`Invalid contract address: ${addr}`)
    }
  }
  const signer = await getSigner()
  const token = new ethers.Contract(
    addresses.XsollaToken,
    abis.XsollaToken,
    signer,
  )
  const treasury = new ethers.Contract(
    addresses.XsollaTreasury,
    abis.XsollaTreasury,
    signer,
  )
  const usdcAddress = isHexAddress(addresses.USDC)
    ? addresses.USDC
    : await treasury.usdc()
  const usdtAddress = isHexAddress(addresses.USDT)
    ? addresses.USDT
    : await treasury.usdt()
  const usdc = isHexAddress(usdcAddress)
    ? new ethers.Contract(usdcAddress, abis.USDC, signer)
    : null
  const usdt = isHexAddress(usdtAddress)
    ? new ethers.Contract(usdtAddress, abis.USDT, signer)
    : null
  const shop =
    isHexAddress(addresses.XsollaShop) && abis.XsollaShop
      ? new ethers.Contract(addresses.XsollaShop, abis.XsollaShop, signer)
      : null
  const items =
    isHexAddress(addresses.XsollaItems) && abis.XsollaItems
      ? new ethers.Contract(addresses.XsollaItems, abis.XsollaItems, signer)
      : null
  const market =
    isHexAddress(addresses.XsollaMarket) && abis.XsollaMarket
      ? new ethers.Contract(
          addresses.XsollaMarket,
          abis.XsollaMarket,
          signer,
        )
      : null
  return {
    token,
    treasury,
    usdc,
    usdt,
    shop,
    items,
    market,
    signer,
    addresses,
    usdcAddress,
    usdtAddress,
  }
}

export function xsollaToChips(xsollaAmount) {
  return Math.floor(Number(xsollaAmount) * CHIPS_PER_XSOLLA)
}

export function chipsToXsolla(chips) {
  return (Number(chips) / CHIPS_PER_XSOLLA).toString()
}

export async function buyXsolla(amountEth) {
  const { treasury } = await getContracts()
  const tx = await treasury.buyXsolla({
    value: ethers.parseEther(String(amountEth)),
  })
  return tx.wait()
}

export async function depositXsolla(amountXsolla) {
  const { token, treasury, addresses } = await getContracts()
  const amount = ethers.parseEther(String(amountXsolla))
  const approveTx = await token.approve(addresses.XsollaTreasury, amount)
  await approveTx.wait()
  const tx = await treasury.deposit(amount)
  return tx.wait()
}

export async function withdrawXsolla(amountXsolla) {
  const { treasury } = await getContracts()
  const amount = ethers.parseEther(String(amountXsolla))
  const tx = await treasury.withdrawPlayCredits(amount)
  return tx.wait()
}

export async function stakeXsolla(amountXsolla) {
  const { token, treasury, addresses } = await getContracts()
  const amount = ethers.parseEther(String(amountXsolla))
  const approveTx = await token.approve(addresses.XsollaTreasury, amount)
  await approveTx.wait()
  const tx = await treasury.stake(amount)
  return tx.wait()
}

export async function unstakeXsolla(amountXsolla) {
  const { treasury } = await getContracts()
  const amount = ethers.parseEther(String(amountXsolla))
  const tx = await treasury.unstake(amount)
  return tx.wait()
}

export async function completeUnstakeXsolla() {
  const { treasury } = await getContracts()
  const tx = await treasury.completeUnstake()
  return tx.wait()
}

export async function cancelUnstakeXsolla() {
  const { treasury } = await getContracts()
  const tx = await treasury.cancelUnstake()
  return tx.wait()
}

export async function swapXsolla(amountXsolla) {
  const { token, treasury, addresses } = await getContracts()
  const amount = ethers.parseEther(String(amountXsolla))
  const approveTx = await token.approve(addresses.XsollaTreasury, amount)
  await approveTx.wait()
  const tx = await treasury.swapXsollaForNative(amount)
  return tx.wait()
}

export async function swapXsollaToUsdc(amountXsolla) {
  const { token, treasury, addresses } = await getContracts()
  const amount = ethers.parseEther(String(amountXsolla))
  const approveTx = await token.approve(addresses.XsollaTreasury, amount)
  await approveTx.wait()
  const tx = await treasury.swapXsollaForUsdc(amount)
  return tx.wait()
}

export async function swapUsdcToXsolla(amountUsdc) {
  const { usdc, treasury, addresses } = await getContracts()
  if (!usdc) throw new Error('USDC not configured')
  const amount = ethers.parseUnits(String(amountUsdc), USDC_DECIMALS)
  const approveTx = await usdc.approve(addresses.XsollaTreasury, amount)
  await approveTx.wait()
  const tx = await treasury.swapUsdcForXsolla(amount)
  return tx.wait()
}

export async function buyXsollaWithUsdc(amountUsdc) {
  const { usdc, treasury, addresses } = await getContracts()
  if (!usdc) throw new Error('USDC not configured')
  const amount = ethers.parseUnits(String(amountUsdc), USDC_DECIMALS)
  const approveTx = await usdc.approve(addresses.XsollaTreasury, amount)
  await approveTx.wait()
  const tx = await treasury.buyXsollaWithUsdc(amount)
  return tx.wait()
}

export async function swapXsollaToUsdt(amountXsolla) {
  const { token, treasury, addresses } = await getContracts()
  const amount = ethers.parseEther(String(amountXsolla))
  const approveTx = await token.approve(addresses.XsollaTreasury, amount)
  await approveTx.wait()
  const tx = await treasury.swapXsollaForUsdt(amount)
  return tx.wait()
}

export async function swapUsdtToXsolla(amountUsdt) {
  const { usdt, treasury, addresses } = await getContracts()
  if (!usdt) throw new Error('USDT not configured')
  const amount = ethers.parseUnits(String(amountUsdt), USDT_DECIMALS)
  const approveTx = await usdt.approve(addresses.XsollaTreasury, amount)
  await approveTx.wait()
  const tx = await treasury.swapUsdtForXsolla(amount)
  return tx.wait()
}

export async function buyXsollaWithUsdt(amountUsdt) {
  const { usdt, treasury, addresses } = await getContracts()
  if (!usdt) throw new Error('USDT not configured')
  const amount = ethers.parseUnits(String(amountUsdt), USDT_DECIMALS)
  const approveTx = await usdt.approve(addresses.XsollaTreasury, amount)
  await approveTx.wait()
  const tx = await treasury.buyXsollaWithUsdt(amount)
  return tx.wait()
}

export async function claimReward(amountXsolla = '1') {
  const { treasury } = await getContracts()
  const tx = await treasury.claimPlayReward(
    ethers.parseEther(String(amountXsolla)),
  )
  return tx.wait()
}

export async function mintMockUsdc(amountUsdc = '1000') {
  const { usdc, signer } = await getContracts()
  if (!usdc) throw new Error('USDC not configured')
  const address = await signer.getAddress()
  const tx = await usdc.mint(
    address,
    ethers.parseUnits(String(amountUsdc), USDC_DECIMALS),
  )
  return tx.wait()
}

export async function mintMockUsdt(amountUsdt = '1000') {
  const { usdt, signer } = await getContracts()
  if (!usdt) throw new Error('USDT not configured')
  const address = await signer.getAddress()
  const tx = await usdt.mint(
    address,
    ethers.parseUnits(String(amountUsdt), USDT_DECIMALS),
  )
  return tx.wait()
}

function parseListing(listing, id) {
  const priceXsolla = listing.priceXsolla ?? listing[0]
  const active = listing.active ?? listing[1]
  const name = listing.name_ ?? listing.name ?? listing[2]
  const metadataURI = listing.metadataURI ?? listing[3]
  const game = listing.game_ ?? listing.game ?? listing[4] ?? 'Other'
  const extra = (listing.length && listing.length > 5) || listing.kind_ != null
  const parsed = {
    id,
    name,
    game,
    metadataURI,
    priceXsolla: ethers.formatEther(priceXsolla),
    priceRaw: priceXsolla,
    active,
  }
  if (extra) {
    parsed.kind = listing.kind_ ?? listing.kind ?? listing[5] ?? ''
    parsed.perk = listing.perk_ ?? listing.perk ?? listing[6] ?? ''
    parsed.studio = listing.studio ?? listing[7] ?? ''
    parsed.studioBps = Number(listing.studioBps ?? listing[8] ?? 0)
    parsed.soulbound = Boolean(listing.soulbound ?? listing[9])
  }
  return enrichItem(parsed)
}

/** Fetch active shop listings (XSOLLA-priced), including parent video game. */
export async function fetchShopListings() {
  const { shop } = await getContracts()
  if (!shop) return []
  const nextId = Number(await shop.nextItemId())
  const listings = []
  for (let id = 1; id < nextId; id++) {
    const listing = parseListing(await shop.getListing(id), id)
    if (!listing.active) continue
    listings.push(listing)
  }
  return listings
}

/** Buy shop item with XSOLLA only. */
export async function buyShopItem(itemId, quantity = 1) {
  const { token, shop, addresses, signer } = await getContracts()
  if (!shop) throw new Error('Shop not deployed')
  const listing = await shop.getListing(itemId)
  const priceXsolla = listing.priceXsolla ?? listing[0]
  const total = priceXsolla.mul
    ? priceXsolla.mul(quantity)
    : priceXsolla * window.BigInt(quantity)
  const buyer = await signer.getAddress()
  const balance = await token.balanceOf(buyer)
  if (balance.lt ? balance.lt(total) : balance < total) {
    const needed = ethers.formatEther(total)
    const available = ethers.formatEther(balance)
    throw new Error(
      `Not enough XSOLLA. This costs ${needed} XSOLLA; balance is ${available} XSOLLA.`,
    )
  }
  const approveTx = await token.approve(addresses.XsollaShop, total)
  await approveTx.wait()
  const tx = await shop.buy(itemId, quantity)
  return tx.wait()
}

export async function isRegisteredStudio(userAddress) {
  if (!userAddress || !isHexAddress(userAddress)) return false
  try {
    const { shop } = await getContracts()
    if (!shop) return false
    return Boolean(await shop.isStudio(userAddress))
  } catch (e) {
    return false
  }
}

export async function setStudioAllowed(studio, allowed = true) {
  const { shop } = await getContracts()
  if (!shop) throw new Error('Shop not deployed')
  if (!isHexAddress(studio)) throw new Error('Invalid studio address')
  const tx = await shop.setStudio(studio, Boolean(allowed))
  return tx.wait()
}

export async function fetchStudioRoster() {
  const { shop } = await getContracts()
  if (!shop) return []

  const known = new Map()
  Object.entries(addresses.studios || {}).forEach(([key, address]) => {
    if (!isHexAddress(address) || key === 'verse') return
    known.set(address.toLowerCase(), {
      address,
      label: key
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    })
  })

  try {
    const events = await shop.queryFilter(shop.filters.StudioUpdated(), 0, 'latest')
    events.forEach((event) => {
      const address = event.args?.studio ?? event.args?.[0]
      if (!isHexAddress(address)) return
      const key = address.toLowerCase()
      known.set(key, { ...(known.get(key) || {}), address })
    })
  } catch (e) {
    // Known deploy addresses still provide a useful roster on older providers.
  }

  const games = await fetchShopGames()
  games.forEach((game) => {
    if (!isHexAddress(game.studio)) return
    const key = game.studio.toLowerCase()
    known.set(key, { ...(known.get(key) || {}), address: game.studio })
  })

  return Promise.all(
    Array.from(known.values()).map(async (studio) => {
      const studioGames = games.filter(
        (game) => game.studio.toLowerCase() === studio.address.toLowerCase(),
      )
      return {
        ...studio,
        allowed: Boolean(await shop.isStudio(studio.address)),
        games: studioGames.map((game) => game.name),
      }
    }),
  )
}

export async function registerStudioGame({
  name,
  blurb = '',
  coverURI = '',
  playUrl = '',
  platforms = '',
}) {
  const { shop } = await getContracts()
  if (!shop) throw new Error('Shop not deployed')
  const tx = await shop.registerGame(
    name,
    blurb,
    coverURI,
    playUrl,
    typeof platforms === 'string' ? platforms : (platforms || []).join(', '),
  )
  return tx.wait()
}

export async function fetchShopGames() {
  const { shop } = await getContracts()
  if (!shop || !shop.nextGameId) return []
  let nextId = 1
  try {
    nextId = Number(await shop.nextGameId())
  } catch (e) {
    return []
  }
  const list = []
  for (let id = 1; id < nextId; id++) {
    const row = await shop.getGame(id)
    const studio = row.studio ?? row[0]
    const name = row.name_ ?? row.name ?? row[1]
    const playUrl = row.playUrl ?? row[4] ?? ''
    const platforms = row.platforms ?? row[5] ?? ''
    const active = row.active ?? row[6]
    if (!name || !active) continue
    if (!studio || studio === ethers.ZeroAddress) continue
    list.push({
      gameId: id,
      id: `onchain-${id}`,
      studio,
      name,
      blurb: row.blurb ?? row[2] ?? '',
      coverURI: row.coverURI ?? row[3] ?? '',
      playUrl,
      platforms,
      active: true,
    })
  }
  return list
}

export async function listStudioItem({
  priceXsolla,
  name,
  uri,
  gameId,
  game,
  kind = 'pack',
  studioBps = 8000,
}) {
  const { shop } = await getContracts()
  if (!shop) throw new Error('Shop not deployed')
  if (!gameId) throw new Error('Register a game first')
  const amount = ethers.parseEther(String(priceXsolla))
  const bps = Math.min(8000, Math.max(0, Number(studioBps) || 0))
  const tx = await shop.listForStudio(
    amount,
    name,
    uri || `ipfs://xsolla/studio/${game || gameId}/${name}.json`,
    gameId,
    kind || 'pack',
    bps,
  )
  return tx.wait()
}

function fmtEther(value) {
  if (value == null) return '0'
  try {
    return ethers.formatEther(value)
  } catch (e) {
    return '0'
  }
}

async function fetchAllListings(shop) {
  if (!shop) return []
  const nextId = Number(await shop.nextItemId())
  const listings = []
  for (let id = 1; id < nextId; id++) {
    listings.push(parseListing(await shop.getListing(id), id))
  }
  return listings
}

/** Shop SKUs + shop/market sale events for a registered studio wallet. */
export async function fetchStudioDesk(studioAddress) {
  if (!studioAddress || !isHexAddress(studioAddress)) {
    return { listings: [], sales: [], shopXsolla: 0, marketXsolla: 0, games: [] }
  }
  const { shop, market } = await getContracts()
  const all = await fetchAllListings(shop)
  const mine = all.filter(
    (item) =>
      item.studio &&
      String(item.studio).toLowerCase() === studioAddress.toLowerCase(),
  )
  const byId = Object.fromEntries(all.map((item) => [String(item.id), item]))
  const sales = []

  const pushSale = (row) => {
    const item = byId[String(row.itemId)] || {}
    sales.push({
      ...row,
      name: item.name || `#${row.itemId}`,
      game: item.game || '',
    })
  }

  if (shop && shop.filters && shop.filters.ItemPurchased) {
    try {
      const logs = await shop.queryFilter(
        shop.filters.ItemPurchased(null, null, studioAddress),
      )
      logs.forEach((log) => {
        const args = log.args || []
        pushSale({
          id: `shop-${log.transactionHash}-${log.logIndex}`,
          channel: 'shop',
          itemId: Number((args.itemId ?? args[1]).toString()),
          buyer: args.buyer ?? args[0],
          quantity: Number((args.quantity ?? args[3]).toString()),
          studioPaid: fmtEther(args.studioPaid ?? args[5]),
          totalPaid: fmtEther(args.totalPaid ?? args[4]),
          blockNumber: log.blockNumber,
          txHash: log.transactionHash,
        })
      })
    } catch (e) {
      // Older shop without studio-indexed purchases
    }
  }

  if (market && market.filters && market.filters.OfferSold) {
    try {
      const logs = await market.queryFilter(
        market.filters.OfferSold(null, null, studioAddress),
      )
      logs.forEach((log) => {
        const args = log.args || []
        pushSale({
          id: `mkt-${log.transactionHash}-${log.logIndex}`,
          channel: 'market',
          itemId: Number((args.itemId ?? args[3]).toString()),
          buyer: args.buyer ?? args[1],
          quantity: Number((args.quantity ?? args[4]).toString()),
          studioPaid: fmtEther(args.studioPaid ?? args[5]),
          totalPaid: fmtEther(args.studioPaid ?? args[5]),
          blockNumber: log.blockNumber,
          txHash: log.transactionHash,
        })
      })
    } catch (e) {
      // Older market without studio-indexed sales
    }
  }

  const provider = shop && shop.provider
  const blockNums = [...new Set(sales.map((row) => row.blockNumber).filter(Boolean))]
  const times = {}
  if (provider) {
    await Promise.all(
      blockNums.map(async (n) => {
        const block = await provider.getBlock(n)
        times[n] = block && block.timestamp ? block.timestamp * 1000 : 0
      }),
    )
  }
  sales.forEach((row) => {
    row.at = times[row.blockNumber] || 0
  })
  sales.sort((a, b) => (b.at || 0) - (a.at || 0))

  const shopXsolla = sales
    .filter((row) => row.channel === 'shop')
    .reduce((sum, row) => sum + Number(row.studioPaid || 0), 0)
  const marketXsolla = sales
    .filter((row) => row.channel === 'market')
    .reduce((sum, row) => sum + Number(row.studioPaid || 0), 0)

  const catalog = await fetchShopGames()
  const mineGames = catalog.filter(
    (g) =>
      g.studio &&
      String(g.studio).toLowerCase() === studioAddress.toLowerCase(),
  )

  return { listings: mine, sales, shopXsolla, marketXsolla, games: mineGames }
}

/** Owned balances for known shop item ids. */
export async function fetchOwnedItems(userAddress) {
  const { shop, items } = await getContracts()
  if (!shop || !items) return []
  const nextId = Number(await shop.nextItemId())
  const owned = []
  for (let id = 1; id < nextId; id++) {
    const balance = await items.balanceOf(userAddress, id)
    const qty = Number(balance.toString())
    if (qty <= 0) continue
    const listing = parseListing(await shop.getListing(id), id)
    owned.push({
      ...listing,
      quantity: qty,
    })
  }
  return owned
}

export async function fetchMarketOffers() {
  const { market, shop } = await getContracts()
  if (!market) return []
  const nextId = Number(await market.nextOfferId())
  const list = []
  for (let id = 1; id < nextId; id++) {
    const offer = await market.getOffer(id)
    const active = offer.active ?? offer[4]
    if (!active) continue
    const itemId = Number((offer.itemId ?? offer[1]).toString())
    const listing = shop ? parseListing(await shop.getListing(itemId), itemId) : { id: itemId }
    list.push({
      offerId: id,
      seller: offer.seller ?? offer[0],
      itemId,
      quantity: Number((offer.quantity ?? offer[2]).toString()),
      priceXsolla: ethers.formatEther(offer.priceXsolla ?? offer[3]),
      priceRaw: offer.priceXsolla ?? offer[3],
      item: listing,
    })
  }
  return list
}

export async function approveMarket() {
  const { items, addresses } = await getContracts()
  if (!items || !addresses.XsollaMarket) {
    throw new Error('Market not deployed')
  }
  const tx = await items.setApprovalForAll(addresses.XsollaMarket, true)
  return tx.wait()
}

export async function listMarketItem(itemId, quantity, priceXsolla) {
  const { market, items, addresses, signer } = await getContracts()
  if (!market) throw new Error('Market not deployed')
  const approved = await items.isApprovedForAll(
    await signer.getAddress(),
    addresses.XsollaMarket,
  )
  if (!approved) {
    const txA = await items.setApprovalForAll(addresses.XsollaMarket, true)
    await txA.wait()
  }
  const tx = await market.list(
    itemId,
    quantity,
    ethers.parseEther(String(priceXsolla)),
  )
  return tx.wait()
}

export async function buyMarketOffer(offerId, priceRaw) {
  const { token, market, addresses } = await getContracts()
  if (!market) throw new Error('Market not deployed')
  const approveTx = await token.approve(addresses.XsollaMarket, priceRaw)
  await approveTx.wait()
  const tx = await market.buy(offerId)
  return tx.wait()
}

export async function cancelMarketOffer(offerId) {
  const { market } = await getContracts()
  if (!market) throw new Error('Market not deployed')
  const tx = await market.cancel(offerId)
  return tx.wait()
}

export async function readBalances(userAddress) {
  const { token, treasury, usdc, usdt } = await getContracts()
  const [
    wallet,
    credits,
    stakedBal,
    usdcLiq,
    usdtLiq,
    usdcRate,
    usdtRate,
  ] = await Promise.all([
    token.balanceOf(userAddress),
    treasury.playCredits(userAddress),
    treasury.staked(userAddress),
    treasury.usdcLiquidity(),
    treasury.usdtLiquidity(),
    treasury.usdcPerXsolla(),
    treasury.usdtPerXsolla(),
  ])
  let walletUsdc = '0'
  let walletUsdt = '0'
  if (usdc) {
    walletUsdc = ethers.formatUnits(
      await usdc.balanceOf(userAddress),
      USDC_DECIMALS,
    )
  }
  if (usdt) {
    walletUsdt = ethers.formatUnits(
      await usdt.balanceOf(userAddress),
      USDT_DECIMALS,
    )
  }
  const extra = {
    pendingUnstakeXsolla: '0',
    unstakeUnlockAt: 0,
    unstakeDelay: 0,
    stakeTier: 0,
  }
  try {
    const [pending, unlock, delay, tier] = await Promise.all([
      treasury.pendingUnstake(userAddress),
      treasury.unstakeUnlockAt(userAddress),
      treasury.unstakeDelay(),
      treasury.stakeTier(userAddress),
    ])
    extra.pendingUnstakeXsolla = ethers.formatEther(pending)
    extra.unstakeUnlockAt = Number(unlock.toString())
    extra.unstakeDelay = Number(delay.toString())
    extra.stakeTier = Number(tier.toString())
  } catch (e) {
    // Older treasury without delay / tiers
  }
  return {
    walletXsolla: ethers.formatEther(wallet),
    playCreditsXsolla: ethers.formatEther(credits),
    stakedXsolla: ethers.formatEther(stakedBal),
    ...extra,
    walletUsdc,
    walletUsdt,
    treasuryUsdc: ethers.formatUnits(usdcLiq, USDC_DECIMALS),
    treasuryUsdt: ethers.formatUnits(usdtLiq, USDT_DECIMALS),
    usdcPerXsolla: ethers.formatUnits(usdcRate, USDC_DECIMALS),
    usdtPerXsolla: ethers.formatUnits(usdtRate, USDT_DECIMALS),
  }
}

export function formatXsollaAmount(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 }).format(n)
}

export { addresses, abis }
