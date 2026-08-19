const config = require('../config');

const RAKE_BPS = Number(config.RAKE_BPS || 500);
const RAKE_DISCOUNT_BPS = Number(config.RAKE_DISCOUNT_BPS || 450);
const RAKE_CAP_BB = Number(config.RAKE_CAP_BB || 3);
const TIER3_XSOLLA = Number(config.STAKE_TIER3 || 2000);

function hasRakeDiscount(player) {
  if (!player || player.isBot) return false;
  if (player.hasRakeCharm) return true;
  return Number(player.stakedXsolla || 0) >= TIER3_XSOLLA;
}

function seatsHaveRakeDiscount(seats = []) {
  return seats.some((seat) => seat && hasRakeDiscount(seat.player));
}

/**
 * Cash-game rake: 5% of amount (4.5% with discount), capped at 3 big blinds per hand.
 */
function computePotRake(amount, table, opts = {}) {
  const pot = Number(amount) || 0;
  if (pot <= 0) return 0;
  const bb = Number(
    (table && (table.bigBlind || (table.minBet != null ? table.minBet * 2 : 0))) ||
      50,
  );
  const discount = !!opts.discount;
  const bps = discount ? RAKE_DISCOUNT_BPS : RAKE_BPS;
  const cap = Math.max(0, bb * RAKE_CAP_BB);
  const already = Number(opts.alreadyTaken) || 0;
  const remainingCap = Math.max(0, cap - already);
  let rake = Math.floor((pot * bps) / 10000);
  if (rake > remainingCap) rake = remainingCap;
  if (rake >= pot) rake = 0;
  return rake;
}

function tournamentFee(buyIn, type, opts = {}) {
  let bps =
    type === 'mtt'
      ? Number(config.MTT_FEE_BPS || 800)
      : Number(config.SNG_FEE_BPS || 1000);
  if (opts.discount) {
    bps = Math.floor((bps * RAKE_DISCOUNT_BPS) / RAKE_BPS);
  }
  const fee = Math.floor((Number(buyIn) * bps) / 10000);
  return { fee, net: Number(buyIn) - fee, bps };
}

module.exports = {
  RAKE_BPS,
  RAKE_DISCOUNT_BPS,
  computePotRake,
  hasRakeDiscount,
  seatsHaveRakeDiscount,
  tournamentFee,
};
