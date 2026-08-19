import React from 'react'
import dealer from './../../assets/game/dealer.png'
import holdemDealer from '../../assets/shop/holdem-dealer.png'

const DealerButton = ({ gold }) => (
  <img className="dealer-img" src={gold ? holdemDealer : dealer} alt="" />
)

export default DealerButton;
