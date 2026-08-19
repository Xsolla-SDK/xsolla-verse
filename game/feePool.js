const config = require('../config');

function createFeePool() {
  return {
    rakeChips: 0,
    tourneyChips: 0,
    shopXsolla: 0,
    addRake(chips) {
      this.rakeChips += Number(chips) || 0;
    },
    addTourney(chips) {
      this.tourneyChips += Number(chips) || 0;
    },
    snapshot() {
      const per = Number(config.CHIPS_PER_XSOLLA || 1000);
      const rakeXsolla = this.rakeChips / per;
      const tourneyXsolla = this.tourneyChips / per;
      const tableXsolla = rakeXsolla + tourneyXsolla;
      const totalXsolla = tableXsolla + Number(this.shopXsolla || 0);
      const stakerBps = Number(config.STAKER_SHARE_BPS || 3000);
      return {
        rakeChips: this.rakeChips,
        tourneyChips: this.tourneyChips,
        shopXsolla: Number(this.shopXsolla || 0),
        tableXsolla,
        totalXsolla,
        stakerBps,
        stakerShareXsolla: (totalXsolla * stakerBps) / 10000,
        rakeBps: Number(config.RAKE_BPS || 500),
        sngFeeBps: Number(config.SNG_FEE_BPS || 1000),
        mttFeeBps: Number(config.MTT_FEE_BPS || 800),
      };
    },
  };
}

module.exports = { createFeePool };
