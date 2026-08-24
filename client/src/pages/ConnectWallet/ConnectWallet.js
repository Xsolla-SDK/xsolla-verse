import React, { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import globalContext from '../../context/global/globalContext'
import locaContext from '../../context/localization/locaContext'
import socketContext from '../../context/websocket/socketContext'
import { CS_FETCH_LOBBY_INFO } from '../../game/actions'
import { connectMetamask } from '../../utils/interact'
import {
  clearDemoPersona,
  describePersona,
  setDemoPersona,
} from '../../utils/demoWallet'
import {
  getPlayerId,
  isValidPlayerId,
  normalizePlayerId,
  setPlayerId,
} from '../../utils/playerId'
import {
  GuestIcon,
  OperatorIcon,
  PlayerIcon,
  StudioIcon,
} from '../../components/verse/RoleIcons'
import xsollaLogo from '../../assets/img/xsolla-logo.svg'
import universeBg from '../../assets/img/xsolla-universe-landing.webp'

const DESKS = [
  { id: 'player', tone: 'cyan', Icon: PlayerIcon, blurb: 'landing.deskPlayer' },
  { id: 'studio', tone: 'pink', Icon: StudioIcon, blurb: 'landing.deskStudio' },
  {
    id: 'operator',
    tone: 'gold',
    Icon: OperatorIcon,
    blurb: 'landing.deskOperator',
  },
  { id: 'guest', tone: 'lilac', Icon: GuestIcon, blurb: 'landing.deskGuest' },
]

const guestWallet = () =>
  `0xguest${Math.random().toString(16).slice(2, 10)}${Date.now().toString(16)}`

const shortAddr = (addr) =>
  addr && addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr || ''

const ConnectWallet = () => {
  const { setWalletAddress, setUserName } = useContext(globalContext)
  const { t } = useContext(locaContext)
  const { socket } = useContext(socketContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [address, setAddress] = useState('')
  const [playerId, setIdDraft] = useState('')
  const [knownId, setKnownId] = useState(false)
  const [busy, setBusy] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const query = new URLSearchParams(location.search)
    const fromQuery = query.get('walletAddress') || ''
    const nameFromQuery = query.get('username') || ''
    if (fromQuery) {
      setAddress(fromQuery)
      const saved = getPlayerId(fromQuery)
      const next = saved || nameFromQuery
      setIdDraft(next)
      setKnownId(Boolean(saved))
    }
  }, [location.search])

  useEffect(() => {
    if (!window.ethereum || !window.ethereum.on) return undefined
    const onAccounts = (accounts) => {
      const next = accounts && accounts[0]
      if (!next) {
        setAddress('')
        setKnownId(false)
        return
      }
      clearDemoPersona()
      setAddress(next)
      const saved = getPlayerId(next)
      setIdDraft(saved)
      setKnownId(Boolean(saved))
      setError('')
    }
    window.ethereum.on('accountsChanged', onAccounts)
    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', onAccounts)
      }
    }
  }, [])

  const applyWallet = (nextAddress, fallbackName = '') => {
    const saved = getPlayerId(nextAddress)
    setAddress(nextAddress)
    setIdDraft(saved || fallbackName)
    setKnownId(Boolean(saved))
  }

  const onConnect = async () => {
    setBusy(true)
    setError('')
    try {
      clearDemoPersona()
      const result = await connectMetamask()
      if (result.event !== 'connected') {
        setError(result.response || t('login.walletFail'))
        return
      }
      applyWallet(result.response)
    } catch (err) {
      setError((err && err.message) || t('login.walletFail'))
    } finally {
      setBusy(false)
    }
  }

  const onDemoDesk = (id) => {
    const persona = setDemoPersona(id)
    if (!persona) {
      setError(t('landing.walletFail'))
      return
    }
    setError('')
    applyWallet(persona.address, persona.username)
  }

  const enterHub = (walletAddress, username, { guest = false } = {}) => {
    if (!socket || socket.connected !== true) {
      setError(t('login.hubWait'))
      return
    }
    const name = guest ? 'Guest' : normalizePlayerId(username)
    if (!guest && !isValidPlayerId(name)) {
      setError(t('login.idInvalid'))
      return
    }
    if (!guest) setPlayerId(walletAddress, name)
    setJoining(true)
    setWalletAddress(walletAddress)
    setUserName(name)
    socket.emit(CS_FETCH_LOBBY_INFO, {
      walletAddress,
      socketId: socket.id,
      gameId: new URLSearchParams(location.search).get('gameId') || 'local',
      username: name,
    })
    navigate('/lobby', { replace: true })
  }

  const onCreateAndEnter = (e) => {
    e.preventDefault()
    if (!address) {
      setError(t('login.connectFirst'))
      return
    }
    enterHub(address, playerId)
  }

  const onGuest = () => {
    clearDemoPersona()
    enterHub(guestWallet(), 'Guest', { guest: true })
  }

  const onPickDesk = (id) => {
    if (id === 'guest') {
      onGuest()
      return
    }
    onDemoDesk(id)
  }

  const hubReady = Boolean(socket && socket.connected)
  const canEnter = Boolean(address && isValidPlayerId(playerId) && hubReady && !busy)
  const activeDesk = DESKS.find((desk) => {
    const persona = describePersona(desk.id)
    return (
      persona &&
      address &&
      persona.address.toLowerCase() === address.toLowerCase()
    )
  })

  return (
    <Page>
      <UniverseImage />
      <FrostedOverlay />
      <Card>
        <Brand to="/">
          <img src={xsollaLogo} alt="Xsolla" />
          <span>
            Xsolla<b>Verse</b>
          </span>
        </Brand>
        <Title>{t('login.title')}</Title>
        <Lead>{t('login.lead')}</Lead>

        <Step>
          <StepLabel>01 · {t('login.connect')}</StepLabel>
          {address ? (
            <WalletChip title={address}>
              {shortAddr(address)}
              <Ghost type="button" onClick={onConnect} disabled={busy}>
                {t('login.switchWallet')}
              </Ghost>
            </WalletChip>
          ) : (
            <Primary type="button" onClick={onConnect} disabled={busy}>
              {busy ? t('identity.connecting') : t('identity.connect')}
            </Primary>
          )}
        </Step>

        <form onSubmit={onCreateAndEnter}>
          <Step>
            <StepLabel>
              02 · {knownId ? t('login.welcomeBack') : t('login.createId')}
            </StepLabel>
            <Input
              value={playerId}
              onChange={(e) => {
                setIdDraft(e.target.value)
                setKnownId(false)
              }}
              placeholder={t('login.idPlaceholder')}
              aria-label={t('login.createId')}
              autoComplete="username"
              maxLength={24}
              disabled={!address}
            />
            <Hint>{t('login.idHint')}</Hint>
          </Step>

          <Primary type="submit" disabled={!canEnter || joining}>
            {joining
              ? t('login.entering')
              : knownId
                ? t('login.enter')
                : t('login.createAndEnter')}
          </Primary>
        </form>

        {!hubReady ? <Status>{t('login.hubWait')}</Status> : null}
        {error ? <ErrorText>{error}</ErrorText> : null}

        <Divider />
        <StepLabel>{t('landing.choose')}</StepLabel>
        <DeskGrid>
          {DESKS.map((desk) => (
            <DeskCard
              key={desk.id}
              type="button"
              $tone={desk.tone}
              $active={activeDesk === desk}
              onClick={() => onPickDesk(desk.id)}
              disabled={busy || joining}
            >
              <DeskGlow aria-hidden="true" />
              <DeskIconWrap $tone={desk.tone}>
                <desk.Icon />
              </DeskIconWrap>
              <DeskName>{t(`role.${desk.id}`)}</DeskName>
              <DeskBlurb>{t(desk.blurb)}</DeskBlurb>
            </DeskCard>
          ))}
        </DeskGrid>
        <Hint>{t('login.demoHint')}</Hint>
      </Card>
    </Page>
  )
}

