import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import locaContext from '../../context/localization/locaContext'
import {
  fetchStudioRoster,
  setStudioAllowed,
} from '../../contracts/xsolla'
import {
  Card,
  CardBody,
  CardTitle,
  Input,
  Lead,
  Meta,
  Primary,
  Ghost,
  Row,
  Title,
  VerseSection,
} from './verseUi'
import { showVerseAlert } from '../../utils/verseAlert'

const OperatorPanel = () => {
  const { t } = useContext(locaContext)
  const [studio, setStudio] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [roster, setRoster] = useState([])

  const loadRoster = async () => {
    setLoading(true)
    try {
      setRoster(await fetchStudioRoster())
    } catch (err) {
      setRoster([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoster()
    // eslint-disable-next-line
  }, [])

  const run = async (address, allowed) => {
    if (!address.trim()) return
    setBusy(true)
    try {
      await setStudioAllowed(address.trim(), allowed)
      showVerseAlert(
        t('operator.title'),
        allowed ? t('operator.saved') : t('operator.revoked'),
        'success',
      )
      setStudio('')
      await loadRoster()
    } catch (err) {
      showVerseAlert(t('operator.title'), err.message || t('operator.fail'), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <VerseSection>
      <Title>{t('operator.title')}</Title>
      <Lead>{t('operator.lead')}</Lead>
      <SectionHeading>
        {t('operator.studios')} · {roster.length}
      </SectionHeading>
      {loading ? (
        <Meta>{t('operator.loading')}</Meta>
      ) : roster.length === 0 ? (
        <Meta>{t('operator.empty')}</Meta>
      ) : (
        <Roster>
          {roster.map((row) => (
            <Card key={row.address}>
              <CardBody>
                <StudioHead>
                  <div>
                    <CardTitle>{row.label || t('operator.unnamed')}</CardTitle>
                    <Wallet>{row.address}</Wallet>
                  </div>
                  <Status $allowed={row.allowed}>
                    {row.allowed ? t('operator.allowed') : t('operator.revokedStatus')}
                  </Status>
                </StudioHead>
                <Meta>
                  {row.games.length
                    ? `${t('operator.titles')}: ${row.games.join(' · ')}`
                    : t('operator.noTitles')}
                </Meta>
                <Actions>
                  {row.allowed ? (
                    <Ghost
                      type="button"
                      disabled={busy}
                      onClick={() => run(row.address, false)}
                    >
                      {t('operator.revoke')}
                    </Ghost>
                  ) : (
                    <Primary
                      type="button"
                      disabled={busy}
                      onClick={() => run(row.address, true)}
                    >
                      {t('operator.allow')}
                    </Primary>
                  )}
                </Actions>
              </CardBody>
            </Card>
          ))}
        </Roster>
      )}
      <SectionHeading>{t('operator.add')}</SectionHeading>
      <Row>
        <Input
          value={studio}
          onChange={(e) => setStudio(e.target.value)}
          placeholder={t('operator.wallet')}
          aria-label={t('operator.wallet')}
        />
      </Row>
      <div style={{ height: '0.55rem' }} />
      <Row>
        <Primary
          type="button"
          disabled={busy || !studio.trim()}
          onClick={() => run(studio, true)}
        >
          {t('operator.allow')}
        </Primary>
      </Row>
      <Meta style={{ marginTop: '0.85rem' }}>{t('operator.hint')}</Meta>
    </VerseSection>
  )
}

const SectionHeading = styled.h3`
  margin: 1.25rem 0 0.65rem;
  font-size: 0.82rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`

const Roster = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.7rem;
`

const StudioHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
`

const Wallet = styled.div`
  margin-top: 0.25rem;
  color: var(--muted);
  font-family: monospace;
  font-size: 0.68rem;
  overflow-wrap: anywhere;
`

const Status = styled.span`
  flex: 0 0 auto;
  padding: 0.2rem 0.4rem;
  border: 1px solid
    ${(p) =>
      p.$allowed ? 'rgba(128,234,255,0.5)' : 'rgba(255,110,199,0.45)'};
  color: ${(p) => (p.$allowed ? 'var(--cyan)' : '#ff9cc9')};
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 0.75rem;
`

export default OperatorPanel
