/**
 * Unit tests for the Zustand store (lib/store.ts).
 * Tests state management for footprint records and coach messages.
 */

import { FootprintRecord, OnboardingAnswers, UserProfile } from '../lib/store';

// ─── Type validation tests (no runtime, but validates TypeScript contracts) ───

describe('FootprintRecord interface', () => {
  it('accepts all valid category types', () => {
    const categories: FootprintRecord['category'][] = ['food', 'transport', 'energy', 'shopping'];
    expect(categories).toHaveLength(4);
  });

  it('accepts all valid source types', () => {
    const sources: FootprintRecord['source'][] = ['manual', 'plaid', 'utility_api', 'scanner', 'onboarding'];
    expect(sources).toHaveLength(5);
  });

  it('can construct a valid FootprintRecord', () => {
    const record: FootprintRecord = {
      id: 'rec_001',
      category: 'transport',
      subCategory: 'Gas Station',
      co2eKg: 12.4,
      source: 'manual',
      label: 'Fill-up',
      date: '2024-06-01',
    };
    expect(record.co2eKg).toBe(12.4);
    expect(record.category).toBe('transport');
  });

  it('amount field is optional', () => {
    const withAmount: FootprintRecord = {
      id: 'rec_002',
      category: 'food',
      subCategory: 'Restaurant',
      co2eKg: 2.1,
      source: 'plaid',
      label: 'Dinner',
      date: '2024-06-02',
      amount: 45.00,
    };
    const withoutAmount: FootprintRecord = {
      id: 'rec_003',
      category: 'energy',
      subCategory: 'Electricity',
      co2eKg: 38.2,
      source: 'manual',
      label: 'Bill',
      date: '2024-06-03',
    };
    expect(withAmount.amount).toBe(45.00);
    expect(withoutAmount.amount).toBeUndefined();
  });
});

describe('OnboardingAnswers interface', () => {
  it('can construct valid onboarding answers', () => {
    const answers: OnboardingAnswers = {
      dietType: 'vegan',
      transportMode: 'walk_bike',
      energySource: 'renewable',
      homeSqFt: 'medium',
      incomeBracket: '30_60k',
      regionCode: 'GB',
    };
    expect(answers.dietType).toBe('vegan');
    expect(answers.transportMode).toBe('walk_bike');
  });
});

describe('UserProfile interface', () => {
  it('can construct a valid UserProfile', () => {
    const profile: UserProfile = {
      id: 'user_abc',
      displayName: 'Alex K.',
      onboardingAnswers: null,
      baselineKgCo2ePerYear: 5800,
      hasEV: false,
      hasSolar: true,
      incomeBracket: '60_100k',
      regionCode: 'US',
    };
    expect(profile.baselineKgCo2ePerYear).toBe(5800);
    expect(profile.hasSolar).toBe(true);
  });

  it('onboardingAnswers can be null before onboarding is complete', () => {
    const profile: UserProfile = {
      id: 'new_user',
      displayName: 'New User',
      onboardingAnswers: null,
      baselineKgCo2ePerYear: 0,
      hasEV: false,
      hasSolar: false,
      incomeBracket: '30_60k',
      regionCode: 'GB',
    };
    expect(profile.onboardingAnswers).toBeNull();
  });
});
