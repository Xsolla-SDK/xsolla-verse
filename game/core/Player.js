class Player {
  constructor(socketId, playerId, playerName, chipsAmount, options = {}) {
    this.socketId = socketId;
    this.id = playerId;
    this.name = playerName;
    this.bankroll = chipsAmount;
    this.isBot = !!options.isBot;
    this.stakedXsolla = Number(options.stakedXsolla) || 0;
    this.hasRakeCharm = !!options.hasRakeCharm;
  }

  setEconomy(payload = {}) {
    if (payload.stakedXsolla != null) this.stakedXsolla = Number(payload.stakedXsolla) || 0;
    if (payload.hasRakeCharm != null) this.hasRakeCharm = !!payload.hasRakeCharm;
  }
}

module.exports = Player;
