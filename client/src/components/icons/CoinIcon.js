import React from 'react'
import PropTypes from 'prop-types'

const CoinIcon = ({ width = 22, height = 22 }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 38 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    style={{
      width: Number(width) || 22,
      height: Number(height) || 22,
      flexShrink: 0,
      display: 'block',
    }}
  >
    <circle cx="19" cy="19" r="18" fill="#FFD36A" stroke="#FFF1B6" strokeWidth="2" />
    <circle cx="19" cy="19" r="14" fill="#E6A93F" stroke="#B97821" strokeWidth="1.5" />
    <circle cx="19" cy="19" r="6.2" fill="none" stroke="#28140A" strokeWidth="2.2" />
  </svg>
)

CoinIcon.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default CoinIcon
