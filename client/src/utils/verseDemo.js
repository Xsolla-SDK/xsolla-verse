const KEY = 'gsv-demo-v1'
const PLAYTEST_PENDING = 'gsv_playtest_pending'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch (e) {
    return {}
  }
}

function persist(next) {
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}

export function defaultDemoState() {
  return {
    displayName: '',
    equipped: null,
    loadout: {},
    ownedNames: [],
    quests: { play: false, buy: false, badge: false },
    playtests: [],
    grants: [],
    tickets: [],
  }
}

export function readDemoState() {
  const loaded = load()
  const defaults = defaultDemoState()
  return {
    ...defaults,
    ...loaded,
    quests: { ...defaults.quests, ...(loaded.quests || {}) },
    loadout: { ...(defaults.loadout || {}), ...(loaded.loadout || {}) },
    ownedNames: Array.isArray(loaded.ownedNames) ? loaded.ownedNames : [],
    playtests: Array.isArray(loaded.playtests) ? loaded.playtests : [],
    grants: Array.isArray(loaded.grants) ? loaded.grants : [],
    tickets: Array.isArray(loaded.tickets) ? loaded.tickets : [],
  }
}

export function writeDemoState(patch) {
  const current = readDemoState()
  const next = { ...current, ...patch }
  if (patch.quests) {
    next.quests = { ...current.quests, ...patch.quests }
    if (next.quests.play && next.quests.buy) next.quests.badge = true
  }
  return persist(next)
}

export function setPlaytestPending(on) {
  if (on) sessionStorage.setItem(PLAYTEST_PENDING, '1')
  else sessionStorage.removeItem(PLAYTEST_PENDING)
}

export function isPlaytestPending() {
  return sessionStorage.getItem(PLAYTEST_PENDING) === '1'
}