export default ConnectWallet

const kenBurns = keyframes`
  0% { transform: scale(1.08) translate3d(0, 0, 0); }
  50% { transform: scale(1.16) translate3d(-2.2%, -1.2%, 0); }
  100% { transform: scale(1.08) translate3d(0, 0, 0); }
`

const fadeUp = keyframes`
  from { opacity: 0; transform: translate3d(0, 18px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
`

const Page = styled.main`
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  color: #f4f0ff;
  font-family: 'Chakra Petch', 'Segoe UI', sans-serif;
  background: #05010f;
`

const UniverseImage = styled.div`
  position: fixed;
  inset: -8%;
  z-index: 0;
  background:
    url(${universeBg}) center 42% / cover no-repeat,
    #05010f;
  animation: ${kenBurns} 32s ease-in-out infinite;
`

const FrostedOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgba(4, 1, 14, 0.72) 0%,
    rgba(4, 1, 14, 0.4) 45%,
    rgba(4, 1, 14, 0.86) 100%
  );
`

const Card = styled.section`
  position: relative;
  z-index: 2;
  width: min(440px, 100%);
  padding: 1.6rem 1.4rem 1.45rem;
  border: 1px solid rgba(128, 234, 255, 0.32);
  background: linear-gradient(
    180deg,
    rgba(28, 10, 52, 0.92) 0%,
    rgba(8, 4, 24, 0.94) 100%
  );
  box-shadow:
    0 0 40px rgba(255, 110, 199, 0.16),
    0 0 80px rgba(128, 234, 255, 0.1);
  animation: ${fadeUp} 0.4s ease-out both;
