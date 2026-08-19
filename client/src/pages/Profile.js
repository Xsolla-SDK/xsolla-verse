import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import socketContext from '../context/websocket/socketContext'
import globalContext from '../context/global/globalContext'
import {
  buyXsolla,
  depositXsolla,
  withdrawXsolla,
  stakeXsolla,
  unstakeXsolla,
  swapXsolla,
  swapXsollaToUsdc,
  swapUsdcToXsolla,
  swapXsollaToUsdt,
  swapUsdtToXsolla,
  mintMockUsdc,
  mintMockUsdt,
  claimReward,
  completeUnstakeXsolla,
  cancelUnstakeXsolla,
  readBalances,
  contractsConfigured,
  CHIPS_PER_XSOLLA,
  addresses,
  formatXsollaAmount,
} from '../contracts/xsolla'
import {
  CS_FETCH_LOBBY_INFO,
  CS_XSOLLA_DEPOSIT,
  CS_XSOLLA_WITHDRAW,
  CS_ECONOMY_SYNC,
  SC_XSOLLA_BANKROLL,
} from '../game/actions'
import { showVerseAlert } from '../utils/verseAlert'
import styled, { keyframes, createGlobalStyle } from 'styled-components'
import universeBg from '../assets/img/xsolla-universe-landing.webp'
import xsollaLogo from '../assets/img/xsolla-logo.svg'
import CoinIcon from '../components/icons/CoinIcon'
import FeePoolCard from '../components/verse/FeePoolCard'
import { STAKE_TIERS, stakeTierFromAmount } from '../contracts/stakeTiers'
import { playerPerks } from '../contracts/itemEcosystem'
import verseContext from '../context/verse/verseContext'
import { isGuestWallet } from '../utils/walletRole'
import { clearDemoPersona } from '../utils/demoWallet'

