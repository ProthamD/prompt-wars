'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, ArrowRight, Star, X, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';

// ── Payment methods that cycle in the modal ───────────────────────────────────
const PAYMENT_METHODS = [
  {
    label: 'UPI',
    color: 'from-orange-500 to-rose-500',
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="12" fill="url(#upi-g)" />
        <defs>
          <linearGradient id="upi-g" x1="0" y1="0" x2="48" y2="48">
            <stop stopColor="#f97316" /><stop offset="1" stopColor="#e11d48" />
          </linearGradient>
        </defs>
        <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle"
              fontSize="13" fontWeight="800" fill="white" fontFamily="sans-serif">UPI</text>
      </svg>
    ),
  },
  {
    label: 'Visa',
    color: 'from-blue-700 to-blue-500',
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="12" fill="url(#visa-g)" />
        <defs>
          <linearGradient id="visa-g" x1="0" y1="0" x2="48" y2="48">
            <stop stopColor="#1d4ed8" /><stop offset="1" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle"
              fontSize="13" fontWeight="900" fill="white" fontFamily="serif" letterSpacing="1">VISA</text>
      </svg>
    ),
  },
  {
    label: 'Mastercard',
    color: 'from-red-500 to-yellow-500',
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <circle cx="18" cy="24" r="12" fill="#ef4444" fillOpacity=".9" />
        <circle cx="30" cy="24" r="12" fill="#eab308" fillOpacity=".9" />
        <ellipse cx="24" cy="24" rx="4" ry="10" fill="#f97316" fillOpacity=".7" />
      </svg>
    ),
  },
  {
    label: 'Net Banking',
    color: 'from-emerald-500 to-teal-500',
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="12" fill="url(#bank-g)" />
        <defs>
          <linearGradient id="bank-g" x1="0" y1="0" x2="48" y2="48">
            <stop stopColor="#10b981" /><stop offset="1" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
        <rect x="10" y="28" width="4" height="10" rx="1" fill="white" fillOpacity=".9" />
        <rect x="17" y="22" width="4" height="16" rx="1" fill="white" fillOpacity=".9" />
        <rect x="24" y="18" width="4" height="20" rx="1" fill="white" fillOpacity=".9" />
        <rect x="31" y="14" width="4" height="24" rx="1" fill="white" fillOpacity=".9" />
        <rect x="8" y="12" width="32" height="3" rx="1" fill="white" fillOpacity=".9" />
      </svg>
    ),
  },
  {
    label: 'Google Pay',
    color: 'from-slate-700 to-slate-500',
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="12" fill="white" />
        <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle"
              fontSize="11" fontWeight="700" fill="#1a1a1a" fontFamily="sans-serif">G Pay</text>
      </svg>
    ),
  },
  {
    label: 'RuPay',
    color: 'from-indigo-500 to-purple-500',
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="12" fill="url(#rupay-g)" />
        <defs>
          <linearGradient id="rupay-g" x1="0" y1="0" x2="48" y2="48">
            <stop stopColor="#6366f1" /><stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle"
              fontSize="10" fontWeight="800" fill="white" fontFamily="sans-serif">RuPay</text>
      </svg>
    ),
  },
];

