/**
 * Unit tests for lib/emissions.ts
 * Tests all pure calculation functions using verified emission factors.
 */

import {
  computeBaselineFootprint,
  getMonthlyRecords,
  getCategoryTotals,
  co2eToTrees,
  co2eToFlights,
  co2eToDrivingKm,
  peerPercentile,
  DIET_KG_PER_YEAR,
  TRANSPORT_KG_PER_YEAR,
  ENERGY_KG_PER_YEAR,
} from '../lib/emissions';

// ─── computeBaselineFootprint ──────────────────────────────────────────────────

describe('computeBaselineFootprint', () => {
  it('calculates correctly for a vegan who walks and uses renewable energy', () => {
    const result = computeBaselineFootprint({
      dietType: 'vegan',
      transportMode: 'walk_bike',
      energySource: 'renewable',
      homeSqFt: 'medium',
    });
    // 1500 + 100 + 400 * 1.0 = 2000
    expect(result).toBe(2000);
  });

  it('calculates correctly for a heavy meat eater who flies and uses fossil fuel', () => {
    const result = computeBaselineFootprint({
      dietType: 'heavy_meat',
      transportMode: 'frequent_flyer',
      energySource: 'fossil',
      homeSqFt: 'large',
    });
    // 3300 + 6000 + 2400 * 1.5 = 12900
    expect(result).toBe(12900);
  });

  it('applies home size multiplier to energy only', () => {
    const small = computeBaselineFootprint({
      dietType: 'omnivore',
      transportMode: 'gas_car',
      energySource: 'mixed',
      homeSqFt: 'small',
    });
    const large = computeBaselineFootprint({
      dietType: 'omnivore',
      transportMode: 'gas_car',
      energySource: 'mixed',
      homeSqFt: 'large',
    });
    // Only energy differs: small = 1200*0.7=840, large = 1200*1.5=1800 → diff=960
    expect(large - small).toBe(960);
  });

  it('returns a number', () => {
    const result = computeBaselineFootprint({
      dietType: 'vegetarian',
      transportMode: 'public_transit',
      energySource: 'mixed',
      homeSqFt: 'medium',
    });
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });
});

// ─── getMonthlyRecords ─────────────────────────────────────────────────────────

describe('getMonthlyRecords', () => {
  it('returns 6 months by default', () => {
    const result = getMonthlyRecords([]);
    expect(result).toHaveLength(6);
  });

  it('returns 3 months when specified', () => {
    const result = getMonthlyRecords([], 3);
    expect(result).toHaveLength(3);
  });

  it('sums records in the correct month bucket', () => {
    const today = new Date();
    const thisMonth = today.toISOString().slice(0, 7);
    const records = [
      { date: `${thisMonth}-05`, co2eKg: 10 },
      { date: `${thisMonth}-15`, co2eKg: 20 },
    ];
    const result = getMonthlyRecords(records, 6);
    const currentMonthEntry = result.find(r => r.month === thisMonth);
    expect(currentMonthEntry?.co2eKg).toBe(30);
  });

  it('ignores records outside the window', () => {
    const result = getMonthlyRecords([
      { date: '2000-01-01', co2eKg: 9999 },
    ], 6);
    const total = result.reduce((sum, r) => sum + r.co2eKg, 0);
    expect(total).toBe(0);
  });
});

// ─── getCategoryTotals ─────────────────────────────────────────────────────────

describe('getCategoryTotals', () => {
  it('sums correctly by category', () => {
    const records = [
      { category: 'food', co2eKg: 10 },
      { category: 'food', co2eKg: 5 },
      { category: 'transport', co2eKg: 20 },
    ];
    const result = getCategoryTotals(records);
    const food = result.find(r => r.category === 'food');
    const transport = result.find(r => r.category === 'transport');
    expect(food?.co2eKg).toBe(15);
    expect(transport?.co2eKg).toBe(20);
  });

  it('returns all 4 categories even with empty data', () => {
    const result = getCategoryTotals([]);
    expect(result).toHaveLength(4);
  });
});

// ─── Conversion helpers ────────────────────────────────────────────────────────

describe('co2eToTrees', () => {
  it('converts kg to tree equivalents', () => {
    expect(co2eToTrees(21)).toBe(1);
    expect(co2eToTrees(210)).toBe(10);
  });

  it('rounds to nearest integer', () => {
    expect(typeof co2eToTrees(100)).toBe('number');
    expect(Number.isInteger(co2eToTrees(100))).toBe(true);
  });
});

describe('co2eToFlights', () => {
  it('converts kg to flight equivalents', () => {
    expect(co2eToFlights(1100)).toBe(1);
  });
});

describe('co2eToDrivingKm', () => {
  it('converts kg to km equivalent', () => {
    expect(co2eToDrivingKm(184)).toBe(1000);
  });
});

// ─── peerPercentile ────────────────────────────────────────────────────────────

describe('peerPercentile', () => {
  it('returns a number between 1 and 99', () => {
    const p = peerPercentile(9000, '60_100k');
    expect(p).toBeGreaterThanOrEqual(1);
    expect(p).toBeLessThanOrEqual(99);
  });

  it('high footprint yields high percentile', () => {
    const high = peerPercentile(20000, '60_100k');
    const low = peerPercentile(1000, '60_100k');
    expect(high).toBeGreaterThan(low);
  });

  it('uses fallback for unknown bracket', () => {
    const result = peerPercentile(9000, 'unknown_bracket');
    expect(typeof result).toBe('number');
  });
});

// ─── Emission factor tables ────────────────────────────────────────────────────

describe('Emission factor tables', () => {
  it('all diet types have positive emission factors', () => {
    Object.values(DIET_KG_PER_YEAR).forEach(val => {
      expect(val).toBeGreaterThan(0);
    });
  });

  it('all transport modes have non-negative emission factors', () => {
    Object.values(TRANSPORT_KG_PER_YEAR).forEach(val => {
      expect(val).toBeGreaterThanOrEqual(0);
    });
  });

  it('vegan has lower emissions than heavy_meat', () => {
    expect(DIET_KG_PER_YEAR.vegan).toBeLessThan(DIET_KG_PER_YEAR.heavy_meat);
  });

  it('walk_bike has lower emissions than frequent_flyer', () => {
    expect(TRANSPORT_KG_PER_YEAR.walk_bike).toBeLessThan(TRANSPORT_KG_PER_YEAR.frequent_flyer);
  });
});
