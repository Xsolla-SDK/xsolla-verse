import React, { useState, useEffect, useContext } from 'react'
import SocketContext from './socketContext'
import { io } from 'socket.io-client'
import {
  CS_DISCONNECT,
  SC_PLAYERS_UPDATED,
  SC_RECEIVE_LOBBY_INFO,
  SC_TABLES_UPDATED,
  SC_FEE_POOL,
} from '../../game/actions'
import globalContext from '../global/globalContext'
import config from '../../clientConfig'

const WebSocketProvider = ({ children }) => {
  const { setTables, setPlayers, setChipsAmount, setFeePool } = useContext(globalContext)

  const [socket, setSocket] = useState(null)
  const [socketId, setSocketId] = useState(null)

  useEffect(() => {
    const next = io(config.socketURI, {
      transports: ['websocket'],
      upgrade: false,
    })

    const onConnect = () => {
      window.socket = next
      setSocket(next)
    }

    const onLobbyInfo = ({ tables, players, socketId: id, amount, feePool }) => {
      setSocketId(id)
      if (amount != null) setChipsAmount(amount)
      setTables(tables)
      setPlayers(players)
      if (feePool && setFeePool) setFeePool(feePool)
    }

    const onPlayersUpdated = (players) => setPlayers(players)
    const onTablesUpdated = (tables) => setTables(tables)
    const onFeePool = (pool) => setFeePool && setFeePool(pool)

    const onUnload = () => {
      try {
        next.emit(CS_DISCONNECT)
        next.close()
      } catch (e) {
        // ignore
      }
    }

    next.on('connect', onConnect)
    next.on(SC_RECEIVE_LOBBY_INFO, onLobbyInfo)
    next.on(SC_PLAYERS_UPDATED, onPlayersUpdated)
    next.on(SC_TABLES_UPDATED, onTablesUpdated)
    next.on(SC_FEE_POOL, onFeePool)
    window.addEventListener('beforeunload', onUnload)

    return () => {
      window.removeEventListener('beforeunload', onUnload)
      next.off('connect', onConnect)
      next.off(SC_RECEIVE_LOBBY_INFO, onLobbyInfo)
      next.off(SC_PLAYERS_UPDATED, onPlayersUpdated)
      next.off(SC_TABLES_UPDATED, onTablesUpdated)
      next.off(SC_FEE_POOL, onFeePool)
      try {
        next.emit(CS_DISCONNECT)
        next.close()
      } catch (e) {
        // ignore
      }
      if (window.socket === next) window.socket = null
      setSocket(null)
      setSocketId(null)
    }
    // eslint-disable-next-line
  }, [])

  function cleanUp() {
    if (!socket && !window.socket) return
    const s = socket || window.socket
    try {
      s.emit(CS_DISCONNECT)
      s.close()
    } catch (e) {
      // ignore
    }
    window.socket = null
    setSocket(null)
    setSocketId(null)
    setPlayers(null)
    setTables(null)
  }

  return (
    <SocketContext.Provider value={{ socket, socketId, cleanUp }}>
      {children}
    </SocketContext.Provider>
  )
}

export default WebSocketProvider
