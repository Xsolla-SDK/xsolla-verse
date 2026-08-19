import React from 'react'
import PropTypes from 'prop-types'

const CoinIcon = ({ width, height }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 38 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="19" cy="19" r="18" fill="#FFD36A" stroke="#FFF1B6" strokeWidth="2" />
    <circle cx="19" cy="19" r="14" fill="#E6A93F" stroke="#B97821" strokeWidth="1.5" />
    <text
      x="19"
      y="25"
      textAnchor="middle"
      fill="#28140A"
      fontFamily="Arial, sans-serif"
      fontSize="18"
      fontWeight="900"
    >
      G
    </text>
  </svg>
)

CoinIcon.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
}

CoinIcon.defaultProps = {
  width: '22',
  height: '22',
}

export default CoinIcon
