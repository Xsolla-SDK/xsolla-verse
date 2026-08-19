import universeImg from '../assets/img/xsolla-universe-landing.webp'

import marvelWeblaunch from '../assets/shop/marvel-weblaunch.png'
import marvelSeason from '../assets/shop/marvel-season.png'
import cookingCover from '../assets/shop/cooking-cover.jpg'
import cookingChef from '../assets/shop/cooking-chef.jpg'
import cookingGift from '../assets/shop/cooking-gift.jpg'
import holdemCardBack from '../assets/shop/holdem-card-back.png'
import holdemDealer from '../assets/shop/holdem-dealer.png'
import holdemTable from '../assets/shop/holdem-table.webp'
import bjFelt from '../assets/shop/bj-felt.png'
import bjTray from '../assets/shop/bj-tray.png'
import bjSeat from '../assets/shop/bj-seat.png'
import verseFrame from '../assets/shop/verse-frame.png'
import verseBanner from '../assets/shop/verse-banner.png'
import seekersNotes from '../assets/shop/seekers-notes.jpg'
import chefFriends from '../assets/shop/chef-friends.jpg'
import ravenhill from '../assets/shop/ravenhill.jpg'
import gdapShowcase from '../assets/shop/gdap-showcase.jpg'
import dtiEmb from '../assets/shop/dti-emb.jpg'
import texasHoldem from '../assets/shop/texas-holdem.jpg'
import blackjackTable from '../assets/shop/blackjack-table.jpg'
import mysteryEnergy from '../assets/shop/mystery-energy.jpg'
import hiddenObjectPass from '../assets/shop/hidden-object-pass.jpg'
import kitchenCrew from '../assets/shop/kitchen-crew.jpg'
import friendsFeast from '../assets/shop/friends-feast.jpg'
import caseFile from '../assets/shop/case-file.jpg'
import detectiveKit from '../assets/shop/detective-kit.jpg'
import manilaIndie from '../assets/shop/manila-indie.jpg'
import studioLaunch from '../assets/shop/studio-launch.jpg'
import exportReady from '../assets/shop/export-ready.jpg'
import globalPayments from '../assets/shop/global-payments.jpg'
import { enrichItem } from './itemEcosystem'

/** Official / curated covers for shop UI */
export const XSOLLA_GAME_IMAGES = {
  marvelSnap: marvelWeblaunch,
  cookingDiary: cookingCover,
  seekersNotes,
  chefFriends,
  ravenhill,
  gdapShowcase,
  dtiEmb,
}

/**
 * Canonical video-game order for the Game Shop UI.
 * On-chain listings include a matching `game` string.
 */
export const SHOP_GAMES = [
  {
    id: 'marvel-snap',
    name: 'MARVEL SNAP',
    blurb: 'Xsolla partner · Second Dinner',
    summary:
      'Collectible card battler. A pack bought here is meant for SNAP live ops — not a Verse table skin.',
    services: ['Live ops', 'QA'],
    image: XSOLLA_GAME_IMAGES.marvelSnap,
    studio: 'Second Dinner',
    partner: 'second-dinner',
    platforms: ['iOS', 'Android', 'PC'],
    playUrl: 'https://www.marvelsnap.com/',
    playable: false,
  },
  {
    id: 'cooking-diary',
    name: 'Cooking Diary',
    blurb: 'Xsolla partner · Mytona',
    summary:
      'Time-management cooking. Starter packs and gift chests grant into Cooking Diary.',
    services: ['QA', 'Localization'],
    image: XSOLLA_GAME_IMAGES.cookingDiary,
    studio: 'Mytona',
    partner: 'mytona',
    platforms: ['iOS', 'Android'],
    playUrl: 'https://mytona.com/games/cooking-diary',
    playable: false,
  },
  {
    id: 'seekers-notes',
    name: 'Seekers Notes',
    blurb: 'Hidden-object mystery · Mytona × Xsolla',
    summary:
      'Hidden-object mystery. Energy packs and the season pass are for this title.',
    services: ['QA', 'Localization'],
    image: XSOLLA_GAME_IMAGES.seekersNotes,
    studio: 'Mytona',
    partner: 'mytona',
    platforms: ['iOS', 'Android'],
    playUrl: 'https://mytona.com/games/seekers-notes',
    playable: false,
  },
  {
    id: 'chef-friends',
    name: 'Chef & Friends',
    blurb: 'Casual cooking co-op · Mytona',
    summary: 'Casual co-op cooking. Bundles grant into Chef & Friends.',
    services: ['QA'],
    image: XSOLLA_GAME_IMAGES.chefFriends,
    studio: 'Mytona',
    partner: 'mytona',
    platforms: ['iOS', 'Android'],
    playUrl: 'https://mytona.com/games/chef-and-friends',
    playable: false,
  },
  {
    id: 'ravenhill',
    name: 'Ravenhill',
    blurb: 'Mystery adventure · Mytona',
    summary: 'Story mystery adventure. Case kits grant into Ravenhill.',
    services: ['QA', 'Localization'],
    image: XSOLLA_GAME_IMAGES.ravenhill,
    studio: 'Mytona',
    partner: 'mytona',
    platforms: ['iOS', 'Android'],
    playUrl: 'https://mytona.com/games/ravenhill',
    playable: false,
  },
  {
    id: 'gdap-showcase',
    name: 'GDAP Showcase',
    blurb: 'Philippine indie spotlight · GDAP × Xsolla',
    summary:
      'Philippine indie titles. Xsolla helps with QA, loc, and certification so they can ship abroad.',
    services: ['QA', 'Localization', 'Certification'],
    image: XSOLLA_GAME_IMAGES.gdapShowcase,
    studio: 'GDAP studios',
    partner: 'gdap',
    platforms: ['PC', 'Mobile'],
    playUrl: 'https://www.gdap.org.ph/',
    playable: false,
  },
  {
    id: 'dti-emb',
    name: 'DTI-EMB Export Hits',
    blurb: 'Export-ready PH titles · DTI-EMB × Xsolla',
    summary:
      'Export-ready Philippine games and a payments kit for global storefronts.',
    services: ['Certification', 'Localization', 'Payments'],
    image: XSOLLA_GAME_IMAGES.dtiEmb,
    studio: 'DTI-EMB',
    partner: 'dti-emb',
    platforms: ['PC', 'Mobile'],
    playUrl: 'https://www.dti.gov.ph/',
    playable: false,
  },
  {
    id: 'holdem',
    name: "Texas Hold'em",
    blurb: 'Card backs, table themes, and dealer cosmetics.',
    summary: 'Xsolla lounge table. Cosmetics stay in Verse and do not grant into partner games.',
    services: [],
    image: texasHoldem,
    studio: 'XsollaVerse',
    partner: 'verse',
    platforms: ['Web'],
    playable: 'cash',
  },
  {
    id: 'blackjack',
    name: 'Blackjack',
    blurb: 'Felt themes, chip trays, and seat accents.',
    summary: 'Xsolla lounge table. Felt and trays stay in Verse.',
    services: [],
    image: blackjackTable,
    studio: 'XsollaVerse',
    partner: 'verse',
    platforms: ['Web'],
    playable: 'bj',
  },
  {
    id: 'metaverse',
    name: 'XsollaVerse',
    blurb: 'Avatar frames and hub cosmetics.',
    summary: 'Hub cosmetics for this lobby. They do not unlock partner games.',
    services: [],
    image: universeImg,
    studio: 'Xsolla',
    partner: 'verse',
    platforms: ['Web'],
    playable: false,
  },
]

