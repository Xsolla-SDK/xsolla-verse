import { apiUrl } from './apiBase'

export async function fetchServerSettings() {
  const res = await fetch(apiUrl('/api/settings'))
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Settings request failed (${res.status})`)
  }
  return data
}

export async function setAllowedIps(allowedAdminIps) {
  const res = await fetch(apiUrl('/api/settings/allowed-ips'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ allowedAdminIps }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Settings request failed (${res.status})`)
  }
  return data
}

export async function allowCurrentIp() {
  const res = await fetch(apiUrl('/api/settings/allow-current-ip'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Settings request failed (${res.status})`)
  }
  return data
}
