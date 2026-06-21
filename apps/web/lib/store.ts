/**
 * @fileoverview Zustand global state store for Terraprint.
 *
 * Manages:
 *  - User profile and onboarding answers (used to compute baseline footprint)
 *  - FootprintRecord array (the user's emission history)
 *  - AI coach conversation history
 *
 * All state is persisted to localStorage via zustand/persist so that
 * users don't lose their data on page refresh during development.
 * In production, records are also synced to MongoDB via the API.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** The 4 top-level carbon emission categories used throughout the app. */
export type Category = 'food' | 'transport' | 'energy' | 'shopping';

/** Data source — determines the trust level and data quality of a record. */
export type Source = 'manual' | 'plaid' | 'utility_api' | 'scanner' | 'onboarding';

/**
 * A single carbon footprint record.
 * Represents one emission event (a flight, meal, energy bill, etc.)
 * with its CO₂ equivalent value calculated from DEFRA/EPA emission factors.
 */
export interface FootprintRecord {
  /** Unique record identifier */
  id: string;
  /** Top-level emission category */
  category: Category;
  /** Specific activity within the category (e.g. 'Gas Station', 'Beef') */
  subCategory: string;
  /** Carbon dioxide equivalent in kilograms */
  co2eKg: number;
  /** How this record was created */
  source: Source;
  /** Human-readable label shown in the dashboard */
  label: string;
  /** ISO 8601 date string (YYYY-MM-DD) */
  date: string;
  /** Spend amount in USD — populated for Plaid-sourced records */
  amount?: number;
}

/**
 * User's answers from the onboarding quiz.
 * These answers are used by `computeBaselineFootprint()` to estimate
 * the user's annual carbon footprint before any manual entries are logged.
 */
export interface OnboardingAnswers {
  dietType: 'vegan' | 'vegetarian' | 'flexitarian' | 'omnivore' | 'heavy_meat';
  transportMode: 'walk_bike' | 'public_transit' | 'hybrid_ev' | 'gas_car' | 'frequent_flyer';
  energySource: 'renewable' | 'mixed' | 'fossil';
  homeSqFt: 'small' | 'medium' | 'large';
  incomeBracket: 'under_30k' | '30_60k' | '60_100k' | '100_200k' | 'over_200k';
  regionCode: string;
}

/**
 * Authenticated user profile.
 * Extended with carbon-specific attributes (EV ownership, solar panels)
 * that affect emission factor selection and peer benchmarking.
 */
export interface UserProfile {
  /** MongoDB ObjectId as string */
  id: string;
  displayName: string;
  onboardingAnswers: OnboardingAnswers | null;
  /** Pre-calculated annual baseline in kg CO₂e (from onboarding) */
  baselineKgCo2ePerYear: number;
  /** Whether the user owns an EV — affects transport emission factors */
  hasEV: boolean;
  /** Whether the user has solar panels — affects energy emission factors */
  hasSolar: boolean;
  incomeBracket: string;
  regionCode: string;
}

/** Coach message shape for the AI conversation history */
export interface CoachMessage {
  role: 'user' | 'assistant';
  content: string;
  /** Unix timestamp in ms */
  ts: number;
}

interface AppState {
  user: UserProfile | null;
  records: FootprintRecord[];
  coachMessages: CoachMessage[];

  setUser: (user: UserProfile) => void;
  addRecord: (r: FootprintRecord) => void;
  addRecords: (rs: FootprintRecord[]) => void;
  removeRecord: (id: string) => void;
  addCoachMessage: (msg: Pick<CoachMessage, 'role' | 'content'>) => void;
  clearCoachMessages: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      records: [],
      coachMessages: [],

      setUser: (user) => set({ user }),
      addRecord: (r) => set((s) => ({ records: [r, ...s.records] })),
      addRecords: (rs) => set((s) => ({ records: [...rs, ...s.records] })),
      removeRecord: (id) => set((s) => ({ records: s.records.filter((r) => r.id !== id) })),
      addCoachMessage: (msg) =>
        set((s) => ({ coachMessages: [...s.coachMessages, { ...msg, ts: Date.now() }] })),
      clearCoachMessages: () => set({ coachMessages: [] }),
    }),
    { name: 'terraprint-store' }
  )
);
