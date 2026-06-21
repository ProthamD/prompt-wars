'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import {
  Leaf, TrendingDown, TrendingUp, Zap, ShoppingBag, Car, Flame,
  MessageCircle, ArrowRight, BarChart3, Clock, Plus, Trophy, SlidersHorizontal
} from 'lucide-react';
import { useStore } from '@/lib/store';
import {
  getMonthlyRecords, getCategoryTotals, co2eToTrees, co2eToFlights, peerPercentile,
  generateDemoRecords, PEER_AVERAGE_BY_INCOME
} from '@/lib/emissions';

const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string; gradient: string }> = {
  food:      { icon: <Flame className="w-4 h-4" />,      color: '#f97316', gradient: 'from-orange-500/20 to-orange-500/5' },
  transport: { icon: <Car className="w-4 h-4" />,        color: '#3b82f6', gradient: 'from-blue-500/20 to-blue-500/5' },
  energy:    { icon: <Zap className="w-4 h-4" />,        color: '#eab308', gradient: 'from-yellow-500/20 to-yellow-500/5' },
  shopping:  { icon: <ShoppingBag className="w-4 h-4" />,color: '#a855f7', gradient: 'from-purple-500/20 to-purple-500/5' },
};

const TIPS = [
  { emoji: '⚡', title: 'Switch to a green energy tariff', saving: '1.2 tons CO₂e/yr', effort: 'Low', category: 'energy' },
  { emoji: '🌱', title: 'Cut red meat to 2x/week', saving: '0.5 tons CO₂e/yr', effort: 'Medium', category: 'food' },
  { emoji: '🚆', title: 'Replace 1 short flight with train', saving: '0.3 tons CO₂e', effort: 'Low', category: 'transport' },
  { emoji: '🛍️', title: 'Buy second-hand for next clothing purchase', saving: '0.1 tons CO₂e', effort: 'Very low', category: 'shopping' },
];

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {value.toLocaleString()}{suffix}
    </motion.span>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card border-brand-glow px-3 py-2 text-xs shadow-blue-glow">
      <div className="text-slate-400 mb-1">{label}</div>
      <div className="font-semibold text-blue-400">{payload[0].value?.toLocaleString()} kg CO₂e</div>
    </div>
  );
};

