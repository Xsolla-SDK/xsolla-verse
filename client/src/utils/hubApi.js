function qs(params) {
  const search = new URLSearchParams()
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value == null || value === '') return
    search.set(key, String(value))
  })
  const s = search.toString()
  return s ? `?${s}` : ''
}

async function hubRequest(path, options = {}) {
  const res = await fetch(`/api/hub${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `Hub request failed (${res.status})`)
  }
  return data
}

export async function postPlaytest(entry) {
  const data = await hubRequest('/playtests', {
    method: 'POST',
    body: JSON.stringify(entry),
  })
  return data.playtest
}

export async function fetchPlaytests({ studio, games, tester } = {}) {
  const data = await hubRequest(
    `/playtests${qs({
      studio,
      tester,
      games: Array.isArray(games) ? games.join(',') : games,
    })}`,
  )
  return data.playtests || []
}

export async function postGrant(entry) {
  const data = await hubRequest('/grants', {
    method: 'POST',
    body: JSON.stringify(entry),
  })
  return data.grant
}

export async function fetchGrants({ studio, games, buyer } = {}) {
  const data = await hubRequest(
    `/grants${qs({
      studio,
      buyer,
      games: Array.isArray(games) ? games.join(',') : games,
    })}`,
  )
  return data.grants || []
}
