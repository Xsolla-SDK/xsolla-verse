import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import locaContext from '../../context/localization/locaContext'
import verseContext from '../../context/verse/verseContext'
import {
  ACADEMY_LINKS,
  ACADEMY_SERVICES,
  ACADEMY_STATS,
  ACADEMY_TRACKS,
} from '../../contracts/academyCatalog'
import StakeTierCells from '../verse/StakeTierCells'
import {
  CardBody,
  CardBtn,
  CardTitle,
  Cover,
  Ghost,
  Grid,
  Lead,
  Meta,
  Primary,
  Row,
  Stamp,
  SubTitle,
  Title,
  VerseSection,
} from '../verse/verseUi'

const AcademyPanel = ({ onHub, onPlaytest, onProfile }) => {
  const { t } = useContext(locaContext)
  const { demo, markQuest } = useContext(verseContext)
  const [trackId, setTrackId] = useState(null)
  const quests = demo.quests || {}
  const doneCount = ACADEMY_TRACKS.filter((track) => quests[track.quest]).length
  const firstOpen =
    ACADEMY_TRACKS.find((track) => !quests[track.quest]) || ACADEMY_TRACKS[0]
  const track = ACADEMY_TRACKS.find((item) => item.id === trackId)

  const completeTrack = (item) => {
    markQuest(item.quest)
    markQuest('academy')
  }

  const jump = (item) => {
    if (item.jump === 'hub' && onHub) onHub()
    if (item.jump === 'profile' && onProfile) onProfile()
    if (item.jump === 'playtest' && onPlaytest) onPlaytest()
    if (item.jump === 'contact') {
      window.open(ACADEMY_LINKS.contact, '_blank', 'noopener,noreferrer')
    }
  }

  if (track) {
    const done = !!quests[track.quest]
    const steps = Array.from({ length: track.steps }, (_, i) => i + 1)
    return (
      <VerseSection>
        <Ghost type="button" onClick={() => setTrackId(null)}>
          ← {t('academy.tracks')}
        </Ghost>
        <Cover style={{ aspectRatio: '21 / 9', margin: '0.85rem 0 1rem' }}>
          <img src={track.image} alt="" />
        </Cover>
        <Title>{t(`academy.${track.id}.title`)}</Title>
        <Lead>{t(`academy.${track.id}.blurb`)}</Lead>
        {done && <Stamp>{t('academy.completed')}</Stamp>}

        <StepRail>
          {steps.map((n) => (
            <Step key={n}>
              <StepNum>{String(n).padStart(2, '0')}</StepNum>
              <CardTitle>{t(`academy.${track.id}.s${n}t`)}</CardTitle>
              <Meta>{t(`academy.${track.id}.s${n}b`)}</Meta>
            </Step>
          ))}
        </StepRail>

        {track.id === 'economy' && <StakeTierCells />}

        <CheckNote>{t(`academy.${track.id}.check`)}</CheckNote>

        {track.id === 'studio' && (
          <>
            <SubTitle>{t('academy.studio.stats')}</SubTitle>
            <StatRow>
              {ACADEMY_STATS.map((stat) => (
                <Stat key={stat.id}>
                  <StatNum>{stat.num}</StatNum>
                  <Meta>{t(`academy.stat.${stat.id}`)}</Meta>
                </Stat>
              ))}
            </StatRow>
            <SubTitle>{t('academy.studio.services')}</SubTitle>
            <Grid>
              {ACADEMY_SERVICES.map((svc) => (
                <ServiceCard
                  key={svc.id}
                  href={svc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CardTitle>{t(`academy.svc.${svc.id}`)}</CardTitle>
                  <Meta>{t(`academy.svc.${svc.id}d`)}</Meta>
                  <Stamp>{t('academy.learnMore')}</Stamp>
                </ServiceCard>
              ))}
            </Grid>
          </>
        )}

        <Row>
          {done ? (
            <Primary type="button" onClick={() => jump(track)}>
              {t(`academy.jump.${track.jump}`)}
            </Primary>
          ) : (
            <>
              <Primary type="button" onClick={() => completeTrack(track)}>
                {t('academy.complete')}
              </Primary>
              <Ghost type="button" onClick={() => jump(track)}>
                {t(`academy.jump.${track.jump}`)}
              </Ghost>
            </>
          )}
        </Row>
      </VerseSection>
    )
  }

  return (
    <VerseSection>
      <Title>{t('academy.title')}</Title>
      <Lead>{t('academy.lead')}</Lead>
      <Meta>
        {doneCount}/{ACADEMY_TRACKS.length} {t('academy.progress')}
      </Meta>
      <Row>
        <Primary type="button" onClick={() => setTrackId(firstOpen.id)}>
          {t('academy.start')}
        </Primary>
        <GhostLink href={ACADEMY_LINKS.contact} target="_blank" rel="noopener noreferrer">
          {t('academy.meeting')}
        </GhostLink>
      </Row>

      <SubTitle>{t('academy.tracks')}</SubTitle>
      <Grid>
        {ACADEMY_TRACKS.map((item) => {
          const done = !!quests[item.quest]
          return (
            <CardBtn key={item.id} type="button" onClick={() => setTrackId(item.id)}>
              <Cover>
                <img src={item.image} alt="" />
              </Cover>
              <CardBody>
                <CardTitle>{t(`academy.${item.id}.title`)}</CardTitle>
                <Meta>{t(`academy.${item.id}.blurb`)}</Meta>
                <Stamp>{done ? t('academy.completed') : t('academy.lesson')}</Stamp>
              </CardBody>
            </CardBtn>
          )
        })}
      </Grid>
    </VerseSection>
  )
}

const StepRail = styled.ol`
  list-style: none;
  margin: 0.85rem 0 0;
  padding: 0 0 0.35rem;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(200px, 1fr);
  gap: 0.75rem;
  overflow-x: auto;
`

const Step = styled.li`
  min-width: 200px;
  padding: 0.85rem 0.9rem;
  border: 1px solid rgba(128, 234, 255, 0.22);
  background: rgba(8, 4, 24, 0.45);
`

const StepNum = styled.div`
  margin-bottom: 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--pink);
`

const CheckNote = styled.p`
  margin: 1rem 0 0;
  padding: 0.75rem 0.9rem;
  border-left: 2px solid var(--cyan);
  background: rgba(128, 234, 255, 0.06);
  color: var(--muted);
  font-size: 0.88rem;
  line-height: 1.45;
`

const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
  margin: 0.35rem 0 0.5rem;

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const Stat = styled.div`
  padding: 0.75rem 0.85rem;
  border: 1px solid rgba(128, 234, 255, 0.22);
  background: rgba(8, 4, 24, 0.4);
`

const StatNum = styled.div`
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
`

const ServiceCard = styled.a`
  display: block;
  padding: 0.85rem 0.9rem 1rem;
  border: 1px solid rgba(128, 234, 255, 0.22);
  background: rgba(8, 4, 24, 0.45);
  text-decoration: none !important;
  color: inherit !important;

  &:hover {
    border-color: rgba(255, 110, 199, 0.55);
  }
`

const GhostLink = styled.a`
  appearance: none;
  display: inline-flex;
  align-items: center;
  font: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  border: 1px solid rgba(128, 234, 255, 0.35);
  background: rgba(8, 4, 24, 0.45);
  color: inherit !important;
  text-decoration: none !important;
`

export default AcademyPanel
