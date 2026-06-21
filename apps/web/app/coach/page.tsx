'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Bot, User, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';
import { getCategoryTotals, getMonthlyRecords } from '@/lib/emissions';

// ── Local AI Coach (no API key needed for demo) ─────────────────────────────
// In production this calls FastAPI /api/v1/coach with RAG + GPT-4o-mini.
// For demo, we use a rule-based responder grounded on the user's actual store data.

function buildContext(records: ReturnType<typeof useStore>['records'], user: ReturnType<typeof useStore>['user']) {
  const totals = getCategoryTotals(records);
  const monthly = getMonthlyRecords(records, 6);
  const topCat = [...totals].sort((a, b) => b.co2eKg - a.co2eKg)[0];
  const totalKg = totals.reduce((s, c) => s + c.co2eKg, 0);
  const lastMonth = monthly[monthly.length - 1]?.co2eKg ?? 0;
  const prevMonth = monthly[monthly.length - 2]?.co2eKg ?? 0;
  const trend = lastMonth > prevMonth ? 'up' : 'down';
  const delta = Math.abs(Math.round(((lastMonth - prevMonth) / Math.max(prevMonth, 1)) * 100));

  return { totals, topCat, totalKg, lastMonth, prevMonth, trend, delta, user };
}

function generateResponse(question: string, ctx: ReturnType<typeof buildContext>): string {
  const q = question.toLowerCase();

  if (q.includes('footprint') && (q.includes('total') || q.includes('how much') || q.includes('what is'))) {
    return `Over the last 6 months, your footprint is **${Math.round(ctx.totalKg)} kg CO₂e** — roughly **${(ctx.totalKg / 1000).toFixed(1)} tonnes**.\n\nYour biggest source is **${ctx.topCat?.category}** at ${ctx.topCat?.co2eKg} kg, which is ${Math.round(((ctx.topCat?.co2eKg ?? 0) / ctx.totalKg) * 100)}% of your total.\n\nThis month was ${ctx.lastMonth} kg, which is ${ctx.trend === 'up' ? '📈 up' : '📉 down'} ${ctx.delta}% from last month.`;
  }

  if (q.includes('spike') || q.includes('go up') || q.includes('increase') || q.includes('why') && q.includes('month')) {
    return `Your footprint ${ctx.trend === 'up' ? 'rose' : 'fell'} ${ctx.delta}% this month.\n\n${ctx.trend === 'up'
      ? `The main contributor was **${ctx.topCat?.category}** — it accounted for the majority of this month's increase. Common culprits in your data: flights, extra driving, or higher energy bills from seasonal heating/cooling.`
      : `Good news — your footprint actually decreased this month! The biggest category this period was **${ctx.topCat?.category}** at ${ctx.topCat?.co2eKg} kg. Keep it up.`}`;
  }

  if (q.includes('reduce') || q.includes('lower') || q.includes('cut') || q.includes('improve')) {
    return `Based on your data, here are the **3 highest-impact actions** specific to you:\n\n1. **${ctx.topCat?.category === 'transport' ? '🚆 Replace 1 flight with train travel' : ctx.topCat?.category === 'food' ? '🌱 Cut red meat to twice a week' : '⚡ Switch to a renewable energy tariff'}** — saves ~0.5–1.2 tonnes/year\n2. **🛒 Choose lower-carbon groceries** — saves ~0.3 tonnes/year\n3. **🏠 Reduce heating by 1°C** — saves ~0.15 tonnes/year\n\nWant me to find a specific action you can take today?`;
  }

  if (q.includes('food') || q.includes('diet') || q.includes('meat')) {
    const foodKg = ctx.totals.find((t) => t.category === 'food')?.co2eKg ?? 0;
    return `Your food footprint is **${foodKg} kg CO₂e** over the last 6 months.\n\nFor context, beef generates ~27 kg CO₂e per kg, vs chicken at ~6.9 kg/kg and lentils at ~0.9 kg/kg.\n\nIf you shifted one beef meal per week to chicken, you'd save roughly **85 kg CO₂e per year** — a meaningful change for a single habit tweak.`;
  }

  if (q.includes('transport') || q.includes('car') || q.includes('flight') || q.includes('travel')) {
    const transKg = ctx.totals.find((t) => t.category === 'transport')?.co2eKg ?? 0;
    return `Your transport footprint is **${transKg} kg CO₂e** over the last 6 months.\n\nA single long-haul flight (e.g., NYC–London) adds ~1,100 kg CO₂e — roughly what the average person emits from all other transport for 3 months.\n\nIf you drive, converting to an EV on a mixed grid saves ~60% of car emissions. On a renewable grid, it's closer to 95%.`;
  }

  if (q.includes('energy') || q.includes('electricity') || q.includes('heating')) {
    const energyKg = ctx.totals.find((t) => t.category === 'energy')?.co2eKg ?? 0;
    return `Your home energy footprint is **${energyKg} kg CO₂e** over 6 months.\n\nSwitching to a renewable energy tariff is the single fastest way to reduce this — it typically takes 10 minutes online and can cut this number by up to 80%.\n\nWant me to find green energy providers in your region?`;
  }

  if (q.includes('peer') || q.includes('average') || q.includes('compare') || q.includes('others')) {
    return `I compare you against people in the **same income bracket and region** — not a flat global average that disadvantages lower-income users.\n\nYour annualized footprint of ~${Math.round(ctx.totalKg * 2)} kg is ${ctx.totalKg * 2 < 9000 ? 'below' : 'above'} the peer average for your group. Remember: the goal isn't shame, it's realistic progress.`;
  }

  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return `Hi there! 👋 I'm your Terraprint AI Coach.\n\nI have access to your actual footprint data (${Math.round(ctx.totalKg)} kg CO₂e over the last 6 months), so I can give you **specific, grounded answers** — not generic blog advice.\n\nTry asking me:\n- "Why did my footprint go up this month?"\n- "What's my biggest category?"\n- "How can I reduce my food footprint?"`;
  }

  return `That's a great question. Based on your 6-month footprint of **${Math.round(ctx.totalKg)} kg CO₂e**, your biggest opportunity area is **${ctx.topCat?.category}** (${ctx.topCat?.co2eKg} kg).\n\nCould you be more specific? For example:\n- Ask about a specific category (food, transport, energy)\n- Ask why your footprint changed this month\n- Ask for specific actions to reduce your impact\n\nI'm grounded in your real data — no generic tips here.`;
}

