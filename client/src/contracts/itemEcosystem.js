/**
 * Ecosystem roles for shop items. Chain listings can override kind/perk/bps;
 * this table fills gaps and drives loadout, market, and play-and-earn perks.
 */
export const COSMETIC_SLOTS = [
  'cardBack',
  'tableTheme',
  'dealer',
  'felt',
  'tray',
  'seat',
  'frame',
  'banner',
]

export const ITEM_ECOSYSTEM = {
  'WEBLAUNCH Bundle': {
    kind: 'pack',
    perk: '',
    studioKey: 'second-dinner',
    studioBps: 8000,
    effect: '80% of XSOLLA goes to Second Dinner. Fuels SNAP live ops in the hall.',
  },
  'Season Pass Boost': {
    kind: 'pack',
    perk: 'season',
    studioKey: 'second-dinner',
    studioBps: 8000,
    effect: 'Studio-funded season energy. 80% split to the publisher.',
  },
  'Chef Starter Pack': {
    kind: 'pack',
    perk: '',
    studioKey: 'mytona',
    studioBps: 8000,
    effect: '80% of XSOLLA goes to Mytona.',
  },
  'Daily Gift Chest': {
    kind: 'pack',
    perk: '',
    studioKey: 'mytona',
    studioBps: 8000,
    effect: 'Live-ops chest. Studio take 80%.',
  },
  'Mystery Energy Pack': {
    kind: 'pack',
    perk: '',
    studioKey: 'mytona',
    studioBps: 8000,
    effect: '80% of XSOLLA goes to Mytona.',
  },
  'Hidden Object Pass': {
    kind: 'pass',
    perk: 'season',
    studioKey: 'mytona',
    studioBps: 8000,
    effect: 'Season pass for Seekers Notes. Studio take 80%.',
  },
  'Kitchen Crew Bundle': {
    kind: 'pack',
    perk: '',
    studioKey: 'mytona',
    studioBps: 8000,
    effect: '80% of XSOLLA goes to Mytona.',
  },
  'Friends Feast Pack': {
    kind: 'pack',
    perk: '',
    studioKey: 'mytona',
    studioBps: 8000,
    effect: '80% of XSOLLA goes to Mytona.',
  },
  'Ravenhill Case File': {
    kind: 'pack',
    perk: '',
    studioKey: 'mytona',
    studioBps: 8000,
    effect: '80% of XSOLLA goes to Mytona.',
  },
  'Noir Detective Kit': {
    kind: 'pack',
    perk: '',
    studioKey: 'mytona',
    studioBps: 8000,
    effect: '80% of XSOLLA goes to Mytona.',
  },
  'Manila Indie Bundle': {
    kind: 'pack',
    perk: '',
    studioKey: 'gdap',
    studioBps: 8000,
    effect: '80% of XSOLLA goes to GDAP studios.',
  },
  'Studio Launch Pack': {
    kind: 'pack',
    perk: '',
    studioKey: 'gdap',
    studioBps: 8000,
    effect: '80% of XSOLLA goes to GDAP studios.',
  },
  'Export Ready Pack': {
    kind: 'pack',
    perk: '',
    studioKey: 'dti-emb',
    studioBps: 8000,
    effect: '80% of XSOLLA goes to DTI-EMB export partners.',
  },
  'Global Payments Kit': {
    kind: 'pack',
    perk: '',
    studioKey: 'dti-emb',
    studioBps: 8000,
    effect: '80% of XSOLLA goes to DTI-EMB export partners.',
  },
  'Neon Card Back': {
    kind: 'cosmetic',
    perk: 'cardBack',
    studioKey: 'verse',
    studioBps: 0,
    effect: 'Replaces the Hold’em card back at the table.',
  },
  'Gold Dealer Button': {
    kind: 'cosmetic',
    perk: 'dealer',
    studioKey: 'verse',
    studioBps: 0,
    effect: 'Gold dealer disc on the Hold’em table.',
  },
  'VIP Table Theme': {
    kind: 'cosmetic',
    perk: 'tableTheme',
    studioKey: 'verse',
    studioBps: 0,
    effect: 'Swaps the Hold’em felt / table art.',
  },
  'Emerald Felt': {
    kind: 'cosmetic',
    perk: 'felt',
    studioKey: 'verse',
    studioBps: 0,
    effect: 'Emerald blackjack felt.',
  },
  'Chrome Chip Tray': {
    kind: 'cosmetic',
    perk: 'tray',
    studioKey: 'verse',
    studioBps: 0,
    effect: 'Chrome tray accent on chip stacks.',
  },
  'High-Roller Seat': {
    kind: 'cosmetic',
    perk: 'seat',
    studioKey: 'verse',
    studioBps: 0,
    effect: 'High-roller seat highlight in blackjack.',
  },
  'Avatar Frame: Ember': {
    kind: 'cosmetic',
    perk: 'frame',
    studioKey: 'verse',
    studioBps: 0,
    effect: 'Lobby identity frame.',
  },
  'Lobby Banner: Neon': {
    kind: 'cosmetic',
    perk: 'banner',
    studioKey: 'verse',
    studioBps: 0,
    effect: 'Neon banner on your social card.',
  },
  'Ember Circuit Pass': {
    kind: 'pass',
    perk: 'season',
    studioKey: 'verse',
    studioBps: 0,
    effect: 'Season sink. Unlocks Ember Circuit extras in the hub.',
  },
  'Certified Playtester': {
    kind: 'bounty',
    perk: 'playtest',
    studioKey: 'verse',
    studioBps: 0,
    soulbound: true,
    effect: 'Soulbound. Funded playtest bounties pay XSOLLA to you.',
  },
  'Rake Charm': {
    kind: 'utility',
    perk: 'rake',
    studioKey: 'verse',
    studioBps: 0,
    effect: 'While owned: 10% lower table rake (demo).',
  },
  'Market License': {
    kind: 'utility',
    perk: 'market',
    studioKey: 'verse',
    studioBps: 0,
    effect: 'While owned: secondary-market fee 1% instead of 2.5%.',
  },
}

