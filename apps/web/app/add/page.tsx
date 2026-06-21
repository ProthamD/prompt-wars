'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Check } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { MANUAL_FACTORS } from '@/lib/emissions';

type ManualKey = keyof typeof MANUAL_FACTORS;

const ENTRIES: { key: ManualKey; emoji: string }[] = [
  { key: 'flight_short',      emoji: '✈️' },
  { key: 'flight_long',       emoji: '🛫' },
  { key: 'car_trip_100km',    emoji: '🚗' },
  { key: 'beef_kg',           emoji: '🥩' },
  { key: 'chicken_kg',        emoji: '🍗' },
  { key: 'gas_heating_month', emoji: '🏭' },
  { key: 'electricity_kwh',   emoji: '⚡' },
];

export default function AddEntryPage() {
  const router   = useRouter();
  const addRecord = useStore((s) => s.addRecord);
  const [selected, setSelected] = useState<ManualKey | null>(null);
  const [qty, setQty]           = useState('1');
  const [done, setDone]         = useState(false);

  function submit() {
    if (!selected) return;
    const factor = MANUAL_FACTORS[selected];
    const q = parseFloat(qty) || 1;
    addRecord({
      id:          `manual-${Date.now()}`,
      category:    factor.category,
      subCategory: selected,
      co2eKg:      Math.round(factor.co2eKg * q * 100) / 100,
      source:      'manual',
      label:       factor.label,
      date:        new Date().toISOString().slice(0, 10),
    });
    setDone(true);
    setTimeout(() => router.push('/dashboard'), 1500);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center mx-auto mb-4 glow-brand">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-black">Entry logged!</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-10 max-w-2xl mx-auto">
      <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>
      <h1 className="text-2xl font-black mb-2">Log a Manual Entry</h1>
      <p className="text-slate-400 text-sm mb-8">For flights, one-off purchases, or anything not captured by auto-tracking.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {ENTRIES.map(({ key, emoji }) => {
          const f = MANUAL_FACTORS[key];
          return (
            <button
              key={key}
              id={`entry-${key}`}
              onClick={() => setSelected(key)}
              className={`glass-card p-4 flex items-center gap-3 text-left cursor-pointer transition-all duration-200
                ${selected === key ? 'border-brand-500/70 bg-brand-500/10 border-brand-glow' : 'hover:border-surface-muted'}`}
            >
              <span className="text-2xl">{emoji}</span>
              <div className="flex-1">
                <div className="font-semibold text-sm">{f.label}</div>
                <div className="text-xs text-slate-500">{f.co2eKg} kg CO₂e / unit</div>
              </div>
              {selected === key && <div className="w-4 h-4 bg-brand-500 rounded-full flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {selected && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 mb-6">
          <label className="text-sm font-semibold mb-2 block">Quantity</label>
          <input
            id="qty-input"
            type="number"
            min="0.1"
            step="0.1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/70"
          />
          <div className="text-xs text-slate-500 mt-2">
            Total: <span className="text-brand-400 font-semibold">
              {Math.round(MANUAL_FACTORS[selected].co2eKg * (parseFloat(qty) || 1) * 100) / 100} kg CO₂e
            </span>
          </div>
        </motion.div>
      )}

      <button
        id="btn-submit-entry"
        onClick={submit}
        disabled={!selected}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" /> Add to my footprint
      </button>
    </div>
  );
}
