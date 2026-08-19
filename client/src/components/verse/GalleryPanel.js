import React, { useContext, useState } from 'react'
import locaContext from '../../context/localization/locaContext'
import { GALLERY_PIECES } from '../../contracts/hubCatalog'
import {
  CardBody,
  CardBtn,
  CardTitle,
  Cover,
  Grid,
  Lead,
  Meta,
  Title,
  VerseSection,
} from './verseUi'

const GalleryPanel = () => {
  const { t } = useContext(locaContext)
  const [active, setActive] = useState(GALLERY_PIECES[0])

  return (
    <VerseSection>
      <Title>{t('gallery.title')}</Title>
      <Lead>{t('gallery.lead')}</Lead>
      {active && (
        <Cover style={{ aspectRatio: '21 / 9', marginBottom: '1rem' }}>
          <img src={active.image} alt={active.title} />
        </Cover>
      )}
      {active && (
        <Meta style={{ marginBottom: '1rem' }}>
          {active.title} · {active.credit}
        </Meta>
      )}
      <Grid>
        {GALLERY_PIECES.map((piece) => (
          <CardBtn
            key={piece.id}
            type="button"
            onClick={() => setActive(piece)}
            style={{
              borderColor:
                active && active.id === piece.id
                  ? 'rgba(255,110,199,0.65)'
                  : undefined,
            }}
          >
            <Cover>
              <img src={piece.image} alt="" />
            </Cover>
            <CardBody>
              <CardTitle>{piece.title}</CardTitle>
              <Meta>{piece.credit}</Meta>
            </CardBody>
          </CardBtn>
        ))}
      </Grid>
    </VerseSection>
  )
}

export default GalleryPanel
