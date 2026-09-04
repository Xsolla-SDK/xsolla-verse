import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gameContext from '../context/game/gameContext'
import socketContext from '../context/websocket/socketContext'
import globalContext from '../context/global/globalContext'
import {
  fetchShopListings,
  fetchShopGames,
  buyShopItem,
  fetchOwnedItems,
  readBalances,
  isRegisteredStudio,
  contractsConfigured,
  addresses,
  formatXsollaAmount,
} from '../contracts/xsolla'
import { groupListingsByGame } from '../contracts/shopCatalog'
import { shopGameByName } from '../contracts/hubCatalog'
import { chainOfflineCopy } from '../utils/chainConfig'
import { enrichItem, splitLabel, playerPerks, grantsInTitle } from '../contracts/itemEcosystem'
import {
  ONLINE_GAMES,
  imageForTableRoom,
  imageForTournamentRoom,
} from '../contracts/onlineCatalog'
import { CS_ECONOMY_SYNC } from '../game/actions'
import { showVerseAlert } from '../utils/verseAlert'
import { isPlaytestPending, setPlaytestPending } from '../utils/verseDemo'
import { clearDemoPersona } from '../utils/demoWallet'
import { fetchGrants, postGrant } from '../utils/hubApi'
import styled, { keyframes, createGlobalStyle } from 'styled-components'
import universeBg from '../assets/img/xsolla-universe-landing.webp'
import xsollaLogo from '../assets/img/xsolla-logo.svg'
import CoinIcon from '../components/icons/CoinIcon'
import AcademyPanel from '../components/academy/AcademyPanel'
import GameHubPanel from '../components/verse/GameHubPanel'
import BackpackPanel from '../components/verse/BackpackPanel'
import SocialPanel from '../components/verse/SocialPanel'
import GalleryPanel from '../components/verse/GalleryPanel'
import SupportPanel from '../components/verse/SupportPanel'
import MarketPanel from '../components/verse/MarketPanel'
import PlaytestPanel from '../components/verse/PlaytestPanel'
import FeePoolCard from '../components/verse/FeePoolCard'
import StudioPanel from '../components/verse/StudioPanel'
import OperatorPanel from '../components/verse/OperatorPanel'
import {
  GuestIcon,
  OperatorIcon,
  PlayerIcon,
  StudioIcon,
} from '../components/verse/RoleIcons'
import locaContext from '../context/localization/locaContext'
import verseContext from '../context/verse/verseContext'
import {
  isGuestWallet,
  isOperatorWallet,
  resolveVerseRole,
  tabsForRole,
  defaultTabForRole,
} from '../utils/walletRole'

