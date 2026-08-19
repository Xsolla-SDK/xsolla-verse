import addresses from '../contracts/addresses.json'

export const isGuestWallet = (address) =>
  typeof address === 'string' && address.toLowerCase().startsWith('0xguest')

export const isOperatorWallet = (address) => {
  if (!address || isGuestWallet(address)) return false
  const deployer = String(addresses.deployer || '').toLowerCase()
  return Boolean(deployer) && address.toLowerCase() === deployer
}

export function resolveVerseRole({ address, isStudio, isOperator }) {
  if (!address || isGuestWallet(address)) return 'guest'
  if (isOperator) return 'operator'
  if (isStudio) return 'studio'
  return 'player'
}

export function tabsForRole(role, { isStudio } = {}) {
  if (role === 'guest') {
    return ['hub', 'shop', 'academy', 'gallery', 'support']
  }
  if (role === 'player') {
    return [
      'hub',
      'shop',
      'backpack',
      'market',
      'play',
      'social',
      'academy',
      'support',
    ]
  }
  if (role === 'studio') {
    return ['hub', 'studio', 'shop', 'backpack', 'academy', 'support']
  }
  const tabs = ['hub', 'operator', 'shop', 'academy', 'support']
  if (isStudio) tabs.splice(2, 0, 'studio')
  return tabs
}

export function defaultTabForRole(role) {
  if (role === 'studio') return 'studio'
  if (role === 'operator') return 'operator'
  return 'hub'
}
