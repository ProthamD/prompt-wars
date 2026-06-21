'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Leaf, Check } from 'lucide-react';
import { useStore } from '@/lib/store';
import type { OnboardingAnswers } from '@/lib/store';
import { computeBaselineFootprint } from '@/lib/emissions';
import { generateDemoRecords } from '@/lib/emissions';

interface Question {
  id: keyof OnboardingAnswers;
  title: string;
  subtitle: string;
  options: { value: string; label: string; emoji: string; desc?: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'dietType',
    title: 'What best describes your diet?',
    subtitle: 'Food accounts for 10–30% of the average household footprint.',
    options: [
      { value: 'vegan',       emoji: '🌱', label: 'Vegan',        desc: 'No animal products' },
      { value: 'vegetarian',  emoji: '🥦', label: 'Vegetarian',   desc: 'No meat, some dairy/eggs' },
      { value: 'flexitarian', emoji: '🐟', label: 'Flexitarian',  desc: 'Mostly plant-based' },
      { value: 'omnivore',    emoji: '🍗', label: 'Omnivore',     desc: 'Balanced meat & plants' },
      { value: 'heavy_meat',  emoji: '🥩', label: 'Heavy meat',   desc: 'Meat at most meals' },
    ],
  },
  {
    id: 'transportMode',
    title: 'How do you usually get around?',
    subtitle: 'Transport is often the single biggest slice of a personal footprint.',
    options: [
      { value: 'walk_bike',      emoji: '🚴', label: 'Walk / Cycle',      desc: 'Rarely use motorised transport' },
      { value: 'public_transit', emoji: '🚇', label: 'Public transit',    desc: 'Bus, metro, train' },
      { value: 'hybrid_ev',      emoji: '⚡', label: 'Hybrid / EV',       desc: 'Electric or hybrid car' },
      { value: 'gas_car',        emoji: '🚗', label: 'Gas / Diesel car',  desc: 'Personal car daily' },
      { value: 'frequent_flyer', emoji: '✈️', label: 'Frequent flyer',   desc: '4+ flights a year' },
    ],
  },
  {
    id: 'energySource',
    title: 'What powers your home?',
    subtitle: 'Switching to renewables can cut your energy footprint by up to 80%.',
    options: [
      { value: 'renewable', emoji: '☀️', label: 'Renewable',      desc: 'Solar / wind / green tariff' },
      { value: 'mixed',     emoji: '⚡', label: 'Mixed grid',     desc: 'Typical national grid mix' },
      { value: 'fossil',    emoji: '🏭', label: 'Mostly fossil',  desc: 'Coal / gas dominant grid' },
    ],
  },
  {
    id: 'homeSqFt',
    title: 'How big is your home?',
    subtitle: 'Larger spaces require more energy to heat, cool, and light.',
    options: [
      { value: 'small',  emoji: '🏠', label: 'Small',  desc: 'Studio or 1-bedroom' },
      { value: 'medium', emoji: '🏡', label: 'Medium', desc: '2–3 bedrooms' },
      { value: 'large',  emoji: '🏘️', label: 'Large',  desc: '4+ bedrooms / house' },
    ],
  },
  {
    id: 'incomeBracket',
    title: 'What\'s your annual household income?',
    subtitle: 'Used only for fair, equity-aware peer comparisons — never shared.',
    options: [
      { value: 'under_30k',  emoji: '💼', label: 'Under $30k' },
      { value: '30_60k',     emoji: '💼', label: '$30k – $60k' },
      { value: '60_100k',    emoji: '💼', label: '$60k – $100k' },
      { value: '100_200k',   emoji: '💼', label: '$100k – $200k' },
      { value: 'over_200k',  emoji: '💼', label: 'Over $200k' },
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const setUser  = useStore((s) => s.setUser);
  const addRecords = useStore((s) => s.addRecords);
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});
  const [done, setDone]       = useState(false);

  const q = QUESTIONS[step];
  const selected = answers[q?.id];
  const progress = ((step) / QUESTIONS.length) * 100;

  function choose(value: string) {
    setAnswers((a) => ({ ...a, [q.id]: value }));
  }

  function next() {
    if (!selected) return;
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      // Finalize
      const finalAnswers = { ...answers, regionCode: 'US-NY' } as OnboardingAnswers;
      const baseline = computeBaselineFootprint(finalAnswers);
      setUser({
        id:                  'local-user',
        displayName:         'You',
        onboardingAnswers:   finalAnswers,
        baselineKgCo2ePerYear: baseline,
        hasEV:               finalAnswers.transportMode === 'hybrid_ev',
        hasSolar:            finalAnswers.energySource === 'renewable',
        incomeBracket:       finalAnswers.incomeBracket,
        regionCode:          'US-NY',
      });
      // Seed 6 months of demo data
      addRecords(generateDemoRecords());
      setDone(true);
      setTimeout(() => router.push('/dashboard'), 1800);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center mx-auto mb-6 glow-brand">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black mb-2">Footprint calculated!</h2>
          <p className="text-slate-400">Taking you to your dashboard…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="flex items-center mb-12">
        <span className="text-2xl tracking-tighter">
          <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-500">
            Terra
          </span>
          <span className="font-light text-white">print</span>
          <span className="text-brand-500">.</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xl mb-10">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Question {step + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-brand-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-xl"
        >
          <h1 className="text-2xl md:text-3xl font-black mb-2 text-center">{q.title}</h1>
          <p className="text-sm text-slate-400 text-center mb-8">{q.subtitle}</p>

          <div className="flex flex-col gap-3">
            {q.options.map((opt) => (
              <button
                key={opt.value}
                id={`option-${opt.value}`}
                onClick={() => choose(opt.value)}
                className={`glass-card p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 text-left
                  ${selected === opt.value
                    ? 'border-brand-500/70 bg-brand-500/10 border-brand-glow'
                    : 'hover:border-surface-muted hover:bg-surface-muted/30'
                  }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{opt.label}</div>
                  {opt.desc && <div className="text-xs text-slate-500">{opt.desc}</div>}
                </div>
                {selected === opt.value && (
                  <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav buttons */}
      <div className="flex items-center gap-4 mt-10 w-full max-w-xl">
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)} className="btn-ghost flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        <button
          id="btn-next"
          onClick={next}
          disabled={!selected}
          className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {step < QUESTIONS.length - 1 ? (
            <>Next <ArrowRight className="w-4 h-4" /></>
          ) : (
            <>See my footprint <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}
