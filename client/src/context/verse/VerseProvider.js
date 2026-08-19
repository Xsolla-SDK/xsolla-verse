import React, { useCallback, useMemo, useState } from 'react'
import verseContext from './verseContext'
import { readDemoState, writeDemoState } from '../../utils/verseDemo'
import { ecosystemFor } from '../../contracts/itemEcosystem'

const VerseProvider = ({ children }) => {
  const [demo, setDemo] = useState(() => readDemoState())

  const commit = useCallback((patchFn) => {
    setDemo((prev) => {
      const patch = typeof patchFn === 'function' ? patchFn(prev) : patchFn
      return writeDemoState({ ...prev, ...patch })
    })
  }, [])

  const api = useMemo(
    () => ({
      demo,
      setDisplayName: (displayName) => commit({ displayName }),
      equipItem: (item) =>
        commit((prev) => {
          const meta = ecosystemFor(item && item.name)
          const loadout = { ...(prev.loadout || {}) }
          if (meta.slot) {
            loadout[meta.slot] = {
              id: item.id,
              name: item.name,
              image: item.image,
              game: item.game,
            }
          }
          return { equipped: item, loadout }
        }),
      unequipItem: (item) =>
        commit((prev) => {
          const meta = ecosystemFor(item && item.name)
          const loadout = { ...(prev.loadout || {}) }
          if (
            meta.slot &&
            loadout[meta.slot] &&
            String(loadout[meta.slot].id) === String(item.id)
          ) {
            delete loadout[meta.slot]
          }
          const equipped =
            prev.equipped &&
            String(prev.equipped.id) === String(item.id)
              ? null
              : prev.equipped
          return { equipped, loadout }
        }),
      setOwnedNames: (ownedNames) => commit({ ownedNames: ownedNames || [] }),
      markQuest: (key) =>
        commit((prev) => ({
          quests: { ...(prev.quests || {}), [key]: true },
        })),
      addPlaytest: (entry) =>
        commit((prev) => ({
          playtests: [
            { ...entry, at: entry.at || new Date().toISOString() },
            ...(prev.playtests || []),
          ].slice(0, 12),
        })),
      addGrant: (entry) =>
        commit((prev) => ({
          grants: [
            { ...entry, at: entry.at || new Date().toISOString() },
            ...(prev.grants || []).filter(
              (row) =>
                String(row.itemId) !== String(entry.itemId) ||
                String(row.buyer || '').toLowerCase() !==
                  String(entry.buyer || '').toLowerCase(),
            ),
          ].slice(0, 24),
        })),
      addTicket: (entry) =>
        commit((prev) => ({
          tickets: [
            { ...entry, at: new Date().toISOString() },
            ...(prev.tickets || []),
          ].slice(0, 8),
        })),
    }),
    [demo, commit],
  )

  return (
    <verseContext.Provider value={api}>{children}</verseContext.Provider>
  )
}

export default VerseProvider
