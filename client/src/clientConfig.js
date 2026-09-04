import { serverOrigin } from './utils/apiBase'

const config = {
  isProduction: import.meta.env.PROD,
  contentfulSpaceId: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  contentfulAccessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
  // Dev: page origin so Vite proxies /socket.io → 127.0.0.1:5001.
  // Prod: VITE_SERVER_URI (Netlify cannot host the Socket.IO hub).
  socketURI: serverOrigin() || (typeof window !== 'undefined' ? window.location.origin : ''),
}

export default config
