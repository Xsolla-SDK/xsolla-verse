const {
  computePotRake,
  tournamentFee,
  hasRakeDiscount,
} = require('../rake');

describe('rake helpers', () => {
  test('cash rake is 5% capped at 3 BB', () => {
    const table = { bigBlind: 100 };
    expect(computePotRake(10000, table)).toBe(300);
    expect(computePotRake(1000, table)).toBe(50);
    expect(computePotRake(1000, table, { discount: true })).toBe(45);
  });

  test('Gold stake or Rake Charm discounts fees', () => {
    expect(hasRakeDiscount({ hasRakeCharm: true })).toBe(true);
    expect(hasRakeDiscount({ stakedXsolla: 2000 })).toBe(true);
    expect(hasRakeDiscount({ stakedXsolla: 500 })).toBe(false);
    expect(tournamentFee(1000, 'sng').fee).toBe(100);
    expect(tournamentFee(1000, 'sng', { discount: true }).fee).toBe(90);
    expect(tournamentFee(1000, 'mtt').fee).toBe(80);
    expect(tournamentFee(1000, 'mtt', { discount: true }).fee).toBe(72);
  });
});
