const config = {
  isProduction: import.meta.env.PROD,
  contentfulSpaceId: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  contentfulAccessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
  socketURI: import.meta.env.PROD
    ? import.meta.env.VITE_SERVER_URI
    : `http://${window.location.hostname}:5001/`,
};

export default config;