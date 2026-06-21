import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Category = 'food' | 'transport' | 'energy' | 'shopping';
export type Source = 'manual' | 'plaid' | 'utility_api' | 'scanner' | 'onboarding';

export interface FootprintRecord {
  id: string;
  category: Category;
  subCategory: string;
  co2eKg: number;
  source: Source;
  label: string;
  date: string; // ISO date string
  amount?: number; // spend in USD if applicable
}

export interface OnboardingAnswers {
  dietType: 'vegan' | 'vegetarian' | 'flexitarian' | 'omnivore' | 'heavy_meat';
  transportMode: 'walk_bike' | 'public_transit' | 'hybrid_ev' | 'gas_car' | 'frequent_flyer';
  energySource: 'renewable' | 'mixed' | 'fossil';
  homeSqFt: 'small' | 'medium' | 'large';
  incomeBracket: 'under_30k' | '30_60k' | '60_100k' | '100_200k' | 'over_200k';
  regionCode: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  onboardingAnswers: OnboardingAnswers | null;
  baselineKgCo2ePerYear: number;
  hasEV: boolean;
  hasSolar: boolean;
  incomeBracket: string;
  regionCode: string;
}

interface AppState {
  user: UserProfile | null;
  records: FootprintRecord[];
  coachMessages: { role: 'user' | 'assistant'; content: string; ts: number }[];

  setUser: (user: UserProfile) => void;
  addRecord: (r: FootprintRecord) => void;
  addRecords: (rs: FootprintRecord[]) => void;
  removeRecord: (id: string) => void;
  addCoachMessage: (msg: { role: 'user' | 'assistant'; content: string }) => void;
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
