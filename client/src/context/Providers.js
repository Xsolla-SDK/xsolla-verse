import React from 'react'
import GlobalState from './global/GlobalState'
import { ThemeProvider } from 'styled-components'
import ModalProvider from './modal/ModalProvider'
import theme from '../styles/theme'
import Normalize from '../styles/Normalize'
import GlobalStyles from '../styles/Global'
import { BrowserRouter } from 'react-router-dom'
import WebSocketProvider from './websocket/WebsocketProvider'
import GameState from './game/GameState'
import LocaProvider from './localization/LocaProvider'
import VerseProvider from './verse/VerseProvider'

const Providers = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <LocaProvider>
        <GlobalState>
          <VerseProvider>
            <ModalProvider>
              <WebSocketProvider>
                <GameState>
                  <Normalize />
                  <GlobalStyles />
                  {children}
                </GameState>
              </WebSocketProvider>
            </ModalProvider>
          </VerseProvider>
        </GlobalState>
      </LocaProvider>
    </ThemeProvider>
  </BrowserRouter>
)

export default Providers
