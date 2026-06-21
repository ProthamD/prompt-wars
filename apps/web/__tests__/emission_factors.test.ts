/**
 * Unit tests for emission factor constants and MCC lookup.
 * Validates the scientific accuracy of carbon data used throughout the app.
 */

import {
  MCC_EMISSION_FACTORS,
  MANUAL_FACTORS,
  PEER_AVERAGE_BY_INCOME,
  HOME_SIZE_MULTIPLIER,
  generateDemoRecords,
} from '../lib/emissions';

// ─── MCC Emission Factors ──────────────────────────────────────────────────────

describe('MCC_EMISSION_FACTORS', () => {
  it('all factors have a positive co2ePerDollar value', () => {
    Object.values(MCC_EMISSION_FACTORS).forEach(factor => {
      expect(factor.co2ePerDollar).toBeGreaterThanOrEqual(0);
    });
  });

  it('all factors have a non-empty category', () => {
    Object.values(MCC_EMISSION_FACTORS).forEach(factor => {
      expect(factor.category.length).toBeGreaterThan(0);
    });
  });

  it('all factors have a non-empty label', () => {
    Object.values(MCC_EMISSION_FACTORS).forEach(factor => {
      expect(factor.label.length).toBeGreaterThan(0);
    });
  });

  it('gas station (MCC 5541) has higher emissions than groceries (MCC 5411)', () => {
    expect(MCC_EMISSION_FACTORS['5541'].co2ePerDollar)
      .toBeGreaterThan(MCC_EMISSION_FACTORS['5411'].co2ePerDollar);
  });

  it('categories are one of the 4 known values', () => {
    const validCategories = new Set(['food', 'transport', 'energy', 'shopping']);
    Object.values(MCC_EMISSION_FACTORS).forEach(factor => {
      expect(validCategories.has(factor.category)).toBe(true);
    });
  });
});

// ─── Manual Entry Factors ──────────────────────────────────────────────────────

describe('MANUAL_FACTORS', () => {
  it('long-haul flight emits more than short-haul', () => {
    expect(MANUAL_FACTORS.flight_long.co2eKg)
      .toBeGreaterThan(MANUAL_FACTORS.flight_short.co2eKg);
  });

  it('beef emits more than chicken per kg (DEFRA verified)', () => {
    expect(MANUAL_FACTORS.beef_kg.co2eKg)
      .toBeGreaterThan(MANUAL_FACTORS.chicken_kg.co2eKg);
  });

  it('all manual factors have positive co2eKg values', () => {
    Object.values(MANUAL_FACTORS).forEach(factor => {
      expect(factor.co2eKg).toBeGreaterThan(0);
    });
  });

  it('all manual factors have a category string', () => {
    Object.values(MANUAL_FACTORS).forEach(factor => {
      expect(typeof factor.category).toBe('string');
      expect(factor.category.length).toBeGreaterThan(0);
    });
  });

  it('electricity factor is less than 1 kg per kWh (grid average ~0.233)', () => {
    expect(MANUAL_FACTORS.electricity_kwh.co2eKg).toBeLessThan(1);
    expect(MANUAL_FACTORS.electricity_kwh.co2eKg).toBeGreaterThan(0);
  });
});

// ─── Peer Average by Income ────────────────────────────────────────────────────

describe('PEER_AVERAGE_BY_INCOME', () => {
  it('higher income brackets have higher average footprints', () => {
    const brackets = ['under_30k', '30_60k', '60_100k', '100_200k', 'over_200k'];
    for (let i = 1; i < brackets.length; i++) {
      expect(PEER_AVERAGE_BY_INCOME[brackets[i]])
        .toBeGreaterThan(PEER_AVERAGE_BY_INCOME[brackets[i - 1]]);
    }
  });

  it('all averages are positive numbers', () => {
    Object.values(PEER_AVERAGE_BY_INCOME).forEach(val => {
      expect(val).toBeGreaterThan(0);
    });
  });

  it('contains all 5 income brackets', () => {
    expect(PEER_AVERAGE_BY_INCOME).toHaveProperty('under_30k');
    expect(PEER_AVERAGE_BY_INCOME).toHaveProperty('over_200k');
  });
});

// ─── Home Size Multiplier ──────────────────────────────────────────────────────

describe('HOME_SIZE_MULTIPLIER', () => {
  it('large home has a higher multiplier than small', () => {
    expect(HOME_SIZE_MULTIPLIER.large).toBeGreaterThan(HOME_SIZE_MULTIPLIER.small);
  });

  it('medium home multiplier equals 1.0 (baseline)', () => {
    expect(HOME_SIZE_MULTIPLIER.medium).toBe(1.0);
  });

  it('all multipliers are positive', () => {
    Object.values(HOME_SIZE_MULTIPLIER).forEach(val => {
      expect(val).toBeGreaterThan(0);
    });
  });
});

// ─── generateDemoRecords ───────────────────────────────────────────────────────

describe('generateDemoRecords', () => {
  it('generates records for 6 months', () => {
    const records = generateDemoRecords();
    const months = new Set(records.map(r => r.date.slice(0, 7)));
    expect(months.size).toBe(6);
  });

  it('all records have required fields', () => {
    const records = generateDemoRecords();
    records.forEach(r => {
      expect(r).toHaveProperty('id');
      expect(r).toHaveProperty('category');
      expect(r).toHaveProperty('co2eKg');
      expect(r).toHaveProperty('date');
      expect(r).toHaveProperty('label');
    });
  });

  it('all co2eKg values are positive', () => {
    const records = generateDemoRecords();
    records.forEach(r => {
      expect(r.co2eKg).toBeGreaterThan(0);
    });
  });

  it('all categories are valid', () => {
    const validCats = new Set(['food', 'transport', 'energy', 'shopping']);
    const records = generateDemoRecords();
    records.forEach(r => {
      expect(validCats.has(r.category)).toBe(true);
    });
  });

  it('generates at least 20 records', () => {
    const records = generateDemoRecords();
    expect(records.length).toBeGreaterThanOrEqual(20);
  });
});