const Lobby = () => {
  const navigate = useNavigate()
  const { socket } = useContext(socketContext)
  const {
    walletAddress,
    walletXsolla,
    setWalletAddress,
    setUserName,
    userName,
    feePool,
    setStakedXsolla,
    setWalletXsolla,
  } = useContext(globalContext)
  const { t, lang, setLang, locales } = useContext(locaContext)
  const { demo, markQuest, setOwnedNames, addGrant } = useContext(verseContext)
  const {
    lobbyTables,
    tournaments,
    joinTable,
    fillBots,
    fillTournamentBots,
    registerTournament,
    startTournament,
  } = useContext(gameContext)
  const [mainTab, setMainTab] = useState('hub')
  const [playTab, setPlayTab] = useState(null)
  const [busy, setBusy] = useState(false)
  const [shopItems, setShopItems] = useState([])
  const [catalogGames, setCatalogGames] = useState([])
  const [ownedItems, setOwnedItems] = useState([])
  const [selectedShopGame, setSelectedShopGame] = useState(null)
  const [status, setStatus] = useState('')
  const [showPlaytest, setShowPlaytest] = useState(false)
  const [isStudio, setIsStudio] = useState(false)
  const [grants, setGrants] = useState([])
  const isGuest = isGuestWallet(walletAddress)
  const isOperator = isOperatorWallet(walletAddress)
  const role = resolveVerseRole({ address: walletAddress, isStudio, isOperator })
  const tabIds = tabsForRole(role, { isStudio })
  const RoleIcon = {
    guest: GuestIcon,
    player: PlayerIcon,
    studio: StudioIcon,
    operator: OperatorIcon,
  }[role]

  useEffect(() => {
    if (walletAddress && contractsConfigured()) {
      refreshShop()
    }
    // eslint-disable-next-line
  }, [walletAddress])

  useEffect(() => {
    if (!socket) navigate('/')
  }, [socket, navigate])

  useEffect(() => {
    if (isPlaytestPending()) setShowPlaytest(true)
  }, [])

  useEffect(() => {
    setMainTab(defaultTabForRole(role))
  }, [role])

  const refreshShop = async () => {
    let owned = ownedItems
    try {
      if (!contractsConfigured() || !addresses.XsollaShop) {
        setShopItems([])
        setOwnedItems([])
        setCatalogGames([])
        owned = []
      } else {
        const listings = await fetchShopListings()
        setShopItems(listings)
        try {
          setCatalogGames(await fetchShopGames())
        } catch (e) {
          setCatalogGames([])
        }
        if (walletAddress) {
          owned = await fetchOwnedItems(walletAddress)
          setOwnedItems(owned)
          if (setOwnedNames) {
            setOwnedNames((owned || []).map((i) => i.name).filter(Boolean))
          }
        } else {
          owned = []
        }
      }
    } catch (e) {
      setStatus(e.message || 'Could not load shop')
    }
    if (!walletAddress || isGuest || !addresses.XsollaShop) {
      setIsStudio(false)
    } else {
      try {
        setIsStudio(await isRegisteredStudio(walletAddress))
      } catch (e) {
        setIsStudio(false)
      }
    }
    if (walletAddress) {
      try {
        setGrants(await fetchGrants({ buyer: walletAddress }))
      } catch (e) {
        setGrants([])
      }
    } else {
      setGrants([])
    }
    await syncEconomy(owned)
  }

  const syncEconomy = async (owned = ownedItems) => {
    if (!walletAddress || isGuest) {
      if (setWalletXsolla) setWalletXsolla(0)
      return
    }
    let staked = 0
    let wallet = 0
    if (contractsConfigured()) {
      try {
        const b = await readBalances(walletAddress)
        staked = Number(b.stakedXsolla) || 0
        wallet = Number(b.walletXsolla) || 0
      } catch (e) {
        // Older treasury or not deployed
      }
    }
    if (setStakedXsolla) setStakedXsolla(staked)
    if (setWalletXsolla) setWalletXsolla(wallet)
    if (!socket) return
    socket.emit(CS_ECONOMY_SYNC, {
      stakedXsolla: staked,
      hasRakeCharm: !!playerPerks(demo, owned).rake,
    })
  }

  const onBuyItem = async (itemId) => {
    if (isGuest) {
      showVerseAlert(t('tabs.shop'), t('guest.shop'), 'info')
      return
    }
    setBusy(true)
    setStatus(`Buying item #${itemId}…`)
    try {
      await buyShopItem(itemId, 1)
      setStatus('Purchase confirmed')
      markQuest('buy')
      const item = (shopItems || []).find((row) => String(row.id) === String(itemId))
      if (item && grantsInTitle(item)) {
        const payload = {
          itemId,
          itemName: item.name,
          game: item.game || '',
          gameId: item.gameId || null,
          buyer: walletAddress,
          studio: item.studio || '',
          kind: item.kind || 'pack',
        }
        try {
          const grant = await postGrant(payload)
          if (addGrant) addGrant(grant)
          showVerseAlert(
            t('tabs.shop'),
            `${t('shop.granted')} ${item.game}`,
            'success',
          )
        } catch (grantErr) {
          if (addGrant) addGrant({ ...payload, note: `${t('shop.granted')} ${item.game}` })
        }
      }
      await refreshShop()
    } catch (e) {
      console.error(e)
      setStatus(e.message || 'Purchase failed')
      showVerseAlert('Shop', e.message || 'Purchase failed', 'error')
    } finally {
      setBusy(false)
    }
  }

  const onLogout = () => {
    clearDemoPersona()
    setWalletAddress('')
    setUserName('')
    if (setWalletXsolla) setWalletXsolla(0)
    navigate('/')
  }

  const cashTables = (lobbyTables || []).filter(
    (t) => (t.gameType || 'holdem') === 'holdem',
  )
  const bjTables = (lobbyTables || []).filter((t) => t.gameType === 'blackjack')
  const sng = (tournaments || []).filter((t) => t.type === 'sng')
  const mtt = (tournaments || []).filter((t) => t.type === 'mtt')
  const shopGames = groupListingsByGame(shopItems, catalogGames)
  const activeShopGame =
    selectedShopGame && shopGames.find((g) => g.name === selectedShopGame)
  const shopMeta = shopGameByName(selectedShopGame)
  const displayLabel =
    demo.displayName ||
    userName ||
    (walletAddress
      ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
      : t('identity.guest'))
  const goPlayTable = (tableId) => {
    markQuest('play')
    setPlaytestPending(true)
    joinTable(tableId)
  }

  const openShopGame = (gameName) => {
    setMainTab('shop')
    setSelectedShopGame(gameName)
    refreshShop()
  }

  const openPlayTab = (tabId) => {
    setMainTab('play')
    setPlayTab(tabId)
  }

  const renderActions = (children) => <ActionRow>{children}</ActionRow>

  return (
    <Page>
      <SwalTheme />
      <Backdrop aria-hidden="true" />
      <Overlay aria-hidden="true" />

      <Shell>
        <TopBar>
          <Brand to="/">
            <img src={xsollaLogo} alt="Xsolla" />
            <BrandText>
              Xsolla<span>Verse</span>
            </BrandText>
          </Brand>

          <PlayerMeta>
            <LocaleBar>
              {(locales || []).map((loc) => (
                <LocaleBtn
                  key={loc.id}
                  type="button"
                  $active={lang === loc.id}
                  onClick={() => setLang(loc.id)}
                >
                  {loc.label}
                </LocaleBtn>
              ))}
            </LocaleBar>
            {(() => {
              const frame =
                (demo.loadout && demo.loadout.frame) || demo.equipped
              return frame ? (
              <EquippedChip title={frame.name}>
                {frame.image && <img src={frame.image} alt="" />}
                <span>{frame.name}</span>
              </EquippedChip>
              ) : null
            })()}
            <ChipBalance title={t('identity.xsolla')}>
              <CoinIcon />
              <MetaValue>{formatXsollaAmount(walletXsolla)}</MetaValue>
            </ChipBalance>
            <ProfileLink
              to="/profile"
              title={`${t(`role.${role}`)} · ${displayLabel}`}
              aria-label={`${t('identity.profile')}: ${displayLabel}`}
            >
              <RoleIconWrap aria-hidden="true">
                <RoleIcon />
              </RoleIconWrap>
              <ProfileName>{displayLabel}</ProfileName>
            </ProfileLink>
            <GhostBtn type="button" onClick={onLogout}>
              {t('identity.logout')}
            </GhostBtn>
          </PlayerMeta>
        </TopBar>

        {feePool && tabIds.includes('play') && (
          <FeePoolBar>
            <FeePoolCard pool={feePool} compact />
          </FeePoolBar>
        )}

        {showPlaytest && (
          <PlaytestModal role="dialog" aria-modal="true" aria-label={t('playtest.title')}>
            <PlaytestScrim
              type="button"
              aria-label="Close"
              onClick={() => {
                setShowPlaytest(false)
                setPlaytestPending(false)
              }}
            />
            <PlaytestBanner>
              <PlaytestPanel
                compact
                ownedItems={ownedItems}
                games={catalogGames}
                onSubmitted={() => setShowPlaytest(false)}
                onEconomyChange={syncEconomy}
              />
              <ClosePlaytest
                type="button"
                aria-label="Close"
                onClick={() => {
                  setShowPlaytest(false)
                  setPlaytestPending(false)
                }}
              >
                ×
              </ClosePlaytest>
            </PlaytestBanner>
          </PlaytestModal>
        )}

        <Tabs role="tablist">
          {(tabIds.includes(mainTab) ? tabIds : [...tabIds, mainTab]).map((id) => (
            <Tab
              key={id}
              type="button"
              role="tab"
              aria-selected={mainTab === id}
              $active={mainTab === id}
              onClick={() => {
                setMainTab(id)
                if (id === 'shop' || id === 'backpack' || id === 'market' || id === 'studio') {
                  setSelectedShopGame(null)
                  refreshShop()
                }
                if (id === 'play') setPlayTab(null)
              }}
            >
              {t(`tabs.${id}`)}
            </Tab>
          ))}
        </Tabs>

        {mainTab === 'hub' && (
          <AnimatedPanel key="main-hub">
            <GameHubPanel
              onOpenShop={openShopGame}
              onPlay={openPlayTab}
              onPlaytest={() => setShowPlaytest(true)}
              extraGames={catalogGames}
              showLounge={tabIds.includes('play')}
            />
          </AnimatedPanel>
        )}

        {mainTab === 'shop' && (
          <AnimatedPanel key="main-shop">
          <SectionBlock>
            {!contractsConfigured() && (
              <Hint>{chainOfflineCopy()}</Hint>
            )}
            {ownedItems.length > 0 && (
              <Hint>
                {t('shop.owned')}:{' '}
                {ownedItems
                  .map(
                    (i) =>
                      `${i.game ? `${i.game} · ` : ''}${i.name} ×${i.quantity}`,
                  )
                  .join(' · ')}
              </Hint>
            )}
            <Hint>
              Bronze+ stake (100 XSOLLA): 2% off Verse share. Studio cut
              unchanged.
            </Hint>
            {isGuest && <Hint>{t('guest.shop')}</Hint>}

            {!selectedShopGame &&
              (shopGames.length === 0 ? (
                <Hint>
                  {chainOfflineCopy()}
                </Hint>
              ) : (
                <AnimatedPanel key="shop-games">
                  <Grid>
                    {shopGames.map((game) => (
                      <InteractiveCard
                        key={game.id}
                        type="button"
                        onClick={() => setSelectedShopGame(game.name)}
                      >
                        <GameCover>
                          {game.image ? (
                            <img src={game.image} alt="" />
                          ) : (
                            <GameCoverFallback>
                              {game.name}
                            </GameCoverFallback>
                          )}
                        </GameCover>
                        <CardTitle>{game.name}</CardTitle>
                        {game.blurb && <CardMeta>{game.blurb}</CardMeta>}
                        {game.qa && <QaStamp>{game.qa}</QaStamp>}
                        <CardMeta>
                          {game.items.length} {t('shop.items')}
                        </CardMeta>
                      </InteractiveCard>
                    ))}
                  </Grid>
                </AnimatedPanel>
              ))}

                {selectedShopGame && (
                  <>
                    <Breadcrumb aria-label="Breadcrumb">
                      <CrumbLink
                        type="button"
                        onClick={() => setSelectedShopGame(null)}
                      >
                        All games
                      </CrumbLink>
                      <CrumbSep aria-hidden="true">/</CrumbSep>
                      <CrumbCurrent>{selectedShopGame}</CrumbCurrent>
                    </Breadcrumb>
                    <AnimatedPanel key={`shop-${selectedShopGame}`}>
                      {(activeShopGame ? activeShopGame.items : []).length ===
                      0 ? (
                        <Hint>{chainOfflineCopy()}</Hint>
                      ) : (
                      <Grid>
                        {(activeShopGame ? activeShopGame.items : []).map(
                          (raw) => {
                            const item = enrichItem(raw)
                            return (
                            <ItemCard key={item.id}>
                              <ItemCover>
                                {item.image ? (
                                  <img src={item.image} alt="" />
                                ) : (
                                  <GameCoverFallback>
                                    {item.name}
                                  </GameCoverFallback>
                                )}
                              </ItemCover>
                              <ItemBody>
                                <CardTitle>{item.name}</CardTitle>
                                {shopMeta && shopMeta.qa && (
                                  <QaStamp>{shopMeta.qa}</QaStamp>
                                )}
                                <QaStamp>
                                  {item.kind}
                                  {item.soulbound ? ` · ${t('eco.soulbound')}` : ''}
                                </QaStamp>
                                <CardMeta>{splitLabel(item.studioBps)}</CardMeta>
                                {item.effect && <CardMeta>{item.effect}</CardMeta>}
                                <PriceMeta title={t('identity.xsolla')}>
                                  <CoinIcon width="18" height="18" />
                                  <span>{formatXsollaAmount(item.priceXsolla)}</span>
                                </PriceMeta>
                                {renderActions(
                                    <PrimaryBtn
                                    type="button"
                                    disabled={
                                      busy ||
                                      isGuest ||
                                      !addresses.XsollaShop
                                    }
                                    onClick={() => onBuyItem(item.id)}
                                  >
                                    {t('shop.buy')}
                                  </PrimaryBtn>,
                                )}
                              </ItemBody>
                            </ItemCard>
                            )
                          },
                        )}
                      </Grid>
                      )}
                    </AnimatedPanel>
                  </>
                )}
                {status && (
                  <StatusLine $error={/fail|error|could not/i.test(status)}>
                    {status}
                  </StatusLine>
                )}
          </SectionBlock>
          </AnimatedPanel>
        )}

        {mainTab === 'play' && (
          <AnimatedPanel key="main-play">
          <SectionBlock>
            {!playTab ? (
              <AnimatedPanel key="play-games">
                <Hint>{t('onlineGames.lead')}</Hint>
                <Grid>
                  {ONLINE_GAMES.map((game) => (
                    <InteractiveCard
                      key={game.id}
                      type="button"
                      onClick={() => setPlayTab(game.id)}
                    >
                      <GameCover>
                        <img src={game.image} alt="" />
                      </GameCover>
                      <CardTitle>{game.label}</CardTitle>
                      <CardMeta>{game.blurb}</CardMeta>
                    </InteractiveCard>
                  ))}
                </Grid>
              </AnimatedPanel>
            ) : (
              <>
                <Breadcrumb aria-label="Breadcrumb">
                  <CrumbLink type="button" onClick={() => setPlayTab(null)}>
                    All games
                  </CrumbLink>
                  <CrumbSep aria-hidden="true">/</CrumbSep>
                  <CrumbCurrent>
                    {(ONLINE_GAMES.find((g) => g.id === playTab) || {}).label ||
                      'Tables'}
                  </CrumbCurrent>
                </Breadcrumb>

                <AnimatedPanel key={`play-${playTab}`}>
                {playTab === 'cash' && (
                  <Grid>
                    {cashTables.map((table) => (
                      <ItemCard key={table.id}>
                        <ItemCover>
                          <img src={imageForTableRoom(table)} alt="" />
                        </ItemCover>
                        <ItemBody>
                          <CardTitle>{table.name}</CardTitle>
                          <CardMeta>
                            Blinds {table.smallBlind}/{table.bigBlind}
                          </CardMeta>
                          <CardMeta>
                            Seats {table.currentNumberPlayers}/
                            {table.maxPlayers}
                          </CardMeta>
                          <CardMeta>
                            Rake 5% pot (cap 3 BB)
                            {playerPerks(demo, ownedItems).rake
                              ? ' · Charm 4.5%'
                              : ''}
                          </CardMeta>
                          {renderActions(
                            <>
                              <PrimaryBtn
                                type="button"
                                onClick={() => goPlayTable(table.id)}
                              >
                                Join
                              </PrimaryBtn>
                              <GhostBtn
                                type="button"
                                onClick={() => fillBots(table.id)}
                              >
                                Fill bots
                              </GhostBtn>
                            </>,
                          )}
                        </ItemBody>
                      </ItemCard>
                    ))}
                  </Grid>
                )}

                {playTab === 'bj' && (
                  <Grid>
                    {bjTables.map((table) => (
                      <ItemCard key={table.id}>
                        <ItemCover>
                          <img src={imageForTableRoom(table)} alt="" />
                        </ItemCover>
                        <ItemBody>
                          <CardTitle>{table.name}</CardTitle>
                          <CardMeta>
                            Bets {table.minBet}–{table.maxBet}
                          </CardMeta>
                          <CardMeta>House edge · no extra rake</CardMeta>
                          <CardMeta>
                            Seats {table.currentNumberPlayers}/
                            {table.maxPlayers}
                          </CardMeta>
                          {renderActions(
                            <>
                              <PrimaryBtn
                                type="button"
                                onClick={() => goPlayTable(table.id)}
                              >
                                Join
                              </PrimaryBtn>
                              <GhostBtn
                                type="button"
                                onClick={() => fillBots(table.id)}
                              >
                                Fill bots
                              </GhostBtn>
                            </>,
                          )}
                        </ItemBody>
                      </ItemCard>
                    ))}
                  </Grid>
                )}

                {(playTab === 'sng' || playTab === 'mtt') && (
                  <Grid>
                    {(playTab === 'sng' ? sng : mtt).map((t) => (
                      <ItemCard key={t.id}>
                        <ItemCover>
                          <img src={imageForTournamentRoom(t)} alt="" />
                        </ItemCover>
                        <ItemBody>
                          <CardTitle>{t.name}</CardTitle>
                          <CardMeta>
                            {t.registered}/{t.maxPlayers} · Buy-in {t.buyIn}
                            {t.feeBps
                              ? ` · Fee ${Number(t.feeBps) / 100}%`
                              : t.type === 'mtt'
                                ? ' · Fee 8%'
                                : ' · Fee 10%'}
                          </CardMeta>
                          {renderActions(
                            <>
                              <PrimaryBtn
                                type="button"
                                disabled={t.status !== 'registering'}
                                onClick={() => {
                                  markQuest('play')
                                  registerTournament(t.id)
                                }}
                              >
                                Register
                              </PrimaryBtn>
                              <GhostBtn
                                type="button"
                                disabled={t.status !== 'registering'}
                                onClick={() =>
                                  fillTournamentBots(
                                    t.id,
                                    t.type === 'mtt' ? 6 : 3,
                                  )
                                }
                              >
                                Add bots
                              </GhostBtn>
                              <GhostBtn
                                type="button"
                                disabled={
                                  t.status !== 'registering' ||
                                  t.registered < 2
                                }
                                onClick={() => startTournament(t.id)}
                              >
                                Start
                              </GhostBtn>
                            </>,
                          )}
                        </ItemBody>
                      </ItemCard>
                    ))}
                  </Grid>
                )}
                </AnimatedPanel>
              </>
            )}
          </SectionBlock>
          </AnimatedPanel>
        )}

        {mainTab === 'academy' && (
          <AnimatedPanel key="main-academy">
            <AcademyPanel
              onHub={() => setMainTab('hub')}
              onPlaytest={() => setShowPlaytest(true)}
              onProfile={() => navigate('/profile')}
            />
          </AnimatedPanel>
        )}

        {mainTab === 'backpack' && (
          <AnimatedPanel key="main-backpack">
            <BackpackPanel
              ownedItems={ownedItems}
              grants={grants}
              isGuest={isGuest}
              onInventoryChange={refreshShop}
            />
          </AnimatedPanel>
        )}

        {mainTab === 'market' && (
          <AnimatedPanel key="main-market">
            <MarketPanel
              ownedItems={ownedItems}
              isGuest={isGuest}
              onEconomyChange={syncEconomy}
              onInventoryChange={refreshShop}
            />
          </AnimatedPanel>
        )}

        {mainTab === 'studio' && isStudio && (
          <AnimatedPanel key="main-studio">
            <StudioPanel onListed={refreshShop} />
          </AnimatedPanel>
        )}

        {mainTab === 'operator' && isOperator && (
          <AnimatedPanel key="main-operator">
            <OperatorPanel />
          </AnimatedPanel>
        )}

        {mainTab === 'social' && (
          <AnimatedPanel key="main-social">
            <SocialPanel
              tables={[...(cashTables || []), ...(bjTables || [])]}
              onSpectate={goPlayTable}
            />
          </AnimatedPanel>
        )}

        {mainTab === 'gallery' && (
          <AnimatedPanel key="main-gallery">
            <GalleryPanel />
          </AnimatedPanel>
        )}

        {mainTab === 'support' && (
          <AnimatedPanel key="main-support">
            <SupportPanel />
            <PlaytestPanel
              ownedItems={ownedItems}
              games={catalogGames}
              onEconomyChange={syncEconomy}
            />
          </AnimatedPanel>
        )}
      </Shell>
    </Page>
  )
}

