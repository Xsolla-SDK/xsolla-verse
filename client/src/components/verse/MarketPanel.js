import React, { useContext, useEffect, useState } from 'react'
import locaContext from '../../context/localization/locaContext'
import globalContext from '../../context/global/globalContext'
import verseContext from '../../context/verse/verseContext'
import { imageForShopItem } from '../../contracts/shopCatalog'
import { enrichItem, splitLabel } from '../../contracts/itemEcosystem'
import {
  addresses,
  buyMarketOffer,
  cancelMarketOffer,
  fetchMarketOffers,
  listMarketItem,
} from '../../contracts/xsolla'
import {
  Card,
  CardBody,
  CardTitle,
  Cover,
  Ghost,
  Grid,
  Input,
  Lead,
  Meta,
  Primary,
  Row,
  Stamp,
  SubTitle,
  Title,
  VerseSection,
} from './verseUi'
import { showVerseAlert } from '../../utils/verseAlert'

const MarketPanel = ({
  ownedItems,
  isGuest,
  onEconomyChange,
  onInventoryChange,
}) => {
  const { t } = useContext(locaContext)
  const { walletAddress } = useContext(globalContext)
  const { demo, unequipItem } = useContext(verseContext)
  const [offers, setOffers] = useState([])
  const [price, setPrice] = useState('12')
  const [busy, setBusy] = useState(false)
  const deployed = Boolean(addresses.XsollaMarket)
  const tradeable = (ownedItems || [])
    .map(enrichItem)
    .filter((item) => item.tradeable && Number(item.id) > 0)

  const refresh = async () => {
    if (!deployed) {
      setOffers([])
      return
    }
    try {
      setOffers(await fetchMarketOffers())
    } catch (e) {
      setOffers([])
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line
  }, [deployed, walletAddress])

  const onList = async (item) => {
    if (isGuest) {
      showVerseAlert(t('market.title'), t('guest.market'), 'info')
      return
    }
    setBusy(true)
    try {
      await listMarketItem(item.id, 1, price)
      showVerseAlert(t('market.title'), t('market.listed'), 'success')
      const equippedInSlot =
        item.slot &&
        demo.loadout &&
        demo.loadout[item.slot] &&
        String(demo.loadout[item.slot].id) === String(item.id)
      const legacyEquipped =
        demo.equipped && String(demo.equipped.id) === String(item.id)
      if (Number(item.quantity) <= 1 && (equippedInSlot || legacyEquipped)) {
        unequipItem(item)
      }
      await refresh()
      if (onInventoryChange) await onInventoryChange()
    } catch (e) {
      showVerseAlert(t('market.title'), e.message || t('market.fail'), 'error')
    } finally {
      setBusy(false)
    }
  }

  const onBuy = async (offer) => {
    if (isGuest) {
      showVerseAlert(t('market.title'), t('guest.market'), 'info')
      return
    }
    setBusy(true)
    try {
      await buyMarketOffer(offer.offerId, offer.priceRaw)
      showVerseAlert(t('market.title'), t('market.bought'), 'success')
      await refresh()
      if (onInventoryChange) await onInventoryChange()
      else if (onEconomyChange) await onEconomyChange()
    } catch (e) {
      showVerseAlert(t('market.title'), e.message || t('market.fail'), 'error')
    } finally {
      setBusy(false)
    }
  }

  const onCancel = async (offer) => {
    setBusy(true)
    try {
      await cancelMarketOffer(offer.offerId)
      await refresh()
      if (onInventoryChange) await onInventoryChange()
    } catch (e) {
      showVerseAlert(t('market.title'), e.message || t('market.fail'), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <VerseSection>
      <Title>{t('market.title')}</Title>
      <Lead>{t('market.lead')}</Lead>
      <Meta>
        Market fee 2.5% (2% with Bronze+ stake). License holders 1%.
      </Meta>
      {!deployed && <Meta>{t('market.deploy')}</Meta>}
      {isGuest && <Meta>{t('guest.market')}</Meta>}

      <SubTitle>{t('market.open')}</SubTitle>
      {offers.length === 0 ? (
        <Meta>—</Meta>
      ) : (
        <Grid>
          {offers.map((offer) => {
            const item = enrichItem(offer.item || {})
            const mine =
              walletAddress &&
              offer.seller &&
              offer.seller.toLowerCase() === walletAddress.toLowerCase()
            const image = imageForShopItem(item)
            return (
              <Card key={offer.offerId}>
                <Cover>
                  {image ? (
                    <img src={image} alt="" />
                  ) : (
                    <div style={{ padding: '1.5rem' }}>{item.name}</div>
                  )}
                </Cover>
                <CardBody>
                  <CardTitle>{item.name || `#${offer.itemId}`}</CardTitle>
                  <Meta>
                    {offer.priceXsolla} XSOLLA · {splitLabel(item.studioBps)}
                  </Meta>
                  {item.effect && <Meta>{item.effect}</Meta>}
                  <Row>
                    {mine ? (
                      <Ghost
                        type="button"
                        disabled={busy}
                        onClick={() => onCancel(offer)}
                      >
                        {t('market.cancel')}
                      </Ghost>
                    ) : (
                      <Primary
                        type="button"
                        disabled={busy || isGuest}
                        onClick={() => onBuy(offer)}
                      >
                        {t('market.buy')}
                      </Primary>
                    )}
                  </Row>
                </CardBody>
              </Card>
            )
          })}
        </Grid>
      )}

      <SubTitle>{t('market.sell')}</SubTitle>
      <Meta>{t('market.sellHint')}</Meta>
      <Row>
        <Input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          aria-label={t('market.price')}
        />
      </Row>
      {tradeable.length === 0 ? (
        <Meta>{t('market.none')}</Meta>
      ) : (
        <Grid>
          {tradeable.map((item) => (
            <Card key={item.id}>
              <Cover>
                {imageForShopItem(item) ? (
                  <img src={imageForShopItem(item)} alt="" />
                ) : null}
              </Cover>
              <CardBody>
                <CardTitle>{item.name}</CardTitle>
                <Stamp>{item.kind}</Stamp>
                <Primary
                  type="button"
                  disabled={busy || !deployed || isGuest}
                  style={{ marginTop: '0.65rem' }}
                  onClick={() => onList(item)}
                >
                  {t('market.list')}
                </Primary>
              </CardBody>
            </Card>
          ))}
        </Grid>
      )}
    </VerseSection>
  )
}

export default MarketPanel