export default function DashboardPage() {
  const { user, records, addRecords } = useStore();

  // Seed demo data if empty
  useEffect(() => {
    if (records.length === 0) {
      addRecords(generateDemoRecords());
    }
  }, []);

  const monthly = useMemo(() => getMonthlyRecords(records, 6), [records]);
  const catTotals = useMemo(() => getCategoryTotals(records), [records]);
  const totalKg   = useMemo(() => Math.round(records.reduce((s, r) => s + r.co2eKg, 0) * 10) / 10, [records]);
  const annualized = Math.round(totalKg * 2); // ~6mo data → annualize

  const prevMonth = monthly[monthly.length - 2]?.co2eKg ?? 0;
  const thisMonth = monthly[monthly.length - 1]?.co2eKg ?? 0;
  const monthDelta = prevMonth > 0 ? Math.round(((thisMonth - prevMonth) / prevMonth) * 100) : 0;

  const bracket = user?.incomeBracket ?? '60_100k';
  const peerAvg = PEER_AVERAGE_BY_INCOME[bracket] ?? 9_000;
  const percentile = peerPercentile(annualized, bracket);

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-surface-border p-6 gap-1 sticky top-0 h-screen">
        <div className="flex items-center mb-8">
          <span className="text-2xl tracking-tighter">
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-500">
              Terra
            </span>
            <span className="font-light text-white">print</span>
            <span className="text-brand-500">.</span>
          </span>
        </div>

        {[
          { href: '/dashboard',    icon: <BarChart3 className="w-4 h-4" />,         label: 'Dashboard',   active: true  },
          { href: '/coach',        icon: <MessageCircle className="w-4 h-4" />,    label: 'AI Coach',    active: false },
          { href: '/add',          icon: <Plus className="w-4 h-4" />,             label: 'Log Entry',   active: false },
          { href: '/simulator',    icon: <SlidersHorizontal className="w-4 h-4" />,label: 'Simulator',   active: false },
          { href: '/time-machine', icon: <Clock className="w-4 h-4" />,            label: 'Time Machine',active: false },
          { href: '/marketplace',  icon: <Zap className="w-4 h-4" />,             label: 'Marketplace', active: false },
          { href: '/leaderboard',  icon: <Trophy className="w-4 h-4" />,           label: 'Leaderboard', active: false },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            id={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border
              ${item.active
                ? 'nav-active border-brand-500/25'
                : 'text-slate-400 hover:text-white hover:bg-surface-muted border-transparent'
              }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}

        <div className="mt-auto">
          <div className="glass-card p-4 border-brand-glow">
            <div className="text-xs text-slate-500 mb-1">Your plan</div>
            <div className="font-semibold text-sm text-white mb-3">Free Tier</div>
            <Link href="/pricing" className="btn-primary text-xs py-2 px-4 w-full block text-center">
              Upgrade →
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-0.5">Last 6 months · {records.length} records</p>
          </div>
          <Link href="/add" id="btn-add-entry" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Log Entry
          </Link>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {/* Total footprint */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.0 }}
            className="stat-card col-span-1 sm:col-span-2 xl:col-span-1"
          >
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">6-Month Total</div>
            <div className="text-4xl font-black text-gradient">
              <AnimatedNumber value={totalKg} /> <span className="text-xl text-slate-500">kg</span>
            </div>
            <div className="text-sm text-slate-400">CO₂e · ~{co2eToTrees(totalKg)} trees to absorb</div>
          </motion.div>

          {/* This month */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="stat-card"
          >
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">This Month</div>
            <div className="text-3xl font-black text-white"><AnimatedNumber value={Math.round(thisMonth)} /></div>
            <div className={`text-sm flex items-center gap-1 ${monthDelta < 0 ? 'text-brand-400' : 'text-red-400'}`}>
              {monthDelta < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              {Math.abs(monthDelta)}% vs last month
            </div>
          </motion.div>

          {/* Peer comparison */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="stat-card"
          >
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Peer Rank</div>
            <div className="text-3xl font-black text-white">
              {percentile < 50 ? 'Top ' : ''}<AnimatedNumber value={percentile < 50 ? percentile : 100 - percentile} suffix="%" />
            </div>
            <div className="text-sm text-slate-400">
              {annualized < peerAvg ? 'Below' : 'Above'} your peer avg ({(peerAvg / 1000).toFixed(1)}t)
            </div>
          </motion.div>

          {/* Flights equivalent */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
            className="stat-card"
          >
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Equivalent To</div>
            <div className="text-3xl font-black text-white">
              <AnimatedNumber value={co2eToFlights(totalKg)} /> <span className="text-xl text-slate-500">flights</span>
            </div>
            <div className="text-sm text-slate-400">NYC → London (economy)</div>
          </motion.div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8">
          {/* Monthly trend */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card p-6 xl:col-span-2"
          >
            <h2 className="font-semibold text-sm mb-4">Monthly CO₂e Trend</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="co2eKg" stroke="url(#lineGrad)" strokeWidth={2.5}
                  fill="url(#areaGrad)" dot={{ fill: '#60a5fa', r: 4, strokeWidth: 2, stroke: '#1e40af' }}
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2, filter: 'url(#glow)' }} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
            className="glass-card p-6"
          >
            <h2 className="font-semibold text-sm mb-4">By Category</h2>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={catTotals} dataKey="co2eKg" nameKey="category" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                  {catTotals.map((entry) => (
                    <Cell key={entry.category} fill={CATEGORY_META[entry.category]?.color ?? '#64748b'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} kg`, 'CO₂e']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 mt-3">
              {catTotals.map((c) => {
                const meta = CATEGORY_META[c.category];
                const pct = Math.round((c.co2eKg / totalKg) * 100);
                return (
                  <div key={c.category} className="flex items-center gap-2 text-xs">
                    <span style={{ color: meta?.color }} className="capitalize">{meta?.icon}</span>
                    <span className="capitalize flex-1 text-slate-400">{c.category}</span>
                    <span className="font-semibold">{c.co2eKg} kg</span>
                    <span className="text-slate-500">({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Category bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="glass-card p-6 mb-8"
        >
          <h2 className="font-semibold text-sm mb-4">Category Breakdown by Month</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="co2eKg" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">Top Actions for You</h2>
            <Link href="/marketplace" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              See all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TIPS.map((tip, i) => {
              const meta = CATEGORY_META[tip.category];
              return (
                <div key={i} className={`rounded-xl p-4 bg-gradient-to-br ${meta?.gradient} border border-surface-border flex items-start gap-3`}>
                  <span className="text-2xl">{tip.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{tip.title}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Saves <span className="text-brand-400 font-semibold">{tip.saving}</span> · Effort: {tip.effort}
                    </div>
                  </div>
                  <button className="btn-primary text-xs py-1.5 px-3 flex-shrink-0">Do it</button>
                </div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
