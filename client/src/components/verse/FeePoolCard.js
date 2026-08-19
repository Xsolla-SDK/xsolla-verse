import React from 'react'
import { Meta, SubTitle, Title } from './verseUi'

const FeePoolCard = ({ pool, compact }) => {
  if (!pool) {
    return compact ? null : <Meta>No table fees yet this session.</Meta>
  }
  const total = Number(pool.totalXsolla) || 0
  const share = Number(pool.stakerShareXsolla) || 0
  const rakeBps = Number(pool.rakeBps) || 500
  if (compact) {
    if (total <= 0) return null
    return (
      <Meta>
        Fee pool {total.toFixed(3)} XSOLLA · stakers {share.toFixed(3)} (
        {(Number(pool.stakerBps) || 3000) / 100}%)
      </Meta>
    )
  }
  return (
    <>
      <Title>Fee pool</Title>
      <Meta>
        Cash rake {rakeBps / 100}% of pot (cap 3 BB). Sit & Go fee{' '}
        {(Number(pool.sngFeeBps) || 1000) / 100}% of buy-in. Stakers get 30% of
        this session pool — not minted XSOLLA.
      </Meta>
      <SubTitle>This session</SubTitle>
      <Meta>Table rake: {Number(pool.rakeChips || 0).toLocaleString()} chips</Meta>
      <Meta>
        Tournament fees: {Number(pool.tourneyChips || 0).toLocaleString()} chips
      </Meta>
      <Meta>≈ {total.toFixed(4)} XSOLLA · staker share {share.toFixed(4)} XSOLLA</Meta>
    </>
  )
}

export default FeePoolCard
