'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Flame, Trophy, Star, Lock, Users } from 'lucide-react';
import { useGamification, ALL_BADGES, DEMO_LEADERBOARD } from '@/lib/gamification';

export default function LeaderboardPage() {
  const { streak, totalActionsCompleted, badges } = useGamification();
  const earned = badges.filter((b) => b.earnedAt);
  const locked = badges.filter((b) => !b.earnedAt);

  return (
    <div className="min-h-screen bg-surface px-4 py-10 max-w-3xl mx-auto">
      <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <div className="flex items-start gap-3 mb-8">
        <div className="w-10 h-10 bg-brand-500/15 rounded-xl flex items-center justify-center border border-brand-500/20">
          <Trophy className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black">Achievements & Leaderboard</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">Demo Data</span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">Opt-in · Privacy-first · Pseudonymous</p>
        </div>
      </div>

      {/* Streak + Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-4 text-center">
          <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <div className="text-3xl font-black">{streak}</div>
          <div className="text-xs text-slate-500">day streak</div>
        </div>
        <div className="glass-card p-4 text-center">
          <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-3xl font-black">{earned.length}</div>
          <div className="text-xs text-slate-500">badges earned</div>
        </div>
        <div className="glass-card p-4 text-center">
          <Trophy className="w-6 h-6 text-brand-400 mx-auto mb-2" />
          <div className="text-3xl font-black">{totalActionsCompleted}</div>
          <div className="text-xs text-slate-500">actions completed</div>
        </div>
      </div>

      {/* Badges */}
      <section className="mb-8">
        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" /> Your Badges
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ALL_BADGES.map((badge) => {
            const isEarned = !!badge.earnedAt;
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`glass-card p-4 text-center relative transition-all duration-200
                  ${isEarned ? 'border-brand-500/30 bg-brand-500/5' : 'opacity-40'}`}
              >
                {!isEarned && (
                  <Lock className="w-3 h-3 text-slate-600 absolute top-2 right-2" />
                )}
                <div className="text-3xl mb-2">{badge.emoji}</div>
                <div className="text-xs font-semibold text-white">{badge.name}</div>
                <div className="text-xs text-slate-500 mt-1 leading-snug">{badge.description}</div>
                {isEarned && (
                  <div className="text-xs text-brand-400 mt-1.5 font-medium">✓ Earned</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Leaderboard */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-400" /> Monthly Leaderboard (Demo)
          </h2>
          <span className="text-xs text-slate-500 bg-surface-muted px-2 py-1 rounded-full">Your neighbourhood · opt-in</span>
        </div>

        <div className="flex flex-col gap-2">
          {DEMO_LEADERBOARD.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all
                ${entry.isYou
                  ? 'bg-brand-500/10 border border-brand-500/30'
                  : 'bg-surface-card border border-surface-border'}`}
            >
              {/* Rank */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0
                ${i === 0 ? 'bg-yellow-400 text-black'
                : i === 1 ? 'bg-slate-400 text-black'
                : i === 2 ? 'bg-orange-600 text-white'
                : 'bg-surface-muted text-slate-400'}`}>
                {i + 1}
              </div>

              {/* Avatar + name */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xl">{entry.avatar}</span>
                <div>
                  <div className={`text-sm font-semibold ${entry.isYou ? 'text-brand-400' : 'text-white'}`}>
                    {entry.displayName} {entry.isYou && '(you)'}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>🔥 {entry.streak}d</span>
                    <span>⭐ {entry.badgeCount} badges</span>
                  </div>
                </div>
              </div>

              {/* CO2e */}
              <div className="text-right flex-shrink-0">
                <div className="font-black text-sm">{entry.co2eKgMonth.toLocaleString()} kg</div>
                <div className="text-xs text-slate-500">this month</div>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-slate-600 mt-4 text-center">
          Leaderboard uses display names only. Real names are never shared.
          Participation is opt-in and can be disabled in settings.
        </p>
      </section>
    </div>
  );
}
