'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, TrendingDown, Plane, Trees, Car } from 'lucide-react';
import { useStore } from '@/lib/store';
import { getCategoryTotals, co2eToTrees, co2eToFlights, co2eToDrivingKm } from '@/lib/emissions';

interface Counterfactual {
  title: string;
  action: string;
  emoji: string;
  monthlySaving: number; // kg CO2e/month
  months: number;
  totalSaving: number;
  equivalents: { icon: React.ReactNode; text: string }[];
}

export default function TimeMachinePage() {
  const { records } = useStore();

  const catTotals = useMemo(() => getCategoryTotals(records), [records]);
  const topCategories = useMemo(
    () => [...catTotals].sort((a, b) => b.co2eKg - a.co2eKg).slice(0, 3),
    [catTotals]
  );

  const counterfactuals = useMemo<Counterfactual[]>(() => {
    return topCategories.map((cat) => {
      const actual = cat.co2eKg;
      let saving = 0;
      let action = '';
      let emoji = '';
      let title = '';

      if (cat.category === 'transport') {
        saving = actual * 0.35;
        action = 'If you\'d switched to an EV 6 months ago';
        emoji = '⚡';
        title = 'Switch to Electric Vehicle';
      } else if (cat.category === 'energy') {
        saving = actual * 0.72;
        action = 'If you\'d switched to a green energy tariff 6 months ago';
        emoji = '☀️';
        title = 'Switch to Renewable Energy';
      } else if (cat.category === 'food') {
        saving = actual * 0.28;
        action = 'If you\'d cut red meat to twice a week 6 months ago';
        emoji = '🌱';
        title = 'Reduce Red Meat Consumption';
      } else {
        saving = actual * 0.20;
        action = 'If you\'d bought second-hand for 30% of purchases 6 months ago';
        emoji = '♻️';
        title = 'Buy Second-Hand & Sustainable';
      }

      const trees = co2eToTrees(saving);
      const flights = co2eToFlights(saving);
      const km = co2eToDrivingKm(saving);

      return {
        title,
        action,
        emoji,
        monthlySaving: Math.round((saving / 6) * 10) / 10,
        months: 6,
        totalSaving: Math.round(saving * 10) / 10,
        equivalents: [
          { icon: <Trees className="w-4 h-4 text-brand-400" />, text: `${trees} trees planted` },
          { icon: <Plane className="w-4 h-4 text-blue-400" />,  text: `${flights} transatlantic flights avoided` },
          { icon: <Car className="w-4 h-4 text-orange-400" />,  text: `${km.toLocaleString()} km not driven` },
        ],
      };
    });
  }, [topCategories]);

  const totalMissed = useMemo(
    () => counterfactuals.reduce((s, c) => s + c.totalSaving, 0),
    [counterfactuals]
  );

  return (
    <div className="min-h-screen bg-surface px-4 py-10 max-w-3xl mx-auto">
      <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-brand-500/15 rounded-xl flex items-center justify-center border border-brand-500/20">
          <Clock className="w-5 h-5 text-brand-400" />
        </div>
        <h1 className="text-2xl font-black">Footprint Time Machine</h1>
      </div>
      <p className="text-slate-400 text-sm mb-8 ml-[52px]">
        What could have been — based on your actual data from the last 6 months.
      </p>

      {/* Summary callout */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-8 border-brand-glow"
      >
        <div className="flex items-start gap-4">
          <TrendingDown className="w-8 h-8 text-brand-400 flex-shrink-0 mt-1" />
          <div>
            <div className="text-sm text-slate-400 mb-1">If you\'d taken these 3 actions 6 months ago…</div>
            <div className="text-3xl font-black text-gradient mb-1">{totalMissed.toLocaleString()} kg CO₂e</div>
            <div className="text-sm text-slate-400">
              …would not have entered the atmosphere. That\'s{' '}
              <span className="text-white font-semibold">{co2eToFlights(totalMissed)} transatlantic flights</span> worth of emissions.
            </div>
          </div>
        </div>
      </motion.div>

      {/* Counterfactuals */}
      <div className="flex flex-col gap-5">
        {counterfactuals.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{c.emoji}</span>
              <div className="flex-1">
                <h3 className="font-bold text-base mb-1">{c.title}</h3>
                <p className="text-sm text-slate-400 italic mb-4">"{c.action}…"</p>

                {/* Savings bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">CO₂e saved</span>
                    <span className="text-brand-400 font-semibold">{c.totalSaving} kg over {c.months} months</span>
                  </div>
                  <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-brand-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: i * 0.1 + 0.3, duration: 0.7 }}
                    />
                  </div>
                </div>

                {/* Equivalents */}
                <div className="flex flex-wrap gap-3">
                  {c.equivalents.map((eq, j) => (
                    <div key={j} className="flex items-center gap-1.5 text-xs bg-surface-muted rounded-full px-3 py-1.5">
                      {eq.icon}
                      <span className="text-slate-300">{eq.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-4 pt-4 border-t border-surface-border flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Saves ~<span className="text-white">{c.monthlySaving} kg/month</span> going forward
              </div>
              <Link href="/marketplace" className="btn-primary text-xs py-1.5 px-4">
                Take this action →
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center text-xs text-slate-600">
        Calculations based on DEFRA 2023 emission factors applied to your actual 6-month data.
        Past savings are estimates — individual results vary.
      </div>
    </div>
  );
}
