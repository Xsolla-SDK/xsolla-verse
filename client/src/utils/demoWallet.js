import { ethers } from 'ethers'

// Hardhat's well-known local mnemonic. Used only for localhost demo desks.
const HARDHAT_MNEMONIC =
  'test test test test test test test test test test test junk'

const SESSION_KEY = 'gsv-demo-persona'
const LOCAL_RPC = import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:8545'

export const DEMO_PERSONAS = {
  operator: { id: 'operator', index: 0, username: 'Operator' },
  studio: { id: 'studio', index: 1, username: 'Studio' },
  player: { id: 'player', index: 5, username: 'Player' },
}

export function walletForIndex(index) {
  return ethers.HDNodeWallet.fromPhrase(
    HARDHAT_MNEMONIC,
    undefined,
    `m/44'/60'/0'/0/${index}`,
  )
}

export function describePersona(id) {
  const spec = DEMO_PERSONAS[id]
  if (!spec) return null
  return {
    ...spec,
    address: walletForIndex(spec.index).address,
  }
}

export function setDemoPersona(id) {
  if (!id || !DEMO_PERSONAS[id]) {
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }
  sessionStorage.setItem(SESSION_KEY, id)
  return describePersona(id)
}

export function clearDemoPersona() {
  sessionStorage.removeItem(SESSION_KEY)
}

export function getDemoPersonaId() {
  const id = sessionStorage.getItem(SESSION_KEY)
  return DEMO_PERSONAS[id] ? id : null
}

export async function getDemoSigner() {
  const spec = DEMO_PERSONAS[getDemoPersonaId()]
  if (!spec) return null
  const provider = new ethers.JsonRpcProvider(LOCAL_RPC)
  return walletForIndex(spec.index).connect(provider)
}
