import React, { useContext } from 'react'
import LocaContext from './locaContext'
import { LOCALES, translate } from '../../i18n/strings'

const initialState = localStorage.getItem('lang') || 'en'

const LocaProvider = ({ children }) => {
  const [lang, setLang] = React.useState(
    LOCALES.some((l) => l.id === initialState) ? initialState : 'en',
  )

  React.useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get('lang')
    if (fromQuery && LOCALES.some((l) => l.id === fromQuery)) setLang(fromQuery)
  }, [])

  React.useEffect(() => {
    localStorage.setItem('lang', lang)
    document.documentElement.setAttribute('lang', lang)
  }, [lang])

  const t = React.useCallback((path) => translate(lang, path), [lang])

  return (
    <LocaContext.Provider value={{ lang, setLang, t, locales: LOCALES }}>
      {children}
    </LocaContext.Provider>
  )
}

export function useLoca() {
  return useContext(LocaContext)
}

export default LocaProvider