const drift = keyframes`
  0% { transform: scale(1.06) translate3d(0, 0, 0); }
  50% { transform: scale(1.12) translate3d(-1.5%, -0.8%, 0); }
  100% { transform: scale(1.06) translate3d(0, 0, 0); }
`

const panelIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const crumbIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-6px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

const SwalTheme = createGlobalStyle`
  .xsolla-swal-popup {
    border: 1px solid rgba(128, 234, 255, 0.35) !important;
    border-radius: 0 !important;
    box-shadow:
      0 0 40px rgba(255, 110, 199, 0.18),
      0 0 60px rgba(128, 234, 255, 0.12) !important;
    font-family: 'Chakra Petch', 'Segoe UI', sans-serif !important;
  }

  .xsolla-swal-title {
    color: #f4f0ff !important;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 700 !important;
  }

  .xsolla-swal-text {
    color: rgba(220, 210, 245, 0.88) !important;
  }

  .xsolla-swal-confirm {
    border: 1px solid rgba(128, 234, 255, 0.65) !important;
    background: linear-gradient(
      135deg,
      rgba(255, 110, 199, 0.55),
      rgba(88, 40, 160, 0.9),
      rgba(20, 70, 140, 0.95)
    ) !important;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-weight: 600 !important;
  }
`

const Page = styled.div`
  --ink: #f4f0ff;
  --muted: rgba(220, 210, 245, 0.78);
  --line: rgba(128, 234, 255, 0.28);
  --pink: #ff6ec7;
  --cyan: #80eaff;

  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  color: var(--ink);
  font-family: 'Chakra Petch', 'Segoe UI', sans-serif;
  overflow-x: hidden;
`

