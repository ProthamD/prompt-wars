/**
 * Unit tests for gamification logic in lib/gamification.ts
 * Tests badge definitions and leaderboard data.
 */

import { ALL_BADGES, DEMO_LEADERBOARD } from '../lib/gamification';

// ─── Badge Definitions ─────────────────────────────────────────────────────────

describe('ALL_BADGES', () => {
  it('contains at least 5 badges', () => {
    expect(ALL_BADGES.length).toBeGreaterThanOrEqual(5);
  });

  it('each badge has required fields', () => {
    ALL_BADGES.forEach(badge => {
      expect(badge).toHaveProperty('id');
      expect(badge).toHaveProperty('name');
      expect(badge).toHaveProperty('emoji');
      expect(badge).toHaveProperty('description');
      expect(badge).toHaveProperty('earnedAt');
    });
  });

  it('all badge ids are unique', () => {
    const ids = ALL_BADGES.map(b => b.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all badges start unearned (earnedAt is null)', () => {
    ALL_BADGES.forEach(badge => {
      expect(badge.earnedAt).toBeNull();
    });
  });

  it('badge names are non-empty strings', () => {
    ALL_BADGES.forEach(badge => {
      expect(typeof badge.name).toBe('string');
      expect(badge.name.length).toBeGreaterThan(0);
    });
  });

  it('badge descriptions are meaningful (>10 chars)', () => {
    ALL_BADGES.forEach(badge => {
      expect(badge.description.length).toBeGreaterThan(10);
    });
  });

  it('contains the first_log badge', () => {
    const badge = ALL_BADGES.find(b => b.id === 'first_log');
    expect(badge).toBeDefined();
  });

  it('contains the week_streak badge', () => {
    const badge = ALL_BADGES.find(b => b.id === 'week_streak');
    expect(badge).toBeDefined();
  });

  it('contains the onboarded badge', () => {
    const badge = ALL_BADGES.find(b => b.id === 'onboarded');
    expect(badge).toBeDefined();
  });
});

// ─── Leaderboard Data ──────────────────────────────────────────────────────────

describe('DEMO_LEADERBOARD', () => {
  it('contains at least 5 entries', () => {
    expect(DEMO_LEADERBOARD.length).toBeGreaterThanOrEqual(5);
  });

  it('each entry has required fields', () => {
    DEMO_LEADERBOARD.forEach(entry => {
      expect(entry).toHaveProperty('id');
      expect(entry).toHaveProperty('displayName');
      expect(entry).toHaveProperty('co2eKgMonth');
      expect(entry).toHaveProperty('streak');
      expect(entry).toHaveProperty('badgeCount');
    });
  });

  it('all leaderboard ids are unique', () => {
    const ids = DEMO_LEADERBOARD.map(e => e.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('co2eKgMonth is a positive number for all entries', () => {
    DEMO_LEADERBOARD.forEach(entry => {
      expect(entry.co2eKgMonth).toBeGreaterThan(0);
    });
  });

  it('streak is non-negative for all entries', () => {
    DEMO_LEADERBOARD.forEach(entry => {
      expect(entry.streak).toBeGreaterThanOrEqual(0);
    });
  });

  it('exactly one entry is marked isYou', () => {
    const youEntries = DEMO_LEADERBOARD.filter(e => e.isYou === true);
    expect(youEntries).toHaveLength(1);
  });

  it('leaderboard has at least one display name that is a non-empty string', () => {
    DEMO_LEADERBOARD.forEach(entry => {
      expect(typeof entry.displayName).toBe('string');
      expect(entry.displayName.length).toBeGreaterThan(0);
    });
  });
});
