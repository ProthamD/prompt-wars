import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  earnedAt: string | null; // ISO date or null if not yet earned
}

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  avatar: string;
  co2eKgMonth: number;
  streak: number;
  badgeCount: number;
  isYou?: boolean;
}

interface GamificationState {
  streak: number;           // consecutive days with activity
  lastActivityDate: string | null;
  totalActionsCompleted: number;
  badges: Badge[];
  completedActionIds: Set<string>;

  recordActivity: () => void;
  completeAction: (actionId: string) => void;
  getBadges: () => Badge[];
}

const ALL_BADGES: Badge[] = [
  { id: 'first_log',       emoji: '🌱', name: 'First Step',         description: 'Logged your first footprint entry',            earnedAt: null },
  { id: 'week_streak',     emoji: '🔥', name: 'On Fire',            description: '7-day logging streak',                         earnedAt: null },
  { id: 'first_action',    emoji: '⚡', name: 'Action Taker',       description: 'Completed your first marketplace action',       earnedAt: null },
  { id: 'carbon_neutral',  emoji: '🏆', name: 'Carbon Neutral Event', description: 'Cleared a carbon debt',                     earnedAt: null },
  { id: 'low_footprint',   emoji: '🌍', name: 'Climate Hero',       description: 'Monthly footprint below peer average',         earnedAt: null },
  { id: 'three_actions',   emoji: '🚀', name: 'Momentum',           description: 'Completed 3 marketplace actions',              earnedAt: null },
  { id: 'onboarded',       emoji: '🎯', name: 'Measured',           description: 'Completed your footprint assessment',          earnedAt: null },
  { id: 'month_streak',    emoji: '💎', name: 'Committed',          description: '30-day logging streak',                        earnedAt: null },
];

const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', displayName: 'Alex K.',     avatar: '🧑', co2eKgMonth: 780,  streak: 21, badgeCount: 5 },
  { id: '2', displayName: 'Priya M.',    avatar: '👩', co2eKgMonth: 840,  streak: 14, badgeCount: 4 },
  { id: '3', displayName: 'Sam R.',      avatar: '🧑', co2eKgMonth: 910,  streak: 9,  badgeCount: 3 },
  { id: '4', displayName: 'Jordan L.',   avatar: '👦', co2eKgMonth: 1050, streak: 7,  badgeCount: 2 },
  { id: '5', displayName: 'You',         avatar: '⭐', co2eKgMonth: 1094, streak: 3,  badgeCount: 2, isYou: true },
  { id: '6', displayName: 'Taylor B.',   avatar: '👩', co2eKgMonth: 1180, streak: 5,  badgeCount: 1 },
  { id: '7', displayName: 'Morgan C.',   avatar: '🧑', co2eKgMonth: 1340, streak: 2,  badgeCount: 1 },
];

export { ALL_BADGES, DEMO_LEADERBOARD };

export const useGamification = create<GamificationState>()(
  persist(
    (set, get) => ({
      streak: 3,
      lastActivityDate: new Date().toISOString().slice(0, 10),
      totalActionsCompleted: 1,
      badges: ALL_BADGES.map((b) =>
        b.id === 'onboarded' || b.id === 'first_log'
          ? { ...b, earnedAt: new Date().toISOString() }
          : b
      ),
      completedActionIds: new Set<string>(),

      recordActivity: () => {
        const today = new Date().toISOString().slice(0, 10);
        const { lastActivityDate, streak } = get();
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

        let newStreak = streak;
        if (lastActivityDate === yesterday) newStreak = streak + 1;
        else if (lastActivityDate !== today)  newStreak = 1;

        set({ streak: newStreak, lastActivityDate: today });

        // Award week streak badge
        if (newStreak >= 7) {
          get()._awardBadge('week_streak');
        }
        if (newStreak >= 30) {
          get()._awardBadge('month_streak');
        }
      },

      completeAction: (actionId: string) => {
        const { totalActionsCompleted, completedActionIds } = get();
        if (completedActionIds.has(actionId)) return;
        const newCount = totalActionsCompleted + 1;
        set({
          totalActionsCompleted: newCount,
          completedActionIds: new Set([...completedActionIds, actionId]),
        });
        get()._awardBadge('first_action');
        if (newCount >= 3) get()._awardBadge('three_actions');
      },

      getBadges: () => get().badges,

      // internal
      _awardBadge: (id: string) => {
        set((s) => ({
          badges: s.badges.map((b) =>
            b.id === id && !b.earnedAt ? { ...b, earnedAt: new Date().toISOString() } : b
          ),
        }));
      },
    } as any),
    { name: 'terraprint-gamification' }
  )
);