const Backdrop = styled.div`
  position: fixed;
  inset: -6%;
  z-index: 0;
  background:
    url(${universeBg}) center 40% / cover no-repeat,
    #05010f;
  animation: ${drift} 40s ease-in-out infinite;
  will-change: transform;
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  background:
    linear-gradient(
      180deg,
      rgba(4, 1, 14, 0.82) 0%,
      rgba(4, 1, 14, 0.62) 40%,
      rgba(4, 1, 14, 0.9) 100%
    );
  pointer-events: none;
`

const Shell = styled.div`
  position: relative;
  z-index: 1;
  width: min(1100px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 1.25rem 0 3.5rem;
`

const TopBar = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 0 1.25rem;
  border-bottom: 1px solid var(--line);
  margin-bottom: 1rem;
`

const FeePoolBar = styled.div`
  margin: -0.35rem 0 0.85rem;
`

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none !important;
  color: inherit !important;

  img {
    width: 108px;
    height: auto;
    display: block;
  }
`

const BrandText = styled.span`
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;

  span {
    color: var(--pink);
  }
`

const PlayerMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
`

const LocaleBar = styled.div`
  display: inline-flex;
  border: 1px solid rgba(128, 234, 255, 0.28);
`

const LocaleBtn = styled.button`
  appearance: none;
  font: inherit;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 0.35rem 0.5rem;
  cursor: pointer;
  border: none;
  background: ${(p) =>
    p.$active ? 'rgba(128, 234, 255, 0.2)' : 'transparent'};
  color: ${(p) => (p.$active ? '#fff' : 'var(--muted)')};
