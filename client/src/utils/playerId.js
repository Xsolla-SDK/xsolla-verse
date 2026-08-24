const STORE_KEY = 'xsolla-verse-player-ids'

const readStore = () => {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (err) {
    return {}
  }
}

const writeStore = (store) => {
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

export const normalizePlayerId = (value) =>
  String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 24)

export const isValidPlayerId = (value) => {
  const id = normalizePlayerId(value)
  return id.length >= 2 && /^[a-zA-Z0-9][a-zA-Z0-9 _.-]{1,23}$/.test(id)
}

export function getPlayerId(address) {
  if (!address) return ''
  const row = readStore()[String(address).toLowerCase()]
  return row && typeof row.username === 'string' ? row.username : ''
}

export function setPlayerId(address, username) {
  if (!address) return ''
  const id = normalizePlayerId(username)
  if (!isValidPlayerId(id)) return ''
  const store = readStore()
  store[String(address).toLowerCase()] = {
    username: id,
    updatedAt: Date.now(),
  }
  writeStore(store)
  return id
}
