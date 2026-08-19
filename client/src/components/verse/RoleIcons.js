import React from 'react'

const Svg = ({ children, glow }) => (
  <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
    <defs>
      <filter id={glow} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="2.4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {children}
  </svg>
)

export const OperatorIcon = () => (
  <Svg glow="opGlow">
    <g filter="url(#opGlow)" fill="none" stroke="#ffe27a" strokeWidth="2.4">
      <path d="M32 6 L54 16 V34 C54 48 32 58 32 58 C32 58 10 48 10 34 V16 Z" fill="rgba(255,226,122,0.12)" />
      <circle cx="32" cy="30" r="8" fill="rgba(255,226,122,0.28)" />
      <path d="M32 22 V18 M32 38 V42 M24 30 H20 M40 30 H44" strokeLinecap="round" />
      <path d="M32 26 L35 30 L32 34 L29 30 Z" fill="#ffe27a" stroke="none" />
    </g>
  </Svg>
)

export const StudioIcon = () => (
  <Svg glow="stGlow">
    <g filter="url(#stGlow)" fill="none" stroke="#ff6ec7" strokeWidth="2.4">
      <rect x="10" y="22" width="44" height="30" rx="4" fill="rgba(255,110,199,0.14)" />
      <path d="M10 22 L18 10 H46 L54 22" fill="rgba(255,110,199,0.28)" />
      <path d="M18 10 L22 22 M30 10 L34 22 M42 10 L46 22" />
      <path d="M28 32 L42 39 L28 46 Z" fill="#ff6ec7" stroke="none" />
    </g>
  </Svg>
)

export const PlayerIcon = () => (
  <Svg glow="plGlow">
    <g filter="url(#plGlow)" fill="none" stroke="#80eaff" strokeWidth="2.4">
      <path
        d="M14 28 C14 20 20 16 32 16 C44 16 50 20 50 28 L54 40 C54 46 48 50 42 50 H22 C16 50 10 46 10 40 Z"
        fill="rgba(128,234,255,0.14)"
      />
      <circle cx="22" cy="36" r="3.2" fill="#80eaff" stroke="none" />
      <circle cx="42" cy="34" r="2.2" fill="#ff6ec7" stroke="none" />
      <circle cx="46" cy="38" r="2.2" fill="#ffe27a" stroke="none" />
      <path d="M20 32 H24 M22 30 V34" strokeLinecap="round" />
    </g>
  </Svg>
)

export const GuestIcon = () => (
  <Svg glow="guGlow">
    <g filter="url(#guGlow)" fill="none" stroke="#e8ddff" strokeWidth="2.4">
      <circle cx="32" cy="32" r="22" fill="rgba(232,221,255,0.1)" />
      <ellipse cx="32" cy="32" rx="16" ry="8" />
      <circle cx="32" cy="32" r="5" fill="rgba(232,221,255,0.35)" />
      <circle cx="32" cy="32" r="2.4" fill="#e8ddff" stroke="none" />
      <path d="M32 10 V18 M32 46 V54 M10 32 H18 M46 32 H54" strokeLinecap="round" />
    </g>
  </Svg>
)