`

const EquippedChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  max-width: 160px;
  padding: 0.25rem 0.5rem;
  border: 1px solid rgba(255, 110, 199, 0.4);
  font-size: 0.72rem;

  img {
    width: 22px;
    height: 22px;
    object-fit: cover;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

const PlaytestModal = styled.div`
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  padding: 1rem;
`

const PlaytestScrim = styled.button`
  appearance: none;
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(4, 1, 14, 0.78);
  backdrop-filter: blur(8px);
  cursor: pointer;
`

const PlaytestBanner = styled.div`
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  width: min(680px, 100%);
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  padding: 1.1rem 3rem 1.25rem 1.25rem;
  border: 1px solid rgba(128, 234, 255, 0.35);
  background: rgba(8, 4, 24, 0.96);
  box-shadow:
    0 0 45px rgba(128, 234, 255, 0.14),
    0 0 70px rgba(255, 110, 199, 0.12);
`

const ClosePlaytest = styled.button`
  appearance: none;
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;
  border: 1px solid rgba(128, 234, 255, 0.35);
  background: rgba(8, 4, 24, 0.45);
  color: inherit;
  font: inherit;
  width: 2rem;
  height: 2rem;
  cursor: pointer;
`

const QaStamp = styled.span`
  display: inline-block;
  margin: 0.35rem 0 0.15rem;
  padding: 0.18rem 0.4rem;
  border: 1px solid rgba(128, 234, 255, 0.4);
  color: var(--cyan);
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

const ProfileLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  height: 2.35rem;
  max-width: 180px;
  padding: 0 0.65rem 0 0.3rem;
  border: 1px solid rgba(128, 234, 255, 0.28);
  background: rgba(255, 255, 255, 0.04);
  text-decoration: none !important;
  color: inherit !important;

  &:hover {
    border-color: var(--cyan);
    color: var(--cyan) !important;
  }
`

const RoleIconWrap = styled.span`
  display: grid;
  place-items: center;
  width: 1.8rem;
  height: 1.8rem;
  flex: 0 0 auto;
  overflow: hidden;

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }
`

const ProfileName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.78rem;
  font-weight: 600;
`

const ChipBalance = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid rgba(128, 234, 255, 0.18);
  background: rgba(255, 255, 255, 0.04);

  svg {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    display: block;
  }
`

const PriceMeta = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0.15rem 0 0.2rem;
  color: #ffd36a;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.02em;
`

const MetaLabel = styled.span`
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
`

const MetaValue = styled.span`
  font-size: 0.92rem;
  font-weight: 600;
  color: #fff;
`

const Tabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0 0 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.35rem;
`

const Tab = styled.button`
  appearance: none;
  border: none;
  background: transparent;
  color: ${(p) => (p.$active ? '#fff' : 'var(--muted)')};
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.75rem 1rem;
  cursor: pointer;
  position: relative;
  transition: color 0.25s ease;

  &::after {
    content: '';
    position: absolute;
    left: 0.85rem;
    right: 0.85rem;
    bottom: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--pink), var(--cyan));
    transform: scaleX(${(p) => (p.$active ? 1 : 0)});
    transform-origin: left center;
    transition: transform 0.3s ease;
  }

  &:hover {
    color: #fff;
  }
