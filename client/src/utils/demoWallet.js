import { ethers } from 'ethers'
import { chainRpcUrl } from './chainConfig'

// Hardhat default mnemonic: 12 words (11× test + junk).
const HARDHAT_MNEMONIC =
  'test test test test test test test test test test test junk'

const SESSION_KEY = 'gsv-demo-persona'

export const DEMO_PERSONAS = {
  operator: {
    id: 'operator',
    index: 0,
    username: 'Operator',
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  },
  studio: {
    id: 'studio',
    index: 1,
    username: 'Studio',
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  },
  player: {
    id: 'player',
    index: 5,
    username: 'Player',
    address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
  },
}

export function walletForIndex(index) {
  return ethers.HDNodeWallet.fromPhrase(
    HARDHAT_MNEMONIC,
    '',
    `m/44'/60'/0'/0/${index}`,
  )
}

export function describePersona(id) {
  const spec = DEMO_PERSONAS[id]
  if (!spec) return null
  return { ...spec }
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
  const rpc = chainRpcUrl()
  if (!rpc) return null
  const provider = new ethers.JsonRpcProvider(rpc)
  return walletForIndex(spec.index).connect(provider)
}
