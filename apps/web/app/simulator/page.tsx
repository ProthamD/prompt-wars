'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Utensils, Car, Zap, Plane, Trees, TrendingDown,
  Leaf, AlertTriangle, CheckCircle2, Target, BarChart3,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell,
} from 'recharts';

// ── Data ─────────────────────────────────────────────────────────────────────
const DIET = [
  { label: 'Heavy Meat', annual: 3_300 },
  { label: 'Omnivore',   annual: 2_800 },
  { label: 'Flexitarian',annual: 2_200 },
  { label: 'Vegetarian', annual: 1_700 },
  { label: 'Vegan',      annual: 1_500 },
];
const TRANSPORT = [
  { label: 'Frequent Flyer',  annual: 6_000 },
  { label: 'Gas / Diesel',    annual: 3_500 },
  { label: 'Hybrid / EV',     annual: 1_200 },
  { label: 'Public Transit',  annual: 600   },
  { label: 'Walk / Cycle',    annual: 100   },
];
const ENERGY = [
  { label: 'Fossil Grid', annual: 2_400 },
  { label: 'Mixed Grid',  annual: 1_200 },
  { label: 'Renewable',   annual: 400   },
];
const FLIGHTS = [
  { label: 'None',     annual: 0     },
  { label: '1 Short',  annual: 255   },
  { label: '2 Short',  annual: 510   },
  { label: '1 Long',   annual: 1_100 },
  { label: '2 Long',   annual: 2_200 },
  { label: '4+ Long',  annual: 4_400 },
];

const PARIS_TARGET = 2_000;
const GLOBAL_AVG   = 7_000;
const BASELINE     = DIET[0].annual + TRANSPORT[0].annual + ENERGY[0].annual + FLIGHTS[5].annual;

// ── Radial gauge ─────────────────────────────────────────────────────────────
function RadialGauge({ value, max = 16_000 }: { value: number; max?: number }) {
  const pct     = Math.min(value / max, 1);
  const R       = 80;
  const stroke  = 14;
  const circ    = 2 * Math.PI * R;
  const arc     = circ * 0.75; // 270-degree arc
  const offset  = arc - arc * pct;
  const color   = value <= PARIS_TARGET ? '#22c55e'
                : value <= GLOBAL_AVG   ? '#f97316'
                :                         '#ef4444';
  const status  = value <= PARIS_TARGET ? 'Paris-compatible ✓'
                : value <= GLOBAL_AVG   ? 'Above target'
                :                         'High impact';

  return (
    <div className="relative flex flex-col items-center">
      <svg width="200" height="200" viewBox="0 0 200 200">
        {/* Track */}
        <circle cx="100" cy="100" r={R} fill="none"
          stroke="#1e2535" strokeWidth={stroke}
          strokeDasharray={`${arc} ${circ}`}
          strokeLinecap="round"
          transform="rotate(135 100 100)" />
        {/* Glow filter */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Progress */}
        <motion.circle
          cx="100" cy="100" r={R} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={`${arc} ${circ}`}
          strokeLinecap="round"
          transform="rotate(135 100 100)"
          filter="url(#glow)"
          initial={{ strokeDashoffset: arc }}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
        />
        {/* Center text */}
        <text x="100" y="92" textAnchor="middle" fill="white"
              fontSize="24" fontWeight="900" fontFamily="sans-serif">
          {value >= 1000 ? `${(value / 1000).toFixed(1)}t` : `${value}`}
        </text>
        <text x="100" y="112" textAnchor="middle" fill="#64748b"
              fontSize="10" fontFamily="sans-serif">
          CO₂e / year
        </text>
      </svg>
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs font-semibold px-3 py-1 rounded-full border"
        style={{ color, borderColor: color + '40', background: color + '15' }}
      >
        {status}
      </motion.div>
    </div>
  );
}