`

const SectionBlock = styled.div`
  width: 100%;
`

const AnimatedPanel = styled.div`
  width: 100%;
  animation: ${panelIn} 0.38s cubic-bezier(0.22, 1, 0.36, 1);
`

const Breadcrumb = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.55rem;
  margin: 0 0 1.1rem;
  animation: ${crumbIn} 0.3s ease;
`

const CrumbLink = styled.button`
  appearance: none;
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover,
  &:focus {
    color: var(--cyan);
  }
`

const CrumbSep = styled.span`
  color: rgba(128, 234, 255, 0.35);
  font-size: 0.78rem;
  font-weight: 600;
  user-select: none;
`

const CrumbCurrent = styled.span`
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
`

const Hint = styled.p`
  margin: 0 0 0.85rem;
  color: var(--muted);
  font-size: 0.9rem;
`

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: center;
  margin-top: 0.75rem;
`

const btnBase = `
  appearance: none;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.55rem 0.85rem;
  cursor: pointer;
  transition: filter 0.2s ease, border-color 0.2s ease, background 0.2s ease;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`

const PrimaryBtn = styled.button`
  ${btnBase}
  border: 1px solid rgba(128, 234, 255, 0.7);
  color: #f8f4ff;
  background: linear-gradient(
    135deg,
    rgba(255, 110, 199, 0.5),
    rgba(88, 40, 160, 0.85),
    rgba(20, 70, 140, 0.9)
  );

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    filter: brightness(1.1);
  }
