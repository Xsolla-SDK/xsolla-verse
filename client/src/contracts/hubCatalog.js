import { SHOP_GAMES } from './shopCatalog'
import marvelWeblaunch from '../assets/shop/marvel-weblaunch.png'
import holdemCardBack from '../assets/shop/holdem-card-back.png'
import universeImg from '../assets/img/xsolla-universe-landing.webp'
import verseFrame from '../assets/shop/verse-frame.png'
import verseBanner from '../assets/shop/verse-banner.png'
import cookingCover from '../assets/shop/cooking-cover.jpg'
import seekersNotes from '../assets/shop/seekers-notes.jpg'
import ravenhill from '../assets/shop/ravenhill.jpg'
import gdapShowcase from '../assets/shop/gdap-showcase.jpg'
import tableImg from '../assets/game/table.webp'

export const PARTNER_HALLS = [
  {
    id: 'second-dinner',
    name: 'Second Dinner',
    blurb: 'MARVEL SNAP — live ops and QA with Xsolla.',
    image: marvelWeblaunch,
  },
  {
    id: 'mytona',
    name: 'Mytona',
    blurb: 'Cooking Diary, Seekers Notes, Chef & Friends, Ravenhill — QA and loc.',
    image: cookingCover,
  },
  {
    id: 'gdap',
    name: 'GDAP',
    blurb: 'Philippine indies — QA, loc, and certification for export.',
    image: gdapShowcase,
  },
  {
    id: 'dti-emb',
    name: 'DTI-EMB',
    blurb: 'Export-ready titles and global payments kits.',
    image: seekersNotes,
  },
]

export const LIVE_EVENTS = [
  {
    id: 'drop',
    kind: 'featured',
    title: 'WEBLAUNCH Bundle',
    game: 'MARVEL SNAP',
    shopGame: 'MARVEL SNAP',
    image: marvelWeblaunch,
  },
  {
    id: 'prize',
    kind: 'prize',
    title: 'Neon Card Back',
    game: "Texas Hold'em Sit & Go",
    playTab: 'sng',
    sideProduct: true,
    image: holdemCardBack,
  },
]

export const GALLERY_PIECES = [
  { id: 'universe', title: 'Verse hub', credit: 'Xsolla Art', image: universeImg },
  { id: 'frame', title: 'Avatar frame: Ember', credit: 'Hub cosmetics', image: verseFrame },
  { id: 'banner', title: 'Lobby banner: Neon', credit: 'Hub cosmetics', image: verseBanner },
  { id: 'table', title: 'Neon table', credit: 'Hold’em', image: tableImg },
  { id: 'snap', title: 'WEBLAUNCH', credit: 'Second Dinner × Xsolla', image: marvelWeblaunch },
  { id: 'cook', title: 'Kitchen world', credit: 'Mytona × Xsolla', image: cookingCover },
  { id: 'notes', title: 'Hidden object', credit: 'Mytona × Xsolla', image: seekersNotes },
  { id: 'raven', title: 'Ravenhill streets', credit: 'Mytona × Xsolla', image: ravenhill },
  { id: 'gdap', title: 'Manila indie', credit: 'GDAP × Xsolla', image: gdapShowcase },
]

export const SUPPORT_FAQ = [
  {
    q: 'How do I buy items?',
    a: 'Connect a wallet, open Game Shop, pick a title, then Buy with XSOLLA. Guest mode can browse but not purchase.',
  },
  {
    q: 'Do cosmetics work in other games?',
    a: 'Partner packs split XSOLLA with the studio and are meant for that title’s live ops. Verse table cosmetics (card backs, felt) only apply in Online Games — poker and blackjack, a side product.',
  },
  {
    q: 'How do chips relate to XSOLLA?',
    a: '1 XSOLLA = 1,000 chips. Deposit on Profile to bankroll tables; withdraw to unlock escrow.',
  },
  {
    q: 'Need localization or QA for our title?',
    a: 'Open Academy or a Support ticket. Xsolla covers loc, LQA, certification, and player engagement.',
  },
]

export function gamesForPartner(partnerId) {
  return SHOP_GAMES.filter((g) => g.partner === partnerId)
}

export function shopGameByName(name) {
  return SHOP_GAMES.find((g) => g.name === name) || null
}
