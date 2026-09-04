import addresses from '../contracts/addresses.json'

const fromEnv = (value) => String(value || '').trim()

export const TARGET_CHAIN_ID = Number(
  import.meta.env.VITE_CHAIN_ID || addresses.chainId || 31337,
)

export const TARGET_RPC_URL = fromEnv(import.meta.env.VITE_RPC_URL)

export const TARGET_CHAIN_NAME =
  fromEnv(import.meta.env.VITE_CHAIN_NAME) ||
  (TARGET_CHAIN_ID === 31337 ? 'Hardhat Local' : `Chain ${TARGET_CHAIN_ID}`)

export const TARGET_NATIVE_NAME = fromEnv(import.meta.env.VITE_NATIVE_NAME) || 'Ether'
export const TARGET_NATIVE_SYMBOL = fromEnv(import.meta.env.VITE_NATIVE_SYMBOL) || 'ETH'

export function isLocalRpc(url = TARGET_RPC_URL) {
  if (!url) return TARGET_CHAIN_ID === 31337
  return /127\.0\.0\.1|localhost/i.test(url)
}

/** Local Hardhat is only used during `npm start`. Production must set VITE_RPC_URL. */
export function chainRpcUrl() {
  if (TARGET_RPC_URL) return TARGET_RPC_URL
  if (import.meta.env.DEV) return 'http://127.0.0.1:8545'
  return ''
}

export function publicChainConfigured() {
  const rpc = chainRpcUrl()
  return Boolean(rpc) && !isLocalRpc(rpc)
}

export function chainOfflineCopy() {
  if (import.meta.env.PROD) {
    return 'On-chain shop and market are not connected on this host. Lobby, tables, and guest still work.'
  }
  return 'Xsolla contracts not deployed. Run npm run deploy:local'
}
