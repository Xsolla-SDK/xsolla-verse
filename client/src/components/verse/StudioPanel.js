import React, { useContext, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import locaContext from '../../context/localization/locaContext'
import globalContext from '../../context/global/globalContext'
import verseContext from '../../context/verse/verseContext'
import { fetchStudioDesk, listStudioItem, registerStudioGame } from '../../contracts/xsolla'
import { splitLabel } from '../../contracts/itemEcosystem'
import { fetchGrants, fetchPlaytests } from '../../utils/hubApi'
import {
  Card,
  CardBody,
  CardTitle,
  Ghost,
  Input,
  Lead,
  Meta,
  Primary,
  Row,
  Stamp,
  SubTitle,
  Title,
  VerseSection,
} from './verseUi'
import { showVerseAlert } from '../../utils/verseAlert'

const KINDS = ['pack', 'cosmetic', 'pass', 'utility']

const shortAddr = (addr) =>
  addr && addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr || '—'

const StudioPanel = ({ onListed }) => {
  const { t } = useContext(locaContext)
  const { walletAddress } = useContext(globalContext)
  const { demo } = useContext(verseContext)
  const [gameName, setGameName] = useState('')
  const [gameBlurb, setGameBlurb] = useState('')
  const [gameCover, setGameCover] = useState('')
  const [gamePlayUrl, setGamePlayUrl] = useState('')
  const [gamePlatforms, setGamePlatforms] = useState('')
  const [gameId, setGameId] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('12')
  const [kind, setKind] = useState('pack')
  const [split, setSplit] = useState('80')
  const [uri, setUri] = useState('')
  const [busy, setBusy] = useState(false)
  const [desk, setDesk] = useState({
    listings: [],
    sales: [],
    shopXsolla: 0,
    marketXsolla: 0,
    games: [],
  })
  const [inbox, setInbox] = useState([])
  const [grants, setGrants] = useState([])
  const studioBps = useMemo(
    () => Math.min(8000, Math.round((Number(split) || 0) * 100)),
    [split],
  )

  const loadDesk = async () => {
    try {
      const next = await fetchStudioDesk(walletAddress)
      setDesk(next)
      setGameId((prev) => {
        if (prev && next.games.some((g) => String(g.gameId) === String(prev))) {
          return prev
        }
        return next.games[0] ? String(next.games[0].gameId) : ''
      })
      const gameNames = (next.games || []).map((g) => g.name).filter(Boolean)
      try {
        const [pts, gts] = await Promise.all([
          fetchPlaytests({ studio: walletAddress, games: gameNames }),
          fetchGrants({ studio: walletAddress, games: gameNames }),
        ])
        setInbox(pts)
        setGrants(gts)
      } catch (hubErr) {
        setInbox([])
        setGrants([])
      }
    } catch (e) {
      setDesk({ listings: [], sales: [], shopXsolla: 0, marketXsolla: 0, games: [] })
    }
  }

  useEffect(() => {
    loadDesk()
    // eslint-disable-next-line
  }, [walletAddress])

  const onRegisterGame = async (e) => {
    e.preventDefault()
    if (!gameName.trim()) return
    setBusy(true)
    try {
      await registerStudioGame({
        name: gameName.trim(),
        blurb: gameBlurb.trim(),
        coverURI: gameCover.trim(),
        playUrl: gamePlayUrl.trim(),
        platforms: gamePlatforms.trim(),
      })
      showVerseAlert(t('studio.title'), t('studio.gameListed'), 'success')
      setGameName('')
      setGameBlurb('')
      setGameCover('')
      setGamePlayUrl('')
      setGamePlatforms('')
      await loadDesk()
      if (onListed) onListed()
    } catch (err) {
      showVerseAlert(t('studio.title'), err.message || t('studio.gameFail'), 'error')
    } finally {
      setBusy(false)
    }
  }

  const onList = async (e) => {
    e.preventDefault()
    if (!name.trim() || !gameId) return
    setBusy(true)
    try {
      const selected = (desk.games || []).find(
        (g) => String(g.gameId) === String(gameId),
      )
      await listStudioItem({
        priceXsolla: price,
        name: name.trim(),
        uri: uri.trim(),
        gameId: Number(gameId),
        game: selected && selected.name,
        kind,
        studioBps,
      })
      showVerseAlert(t('studio.title'), t('studio.listed'), 'success')
      setName('')
      await loadDesk()
      if (onListed) onListed()
    } catch (err) {
      showVerseAlert(t('studio.title'), err.message || t('studio.fail'), 'error')
    } finally {
      setBusy(false)
    }
  }

  const earned = Number(desk.shopXsolla || 0) + Number(desk.marketXsolla || 0)
  const studioNames = new Set((desk.games || []).map((g) => g.name))
  const localPlaytests = (demo.playtests || []).filter(
    (row) => row.game && studioNames.has(row.game),
  )
  const studioPlaytests = inbox.length ? inbox : localPlaytests

  return (
    <VerseSection>
      <Title>{t('studio.title')}</Title>
      <Lead>{t('studio.lead')}</Lead>
      <Meta>
        {t('studio.split')}: {studioBps / 100}% · {t('studio.verseShare')}:{' '}
        {(10000 - studioBps) / 100}%
      </Meta>
      <form onSubmit={onRegisterGame}>
        <SubTitle>{t('studio.registerGame')}</SubTitle>
        <Row>
          <Input
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder={t('studio.game')}
            aria-label={t('studio.game')}
          />
          <Input
            value={gameBlurb}
            onChange={(e) => setGameBlurb(e.target.value)}
            placeholder={t('studio.blurb')}
            aria-label={t('studio.blurb')}
          />
        </Row>
        <div style={{ height: '0.55rem' }} />
        <Row>
          <Input
            value={gameCover}
            onChange={(e) => setGameCover(e.target.value)}
            placeholder={t('studio.cover')}
            aria-label={t('studio.cover')}
          />
          <Input
            value={gamePlayUrl}
            onChange={(e) => setGamePlayUrl(e.target.value)}
            placeholder={t('studio.playUrl')}
            aria-label={t('studio.playUrl')}
          />
        </Row>
        <div style={{ height: '0.55rem' }} />
        <Row>
          <Input
            value={gamePlatforms}
            onChange={(e) => setGamePlatforms(e.target.value)}
            placeholder={t('studio.platforms')}
            aria-label={t('studio.platforms')}
          />
          <Primary type="submit" disabled={busy}>
            {t('studio.registerGame')}
          </Primary>
        </Row>
      </form>
      {(desk.games || []).length > 0 && (
        <>
          <SubTitle>{t('studio.yourGames')}</SubTitle>
          {desk.games.map((g) => (
            <Card key={g.gameId} style={{ marginBottom: '0.5rem' }}>
              <CardBody>
                <CardTitle>{g.name}</CardTitle>
                {g.blurb ? <Meta>{g.blurb}</Meta> : null}
                {g.playUrl ? <Meta>{g.playUrl}</Meta> : null}
              </CardBody>
            </Card>
          ))}
        </>
      )}
      <form onSubmit={onList}>
        <SubTitle>{t('studio.list')}</SubTitle>
        <Row>
          <GameSelect
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            aria-label={t('studio.game')}
          >
            <option value="">{t('studio.pickGame')}</option>
            {(desk.games || []).map((g) => (
              <option key={g.gameId} value={g.gameId}>
                {g.name}
              </option>
            ))}
          </GameSelect>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('studio.name')}
            aria-label={t('studio.name')}
          />
        </Row>
        <div style={{ height: '0.55rem' }} />
        <Row>
          <Input
            type="number"
            min="0.01"
            step="0.1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            aria-label={t('studio.price')}
          />
          <Input
            type="number"
            min="0"
            max="80"
            step="1"
            value={split}
            onChange={(e) => setSplit(e.target.value)}
            aria-label={t('studio.split')}
          />
          <Input
            value={uri}
            onChange={(e) => setUri(e.target.value)}
            placeholder={t('studio.uri')}
            aria-label={t('studio.uri')}
          />
        </Row>
        <Row>
          {KINDS.map((id) => (
            <Ghost
              key={id}
              type="button"
              onClick={() => setKind(id)}
              style={{
                borderColor:
                  kind === id ? 'rgba(128,234,255,0.9)' : undefined,
              }}
            >
              {t(`eco.kind.${id}`)}
            </Ghost>
          ))}
        </Row>
        <Row>
          <Stamp>{kind}</Stamp>
          <Primary type="submit" disabled={busy || !gameId}>
            {t('studio.list')}
          </Primary>
        </Row>
      </form>

      <SubTitle>{t('studio.skus')}</SubTitle>
      {desk.listings.length === 0 ? (
        <Meta>{t('studio.noSkus')}</Meta>
      ) : (
        desk.listings.map((item) => (
          <Card key={item.id} style={{ marginBottom: '0.5rem' }}>
            <CardBody>
              <CardTitle>
                {item.game} · {item.name}
              </CardTitle>
              <Meta>
                {item.priceXsolla} XSOLLA · {splitLabel(item.studioBps)}
                {item.active ? '' : ` · ${t('studio.inactive')}`}
              </Meta>
            </CardBody>
          </Card>
        ))
      )}

      <SubTitle>{t('studio.sales')}</SubTitle>
      <Meta>
        {t('studio.earned')}: {earned.toFixed(4)} XSOLLA · {t('studio.shopSale')}{' '}
        {Number(desk.shopXsolla || 0).toFixed(4)} · {t('studio.marketSale')}{' '}
        {Number(desk.marketXsolla || 0).toFixed(4)}
      </Meta>
      {desk.sales.length === 0 ? (
        <Meta style={{ marginTop: '0.5rem' }}>{t('studio.noSales')}</Meta>
      ) : (
        desk.sales.map((row) => (
          <Card key={row.id} style={{ marginTop: '0.5rem' }}>
            <CardBody>
              <CardTitle>
                {row.game ? `${row.game} · ` : ''}
                {row.name}
              </CardTitle>
              <Meta>
                {row.channel === 'market'
                  ? t('studio.marketSale')
                  : t('studio.shopSale')}{' '}
                · {t('studio.qty')} {row.quantity} · {Number(row.studioPaid).toFixed(4)}{' '}
                XSOLLA
              </Meta>
              <Meta>
                {row.at ? new Date(row.at).toLocaleString() : '—'} ·{' '}
                {t('studio.buyer')} {shortAddr(row.buyer)}
              </Meta>
            </CardBody>
          </Card>
        ))
      )}
      <SubTitle>{t('studio.playtests')}</SubTitle>
      {studioPlaytests.length === 0 ? (
        <Meta>{t('studio.noPlaytests')}</Meta>
      ) : (
        studioPlaytests.map((row, i) => (
          <Card key={row.at || i} style={{ marginTop: '0.5rem' }}>
            <CardBody>
              <CardTitle>
                {row.game}
                {row.category ? ` · ${t(`playtest.${row.category}`)}` : ''}
              </CardTitle>
              <Meta>
                {row.rating ? `${t('playtest.rating')}: ${row.rating}/5` : '—'}
              </Meta>
              {row.details ? <Meta>{row.details}</Meta> : null}
              {row.suggestion ? (
                <Meta>
                  <strong>{t('playtest.suggestion')}:</strong> {row.suggestion}
                </Meta>
              ) : null}
              <Meta>{row.at ? new Date(row.at).toLocaleString() : '—'}</Meta>
              {row.tester ? <Meta>{shortAddr(row.tester)}</Meta> : null}
            </CardBody>
          </Card>
        ))
      )}
      <SubTitle>{t('studio.grants')}</SubTitle>
      {grants.length === 0 ? (
        <Meta>{t('studio.noGrants')}</Meta>
      ) : (
        grants.map((row) => (
          <Card key={row.id || row.at} style={{ marginTop: '0.5rem' }}>
            <CardBody>
              <CardTitle>
                {row.game ? `${row.game} · ` : ''}
                {row.itemName}
              </CardTitle>
              <Meta>{row.note || t('backpack.granted')}</Meta>
              <Meta>
                {row.at ? new Date(row.at).toLocaleString() : '—'} ·{' '}
                {t('studio.buyer')} {shortAddr(row.buyer)}
              </Meta>
            </CardBody>
          </Card>
        ))
      )}
    </VerseSection>
  )
}

const GameSelect = styled.select`
  font: inherit;
  color: #fff;
  background: rgba(8, 4, 24, 0.6);
  border: 1px solid rgba(128, 234, 255, 0.28);
  padding: 0.5rem 0.7rem;
  width: min(100%, 280px);
`

export default StudioPanel
