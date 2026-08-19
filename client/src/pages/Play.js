import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Container from '../components/layout/Container'
import Button from '../components/buttons/Button'
import gameContext from '../context/game/gameContext'
import socketContext from '../context/websocket/socketContext'
import globalContext from '../context/global/globalContext'
import PokerTable from '../components/game/PokerTable'
import { RotateDevicePrompt } from '../components/game/RotateDevicePrompt'
import { PositionedUISlot } from '../components/game/PositionedUISlot'
import { PokerTableWrapper } from '../components/game/PokerTableWrapper'
import { Seat } from '../components/game/Seat/Seat'
import { InfoPill } from '../components/game/InfoPill'
import { GameUI } from '../components/game/GameUI'
import { GameStateInfo } from '../components/game/GameStateInfo'
import BrandingImage from '../components/game/BrandingImage'
import PokerCard from '../components/game/PokerCard'
import verseContext from '../context/verse/verseContext'
import { playerPerks } from '../contracts/itemEcosystem'
import { STAKE_TIERS } from '../contracts/stakeTiers'
import background from '../assets/img/background.png'
import './Play.scss'

const Play = () => {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const { socket } = useContext(socketContext)
  const { chipsAmount, stakedXsolla } = useContext(globalContext)
  const { demo } = useContext(verseContext)
  const loadout = (demo && demo.loadout) || {}
  const perks = playerPerks(demo)
  const goldStake = Number(stakedXsolla) >= STAKE_TIERS[2].min
  const tableSrc = loadout.tableTheme && loadout.tableTheme.image
  const cardBackSrc = loadout.cardBack && loadout.cardBack.image
  const {
    messages,
    currentTable,
    seatId,
    joinTable,
    leaveTable,
    sitDown,
    standUp,
    fold,
    check,
    call,
    raise,
    fillBots,
  } = useContext(gameContext)

  const [bet, setBet] = useState(0)

  useEffect(() => {
    if (!socket) {
      navigate('/')
      return undefined
    }
    const id = Number(tableId || 1)
    joinTable(id)
    // Do NOT leave on unmount — remount/HMR was standing players up and
    // stalling in-progress bot hands. Explicit Leave button handles exit.
    // eslint-disable-next-line
  }, [socket, tableId])

  useEffect(() => {
    if (!currentTable) return
    const seat = seatId && currentTable.seats[seatId]
    const minRaise = currentTable.minRaise || currentTable.minBet
    const callAmount = currentTable.callAmount || 0
    const floor = Math.max(callAmount, minRaise, currentTable.minBet || 0)
    setBet(floor)
  }, [currentTable, seatId])

  return (
    <>
      <RotateDevicePrompt />
      <Container
        fullHeight
        display="flex"
        flexDirection="column"
        alignItems="stretch"
        justifyContent="flex-start"
        padding="0"
        style={{
          backgroundImage: `url(${background})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
          backgroundColor: 'black',
        }}
        className="play-area"
      >
        {currentTable && (
          <PositionedUISlot top="2vh" left="1.5rem" scale="0.65" style={{ zIndex: '50' }}>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <Button small secondary onClick={leaveTable}>
                Leave
              </Button>
              <Button small secondary onClick={() => fillBots(currentTable.id)}>
                Fill bots
              </Button>
            </div>
          </PositionedUISlot>
        )}
        {(perks.rake || goldStake) && (
          <PositionedUISlot top="2vh" right="1.5rem" scale="0.7" style={{ zIndex: '50' }}>
            <InfoPill>
              Rake Charm / Gold stake · 4.5% pot (cap 3 BB)
            </InfoPill>
          </PositionedUISlot>
        )}
        <PokerTableWrapper>
          <PokerTable src={tableSrc} />
          {currentTable && (
            <>
              {[1, 2, 3, 4, 5].map((n) => {
                const positions = {
                  1: { top: '-5%', left: '0', origin: 'top left' },
                  2: { top: '-5%', right: '2%', origin: 'top right' },
                  3: { bottom: '15%', right: '2%', origin: 'bottom right' },
                  4: { bottom: '8%', origin: 'bottom center' },
                  5: { bottom: '15%', left: '0', origin: 'bottom left' },
                }
                const pos = positions[n]
                return (
                  <PositionedUISlot key={n} {...pos} scale="0.55">
                    <Seat
                      seatNumber={n}
                      currentTable={currentTable}
                      sitDown={sitDown}
                      chipsAmount={chipsAmount}
                    />
                  </PositionedUISlot>
                )
              })}
              <PositionedUISlot top="-25%" scale="0.55" origin="top center" style={{ zIndex: '1' }}>
                <BrandingImage />
              </PositionedUISlot>
              <PositionedUISlot
                width="100%"
                origin="center center"
                scale="0.60"
                style={{
                  display: 'flex',
                  textAlign: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {currentTable.board &&
                  currentTable.board.length > 0 &&
                  currentTable.board.map((card, index) => (
                    <PokerCard
                      key={index}
                      card={card}
                      backSrc={cardBackSrc}
                    />
                  ))}
              </PositionedUISlot>
              <PositionedUISlot top="-5%" scale="0.60" origin="bottom center">
                {messages && messages.length > 0 && (
                  <>
                    <InfoPill>{messages[messages.length - 1]}</InfoPill>
                    {currentTable.winMessages &&
                      currentTable.winMessages.length > 0 && (
                        <InfoPill>
                          {
                            currentTable.winMessages[
                              currentTable.winMessages.length - 1
                            ]
                          }
                        </InfoPill>
                      )}
                  </>
                )}
              </PositionedUISlot>
              <PositionedUISlot top="12%" scale="0.60" origin="center center">
                {(!currentTable.winMessages ||
                  currentTable.winMessages.length === 0) && (
                  <GameStateInfo currentTable={currentTable} />
                )}
              </PositionedUISlot>
              {seatId &&
                currentTable.seats[seatId] &&
                currentTable.seats[seatId].folded &&
                !currentTable.handOver &&
                (!currentTable.seats[seatId].hand ||
                  currentTable.seats[seatId].hand.length === 0) && (
                  <PositionedUISlot top="28%" scale="0.7" origin="center center">
                    <InfoPill>Waiting for next hand…</InfoPill>
                  </PositionedUISlot>
                )}
            </>
          )}
        </PokerTableWrapper>

        {currentTable &&
          seatId &&
          currentTable.seats[seatId] &&
          currentTable.seats[seatId].turn && (
            <GameUI
              currentTable={currentTable}
              seatId={seatId}
              bet={bet}
              setBet={setBet}
              raise={raise}
              standUp={standUp}
              fold={fold}
              check={check}
              call={call}
            />
          )}
      </Container>
    </>
  )
}

export default Play