`

const GhostBtn = styled.button`
  ${btnBase}
  border: 1px solid
    ${(p) =>
      p.$active ? 'rgba(255, 110, 199, 0.7)' : 'rgba(128, 234, 255, 0.28)'};
  color: var(--ink);
  background: ${(p) =>
    p.$active ? 'rgba(255, 110, 199, 0.16)' : 'rgba(255, 255, 255, 0.04)'};

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    border-color: var(--cyan);
    background: rgba(128, 234, 255, 0.08);
  }
`

const StatusLine = styled.p`
  margin: 0.85rem 0 0;
  padding: 0.65rem 0.85rem;
  border: 1px solid
    ${(p) =>
      p.$error ? 'rgba(255, 110, 199, 0.55)' : 'rgba(128, 234, 255, 0.4)'};
  background: ${(p) =>
    p.$error ? 'rgba(255, 110, 199, 0.12)' : 'rgba(128, 234, 255, 0.1)'};
  color: ${(p) => (p.$error ? '#ffb3e0' : 'var(--cyan)')};
  font-size: 0.88rem;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.85rem;
  width: 100%;
`

const Card = styled.div`
  border: 1px solid rgba(128, 234, 255, 0.22);
  background: rgba(10, 5, 24, 0.7);
  backdrop-filter: blur(8px);
  padding: 1.1rem;
`

const ItemCard = styled.div`
  border: 1px solid rgba(128, 234, 255, 0.22);
  background: rgba(10, 5, 24, 0.7);
  backdrop-filter: blur(8px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const ItemCover = styled.div`
  width: 100%;
  aspect-ratio: 16 / 10;
  background: rgba(0, 0, 0, 0.35);
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

const ItemBody = styled.div`
  padding: 0.9rem 1.1rem 1.1rem;
`

const InteractiveCard = styled.button`
  appearance: none;
  text-align: left;
  border: 1px solid rgba(128, 234, 255, 0.22);
  background: rgba(10, 5, 24, 0.7);
  backdrop-filter: blur(8px);
  padding: 0;
  overflow: hidden;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;

  &:hover {
    border-color: var(--cyan);
    transform: translateY(-1px);
  }

  ${'' /* title/meta padding */}
  & > h3,
  & > p {
    padding-left: 1.1rem;
    padding-right: 1.1rem;
  }

  & > h3 {
    margin-top: 0.85rem;
  }

  & > p:last-child {
    padding-bottom: 1.1rem;
  }
`

const GameCover = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: rgba(0, 0, 0, 0.35);
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

const GameCoverFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(128, 234, 255, 0.7);
  background: linear-gradient(
    135deg,
    rgba(255, 110, 199, 0.2),
    rgba(20, 70, 140, 0.35)
  );
`

const CardTitle = styled.h3`
  margin: 0 0 0.45rem;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.04em;
`

const CardMeta = styled.p`
  margin: 0.2rem 0;
  color: var(--muted);
  font-size: 0.9rem;
`

export default Lobby
