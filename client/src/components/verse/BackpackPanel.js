import React, { useContext, useState } from 'react'
import locaContext from '../../context/localization/locaContext'
import verseContext from '../../context/verse/verseContext'
import { imageForShopItem } from '../../contracts/shopCatalog'
import { enrichItem, splitLabel } from '../../contracts/itemEcosystem'
import { addresses, listMarketItem } from '../../contracts/xsolla'
import { showVerseAlert } from '../../utils/verseAlert'
import { chainOfflineCopy } from '../../utils/chainConfig'
import verseFrame from '../../assets/shop/verse-frame.png'
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
  Title,
  VerseSection,
} from './verseUi'

const BackpackPanel = ({
  ownedItems,
  grants,
  isGuest,
  onInventoryChange,
}) => {
  const { t } = useContext(locaContext)
  const { demo, equipItem, unequipItem } = useContext(verseContext)
  const [filter, setFilter] = useState('all')
  const [saleItemId, setSaleItemId] = useState(null)
  const [salePrice, setSalePrice] = useState('12')
  const [busyItemId, setBusyItemId] = useState(null)
  const marketDeployed = Boolean(addresses.XsollaMarket)
  const grantList = [...(grants || []), ...(demo.grants || [])]
  const grantFor = (item) =>
    grantList.find(
      (row) =>
        String(row.itemId) === String(item.id) ||
        (row.itemName && row.itemName === item.name),
    )
  const items = [...(ownedItems || [])]
  if (demo.quests && demo.quests.badge) {
    items.unshift({
      id: 'ember-badge',
      name: t('backpack.badge'),
      game: 'XsollaVerse',
      quantity: 1,
      image: verseFrame,
      demoReward: true,
      kind: 'bounty',
      perk: 'frame',
      soulbound: true,
    })
  }
  const enrichedItems = items.map(enrichItem)
  const isEquipped = (item) => {
    const loadoutItem = item.slot && demo.loadout && demo.loadout[item.slot]
    return (
      (loadoutItem && String(loadoutItem.id) === String(item.id)) ||
      (demo.equipped && String(demo.equipped.id) === String(item.id))
    )
  }
  const visibleItems = enrichedItems.filter((item) => {
    if (filter === 'equipped') return isEquipped(item)
    if (filter === 'cosmetics') return item.kind === 'cosmetic'
    if (filter === 'tradeable') {
      return item.tradeable && Number(item.id) > 0
    }
    return true
  })
  const filters = ['all', 'equipped', 'cosmetics', 'tradeable']

  const onList = async (item) => {
    if (isGuest) {
      showVerseAlert(t('market.title'), t('guest.market'), 'info')
      return
    }
    const price = Number(salePrice)
    if (!Number.isFinite(price) || price <= 0) {
      showVerseAlert(t('market.title'), t('backpack.invalidPrice'), 'error')
      return
    }
    setBusyItemId(item.id)
    try {
      await listMarketItem(item.id, 1, salePrice)
      showVerseAlert(t('market.title'), t('market.listed'), 'success')
      setSaleItemId(null)
      if (Number(item.quantity) <= 1 && isEquipped(item)) {
        unequipItem(item)
      }
      if (onInventoryChange) await onInventoryChange()
    } catch (e) {
      showVerseAlert(t('market.title'), e.message || t('market.fail'), 'error')
    } finally {
      setBusyItemId(null)
    }
  }

  return (
    <VerseSection>
      <Title>{t('backpack.title')}</Title>
      <Lead>{t('backpack.lead')}</Lead>
      <Row>
        {filters.map((id) => (
          <Ghost
            key={id}
            type="button"
            aria-pressed={filter === id}
            style={
              filter === id
                ? { borderColor: 'var(--cyan)', color: 'var(--cyan)' }
                : undefined
            }
            onClick={() => setFilter(id)}
          >
            {t(`backpack.filter.${id}`)}
          </Ghost>
        ))}
      </Row>
      {!marketDeployed && <Meta>{chainOfflineCopy()}</Meta>}
      {items.length === 0 ? (
        <Meta>{t('backpack.empty')}</Meta>
      ) : visibleItems.length === 0 ? (
        <Meta>{t('backpack.noMatches')}</Meta>
      ) : (
        <Grid>
          {visibleItems.map((item) => {
            const image = item.image || imageForShopItem(item)
            const equipped = isEquipped(item)
            const grant = grantFor(item)
            const canSell = item.tradeable && Number(item.id) > 0
            return (
              <Card key={item.id}>
                <Cover>
                  {image ? (
                    <img src={image} alt="" />
                  ) : (
                    <div style={{ padding: '2rem', color: 'var(--muted)' }}>
                      {item.name}
                    </div>
                  )}
                </Cover>
                <CardBody>
                  <CardTitle>{item.name}</CardTitle>
                  <Meta>
                    {item.game}
                    {item.quantity > 1 ? ` · ×${item.quantity}` : ''}
                  </Meta>
                  <Stamp>
                    {t(`eco.kind.${item.kind}`) !== `eco.kind.${item.kind}`
                      ? t(`eco.kind.${item.kind}`)
                      : item.kind}
                  </Stamp>
                  {item.soulbound && <Stamp>{t('eco.soulbound')}</Stamp>}
                  {item.studioBps > 0 && (
                    <Meta>{splitLabel(item.studioBps)}</Meta>
                  )}
                  {item.effect && <Meta>{item.effect}</Meta>}
                  {grant ? (
                    <Stamp>{t('backpack.granted')}</Stamp>
                  ) : null}
                  {grant && grant.note ? <Meta>{grant.note}</Meta> : null}
                  {item.slot ? (
                    equipped ? (
                      <Row>
                        <Stamp>{t('backpack.equipped')}</Stamp>
                        <Ghost type="button" onClick={() => unequipItem(item)}>
                          {t('backpack.unequip')}
                        </Ghost>
                      </Row>
                    ) : (
                      <Primary
                        type="button"
                        style={{ marginTop: '0.65rem' }}
                        onClick={() =>
                          equipItem({
                            id: item.id,
                            name: item.name,
                            game: item.game,
                            image,
                          })
                        }
                      >
                        {t('backpack.equip')}
                      </Primary>
                    )
                  ) : (
                    <Stamp>{t('backpack.activeOwned')}</Stamp>
                  )}
                  {canSell && (
                    <>
                      {saleItemId === item.id ? (
                        <Row>
                          <Input
                            type="number"
                            min="0.0001"
                            step="0.0001"
                            value={salePrice}
                            aria-label={t('market.price')}
                            onChange={(e) => setSalePrice(e.target.value)}
                          />
                          <Primary
                            type="button"
                            disabled={
                              busyItemId != null ||
                              !marketDeployed ||
                              isGuest
                            }
                            onClick={() => onList(item)}
                          >
                            {t('market.list')}
                          </Primary>
                          <Ghost
                            type="button"
                            disabled={busyItemId != null}
                            onClick={() => setSaleItemId(null)}
                          >
                            {t('backpack.cancel')}
                          </Ghost>
                        </Row>
                      ) : (
                        <Ghost
                          type="button"
                          disabled={!marketDeployed || isGuest}
                          style={{ marginTop: '0.65rem' }}
                          onClick={() => setSaleItemId(item.id)}
                        >
                          {t('backpack.sell')}
                        </Ghost>
                      )}
                    </>
                  )}
                </CardBody>
              </Card>
            )
          })}
        </Grid>
      )}
    </VerseSection>
  )
}

export default BackpackPanel