export function ecosystemFor(name) {
  const row = (name && ITEM_ECOSYSTEM[name]) || {}
  const perk = row.perk || ''
  return {
    kind: row.kind || 'cosmetic',
    perk,
    slot: COSMETIC_SLOTS.indexOf(perk) >= 0 ? perk : null,
    studioKey: row.studioKey || 'verse',
    studioBps: typeof row.studioBps === 'number' ? row.studioBps : 0,
    soulbound: !!row.soulbound,
    effect: row.effect || '',
  }
}

export function enrichItem(item) {
  if (!item) return item
  const meta = ecosystemFor(item.name)
  const kind = item.kind || meta.kind
  const perk = item.perk || meta.perk
  const studioBps =
    item.studioBps != null && item.studioBps !== ''
      ? Number(item.studioBps)
      : meta.studioBps
  const soulbound =
    item.soulbound != null ? !!item.soulbound : meta.soulbound
  return {
    ...item,
    kind,
    perk,
    slot: COSMETIC_SLOTS.indexOf(perk) >= 0 ? perk : null,
    studioBps,
    soulbound,
    effect: meta.effect,
    studioKey: meta.studioKey,
    tradeable: !soulbound && kind !== 'bounty',
  }
}

export function playerPerks(demo, ownedItems = []) {
  const names = new Set()
  if (demo && demo.equipped && demo.equipped.name) {
    names.add(demo.equipped.name)
  }
  Object.keys((demo && demo.loadout) || {}).forEach((slot) => {
    const item = demo.loadout[slot]
    if (item && item.name) names.add(item.name)
  })
  ;((demo && demo.ownedNames) || []).forEach((name) => names.add(name))
  ;(ownedItems || []).forEach((item) => {
    if (item && item.name) names.add(item.name)
  })
  const perks = {}
  names.forEach((name) => {
    const meta = ecosystemFor(name)
    if (meta.perk) perks[meta.perk] = { name, ...meta }
  })
  return perks
}

export function grantsInTitle(item) {
  const row = enrichItem(item)
  if (!row) return false
  if (row.studioKey === 'verse') return false
  return row.kind === 'pack' || row.kind === 'pass'
}

export function splitLabel(bps) {
  const studio = Math.round((Number(bps) || 0) / 100)
  const verse = 100 - studio
  if (studio <= 0) return '100% Verse'
  return `${studio}% studio · ${verse}% Verse`
}
