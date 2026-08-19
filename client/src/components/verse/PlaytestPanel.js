import React, { useContext, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import locaContext from '../../context/localization/locaContext'
import verseContext from '../../context/verse/verseContext'
import globalContext from '../../context/global/globalContext'
import { setPlaytestPending } from '../../utils/verseDemo'
import { postPlaytest } from '../../utils/hubApi'
import { isGuestWallet } from '../../utils/walletRole'
import { playerPerks } from '../../contracts/itemEcosystem'
import { claimReward, contractsConfigured } from '../../contracts/xsolla'
import { SHOP_GAMES, isVerseSideGame } from '../../contracts/shopCatalog'
import {
  Card,
  CardBody,
  CardTitle,
  Lead,
  Meta,
  Primary,
  Row,
  SubTitle,
  Title,
  VerseSection,
} from './verseUi'

const CATEGORIES = ['gameplay', 'bug', 'controls', 'visuals', 'performance', 'other']
const RATINGS = [1, 2, 3, 4, 5]

const PlaytestPanel = ({ compact, onSubmitted, onEconomyChange, ownedItems, games }) => {
  const { t } = useContext(locaContext)
  const { demo, addPlaytest } = useContext(verseContext)
  const { walletAddress } = useContext(globalContext)
  const isGuest = isGuestWallet(walletAddress)
  const titles = useMemo(() => {
    const seen = new Set()
    const list = []
    const push = (g) => {
      if (!g || !g.name || seen.has(g.name)) return
      seen.add(g.name)
      list.push(g)
    }
    ;(games || []).forEach(push)
    SHOP_GAMES.forEach(push)
    const partners = list.filter((g) => !isVerseSideGame(g))
    const side = list.filter((g) => isVerseSideGame(g))
    return [...partners, ...side]
  }, [games])
  const [gameName, setGameName] = useState('')
  const [category, setCategory] = useState('gameplay')
  const [rating, setRating] = useState(3)
  const [details, setDetails] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [sent, setSent] = useState(false)
  const [bountyNote, setBountyNote] = useState('')
  const certified = !!playerPerks(demo, ownedItems).playtest

  useEffect(() => {
    if (!gameName && titles[0]) setGameName(titles[0].name)
  }, [titles, gameName])

  const submit = async (e) => {
    e.preventDefault()
    if (!gameName) return
    const selected = titles.find((g) => g.name === gameName)
    const entry = {
      category,
      rating,
      details: details.trim(),
      suggestion: suggestion.trim(),
      certified,
      game: gameName,
      gameId: selected && selected.gameId,
      studio: selected && selected.studio,
      tester: walletAddress || '',
    }
    try {
      const saved = await postPlaytest(entry)
      addPlaytest({ ...entry, ...saved })
    } catch (err) {
      addPlaytest(entry)
    }
    setPlaytestPending(false)
    setSent(true)
    if (certified && !isGuest && contractsConfigured()) {
      try {
        await claimReward('1')
        setBountyNote(t('playtest.bountyPaid'))
        if (onEconomyChange) await onEconomyChange()
      } catch (err) {
        setBountyNote(t('playtest.bountySkip'))
      }
    }
    if (onSubmitted) onSubmitted()
  }

  return (
    <VerseSection>
      <Title>{t('playtest.title')}</Title>
      <Lead>{t('playtest.lead')}</Lead>
      {certified && <Meta>{t('playtest.certified')}</Meta>}
      {isGuest && <Meta>{t('guest.bounty')}</Meta>}
      <form onSubmit={submit}>
        <Meta style={{ marginBottom: '0.35rem' }}>{t('playtest.pickGame')}</Meta>
        <GameSelect
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          aria-label={t('playtest.pickGame')}
        >
          <option value="">{t('studio.pickGame')}</option>
          {titles.map((g) => (
            <option key={g.id || g.name} value={g.name}>
              {g.name}
            </option>
          ))}
        </GameSelect>
        <FieldLabel>{t('playtest.category')}</FieldLabel>
        <CategoryGrid>
          {CATEGORIES.map((id) => (
            <Choice
              key={id}
              type="button"
              $active={category === id}
              onClick={() => setCategory(id)}
            >
              {t(`playtest.${id}`)}
            </Choice>
          ))}
        </CategoryGrid>
        <FieldLabel>{t('playtest.rating')}</FieldLabel>
        <RatingRow aria-label={t('playtest.rating')}>
          {RATINGS.map((value) => (
            <Rating
              key={value}
              type="button"
              $active={rating === value}
              onClick={() => setRating(value)}
              aria-label={`${value} / 5`}
            >
              {value}
            </Rating>
          ))}
          <RatingHint>{t('playtest.ratingHint')}</RatingHint>
        </RatingRow>
        <FieldLabel htmlFor="playtest-details">{t('playtest.details')}</FieldLabel>
        <TextArea
          id="playtest-details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder={t('playtest.detailsHint')}
          maxLength={600}
          required
        />
        <FieldLabel htmlFor="playtest-suggestion">{t('playtest.suggestion')}</FieldLabel>
        <TextArea
          id="playtest-suggestion"
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          placeholder={t('playtest.suggestionHint')}
          maxLength={400}
          $short
        />
        <Row>
          <Primary type="submit" disabled={!gameName || !details.trim()}>
            {t('playtest.submit')}
          </Primary>
        </Row>
      </form>
      {sent && (
        <Meta style={{ marginTop: '0.75rem' }}>
          {t('playtest.thanks')}
          {bountyNote ? ` ${bountyNote}` : ''}
        </Meta>
      )}

      {!compact && (
        <>
          <SubTitle>{t('playtest.dashboard')}</SubTitle>
          {(demo.playtests || []).length === 0 ? (
            <Meta>—</Meta>
          ) : (
            (demo.playtests || []).map((row, i) => (
              <Card key={row.at || i} style={{ marginBottom: '0.5rem' }}>
                <CardBody>
                  <CardTitle>
                    {row.game ? `${row.game} · ` : ''}
                    {new Date(row.at).toLocaleString()}
                  </CardTitle>
                  <Meta>
                    {row.category ? t(`playtest.${row.category}`) : t('playtest.gameplay')}
                    {' · '}
                    {row.rating || '—'}/5
                  </Meta>
                  {row.details ? <Meta>{row.details}</Meta> : null}
                </CardBody>
              </Card>
            ))
          )}
        </>
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
  min-width: 12rem;
`

const FieldLabel = styled.label`
  display: block;
  margin: 0.9rem 0 0.4rem;
  color: var(--muted);
  font-size: 0.8rem;
  line-height: 1.4;
`

const CategoryGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`

const Choice = styled.button`
  appearance: none;
  padding: 0.45rem 0.65rem;
  border: 1px solid
    ${(p) => (p.$active ? 'rgba(128,234,255,0.9)' : 'rgba(128,234,255,0.25)')};
  background: ${(p) =>
    p.$active ? 'rgba(128,234,255,0.15)' : 'rgba(8,4,24,0.35)'};
  color: inherit;
  font: inherit;
  font-size: 0.78rem;
  cursor: pointer;
`

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`

const Rating = styled.button`
  appearance: none;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  border: 1px solid
    ${(p) => (p.$active ? 'rgba(255,110,199,0.9)' : 'rgba(128,234,255,0.25)')};
  background: ${(p) =>
    p.$active ? 'rgba(255,110,199,0.2)' : 'rgba(8,4,24,0.35)'};
  color: inherit;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
`

const RatingHint = styled.span`
  margin-left: 0.35rem;
  color: var(--muted);
  font-size: 0.72rem;
`

const TextArea = styled.textarea`
  box-sizing: border-box;
  width: 100%;
  min-height: ${(p) => (p.$short ? '4.5rem' : '7rem')};
  resize: vertical;
  padding: 0.65rem 0.75rem;
  border: 1px solid rgba(128, 234, 255, 0.28);
  background: rgba(8, 4, 24, 0.6);
  color: #fff;
  font: inherit;
  line-height: 1.45;

  &:focus {
    outline: none;
    border-color: rgba(128, 234, 255, 0.85);
  }
`

export default PlaytestPanel
