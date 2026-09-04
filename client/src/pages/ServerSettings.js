import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import xsollaLogo from '../assets/img/xsolla-logo.svg'
import universeBg from '../assets/img/xsolla-universe-landing.webp'
import {
  allowCurrentIp,
  fetchServerSettings,
  setAllowedIps,
} from '../utils/settingsApi'

const ServerSettings = () => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [newIp, setNewIp] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setSettings(await fetchServerSettings())
    } catch (err) {
      setError(
        (err && err.message) ||
          'Failed to load server settings. Is the backend running?',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const updateIps = async (ips) => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      setSettings(await setAllowedIps(ips))
      setSaved(true)
    } catch (err) {
      setError((err && err.message) || 'Failed to update allowed IPs.')
    } finally {
      setSaving(false)
    }
  }

  const addIp = () => {
    if (!settings || !newIp.trim()) return
    const next = [...settings.allowedAdminIps, newIp.trim()]
    setNewIp('')
    updateIps(next)
  }

  const onAllowCurrent = async () => {
    if (!settings || saving) return
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      setSettings(await allowCurrentIp())
      setSaved(true)
    } catch (err) {
      setError((err && err.message) || 'Failed to allow this IP.')
    } finally {
      setSaving(false)
    }
  }

  const removeIp = (ip) => {
    if (!settings) return
    if ((settings.envAllowedIps || []).includes(ip)) return
    updateIps(settings.allowedAdminIps.filter((entry) => entry !== ip))
  }

  const envIps = new Set(settings?.envAllowedIps || [])

  return (
    <Page>
      <UniverseImage aria-hidden="true" />
      <FrostedOverlay aria-hidden="true" />
      <Card>
        <TopRow>
          <Brand to="/">
            <img src={xsollaLogo} alt="Xsolla" />
            <span>
              Xsolla<b>Verse</b>
            </span>
          </Brand>
          <Ghost as={Link} to="/enter">
            Back to sign in
          </Ghost>
        </TopRow>

        <Title>Server settings</Title>
        <Lead>Login IP allowlist</Lead>

        {loading ? (
          <Hint>Loading settings…</Hint>
        ) : (
          <>
            {error ? <ErrorText>{error}</ErrorText> : null}
            {saved ? <SavedText>Settings saved.</SavedText> : null}

            {settings ? (
              <Panel>
                <PanelTitle>Your IP address</PanelTitle>
                <IpRow>
                  <Code>{settings.currentIp || 'unknown'}</Code>
                  <Status $ok={settings.ipAllowed}>
                    <Dot $ok={settings.ipAllowed} />
                    {settings.ipAllowed
                      ? 'Allowed to sign in'
                      : 'Not allowed to sign in'}
                  </Status>
                  {!settings.ipAllowed ? (
                    <Primary
                      type="button"
                      onClick={onAllowCurrent}
                      disabled={saving}
                    >
                      Allow this IP
                    </Primary>
                  ) : null}
                </IpRow>
                <Hint>
                  Behind a proxy this is the visitor address from{' '}
                  <code>X-Forwarded-For</code>. You can also set{' '}
                  <code>ALLOWED_LOGIN_IPS</code> in the host environment.
                </Hint>
              </Panel>
            ) : null}

            {settings ? (
              <Panel>
                <PanelTitle>Allowed login IPs</PanelTitle>
                <Hint>
                  Only these addresses may sign in. Add them here, or set{' '}
                  <code>ALLOWED_LOGIN_IPS</code> (comma-separated). Env-var
                  addresses cannot be removed from this page.
                </Hint>
                <AddRow>
                  <Input
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addIp()}
                    placeholder="e.g. 203.0.113.10"
                    aria-label="IP address"
                  />
                  <Primary
                    type="button"
                    onClick={addIp}
                    disabled={saving || !newIp.trim()}
                  >
                    Add
                  </Primary>
                </AddRow>
                {settings.allowedAdminIps.length === 0 ? (
                  <Hint>No allowed IPs configured.</Hint>
                ) : (
                  <List>
                    {settings.allowedAdminIps.map((ip) => {
                      const fromEnv = envIps.has(ip)
                      return (
                        <Item key={ip}>
                          <ItemMain>
                            <Code>{ip}</Code>
                            {fromEnv ? <Badge>env</Badge> : null}
                          </ItemMain>
                          <Ghost
                            type="button"
                            onClick={() => removeIp(ip)}
                            disabled={saving || fromEnv}
                            aria-label={
                              fromEnv
                                ? `${ip} comes from ALLOWED_LOGIN_IPS`
                                : `Remove ${ip}`
                            }
                          >
                            Remove
                          </Ghost>
                        </Item>
                      )
                    })}
                  </List>
                )}
              </Panel>
            ) : null}
          </>
        )}
      </Card>
    </Page>
  )
}

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
  place-items: start center;
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
  width: min(640px, 100%);
  margin-top: 1.5rem;
  padding: 1.6rem 1.4rem 1.6rem;
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

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.1rem;
`

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
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

const Panel = styled.div`
  margin-top: 0.85rem;
  padding: 1rem 0.95rem 1.05rem;
  border: 1px solid rgba(128, 234, 255, 0.18);
  background: rgba(255, 255, 255, 0.03);
`

const PanelTitle = styled.h2`
  margin: 0 0 0.65rem;
  font-size: 0.95rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`

const IpRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
`

const Code = styled.code`
  padding: 0.35rem 0.55rem;
  border: 1px solid rgba(128, 234, 255, 0.22);
  background: rgba(8, 4, 24, 0.7);
  font-size: 0.85rem;
`

const Status = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${(p) => (p.$ok ? '#6ee7b7' : '#f87171')};
`

const Dot = styled.span`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: ${(p) => (p.$ok ? '#6ee7b7' : '#f87171')};
`

const Hint = styled.p`
  margin: 0.65rem 0 0;
  color: rgba(220, 210, 245, 0.62);
  font-size: 0.8rem;
  line-height: 1.45;

  code {
    color: #80eaff;
  }
`

const AddRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
`

const Input = styled.input`
  flex: 1;
  min-width: 0;
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
`

const Primary = styled.button`
  appearance: none;
  padding: 0.7rem 0.95rem;
  border: 1px solid rgba(128, 234, 255, 0.7);
  background: linear-gradient(180deg, #1aa890 0%, #0b3d38 100%);
  color: #e8f0ee;
  font: inherit;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;

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
  text-decoration: none;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const List = styled.ul`
  margin: 0.75rem 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.45rem;
`

const Item = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  padding: 0.55rem 0.65rem;
  border: 1px solid rgba(128, 234, 255, 0.14);
  background: rgba(8, 4, 24, 0.45);
`

const ItemMain = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
`

const Badge = styled.span`
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #80eaff;
  border: 1px solid rgba(128, 234, 255, 0.35);
  border-radius: 999px;
  padding: 0.12rem 0.45rem;
`

const ErrorText = styled.p`
  margin: 0 0 0.75rem;
  color: #f87171;
  font-size: 0.88rem;
`

const SavedText = styled.p`
  margin: 0 0 0.75rem;
  color: #6ee7b7;
  font-size: 0.88rem;
`

export default ServerSettings