/** Item name → unique local product image */
export const SHOP_ITEM_IMAGES = {
  'WEBLAUNCH Bundle': marvelWeblaunch,
  'Season Pass Boost': marvelSeason,
  'Chef Starter Pack': cookingChef,
  'Daily Gift Chest': cookingGift,
  'Neon Card Back': holdemCardBack,
  'Gold Dealer Button': holdemDealer,
  'VIP Table Theme': holdemTable,
  'Emerald Felt': bjFelt,
  'Chrome Chip Tray': bjTray,
  'High-Roller Seat': bjSeat,
  'Avatar Frame: Ember': verseFrame,
  'Lobby Banner: Neon': verseBanner,
  'Ember Circuit Pass': verseBanner,
  'Certified Playtester': verseFrame,
  'Market License': globalPayments,
  'Rake Charm': holdemDealer,
  'Mystery Energy Pack': mysteryEnergy,
  'Hidden Object Pass': hiddenObjectPass,
  'Kitchen Crew Bundle': kitchenCrew,
  'Friends Feast Pack': friendsFeast,
  'Ravenhill Case File': caseFile,
  'Noir Detective Kit': detectiveKit,
  'Manila Indie Bundle': manilaIndie,
  'Studio Launch Pack': studioLaunch,
  'Export Ready Pack': exportReady,
  'Global Payments Kit': globalPayments,
}

export function imageForShopItem(item) {
  if (!item) return null
  return SHOP_ITEM_IMAGES[item.name] || null
}

export function uriToHttp(uri) {
  if (!uri || typeof uri !== 'string') return null
  if (
    uri.startsWith('http://') ||
    uri.startsWith('https://') ||
    uri.startsWith('data:')
  ) {
    return uri
  }
  if (uri.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${uri.slice(7)}`
  }
  return null
}

export function parsePlatforms(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (!value) return []
  return String(value)
    .split(/[,·|/]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function isVerseSideGame(game) {
  return Boolean(game && (game.partner === 'verse' || game.playable))
}

export function openGameUrl(url) {
  if (!url || typeof url !== 'string') return false
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false
  window.open(url, '_blank', 'noopener,noreferrer')
  return true
}

export function groupListingsByGame(listings = [], extraGames = []) {
  const byGame = new Map()

  for (const item of listings) {
    const game = (item.game && String(item.game).trim()) || 'Other'
    const withImage = {
      ...enrichItem(item),
      image: imageForShopItem(item),
    }
    if (!byGame.has(game)) byGame.set(game, [])
    byGame.get(game).push(withImage)
  }

  const ordered = []
  const seen = new Set()
  const extraByName = Object.fromEntries(
    (extraGames || []).filter((g) => g && g.name).map((g) => [g.name, g]),
  )

  for (const g of SHOP_GAMES) {
    const extra = extraByName[g.name] || {}
    const items = byGame.get(g.name) || []
    ordered.push({
      ...g,
      blurb: extra.blurb || g.blurb,
      playUrl: extra.playUrl || g.playUrl,
      platforms: parsePlatforms(extra.platforms || g.platforms),
      coverURI: extra.coverURI || g.coverURI,
      image: uriToHttp(extra.coverURI) || g.image,
      gameId: extra.gameId,
      items,
    })
    seen.add(g.name)
  }

  for (const extra of extraGames) {
    const name = extra && extra.name
    if (!name || seen.has(name)) continue
    ordered.push({
      id: extra.id || `onchain-${extra.gameId}`,
      name,
      blurb: extra.blurb || '',
      image: uriToHttp(extra.coverURI),
      studio: extra.studio,
      playUrl: extra.playUrl || '',
      platforms: parsePlatforms(extra.platforms),
      onChain: true,
      items: byGame.get(name) || [],
    })
    seen.add(name)
  }

  for (const [name, items] of byGame.entries()) {
    if (seen.has(name)) continue
    ordered.push({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      blurb: '',
      image: null,
      items,
    })
  }

  return ordered
}
