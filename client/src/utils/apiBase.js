/** Origin of the Express + Socket.IO hub. Empty in local Vite so `/api` and `/socket.io` go through the proxy. */
export function serverOrigin() {
  const raw = import.meta.env.VITE_SERVER_URI
  if (typeof raw === 'string' && raw.trim() && !/YOUR-SERVICE/i.test(raw)) {
    return raw.trim().replace(/\/$/, '')
  }
  return ''
}

export function apiUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${serverOrigin()}${normalized}`
}
