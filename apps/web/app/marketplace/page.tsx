'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Check, Zap, Leaf, DollarSign, Star } from 'lucide-react';

interface Action {
  id: string;
  emoji: string;
  title: string;
  provider: string;
  saving: string;
  cost: string;
  category: 'energy' | 'offset' | 'transport' | 'food';
  tag: string;
  tagColor: string;
  rating: number;
  completed?: boolean;
}

const ACTIONS: Action[] = [
  {
    id: 'green-energy',
    emoji: '⚡',
    title: 'Switch to 100% renewable energy',
    provider: 'Green Mountain Energy',
    saving: '1.2 tons CO₂e / year',
    cost: 'Free switch · ~$2/mo premium',
    category: 'energy',
    tag: 'Highest Impact',
    tagColor: 'bg-brand-500/20 text-brand-400',
    rating: 4.8,
  },
  {
    id: 'carbon-offset',
    emoji: '🌲',
    title: 'Offset last month\'s footprint',
    provider: 'Patch · Gold Standard certified',
    saving: '450 kg CO₂e removed',
    cost: '$9.50 one-time',
    category: 'offset',
    tag: 'Quick Win',
    tagColor: 'bg-blue-500/20 text-blue-400',
    rating: 4.9,
  },
  {
    id: 'ev-rebate',
    emoji: '🚗',
    title: 'Claim your EV purchase tax credit',
    provider: 'IRS Clean Vehicle Credit',
    saving: 'Up to $7,500 + ~2.1 tons CO₂/yr',
    cost: 'Free to claim',
    category: 'transport',
    tag: 'High Value',
    tagColor: 'bg-purple-500/20 text-purple-400',
    rating: 4.7,
  },
  {
    id: 'solar-quote',
    emoji: '☀️',
    title: 'Get a free solar installation quote',
    provider: 'Sunrun',
    saving: 'Up to 3.5 tons CO₂e / year',
    cost: 'Free quote · $0 down financing',
    category: 'energy',
    tag: 'Long-term',
    tagColor: 'bg-yellow-500/20 text-yellow-400',
    rating: 4.5,
  },
  {
    id: 'meatless-kit',
    emoji: '🥗',
    title: 'Try a plant-based meal kit',
    provider: 'Purple Carrot',
    saving: '~0.3 tons CO₂e / year',
    cost: '25% off first box',
    category: 'food',
    tag: 'Beginner Friendly',
    tagColor: 'bg-green-500/20 text-green-400',
    rating: 4.3,
  },
  {
    id: 'transit-pass',
    emoji: '🚇',
    title: 'Monthly transit pass discount',
    provider: 'Your local transit authority',
    saving: '~0.8 tons CO₂e / year vs driving',
    cost: 'Commuter benefit pre-tax savings',
    category: 'transport',
    tag: 'Easy Switch',
    tagColor: 'bg-indigo-500/20 text-indigo-400',
    rating: 4.6,
  },
];

const CATEGORY_FILTERS = ['all', 'energy', 'offset', 'transport', 'food'];

export default function MarketplacePage() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const filtered = filter === 'all' ? ACTIONS : ACTIONS.filter((a) => a.category === filter);

  async function complete(id: string) {
    if (id !== 'carbon-offset') {
      // For non-offset actions, just use the fake delay for now (as demo)
      setLoadingAction(id);
      setTimeout(() => {
        setLoadingAction(null);
        setCompleted((prev) => new Set([...prev, id]));
        router.push(`/receipt?action=${id}`);
      }, 800);
      return;
    }

    setLoadingAction(id);
    try {
      const res = await fetch('/api/marketplace/offset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId: id, amountKgCo2e: 450 }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setCompleted((prev) => new Set([...prev, id]));
        router.push(`/receipt?tx=${data.transactionId}`);
      } else {
        console.error('Error purchasing offset:', data.error);
        alert('Failed to complete transaction.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-10 max-w-3xl mx-auto">
      <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <div className="flex items-start gap-3 mb-2">
        <div className="w-10 h-10 bg-brand-500/15 rounded-xl flex items-center justify-center border border-brand-500/20">
          <Zap className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Action Marketplace</h1>
          <p className="text-sm text-slate-400 mt-0.5">One-tap actions, ranked by impact × effort for your profile.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 my-6">
        {[
          { icon: <Leaf className="w-4 h-4 text-brand-400" />, label: `${completed.size} completed` },
          { icon: <DollarSign className="w-4 h-4 text-yellow-400" />, label: 'Free actions available' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-slate-400 bg-surface-card border border-surface-border rounded-full px-3 py-1.5">
            {s.icon} {s.label}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat}
            id={`filter-${cat}`}
            onClick={() => setFilter(cat)}
            className={`text-xs font-medium px-4 py-2 rounded-full transition-all capitalize
              ${filter === cat
                ? 'bg-brand-500 text-white'
                : 'bg-surface-muted border border-surface-border text-slate-400 hover:border-brand-500/30'
              }`}
          >
            {cat === 'all' ? 'All Actions' : cat}
          </button>
        ))}
      </div>

      {/* Actions grid */}
      <div className="flex flex-col gap-4">
        {filtered.map((action, i) => {
          const isDone = completed.has(action.id);
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`glass-card p-5 transition-all duration-300 ${isDone ? 'opacity-60 border-brand-500/20' : 'hover:border-surface-muted'}`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{action.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-sm">{action.title}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${action.tagColor}`}>{action.tag}</span>
                    {isDone && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400">✓ Done</span>}
                  </div>
                  <div className="text-xs text-slate-500 mb-2">{action.provider}</div>
                  <div className="flex gap-4 text-xs">
                    <div>
                      <span className="text-slate-500">Saves: </span>
                      <span className="text-brand-400 font-semibold">{action.saving}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Cost: </span>
                      <span className="text-white">{action.cost}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`w-3 h-3 ${j < Math.round(action.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-surface-muted'}`} />
                    ))}
                    <span className="text-xs text-slate-500 ml-1">{action.rating}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                {isDone ? (
                  <div className="flex items-center gap-2 text-sm text-brand-400 font-semibold">
                    <Check className="w-4 h-4" /> Completed — Impact Receipt generated
                  </div>
                ) : (
                  <>
                    <button
                      id={`action-do-${action.id}`}
                      onClick={() => complete(action.id)}
                      disabled={loadingAction === action.id}
                      className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {loadingAction === action.id ? (
                        <span className="animate-pulse">Processing...</span>
                      ) : (
                        <><Zap className="w-3.5 h-3.5" /> Take action</>
                      )}
                    </button>
                    <button className="btn-ghost text-xs py-2 px-4 flex items-center gap-1.5">
                      Learn more <ExternalLink className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 text-center text-xs text-slate-600">
        Terraprint earns a small commission on offset purchases. All offsets are Gold Standard or Verra certified.
        Energy provider savings estimates use your region's average grid intensity.
      </div>
    </div>
  );
}