function formatCountdown(unlockAtSec, nowMs) {
  const secs = Math.max(
    0,
    Math.ceil((Number(unlockAtSec) * 1000 - nowMs) / 1000),
  )
  if (secs <= 0) return 'ready'
  if (secs < 120) return `${secs}s`
  const m = Math.floor(secs / 60)
  const rem = secs % 60
  if (m < 60) return `${m}m ${rem}s`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

const Profile = () => {
  const navigate = useNavigate()
  const { socket } = useContext(socketContext)
  const {
    walletAddress,
    walletXsolla,
    setChipsAmount,
    setWalletAddress,
    userName,
    setUserName,
    feePool,
    setStakedXsolla,
    setWalletXsolla,
  } = useContext(globalContext)
  const { demo, setDisplayName } = useContext(verseContext)
  const [amount, setAmount] = useState('1')
  const [nameDraft, setNameDraft] = useState(
    () => demo.displayName || userName || '',
  )
  const [busy, setBusy] = useState(false)
  const [balances, setBalances] = useState(null)
  const [status, setStatus] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const isGuest = isGuestWallet(walletAddress)

  useEffect(() => {
    if (!socket) {
      navigate('/')
      return undefined
    }
    if (!walletAddress) {
      navigate('/', { replace: true })
    }
  }, [socket, navigate, walletAddress])

  useEffect(() => {
    if (!socket) return undefined
    const onBankroll = (payload) => {
      if (payload.error) {
        setStatus(payload.error)
        return
      }
      if (payload.bankroll != null && setChipsAmount) {
        setChipsAmount(payload.bankroll)
      }
      setStatus(
        payload.action === 'deposit'
          ? `Deposited ${payload.amountXsolla} XSOLLA → chips`
          : `Withdrew ${payload.amountXsolla} XSOLLA from chips`,
      )
    }
    socket.on(SC_XSOLLA_BANKROLL, onBankroll)
    return () => socket.off(SC_XSOLLA_BANKROLL, onBankroll)
  }, [socket, setChipsAmount])

  useEffect(() => {
    const pending = Number(balances && balances.pendingUnstakeXsolla) || 0
    const unlock = Number(balances && balances.unstakeUnlockAt) || 0
    if (pending <= 0 || unlock <= 0) return undefined
    const tick = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(tick)
  }, [balances])

  useEffect(() => {
    if (walletAddress && contractsConfigured() && !isGuest) {
      refreshBalances()
    }
    // eslint-disable-next-line
  }, [walletAddress])

  const syncEconomy = (staked) => {
    const stakedXsolla = Number(staked) || 0
    if (setStakedXsolla) setStakedXsolla(stakedXsolla)
    if (!socket) return
    socket.emit(CS_ECONOMY_SYNC, {
      stakedXsolla,
      hasRakeCharm: !!playerPerks(demo).rake,
    })
  }

  const refreshBalances = async () => {
    try {
      if (!walletAddress || !contractsConfigured() || isGuest) return
      const b = await readBalances(walletAddress)
      setBalances(b)
      syncEconomy(b.stakedXsolla)
      if (setWalletXsolla) setWalletXsolla(Number(b.walletXsolla) || 0)
    } catch (e) {
      setStatus(e.message || 'Could not read balances')
    }
  }

  const run = async (fn, label) => {
    setBusy(true)
    setStatus(`${label}…`)
    try {
      const receipt = await fn()
      setStatus(`${label} confirmed`)
      await refreshBalances()
      return receipt
    } catch (e) {
      console.error(e)
      setStatus(e.message || `${label} failed`)
      showVerseAlert('Finance', e.message || `${label} failed`, 'error')
      return null
    } finally {
      setBusy(false)
    }
  }

  const onBuy = () => run(() => buyXsolla(amount), 'Buy XSOLLA')
  const onDeposit = async () => {
    const receipt = await run(() => depositXsolla(amount), 'Deposit XSOLLA')
    if (receipt && socket) {
      socket.emit(CS_XSOLLA_DEPOSIT, {
        amountXsolla: Number(amount),
        txHash: receipt.transactionHash,
      })
    }
  }
  const onWithdraw = async () => {
    if (!socket) return
    socket.emit(CS_XSOLLA_WITHDRAW, { amountXsolla: Number(amount) })
    await run(() => withdrawXsolla(amount), 'Withdraw XSOLLA')
  }
  const onStake = () => run(() => stakeXsolla(amount), 'Stake XSOLLA')
  const onUnstake = () =>
    run(
      () => unstakeXsolla(amount),
      Number(balances && balances.unstakeDelay) > 0
        ? 'Request unstake'
        : 'Unstake XSOLLA',
    )
  const onCompleteUnstake = () =>
    run(() => completeUnstakeXsolla(), 'Complete unstake')
  const onCancelUnstake = () =>
    run(() => cancelUnstakeXsolla(), 'Cancel unstake')
  const onStakeTier = (min) => {
    setAmount(String(min))
    return run(() => stakeXsolla(min), `Stake ${min} XSOLLA`)
  }
  const onSwapNative = () => run(() => swapXsolla(amount), 'Swap XSOLLA→native')
  const onSwapToUsdc = () => run(() => swapXsollaToUsdc(amount), 'Swap XSOLLA→USDC')
  const onSwapFromUsdc = () => run(() => swapUsdcToXsolla(amount), 'Swap USDC→XSOLLA')
  const onSwapToUsdt = () => run(() => swapXsollaToUsdt(amount), 'Swap XSOLLA→USDT')
  const onSwapFromUsdt = () => run(() => swapUsdtToXsolla(amount), 'Swap USDT→XSOLLA')
  const onMintUsdc = () => run(() => mintMockUsdc(amount), 'Mint mock USDC')
  const onMintUsdt = () => run(() => mintMockUsdt(amount), 'Mint mock USDT')
  const onClaim = () => run(() => claimReward(amount), 'Claim reward')

  const saveDisplayName = () => {
    const next = nameDraft.trim().slice(0, 24)
    if (!next) return
    setDisplayName(next)
    setUserName(next)
    if (socket && walletAddress) {
      socket.emit(CS_FETCH_LOBBY_INFO, {
        walletAddress,
        socketId: socket.id,
        gameId: 'local',
        username: next,
      })
    }
    setStatus('Display name saved')
  }

  const onLogout = () => {
    clearDemoPersona()
    setWalletAddress('')
    setUserName('')
    if (setWalletXsolla) setWalletXsolla(0)
    navigate('/')
  }

  if (!walletAddress) {
    return null
  }

  const stakedAmt = Number(balances && balances.stakedXsolla) || 0
  const currentTier = stakeTierFromAmount(stakedAmt)
  const pendingUnstake = Number(balances && balances.pendingUnstakeXsolla) || 0
  const unlockAt = Number(balances && balances.unstakeUnlockAt) || 0
  const unlockReady = pendingUnstake > 0 && Date.now() >= unlockAt * 1000
  const delaySec = Number(balances && balances.unstakeDelay) || 0

  return (
    <Page>
      <SwalTheme />
      <Backdrop aria-hidden="true" />
      <Overlay aria-hidden="true" />

      <Shell>
        <TopBar>
          <Brand to="/">
            <img src={xsollaLogo} alt="Xsolla" />
            <BrandText>
              Xsolla<span>Verse</span>
            </BrandText>
          </Brand>
          <NavLinks>
            <NavLink to="/lobby">Lobby</NavLink>
          </NavLinks>
          <PlayerMeta>
            <ChipBalance title="XSOLLA">
              <CoinIcon />
              <MetaValue>{formatXsollaAmount(walletXsolla)}</MetaValue>
            </ChipBalance>
            <GhostBtn type="button" onClick={onLogout}>
              Log out
            </GhostBtn>
          </PlayerMeta>
        </TopBar>

        <Panel>
          <PanelTitle>Profile</PanelTitle>
          <ProfileRow>
            <MetaChip>
              <MetaLabel>Player</MetaLabel>
              <MetaValue>{userName || 'Player'}</MetaValue>
            </MetaChip>
            <MetaChip>
              <MetaLabel>Wallet</MetaLabel>
              <MetaValue>
                {walletAddress.slice(0, 8)}…{walletAddress.slice(-6)}
              </MetaValue>
            </MetaChip>
          </ProfileRow>
          <ActionRow>
            <ProfileInput
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="Display name"
              aria-label="Display name"
              maxLength={24}
            />
            <GhostBtn type="button" onClick={saveDisplayName}>
              Save name
            </GhostBtn>
          </ActionRow>
        </Panel>

        {isGuest ? (
          <Panel style={{ marginTop: '1rem' }}>
            <PanelTitle as="h2">Guest</PanelTitle>
            <PanelSub>
              Browse the hub as a guest. Shop and stake need a player desk.
            </PanelSub>
          </Panel>
        ) : (
        <>
        <Panel style={{ marginTop: '1rem' }}>
          <PanelTitle as="h2">Membership stake</PanelTitle>
          <PanelSub>
            Stake XSOLLA for shop, market, and table perks. Yield is 30% of this
            session’s table fees — not minted XSOLLA.
            {delaySec > 0
              ? ` Unstake delay ${delaySec}s in demo (14 days in production).`
              : ''}
          </PanelSub>
          {currentTier ? (
            <Hint>
              Current tier: {currentTier.name} ({stakedAmt.toFixed(2)} XSOLLA)
            </Hint>
          ) : (
            <Hint>Stake 100 XSOLLA for Bronze perks.</Hint>
          )}
          <TierGrid>
            {STAKE_TIERS.map((tier) => {
              const active = currentTier && currentTier.id === tier.id
              const reached = currentTier && currentTier.id >= tier.id
              return (
                <TierCard key={tier.id} $active={active}>
                  <MetaLabel>{tier.name}</MetaLabel>
                  <MetaValue>{tier.min} XSOLLA</MetaValue>
                  <PerkList>
                    {tier.perks.map((perk) => (
                      <li key={perk}>{perk}</li>
                    ))}
                  </PerkList>
                  <GhostBtn
                    type="button"
                    disabled={busy || !contractsConfigured()}
                    onClick={() => onStakeTier(tier.min)}
                  >
                    {reached ? 'Add stake' : `Stake ${tier.min}`}
                  </GhostBtn>
                </TierCard>
              )
            })}
          </TierGrid>
          {pendingUnstake > 0 && (
            <UnstakeBar>
              <Hint>
                {pendingUnstake.toFixed(4)} XSOLLA unlocking{' '}
                {unlockReady
                  ? 'now'
                  : `in ${formatCountdown(unlockAt, now)}`}
              </Hint>
              <PrimaryBtn
                type="button"
                disabled={busy || !unlockReady}
                onClick={onCompleteUnstake}
              >
                Complete unstake
              </PrimaryBtn>
              <GhostBtn
                type="button"
                disabled={busy}
                onClick={onCancelUnstake}
              >
                Cancel
              </GhostBtn>
            </UnstakeBar>
          )}
          <FeePoolWrap>
            <FeePoolCard pool={feePool} />
          </FeePoolWrap>
        </Panel>

        <Panel style={{ marginTop: '1rem' }}>
          <PanelTitle as="h2">Finance</PanelTitle>
          <PanelSub>
            1 XSOLLA = {CHIPS_PER_XSOLLA} chips · Shop uses XSOLLA · Tables use
            chips
          </PanelSub>

          {!contractsConfigured() ? (
            <Hint>
              Contracts not deployed yet. Run <code>npx hardhat node</code> and{' '}
              <code>npm run deploy:local</code>
            </Hint>
          ) : (
            <>
              <Hint>
                Token {addresses.XsollaToken?.slice(0, 10)}… · Treasury{' '}
                {addresses.XsollaTreasury?.slice(0, 10)}…
                {addresses.USDC
                  ? ` · USDC ${addresses.USDC.slice(0, 10)}…`
                  : ''}
                {addresses.USDT
                  ? ` · USDT ${addresses.USDT.slice(0, 10)}…`
                  : ''}
              </Hint>

              {balances && (
                <BalanceGrid>
                  <BalanceItem>
                    <MetaLabel>Wallet XSOLLA</MetaLabel>
                    <MetaValue>
                      {Number(balances.walletXsolla).toFixed(4)}
                    </MetaValue>
                  </BalanceItem>
                  <BalanceItem>
                    <MetaLabel>Escrow</MetaLabel>
                    <MetaValue>
                      {Number(balances.playCreditsXsolla).toFixed(4)}
                    </MetaValue>
                  </BalanceItem>
                  <BalanceItem>
                    <MetaLabel>Staked</MetaLabel>
                    <MetaValue>
                      {Number(balances.stakedXsolla).toFixed(4)}
                    </MetaValue>
                  </BalanceItem>
                  <BalanceItem>
                    <MetaLabel>USDC / USDT</MetaLabel>
                    <MetaValue>
                      {Number(balances.walletUsdc).toFixed(2)} /{' '}
                      {Number(balances.walletUsdt).toFixed(2)}
                    </MetaValue>
                  </BalanceItem>
                </BalanceGrid>
              )}

              <ActionRow>
                <AmountInput
                  type="number"
                  min="0.01"
                  step="0.1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  aria-label="Amount"
                />
                <PrimaryBtn type="button" disabled={busy} onClick={onBuy}>
                  Buy (POL)
                </PrimaryBtn>
                <GhostBtn type="button" disabled={busy} onClick={onDeposit}>
                  Deposit → Chips
                </GhostBtn>
                <GhostBtn type="button" disabled={busy} onClick={onWithdraw}>
                  Withdraw
                </GhostBtn>
                <GhostBtn type="button" disabled={busy} onClick={onStake}>
                  Stake
                </GhostBtn>
                <GhostBtn type="button" disabled={busy} onClick={onUnstake}>
                  {delaySec > 0 ? 'Request unstake' : 'Unstake'}
                </GhostBtn>
              </ActionRow>
              <ActionRow>
                <PrimaryBtn
                  type="button"
                  disabled={busy}
                  onClick={onSwapFromUsdc}
                >
                  USDC→XSOLLA
                </PrimaryBtn>
                <PrimaryBtn type="button" disabled={busy} onClick={onSwapToUsdc}>
                  XSOLLA→USDC
                </PrimaryBtn>
                <PrimaryBtn
                  type="button"
                  disabled={busy}
                  onClick={onSwapFromUsdt}
                >
                  USDT→XSOLLA
                </PrimaryBtn>
                <PrimaryBtn type="button" disabled={busy} onClick={onSwapToUsdt}>
                  XSOLLA→USDT
                </PrimaryBtn>
                <GhostBtn type="button" disabled={busy} onClick={onSwapNative}>
                  XSOLLA→POL
                </GhostBtn>
              </ActionRow>
              <ActionRow>
                <GhostBtn type="button" disabled={busy} onClick={onMintUsdc}>
                  Faucet USDC
                </GhostBtn>
                <GhostBtn type="button" disabled={busy} onClick={onMintUsdt}>
                  Faucet USDT
                </GhostBtn>
                <GhostBtn type="button" disabled={busy} onClick={onClaim}>
                  Claim
                </GhostBtn>
                <GhostBtn type="button" disabled={busy} onClick={refreshBalances}>
                  Refresh
                </GhostBtn>
              </ActionRow>
            </>
          )}

          {status && (
            <StatusLine $error={/fail|error|could not/i.test(status)}>
              {status}
            </StatusLine>
          )}
        </Panel>
        </>
        )}
      </Shell>
    </Page>
  )
}

const drift = keyframes`
  0% { transform: scale(1.06) translate3d(0, 0, 0); }
  50% { transform: scale(1.12) translate3d(-1.5%, -0.8%, 0); }
  100% { transform: scale(1.06) translate3d(0, 0, 0); }
`

const SwalTheme = createGlobalStyle`
  .xsolla-swal-popup {
    border: 1px solid rgba(128, 234, 255, 0.35) !important;
    border-radius: 0 !important;
    font-family: 'Chakra Petch', 'Segoe UI', sans-serif !important;
  }
  .xsolla-swal-title {
    color: #f4f0ff !important;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .xsolla-swal-text { color: rgba(220, 210, 245, 0.88) !important; }
  .xsolla-swal-confirm {
    border: 1px solid rgba(128, 234, 255, 0.65) !important;
    background: linear-gradient(
      135deg,
      rgba(255, 110, 199, 0.55),
      rgba(88, 40, 160, 0.9),
      rgba(20, 70, 140, 0.95)
    ) !important;
    text-transform: uppercase;
    font-weight: 600 !important;
  }
`

const Page = styled.div`
  --ink: #f4f0ff;
  --muted: rgba(220, 210, 245, 0.78);
  --line: rgba(128, 234, 255, 0.28);
  --pink: #ff6ec7;
  --cyan: #80eaff;
  --panel: rgba(12, 6, 28, 0.72);

  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  color: var(--ink);
  font-family: 'Chakra Petch', 'Segoe UI', sans-serif;
  overflow-x: hidden;
`

const Backdrop = styled.div`
  position: fixed;
  inset: -6%;
  z-index: 0;
  background:
    url(${universeBg}) center 40% / cover no-repeat,
    #05010f;
  animation: ${drift} 40s ease-in-out infinite;
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  background: linear-gradient(
    180deg,
    rgba(4, 1, 14, 0.82) 0%,
    rgba(4, 1, 14, 0.62) 40%,
    rgba(4, 1, 14, 0.9) 100%
  );
  pointer-events: none;
`

const Shell = styled.div`
  position: relative;
  z-index: 1;
  width: min(1100px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 1.25rem 0 3.5rem;
`

const TopBar = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 0 1.25rem;
  border-bottom: 1px solid var(--line);
  margin-bottom: 1.25rem;
`

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none !important;
  color: inherit !important;

  img {
    width: 108px;
    height: auto;
    display: block;
  }
`

const BrandText = styled.span`
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;

  span {
    color: var(--pink);
  }
`

const NavLinks = styled.nav`
  display: flex;
  gap: 0.75rem;
`

const NavLink = styled(Link)`
  color: ${(p) => (p.$active ? '#fff' : 'var(--muted)')} !important;
  text-decoration: none !important;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.85rem;
  padding-bottom: 0.2rem;
  border-bottom: 2px solid
    ${(p) => (p.$active ? 'var(--cyan)' : 'transparent')};

  &:hover {
    color: #fff !important;
  }
`

const PlayerMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
`

const MetaChip = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.4rem 0.7rem;
  border: 1px solid rgba(128, 234, 255, 0.18);
  background: rgba(255, 255, 255, 0.04);
  min-width: 96px;
`

const ChipBalance = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid rgba(128, 234, 255, 0.18);
  background: rgba(255, 255, 255, 0.04);
`

const MetaLabel = styled.span`
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
`

const MetaValue = styled.span`
  font-size: 0.92rem;
  font-weight: 600;
  color: #fff;
`

const Panel = styled.section`
  border: 1px solid var(--line);
  background: var(--panel);
  backdrop-filter: blur(10px);
  padding: 1.25rem 1.2rem 1.4rem;
`

const PanelTitle = styled.h1`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

const ProfileRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.85rem;
`

const PanelSub = styled.p`
  margin: 0.4rem 0 1rem;
  color: var(--muted);
  font-size: 0.9rem;
`

const Hint = styled.p`
  margin: 0.35rem 0;
  color: var(--muted);
  font-size: 0.9rem;

  code {
    color: var(--cyan);
    font-size: 0.85em;
  }
`

const BalanceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.55rem;
  margin: 0.85rem 0 0.35rem;
`

const BalanceItem = styled.div`
  padding: 0.55rem 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
`

const TierGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.65rem;
  margin: 0.85rem 0 0.35rem;
`

const TierCard = styled.div`
  padding: 0.75rem 0.8rem 0.9rem;
  border: 1px solid
    ${(p) =>
      p.$active ? 'rgba(128, 234, 255, 0.7)' : 'rgba(255, 255, 255, 0.08)'};
  background: ${(p) =>
    p.$active ? 'rgba(128, 234, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)'};
`

const PerkList = styled.ul`
  margin: 0.45rem 0 0.7rem;
  padding-left: 1.1rem;
  color: var(--muted);
  font-size: 0.82rem;
  line-height: 1.45;
`

const UnstakeBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: center;
  margin-top: 0.85rem;
`

const FeePoolWrap = styled.div`
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(128, 234, 255, 0.18);
`

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: center;
  margin-top: 0.75rem;
`

const AmountInput = styled.input`
  width: 110px;
  padding: 0.55rem 0.65rem;
  border: 1px solid var(--line);
  background: rgba(0, 0, 0, 0.35);
  color: var(--ink);
  font: inherit;
`

const ProfileInput = styled(AmountInput)`
  width: min(260px, 100%);
`

const btnBase = `
  appearance: none;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.55rem 0.85rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`

const PrimaryBtn = styled.button`
  ${btnBase}
  border: 1px solid rgba(128, 234, 255, 0.7);
  color: #f8f4ff;
  background: linear-gradient(
    135deg,
    rgba(255, 110, 199, 0.5),
    rgba(88, 40, 160, 0.85),
    rgba(20, 70, 140, 0.9)
  );
`

const GhostBtn = styled.button`
  ${btnBase}
  border: 1px solid rgba(128, 234, 255, 0.28);
  color: var(--ink);
  background: rgba(255, 255, 255, 0.04);

  &:hover:not(:disabled) {
    border-color: var(--cyan);
  }
`

const StatusLine = styled.p`
  margin: 0.85rem 0 0;
  padding: 0.65rem 0.85rem;
  border: 1px solid
    ${(p) =>
      p.$error ? 'rgba(255, 110, 199, 0.55)' : 'rgba(128, 234, 255, 0.4)'};
  background: ${(p) =>
    p.$error ? 'rgba(255, 110, 199, 0.12)' : 'rgba(128, 234, 255, 0.1)'};
  color: ${(p) => (p.$error ? '#ffb3e0' : 'var(--cyan)')};
  font-size: 0.88rem;
`

export default Profile