const PLANS = [
  {
    id: 'free',
    name: 'Starter',
    price: 0,
    period: 'forever',
    badge: null,
    description: 'Get your footprint baseline and start tracking manually.',
    cta: 'Get started free',
    ctaFree: true,
    highlight: false,
    features: [
      'Footprint quiz & baseline estimate',
      'Manual activity logging',
      'Monthly trend chart',
      'Basic peer benchmarking',
      'Scenario Simulator',
      'Time Machine (last 3 months)',
    ],
    locked: [
      'AI Carbon Coach',
      'Auto bank-link (Plaid)',
      'Barcode scanner',
      'Grid carbon nudges',
      'Verified Impact Receipts',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 7,
    period: '/month',
    badge: 'Most Popular',
    description: 'Automate tracking and unlock the AI coach for real reductions.',
    cta: 'Start 14-day free trial',
    ctaFree: false,
    highlight: true,
    features: [
      'Everything in Starter',
      'AI Carbon Coach (unlimited)',
      'Barcode scanner (food CO₂e)',
      'Grid carbon nudges (WattTime)',
      'Verified Impact Receipts',
      'Full Time Machine (all history)',
      'CSV & PDF export',
      'Email weekly digest',
    ],
    locked: ['Team dashboard', 'API access', 'Auto bank-link (Plaid - Planned)'],
  },
  {
    id: 'team',
    name: 'Team',
    price: 16,
    period: '/month',
    badge: 'Best Value for Groups',
    description: 'Up to 5 members. Compare footprints, compete, and reduce together.',
    cta: 'Start team trial',
    ctaFree: false,
    highlight: false,
    features: [
      'Everything in Pro',
      'Up to 5 team members',
      'Shared team dashboard',
      'Internal leaderboard',
      'Team carbon budget tracker',
      'Admin analytics',
      'Priority support',
      'API access (100k req/mo)',
    ],
    locked: [],
  },
];

// ── Coming Soon Modal ─────────────────────────────────────────────────────────
function ComingSoonModal({ plan, onClose }: { plan: typeof PLANS[0]; onClose: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0);

  // Auto-cycle through payment methods
  useEffect(() => {
    const t = setInterval(() => {
      setActiveIdx((i) => (i + 1) % PAYMENT_METHODS.length);
    }, 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.88, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-3xl overflow-hidden
                     border border-white/10 bg-[#0d1117] shadow-2xl"
        >
          {/* Glow top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40
                          bg-gradient-to-b from-blue-500/25 to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5
                       hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>

          <div className="relative p-8 text-center">
            {/* Badge */}
            <motion.div
              animate={{ rotate: [0, -3, 3, -2, 2, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-violet-500/20
                         border border-blue-500/30 rounded-full px-4 py-1.5 mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-semibold text-blue-300 tracking-wide uppercase">Coming Soon</span>
            </motion.div>

            <h2 className="text-2xl font-black text-white mb-1">
              {plan.name} Plan
            </h2>
            <p className="text-slate-400 text-sm mb-8">
              Payments are on their way. We're building a seamless checkout experience with every major method.
            </p>

            {/* Payment carousel */}
            <div className="relative h-32 mb-6 overflow-hidden">
              {/* Sliding track */}
              <div className="flex gap-3 absolute left-0 top-1/2 -translate-y-1/2"
                   style={{
                     transform: `translateX(calc(50% - ${activeIdx * 88 + 44}px)) translateY(-50%)`,
                     transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
                     width: `${PAYMENT_METHODS.length * 88}px`,
                   }}>
                {PAYMENT_METHODS.map((pm, idx) => (
                  <motion.div
                    key={pm.label}
                    animate={{
                      scale: idx === activeIdx ? 1.18 : 0.82,
                      opacity: Math.abs(idx - activeIdx) <= 1 ? 1 : 0.3,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className="flex-shrink-0 w-20 flex flex-col items-center gap-2 cursor-pointer"
                    onClick={() => setActiveIdx(idx)}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg
                                    bg-gradient-to-br ${pm.color}
                                    ${idx === activeIdx ? 'ring-2 ring-white/30 shadow-blue-500/30 shadow-xl' : ''}`}>
                      {pm.icon}
                    </div>
                    <span className={`text-xs font-semibold transition-colors
                      ${idx === activeIdx ? 'text-white' : 'text-slate-600'}`}>
                      {pm.label}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Left/right fade edges */}
              <div className="absolute left-0 top-0 w-16 h-full bg-gradient-to-r from-[#0d1117] to-transparent pointer-events-none z-10" />
              <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-[#0d1117] to-transparent pointer-events-none z-10" />
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-1.5 mb-8">
              {PAYMENT_METHODS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`rounded-full transition-all duration-300
                    ${idx === activeIdx ? 'w-5 h-1.5 bg-blue-400' : 'w-1.5 h-1.5 bg-slate-700 hover:bg-slate-500'}`}
                />
              ))}
            </div>

            {/* Notify CTA */}
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5
                           text-sm text-white placeholder-slate-600
                           focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
              />
              <button
                className="btn-primary text-sm px-5 py-2.5 whitespace-nowrap"
                onClick={() => {}}
              >
                Notify me
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-3">
              We'll ping you the moment checkout goes live. No spam.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';
  const [activePlan, setActivePlan] = useState<typeof PLANS[0] | null>(null);

  return (
    <div className="min-h-screen bg-surface px-4 py-16 relative overflow-hidden">

      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full
                      bg-blue-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[400px] rounded-full
                      bg-violet-600/6 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* ── Nav — session-aware ──────────────────────────────────────── */}
        <nav className="flex items-center justify-between mb-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl tracking-tighter">
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-500">
                Terra
              </span>
              <span className="font-light text-white">print</span>
              <span className="text-brand-500">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              // ✅ Logged in → show Dashboard link, no Sign In / Sign Up
              <Link href="/dashboard" className="btn-primary text-sm py-2 px-5">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm py-2">Sign in</Link>
                <Link href="/onboarding" className="btn-primary text-sm py-2">Get started free</Link>
              </>
            )}
          </div>
        </nav>

        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-500/10
                       border border-blue-500/20 px-3 py-1.5 rounded-full mb-5"
          >
            <Zap className="w-3.5 h-3.5" /> Simple, honest pricing
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-5xl font-black mb-4"
          >
            Invest in the <span className="text-gradient">planet</span>.
            <br />Not your subscription budget.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg max-w-xl mx-auto"
          >
            Start free. Upgrade only when you're ready for automation and the AI coach.
            No dark patterns, no annual lock-in required.
          </motion.p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col rounded-2xl p-7 ${
                plan.highlight ? 'pricing-popular' : 'glass-card'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap
                  ${plan.highlight
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                    : 'bg-surface-muted border border-surface-border text-slate-300'
                  }`}>
                  {plan.id === 'pro' && <Star className="inline w-3 h-3 mr-1 fill-current" />}
                  {plan.badge}
                </div>
              )}

              {/* Name & price */}
              <div className="mb-6">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-black">{plan.price === 0 ? 'Free' : `$${plan.price}`}</span>
                  {plan.price > 0 && <span className="text-slate-500 text-sm">{plan.period}</span>}
                </div>
                <p className="text-sm text-slate-400 leading-snug">{plan.description}</p>
              </div>

              {/* CTA */}
              {plan.ctaFree ? (
                <Link
                  href="/onboarding"
                  id={`btn-plan-${plan.id}`}
                  className="btn-ghost w-full text-sm py-2.5 mb-6 text-center"
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  id={`btn-plan-${plan.id}`}
                  onClick={() => setActivePlan(plan)}
                  className={`${plan.highlight ? 'btn-primary' : 'btn-ghost'} w-full text-sm py-2.5 mb-6 flex items-center justify-center gap-1`}
                >
                  {plan.cta} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Features */}
              <div className="flex flex-col gap-2.5 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{f}</span>
                  </div>
                ))}
                {plan.locked.map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-sm opacity-35">
                    <div className="w-4 h-4 flex-shrink-0 mt-0.5 border border-slate-600 rounded-sm" />
                    <span className="text-slate-500 line-through">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reassurance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-8 text-center"
        >
          <h2 className="font-bold text-lg mb-2">No tricks. Just facts.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 text-sm text-slate-400">
            {[
              { emoji: '🔓', title: 'Cancel anytime', body: 'No annual lock-in. Cancel from your dashboard in 30 seconds.' },
              { emoji: '🌍', title: '14-day free trial', body: 'Full Pro access for 14 days. No card needed to start.' },
              { emoji: '🔒', title: 'Bank-grade security', body: 'Plaid tokens AES-256 encrypted. We never sell your data.' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-2">
                <span className="text-2xl">{item.emoji}</span>
                <div className="font-semibold text-white">{item.title}</div>
                <div className="leading-relaxed">{item.body}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="text-center text-xs text-slate-600 mt-8">
          Prices in USD. Pro and Team plans billed monthly. Switch plans anytime.
        </p>
      </div>

      {/* Coming Soon Modal */}
      {activePlan && (
        <ComingSoonModal plan={activePlan} onClose={() => setActivePlan(null)} />
      )}
    </div>
  );
}
