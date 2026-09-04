import { ethers } from 'ethers'
import {
  TARGET_CHAIN_ID,
  TARGET_CHAIN_NAME,
  TARGET_NATIVE_NAME,
  TARGET_NATIVE_SYMBOL,
  chainRpcUrl,
  publicChainConfigured,
} from './chainConfig'

const toHexChainId = (id) => `0x${Number(id).toString(16)}`

const ensureTargetNetwork = async () => {
  const rpc = chainRpcUrl()
  if (!rpc) return
  const hexId = toHexChainId(TARGET_CHAIN_ID)
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexId }],
    })
  } catch (err) {
    // 4902 = chain not added to MetaMask
    if (err && (err.code === 4902 || err.code === -32603)) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: hexId,
            chainName: TARGET_CHAIN_NAME,
            rpcUrls: [rpc],
            nativeCurrency: {
              name: TARGET_NATIVE_NAME,
              symbol: TARGET_NATIVE_SYMBOL,
              decimals: 18,
            },
          },
        ],
      })
      return
    }
    throw err
  }
}

export const connectMetamask = async () => {
  if (!window.ethereum) {
    return {
      event: 'No Wallet',
      response: 'Please install MetaMask in your browser',
    }
  }

  try {
    const currentChain = await window.ethereum.request({
      method: 'eth_chainId',
    })
    const currentId = parseInt(currentChain, 16)

    if (publicChainConfigured() && currentId !== TARGET_CHAIN_ID) {
      await ensureTargetNetwork()
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    })

    if (!accounts || !accounts[0]) {
      return { event: 'error', response: 'No account selected' }
    }

    return { event: 'connected', response: accounts[0] }
  } catch (err) {
    console.error(err)
    return {
      event: 'error',
      response: (err && err.message) || 'Wallet connection failed',
    }
  }
}
