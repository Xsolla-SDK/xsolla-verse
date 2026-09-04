/** Stake membership tiers (XSOLLA, 18-decimal human amounts). */
export const STAKE_TIERS = [
  {
    id: 1,
    min: 100,
    name: 'Bronze',
    tone: 'bronze',
    accent: '#c47a3a',
    perks: ['2% shop discount (Verse share)', 'Market fee 2% (from 2.5%)'],
  },
  {
    id: 2,
    min: 500,
    name: 'Silver',
    tone: 'silver',
    accent: '#9aadc2',
    perks: ['Bronze perks', 'Playtest priority', 'Ember drop whitelist'],
  },
  {
    id: 3,
    min: 2000,
    name: 'Gold',
    tone: 'gold',
    accent: '#e6c35c',
    perks: ['Silver perks', 'Rake Charm effect (−10% table rake)'],
  },
]

export const STAKER_SHARE_BPS = 3000

export function stakeTierFromAmount(xsolla) {
  const n = Number(xsolla) || 0
  if (n >= 2000) return STAKE_TIERS[2]
  if (n >= 500) return STAKE_TIERS[1]
  if (n >= 100) return STAKE_TIERS[0]
  return null
}

export function shopDiscountBps(xsolla) {
  return stakeTierFromAmount(xsolla) ? 200 : 0
}