`

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 1.1rem;
  color: inherit;
  text-decoration: none;

  img {
    width: 92px;
    height: auto;
  }

  span {
    font-size: 1.05rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  b {
    font-weight: 700;
    color: #80eaff;
  }
`

const Title = styled.h1`
  margin: 0;
  font-size: 1.35rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`

const Lead = styled.p`
  margin: 0.45rem 0 1.15rem;
  color: rgba(220, 210, 245, 0.78);
  font-size: 0.92rem;
  line-height: 1.45;
`

const Step = styled.div`
  margin-bottom: 1rem;
`

const StepLabel = styled.p`
  margin: 0 0 0.45rem;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #80eaff;
`

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 0.7rem 0.8rem;
  border: 1px solid rgba(128, 234, 255, 0.28);
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  font: inherit;
  outline: none;

  &:focus {
    border-color: #80eaff;
  }

  &:disabled {
    opacity: 0.45;
  }
`

const Primary = styled.button`
  width: 100%;
  margin-top: 0.15rem;
  padding: 0.8rem 1rem;
  border: 1px solid rgba(128, 234, 255, 0.7);
  background: linear-gradient(180deg, #1aa890 0%, #0b3d38 100%);
  color: #e8f0ee;
  font: inherit;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const Ghost = styled.button`
  appearance: none;
  padding: 0.45rem 0.7rem;
  border: 1px solid rgba(128, 234, 255, 0.22);
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const WalletChip = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.55rem 0.65rem;
  border: 1px solid rgba(128, 234, 255, 0.28);
  background: rgba(128, 234, 255, 0.08);
  font-weight: 600;
  letter-spacing: 0.04em;
`

const Hint = styled.p`
  margin: 0.4rem 0 0;
  color: rgba(220, 210, 245, 0.55);
  font-size: 0.78rem;
  line-height: 1.35;
`

const Status = styled.p`
  margin: 0.7rem 0 0;
  color: #80eaff;
  font-size: 0.85rem;
`

const ErrorText = styled.p`
  margin: 0.7rem 0 0;
  color: #ff9cc9;
  font-size: 0.88rem;
`

const Divider = styled.hr`
  margin: 1.1rem 0 0.85rem;
  border: 0;
  border-top: 1px solid rgba(128, 234, 255, 0.16);
`

const TONE = {
  gold: { line: '#ffe27a', glow: 'rgba(255, 226, 122, 0.34)' },
  pink: { line: '#ff6ec7', glow: 'rgba(255, 110, 199, 0.34)' },
  cyan: { line: '#80eaff', glow: 'rgba(128, 234, 255, 0.34)' },
  lilac: { line: '#e8ddff', glow: 'rgba(232, 221, 255, 0.28)' },
}

const DeskGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  margin-top: 0.55rem;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`

const DeskGlow = styled.span`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 20%,
    rgba(255, 255, 255, 0.16) 48%,
    transparent 78%
  );
  transform: translateX(-120%);
  transition: transform 0.55s ease;
  pointer-events: none;
`

const DeskCard = styled.button`
  position: relative;
  overflow: hidden;
  appearance: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.85rem 0.6rem 0.75rem;
  clip-path: polygon(
    0 0.65rem,
    0.65rem 0,
    100% 0,
    100% calc(100% - 0.65rem),
    calc(100% - 0.65rem) 100%,
    0 100%
  );
  border: 1px solid
    ${(p) => (p.$active ? TONE[p.$tone].line : 'rgba(128, 234, 255, 0.2)')};
  background:
    radial-gradient(
      circle at 50% 0%,
      ${(p) => (p.$active ? TONE[p.$tone].glow : 'rgba(255, 255, 255, 0.06)')} 0%,
      transparent 72%
    ),
    rgba(6, 2, 20, 0.72);
  box-shadow: ${(p) =>
    p.$active ? `0 0 26px ${TONE[p.$tone].glow}` : 'none'};
  color: inherit;
  font: inherit;
  cursor: pointer;
  text-align: center;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;

  &:hover:not(:disabled),
  &:focus-visible {
    transform: translateY(-3px);
    border-color: ${(p) => TONE[p.$tone].line};
    box-shadow: 0 0 26px ${(p) => TONE[p.$tone].glow};
    outline: none;
  }

  &:hover:not(:disabled) ${DeskGlow} {
    transform: translateX(120%);
  }

  &:active:not(:disabled) {
    transform: translateY(-1px) scale(0.985);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const DeskIconWrap = styled.span`
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    ${(p) => TONE[p.$tone].glow} 0%,
    transparent 70%
  );

  svg {
    width: 40px;
    height: 40px;
    display: block;
  }
`

const DeskName = styled.span`
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`

const DeskBlurb = styled.span`
  font-size: 0.7rem;
  line-height: 1.3;
  color: rgba(220, 210, 245, 0.66);
`
