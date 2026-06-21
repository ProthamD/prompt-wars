'use client';

import Link from 'next/link';
import { ArrowRight, Zap, BarChart3, Leaf, Shield, ChevronRight, Globe, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

const features = [
  {
    icon: <Zap className="w-6 h-6 text-brand-400" />,
    title: 'Bank Link (Roadmap)',
    desc: 'Connect your card once. We will map every transaction to its carbon footprint automatically — zero manual logging. (Coming soon)',
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-brand-400" />,
    title: 'AI Carbon Coach',
    desc: 'Ask "Why did my footprint spike in May?" and get a real answer based on your actual spending data, not generic tips.',
  },
  {
    icon: <Leaf className="w-6 h-6 text-brand-400" />,
    title: 'Action Marketplace',
    desc: 'Switch energy provider, claim a rebate, buy verified offsets — all in one tap from inside the app.',
  },
  {
    icon: <Globe className="w-6 h-6 text-brand-400" />,
    title: 'Equity-Aware Benchmarks',
    desc: 'Compare your footprint against people in the same income bracket and region — never against an unfair global average.',
  },
  {
    icon: <TrendingDown className="w-6 h-6 text-brand-400" />,
    title: 'Footprint Time Machine',
    desc: '"If you\'d switched energy plans in January, you\'d have saved 0.9 tons over 6 months." Hindsight made actionable.',
  },
  {
    icon: <Shield className="w-6 h-6 text-brand-400" />,
    title: 'Privacy-First',
    desc: 'No data resale. Minimal retention. On-device processing where possible. Your data powers your insights only.',
  },
];

const stats = [
  { value: '100%', label: 'accurate manual tracking today' },
  { value: '1-tap', label: 'action execution' },
  { value: 'Zero', label: 'shame-based comparisons' },
];

export default function LandingPage() {
  const { status } = useSession();
  const isLoggedIn = status === 'authenticated';
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 border-b border-surface-border/50 backdrop-blur-md bg-surface/80">
        <div className="flex items-center">
          <span className="text-xl tracking-tighter">
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-500">
              Terra
            </span>
            <span className="font-light text-white">print</span>
            <span className="text-brand-500">.</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">Pricing</Link>
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn-primary text-sm py-2 px-5">Dashboard →</Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-sm py-2 px-4">Sign in</Link>
              <Link href="/onboarding" className="btn-primary text-sm py-2 px-5">Get Started →</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-40 pb-28 overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl animate-slide-up">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
            Friction-free carbon tracking — now in beta
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Your real carbon{' '}
            <span className="text-gradient">footprint.</span>
            <br />
            Not a guilt trip.
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Terraprint helps you track your CO₂ from every purchase, gives you an AI coach grounded
            in your actual data, and executes one-tap actions to reduce your impact — without shame. Auto-sync coming soon.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding" id="cta-get-started" className="btn-primary flex items-center gap-2 text-base justify-center">
              Get your footprint free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/dashboard" id="cta-demo" className="btn-ghost text-base flex items-center gap-2 justify-center">
              View demo dashboard
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative mt-20 flex flex-wrap justify-center gap-10 opacity-0 animate-[slideUp_0.5s_ease-out_0.3s_forwards]">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-black text-gradient">{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 md:px-12 py-20 max-w-6xl mx-auto w-full">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Everything existing apps get wrong.{' '}
            <span className="text-gradient">We fixed it.</span>
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Most carbon trackers collapse after the first week. We removed every friction point.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="glass-card p-6 group hover:border-brand-500/30 transition-colors duration-300"
            >
              <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors">
                {f.icon}
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-6 md:mx-12 mb-20 rounded-3xl border p-12 text-center relative overflow-hidden"
               style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(99,102,241,0.1) 50%, rgba(139,92,246,0.08) 100%)',
                        borderColor: 'rgba(59,130,246,0.25)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(59,130,246,0.12),transparent)] pointer-events-none" />
        <div className="relative">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Ready to see your real footprint?
          </h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Takes 2 minutes. No credit card. No shame.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding" id="cta-footer" className="btn-primary inline-flex items-center gap-2 text-base">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/pricing" className="btn-ghost inline-flex items-center gap-2 text-base">
              View pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <span className="text-sm tracking-tighter mr-1">
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-500">
              Terra
            </span>
            <span className="font-light text-white">print</span>
            <span className="text-brand-500">.</span>
          </span>
          <span>© 2026 Terraprint. Methodology disclosed in-app.</span>
        </div>
        <div className="flex gap-6">
          <Link href="/pricing"      className="hover:text-slate-300 transition-colors">Pricing</Link>
          <Link href="/privacy"      className="hover:text-slate-300 transition-colors">Privacy</Link>
          <Link href="/methodology"  className="hover:text-slate-300 transition-colors">Methodology</Link>
          <Link href="/dashboard"    className="hover:text-slate-300 transition-colors">Dashboard</Link>
        </div>
      </footer>
    </main>
  );
}
