import React from 'react'
import styled from 'styled-components'

const TONE = {
  bronze: {
    disc: 'linear-gradient(160deg, #e2a56a 0%, #c47a3a 42%, #8a4e1e 100%)',
    rim: '#f3d0a8',
    ring: '#7a3f14',
  },
  silver: {
    disc: 'linear-gradient(160deg, #f2f6fa 0%, #9aadc2 45%, #6d8296 100%)',
    rim: '#eef3f8',
    ring: '#5a6d80',
  },
  gold: {
    disc: 'linear-gradient(160deg, #ffe9a0 0%, #e0b33a 42%, #b07a12 100%)',
    rim: '#fff1b6',
    ring: '#8a5c0a',
  },
}

const EMOJI = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
}

const StakeMedalIcon = ({ tone = 'bronze', size = 72 }) => {
  const c = TONE[tone] || TONE.bronze
  const px = Number(size) || 72
  return (
    <Wrap $size={px} role="img" aria-label={`${tone} medal`}>
      <Ribbon $left />
      <Ribbon />
      <Disc $disc={c.disc} $rim={c.rim} $ring={c.ring} $size={px}>
        <Glyph aria-hidden="true">{EMOJI[tone] || EMOJI.bronze}</Glyph>
      </Disc>
    </Wrap>
  )
}

const Wrap = styled.span`
  position: relative;
  display: block;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size + 10}px;
  min-width: ${(p) => p.$size}px;
  min-height: ${(p) => p.$size + 10}px;
  flex-shrink: 0;
  overflow: visible;
`

const Ribbon = styled.span`
  position: absolute;
  top: 0;
  left: ${(p) => (p.$left ? '18%' : 'auto')};
  right: ${(p) => (p.$left ? 'auto' : '18%')};
  width: 18%;
  height: 34%;
  background: ${(p) => (p.$left ? '#c45c6a' : '#8e3d52')};
  clip-path: ${(p) =>
    p.$left ? 'polygon(0 0, 100% 0, 70% 100%, 0 78%)' : 'polygon(0 0, 100% 0, 100% 78%, 30% 100%)'};
  z-index: 0;
`

const Disc = styled.span`
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 1;
  display: grid;
  place-items: center;
  width: ${(p) => Math.round(p.$size * 0.78)}px;
  height: ${(p) => Math.round(p.$size * 0.78)}px;
  margin-left: ${(p) => -Math.round(p.$size * 0.39)}px;
  border-radius: 50%;
  background: ${(p) => p.$disc};
  border: 3px solid ${(p) => p.$rim};
  box-shadow:
    0 0 0 2px ${(p) => p.$ring},
    0 8px 18px rgba(0, 0, 0, 0.35);
`

const Glyph = styled.span`
  font-size: 1.85rem;
  line-height: 1;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.35));
`

export default StakeMedalIcon
