const config = {
  isProduction: import.meta.env.PROD,
  contentfulSpaceId: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  contentfulAccessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
  // Dev uses the page origin so Vite can proxy /socket.io → 127.0.0.1:5001.
  // Direct :5001 fails on Windows when the UI is localhost (::1) and the API binds IPv4.
  socketURI: import.meta.env.PROD
    ? import.meta.env.VITE_SERVER_URI
    : typeof window !== 'undefined'
      ? window.location.origin
      : '',
};

export default config;