// ── Pill selector ─────────────────────────────────────────────────────────────
function PillSelector({
  icon, label, options, value, onChange,
}: {
  icon: React.ReactNode; label: string;
  options: { label: string; annual: number }[];
  value: number; onChange: (i: number) => void;
}) {
  const co2 = options[value].annual;
  const pct = Math.round((co2 / options[0].annual) * 100);
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            {icon}
          </div>
          <span className="font-semibold text-sm">{label}</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">{co2.toLocaleString()} kg/yr</div>
          <div className="w-20 h-1 bg-surface-muted rounded-full mt-1 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
              animate={{ width: `${Math.min(pct, 100)}%` }}
              transition={{ type: 'spring', stiffness: 80 }}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt, i) => (
          <button
            key={opt.label}
            onClick={() => onChange(i)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border
              ${value === i
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-sm shadow-blue-500/20'
                : 'border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/15'
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1117]/95 px-3 py-2 text-xs shadow-xl">
      <div className="text-slate-400 mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value?.toLocaleString()} kg
        </div>
      ))}
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SimulatorPage() {
  const [diet,      setDiet]      = useState(1);
  const [transport, setTransport] = useState(1);
  const [energy,    setEnergy]    = useState(1);
  const [flights,   setFlights]   = useState(2);

  const total = useMemo(() =>
    DIET[diet].annual + TRANSPORT[transport].annual +
    ENERGY[energy].annual + FLIGHTS[flights].annual,
    [diet, transport, energy, flights]
  );

  const saving       = BASELINE - total;
  const treesPerYear = Math.round(saving / 21);
  const flightsSaved = Math.round((saving / 1_100) * 10) / 10;
  const dollarSaved  = Math.round(
    (TRANSPORT[0].annual - TRANSPORT[transport].annual) * 0.012 +
    (ENERGY[0].annual    - ENERGY[energy].annual)    * 0.008
  );

  const trajectory = useMemo(() =>
    Array.from({ length: 11 }, (_, i) => ({
      year: new Date().getFullYear() + i,
      You: Math.round(total * Math.pow(0.97, i)),
      'Global Avg': Math.round(GLOBAL_AVG * Math.pow(0.98, i)),
      'Paris Target': PARIS_TARGET,
    })), [total]
  );

  const breakdown = [
    { name: 'Diet',      value: DIET[diet].annual,      color: '#f97316' },
    { name: 'Transport', value: TRANSPORT[transport].annual, color: '#3b82f6' },
    { name: 'Energy',    value: ENERGY[energy].annual,  color: '#eab308' },
    { name: 'Flights',   value: FLIGHTS[flights].annual,color: '#8b5cf6' },
  ];

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Ambient */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/8 blur-[120px] pointer-events-none rounded-full" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-violet-600/6 blur-[100px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-black leading-none">Scenario Simulator</h1>
              <p className="text-xs text-slate-500 mt-0.5">Model your 10-year CO₂e trajectory in real time</p>
            </div>
          </div>
          <div className="w-24" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">

          {/* ── Left column ── */}
          <div className="flex flex-col gap-5">

            {/* Selectors */}
            <PillSelector icon={<Utensils className="w-4 h-4" />} label="Diet"        options={DIET}      value={diet}      onChange={setDiet}      />
            <PillSelector icon={<Car      className="w-4 h-4" />} label="Transport"   options={TRANSPORT} value={transport} onChange={setTransport} />
            <PillSelector icon={<Zap      className="w-4 h-4" />} label="Home Energy" options={ENERGY}    value={energy}    onChange={setEnergy}    />
            <PillSelector icon={<Plane    className="w-4 h-4" />} label="Flights/yr"  options={FLIGHTS}   value={flights}   onChange={setFlights}   />

            {/* Category breakdown bar */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-400" /> Emission Breakdown
              </h2>
              <div className="flex flex-col gap-3">
                {breakdown.map((b) => {
                  const pct = Math.round((b.value / total) * 100) || 0;
                  return (
                    <div key={b.name}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-400">{b.name}</span>
                        <span className="font-semibold" style={{ color: b.color }}>
                          {b.value.toLocaleString()} kg · {pct}%
                        </span>
                      </div>
                      <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: b.color }}
                          animate={{ width: `${pct}%` }}
                          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 10-year chart */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
              <h2 className="text-sm font-semibold mb-1 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-green-400" /> 10-Year Trajectory
              </h2>
              <p className="text-xs text-slate-500 mb-4">Assuming 3% annual reduction · dashed = Paris 2t target</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trajectory} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gYou" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f97316" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="year" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} />
                  <ReferenceLine y={PARIS_TARGET} stroke="#22c55e" strokeDasharray="6 3"
                    label={{ value: '2t', fill: '#22c55e', fontSize: 9, position: 'insideTopRight' }} />
                  <Area type="monotone" dataKey="Global Avg" stroke="#f97316" strokeWidth={1.5}
                    fill="url(#gAvg)" dot={false} name="Global Avg" />
                  <Area type="monotone" dataKey="You" stroke="#3b82f6" strokeWidth={2.5}
                    fill="url(#gYou)" dot={{ fill: '#3b82f6', r: 3 }} name="You" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-5">

            {/* Radial gauge */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 flex flex-col items-center">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Annual Footprint</p>
              <AnimatePresence mode="wait">
                <motion.div key={total} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                  <RadialGauge value={total} />
                </motion.div>
              </AnimatePresence>

              {/* vs target bar */}
              <div className="w-full mt-5">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>vs Paris 2t target</span>
                  <span className={total <= PARIS_TARGET ? 'text-green-400' : 'text-orange-400'}>
                    {total <= PARIS_TARGET ? '✓ Under target' : `${Math.round(total / PARIS_TARGET * 10) / 10}× over`}
                  </span>
                </div>
                <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${total <= PARIS_TARGET ? 'bg-green-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}
                    animate={{ width: `${Math.min((PARIS_TARGET / total) * 100, 100)}%` }}
                    transition={{ type: 'spring', stiffness: 80 }}
                  />
                </div>
              </div>
            </div>

            {/* Impact stats */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">vs Worst Case</p>
              <div className="flex flex-col gap-4">
                {[
                  { icon: <Trees className="w-4 h-4" />, color: '#22c55e', val: treesPerYear.toLocaleString(), label: 'trees/yr equivalent saved' },
                  { icon: <Plane className="w-4 h-4" />, color: '#3b82f6', val: `${flightsSaved}`, label: 'long-haul flights avoided' },
                  { icon: <TrendingDown className="w-4 h-4" />, color: '#a78bfa', val: `$${dollarSaved.toLocaleString()}`, label: 'estimated energy savings/yr' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ background: s.color + '18', color: s.color }}>
                      {s.icon}
                    </div>
                    <div>
                      <motion.div key={s.val} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                        className="font-black text-lg leading-none" style={{ color: s.color }}>
                        {s.val}
                      </motion.div>
                      <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert / badge */}
            <motion.div key={total <= PARIS_TARGET ? 'good' : 'warn'}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border p-4 flex items-start gap-3
                ${total <= PARIS_TARGET
                  ? 'border-green-500/20 bg-green-500/5'
                  : 'border-orange-500/20 bg-orange-500/5'}`}>
              {total <= PARIS_TARGET
                ? <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                : <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />}
              <p className={`text-sm leading-snug ${total <= PARIS_TARGET ? 'text-green-300' : 'text-orange-300'}`}>
                {total <= PARIS_TARGET
                  ? 'Your current scenario is Paris Agreement-compatible. Great work!'
                  : `You're ${Math.round(total / PARIS_TARGET)}× over the 2t/yr target. Adjust sliders to see what makes the biggest difference.`}
              </p>
            </motion.div>

            {/* CTA */}
            <Link href="/marketplace"
              className="btn-primary flex items-center justify-center gap-2 py-3 text-sm">
              <Leaf className="w-4 h-4" /> Take actions to reach this →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
