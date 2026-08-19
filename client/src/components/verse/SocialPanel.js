import React, { useContext, useEffect, useState } from 'react'
import locaContext from '../../context/localization/locaContext'
import globalContext from '../../context/global/globalContext'
import socketContext from '../../context/websocket/socketContext'
import { CS_LOBBY_CHAT, CS_LOBBY_CONNECT, SC_LOBBY_CHAT } from '../../game/actions'
import {
  Card,
  CardBody,
  CardTitle,
  Ghost,
  Grid,
  Input,
  Lead,
  Meta,
  Primary,
  Row,
  SubTitle,
  Title,
  VerseSection,
} from './verseUi'

const SocialPanel = ({ tables, onSpectate }) => {
  const { t } = useContext(locaContext)
  const { players, userName, walletAddress } = useContext(globalContext)
  const { socket } = useContext(socketContext)
  const [text, setText] = useState('')
  const [messages, setMessages] = useState([])
  const list = Array.isArray(players)
    ? players
    : players
      ? Object.values(players)
      : []
  const openTables = (tables || []).filter(
    (tb) => (tb.currentNumberPlayers || 0) > 0,
  )

  useEffect(() => {
    if (!socket) return undefined
    socket.emit(CS_LOBBY_CONNECT, {
      gameId: 'local',
      address: walletAddress,
      userInfo: { name: userName },
    })
    const onChat = ({ text: msg, userInfo }) => {
      setMessages((prev) =>
        [...prev, { text: msg, name: (userInfo && userInfo.name) || 'Player' }].slice(
          -40,
        ),
      )
    }
    socket.on(SC_LOBBY_CHAT, onChat)
    return () => socket.off(SC_LOBBY_CHAT, onChat)
  }, [socket, walletAddress, userName])

  const send = (e) => {
    e.preventDefault()
    if (!socket || !text.trim()) return
    socket.emit(CS_LOBBY_CHAT, {
      gameId: 'local',
      text: text.trim(),
      userInfo: { name: userName || 'Player' },
    })
    setText('')
  }

  return (
    <VerseSection>
      <Title>{t('social.title')}</Title>
      <Lead>
        {t('social.online')}: {list.length}
      </Lead>

      <SubTitle>{t('social.online')}</SubTitle>
      {list.length === 0 ? (
        <Meta>{t('social.empty')}</Meta>
      ) : (
        <Grid>
          {list.map((p) => (
            <Card key={p.socketId || p.id}>
              <CardBody>
                <CardTitle>{p.name || p.username || 'Player'}</CardTitle>
                <Meta>
                  {(p.id || '').toString().slice(0, 10)}
                  {(p.id || '').length > 10 ? '…' : ''}
                </Meta>
              </CardBody>
            </Card>
          ))}
        </Grid>
      )}

      <SubTitle>{t('social.tables')}</SubTitle>
      {openTables.length === 0 ? (
        <Meta>—</Meta>
      ) : (
        <Grid>
          {openTables.map((tb) => (
            <Card key={tb.id}>
              <CardBody>
                <CardTitle>{tb.name}</CardTitle>
                <Meta>
                  {tb.currentNumberPlayers}/{tb.maxPlayers}
                </Meta>
                <Ghost
                  type="button"
                  style={{ marginTop: '0.55rem' }}
                  onClick={() => onSpectate(tb.id)}
                >
                  {t('social.spectate')}
                </Ghost>
              </CardBody>
            </Card>
          ))}
        </Grid>
      )}

      <SubTitle>{t('social.chat')}</SubTitle>
      <div
        style={{
          minHeight: 120,
          maxHeight: 220,
          overflow: 'auto',
          border: '1px solid rgba(128,234,255,0.2)',
          padding: '0.75rem',
          marginBottom: '0.65rem',
          background: 'rgba(8,4,24,0.4)',
        }}
      >
        {messages.length === 0 ? (
          <Meta>{t('social.placeholder')}</Meta>
        ) : (
          messages.map((m, i) => (
            <p key={i} style={{ margin: '0 0 0.45rem' }}>
              <strong>{m.name}:</strong> {m.text}
            </p>
          ))
        )}
      </div>
      <form onSubmit={send}>
        <Row>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('social.placeholder')}
            aria-label={t('social.chat')}
          />
          <Primary type="submit">{t('social.send')}</Primary>
        </Row>
      </form>
    </VerseSection>
  )
}

export default SocialPanel