const STARTERS = [
  'What\'s my total footprint?',
  'Why did my footprint spike this month?',
  'How can I reduce my transport emissions?',
  'How do I compare to my peers?',
];

export default function CoachPage() {
  const { records, user, coachMessages, addCoachMessage } = useStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [coachMessages]);

  async function send(text?: string) {
    const q = text ?? input.trim();
    if (!q) return;
    setInput('');
    addCoachMessage({ role: 'user', content: q });
    setLoading(true);

    try {
      // Build footprint context to inject into the system prompt
      const ctx = buildContext(records, user);
      const context = {
        total_kg_6mo:    Math.round(ctx.totalKg),
        top_category:    ctx.topCat?.category,
        top_category_kg: ctx.topCat?.co2eKg,
        this_month_kg:   ctx.lastMonth,
        prev_month_kg:   ctx.prevMonth,
        trend:           ctx.trend,
        trend_pct:       ctx.delta,
        category_totals: ctx.totals,
      };

      // Pass last 10 messages as history (exclude the one just added)
      const history = coachMessages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, context, history }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        addCoachMessage({
          role: 'assistant',
          content: `Sorry, I couldn't reach the AI right now. ${data.error ?? 'Please try again.'}`,
        });
      } else {
        addCoachMessage({ role: 'assistant', content: data.reply });
      }
    } catch (err) {
      addCoachMessage({
        role: 'assistant',
        content: 'Network error — please check your connection and try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  function renderMarkdown(text: string) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 p-5 border-b border-surface-border sticky top-0 bg-surface/90 backdrop-blur-sm z-10">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500/20 border border-brand-500/30 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <div className="font-semibold text-sm">Terraprint AI Coach</div>
            <div className="text-xs text-brand-400">Grounded in your real data</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-5 flex flex-col gap-4">
        {coachMessages.length === 0 && (
          <div className="flex flex-col items-center text-center py-12">
            <div className="w-16 h-16 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-brand-400" />
            </div>
            <h2 className="text-xl font-black mb-2">Your AI Carbon Coach</h2>
            <p className="text-slate-400 text-sm max-w-md mb-8">
              I have access to your actual footprint data and emission history.
              Ask me anything — I'll give you specific, grounded answers.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-sm bg-surface-muted border border-surface-border rounded-full px-4 py-2 hover:border-brand-500/40 hover:text-brand-300 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {coachMessages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                ${msg.role === 'user' ? 'bg-surface-muted' : 'bg-brand-500/20 border border-brand-500/30'}`}>
                {msg.role === 'user'
                  ? <User className="w-4 h-4 text-slate-400" />
                  : <Sparkles className="w-4 h-4 text-brand-400" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-brand-500/20 border border-brand-500/20 text-white rounded-tr-sm'
                  : 'bg-surface-card border border-surface-border text-slate-200 rounded-tl-sm'}`}>
                <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-brand-400" />
            </div>
            <div className="bg-surface-card border border-surface-border rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 bg-brand-500/60 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-surface-border">
        <div className="flex gap-3">
          <input
            id="coach-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask about your footprint…"
            className="flex-1 bg-surface-muted border border-surface-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500/70"
          />
          <button
            id="btn-send-coach"
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="btn-primary px-4 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
