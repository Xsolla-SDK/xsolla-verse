import React, { useContext, useState } from 'react'
import locaContext from '../../context/localization/locaContext'
import verseContext from '../../context/verse/verseContext'
import { SUPPORT_FAQ } from '../../contracts/hubCatalog'
import {
  Card,
  CardBody,
  CardTitle,
  Input,
  Lead,
  Meta,
  Primary,
  Row,
  SubTitle,
  TextArea,
  Title,
  VerseSection,
} from './verseUi'

const REPLIES = [
  'Logged. A Xsolla player-support agent would pick this up in under a minute in production.',
  'Thanks — for wallet or shop issues, also check Profile → Refresh balances.',
  'Noted. Localization and LQA requests route to the Academy / studio services team.',
]

const SupportPanel = () => {
  const { t } = useContext(locaContext)
  const { demo, addTicket } = useContext(verseContext)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return
    const reply = REPLIES[(demo.tickets || []).length % REPLIES.length]
    addTicket({
      subject: subject.trim(),
      message: message.trim(),
      reply,
    })
    setSubject('')
    setMessage('')
  }

  return (
    <VerseSection>
      <Title>{t('support.title')}</Title>
      <Lead>{t('support.lead')}</Lead>

      <SubTitle>{t('support.faq')}</SubTitle>
      {SUPPORT_FAQ.map((item) => (
        <Card key={item.q} style={{ marginBottom: '0.65rem' }}>
          <CardBody>
            <CardTitle>{item.q}</CardTitle>
            <Meta>{item.a}</Meta>
          </CardBody>
        </Card>
      ))}

      <SubTitle>{t('support.ticket')}</SubTitle>
      <form onSubmit={submit}>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={t('support.subject')}
          aria-label={t('support.subject')}
        />
        <div style={{ height: '0.55rem' }} />
        <TextArea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('support.message')}
          aria-label={t('support.message')}
        />
        <Row>
          <Primary type="submit">{t('support.submit')}</Primary>
        </Row>
      </form>

      {(demo.tickets || []).map((ticket, i) => (
        <Card key={`${ticket.at}-${i}`} style={{ marginTop: '0.75rem' }}>
          <CardBody>
            <CardTitle>{ticket.subject}</CardTitle>
            <Meta>{ticket.message}</Meta>
            <Meta style={{ marginTop: '0.65rem' }}>
              {t('support.reply')}: {ticket.reply}
            </Meta>
          </CardBody>
        </Card>
      ))}
    </VerseSection>
  )
}

export default SupportPanel
