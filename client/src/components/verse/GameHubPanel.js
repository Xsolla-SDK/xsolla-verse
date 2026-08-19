import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import locaContext from '../../context/localization/locaContext'
import verseContext from '../../context/verse/verseContext'
import {
  SHOP_GAMES,
  isVerseSideGame,
  openGameUrl,
  parsePlatforms,
  uriToHttp,
} from '../../contracts/shopCatalog'
import { PARTNER_HALLS } from '../../contracts/hubCatalog'
import {
  Card,
  CardBody,
  CardTitle,
  Cover,
  Ghost,
  Grid,
  Lead,
  Meta,
  Primary,
  Row,
  SubTitle,
  Title,
  VerseSection,
} from './verseUi'

const shortStudio = (studio) => {
  if (!studio) return '—'
  if (typeof studio === 'string' && studio.startsWith('0x') && studio.length > 12) {
    return `${studio.slice(0, 6)}…${studio.slice(-4)}`
  }
  return studio
}

const GameHubPanel = ({
  onOpenShop,
  onPlay,
  onPlaytest,
  extraGames,
  showLounge = false,
}) => {
  const { t } = useContext(locaContext)
  const { markQuest } = useContext(verseContext)
  const [studioId, setStudioId] = useState('all')

  const extraByName = Object.fromEntries(
    (extraGames || []).filter((g) => g && g.name).map((g) => [g.name, g]),
  )

  const extras = (extraGames || [])
    .filter((g) => !SHOP_GAMES.some((s) => s.name === g.name))
    .map((g) => ({
      ...g,
      image: uriToHttp(g.coverURI),
      studio: g.studioLabel || g.studio,
      platforms: parsePlatforms(g.platforms),
      playUrl: g.playUrl || '',
      summary: g.blurb || '',
      services: [],
    }))

  const catalog = [
    ...SHOP_GAMES.map((g) => {
      const extra = extraByName[g.name] || {}
      return {
        ...g,
        playUrl: extra.playUrl || g.playUrl,
        platforms: parsePlatforms(extra.platforms || g.platforms),
        summary: extra.blurb || g.summary || g.blurb,
        image: uriToHttp(extra.coverURI) || g.image,
      }
    }),
    ...extras,
  ]

  const titles = catalog.filter((g) => !isVerseSideGame(g))
  const lounge = catalog.filter((g) => g.playable)
  const studios = PARTNER_HALLS.filter((p) =>
    titles.some((g) => g.partner === p.id),
  )

  const shelf =
    studioId === 'all'
      ? titles
      : titles.filter((g) => g.partner === studioId)

  const openGame = (game) => {
    markQuest('play')
    openGameUrl(game.playUrl)
  }

  return (
    <VerseSection>
      <Title>{t('hub.title')}</Title>
      <Lead>{t('hub.lead')}</Lead>

      <SubTitle>
        {t('hub.titles')} · {shelf.length}
      </SubTitle>
      <Row>
        <FilterChip
          type="button"
          $on={studioId === 'all'}
          onClick={() => setStudioId('all')}
        >
          {t('hub.filterAll')}
        </FilterChip>
        {studios.map((p) => (
          <FilterChip
            key={p.id}
            type="button"
            $on={studioId === p.id}
            onClick={() => setStudioId(p.id)}
            title={p.blurb}
          >
            {p.name}
          </FilterChip>
        ))}
      </Row>

      {shelf.length === 0 ? (
        <Meta style={{ marginTop: '0.85rem' }}>{t('hub.empty')}</Meta>
      ) : (
        <Grid style={{ marginTop: '0.85rem' }}>
          {shelf.map((game) => (
            <Card key={game.id}>
              <Cover>
                {game.image ? <img src={game.image} alt="" /> : null}
              </Cover>
              <CardBody>
                <CardTitle>{game.name}</CardTitle>
                <Meta>
                  {shortStudio(game.studio)}
                  {parsePlatforms(game.platforms).length > 0
                    ? ` · ${parsePlatforms(game.platforms).join(' · ')}`
                    : ''}
                </Meta>
                <Meta>{game.summary || game.blurb}</Meta>
                {(game.services || []).length > 0 && (
                  <Meta>
                    {t('hub.gsOnTitle')}: {(game.services || []).join(' · ')}
                  </Meta>
                )}
                <Row>
                  {game.playUrl ? (
                    <Primary type="button" onClick={() => openGame(game)}>
                      {t('hub.openGame')}
                    </Primary>
                  ) : null}
                  <Ghost type="button" onClick={() => onOpenShop(game.name)}>
                    {t('hub.packs')}
                  </Ghost>
                  {onPlaytest ? (
                    <Ghost type="button" onClick={onPlaytest}>
                      {t('hub.playtest')}
                    </Ghost>
                  ) : null}
                </Row>
              </CardBody>
            </Card>
          ))}
        </Grid>
      )}

      {showLounge && onPlay && lounge.length > 0 && (
        <>
          <SubTitle>{t('hub.lounge')}</SubTitle>
          <Lead>{t('hub.loungeLead')}</Lead>
          <Row>
            {lounge.map((game) => (
              <Ghost
                key={game.id}
                type="button"
                onClick={() => onPlay(game.playable)}
              >
                {game.name}
              </Ghost>
            ))}
          </Row>
        </>
      )}
    </VerseSection>
  )
}

const FilterChip = styled.button`
  appearance: none;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.4rem 0.7rem;
  cursor: pointer;
  border: 1px solid
    ${(p) =>
      p.$on ? 'rgba(128, 234, 255, 0.9)' : 'rgba(128, 234, 255, 0.28)'};
  background: ${(p) =>
    p.$on ? 'rgba(128, 234, 255, 0.12)' : 'rgba(8, 4, 24, 0.45)'};
  color: inherit;
`

export default GameHubPanel
