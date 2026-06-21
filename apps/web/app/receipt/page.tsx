'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Share2, Leaf, ArrowLeft, Trees, Plane } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ACTION_DATA: Record<string, { title: string; provider: string; co2eKg: number; emoji: string }> = {
  'green-energy':  { title: 'Switched to 100% Renewable Energy', provider: 'Green Mountain Energy', co2eKg: 1_200, emoji: '⚡' },
  'carbon-offset': { title: 'Offset Last Month\'s Footprint',    provider: 'Patch · Gold Standard',  co2eKg: 450,   emoji: '🌲' },
  'ev-rebate':     { title: 'Claimed EV Tax Credit',              provider: 'IRS Clean Vehicle Credit',co2eKg: 2_100, emoji: '🚗' },
  'solar-quote':   { title: 'Initiated Solar Installation',       provider: 'Sunrun',                  co2eKg: 3_500, emoji: '☀️' },
  'meatless-kit':  { title: 'Started Plant-Based Meal Kit',       provider: 'Purple Carrot',           co2eKg: 300,   emoji: '🥗' },
  'transit-pass':  { title: 'Activated Monthly Transit Pass',     provider: 'Local Transit Authority', co2eKg: 800,   emoji: '🚇' },
};

function ReceiptContent() {
  const params     = useSearchParams();
  const txId       = params.get('tx');
  const actionId   = params.get('action') ?? 'carbon-offset';
  const action     = ACTION_DATA[actionId] ?? ACTION_DATA['carbon-offset'];
  
  const { data: tx } = useSWR(txId ? `/api/marketplace/transaction/${txId}` : null, fetcher);

  const date       = tx?.timestamp ? new Date(tx.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const receiptId  = tx?.confirmationId ?? `TRP-${Date.now().toString(36).toUpperCase().slice(-8)}`;
  
  const co2eKg     = tx?.amountKgCo2e ?? action.co2eKg;
  const treesEquiv = Math.round(co2eKg / 21);
  const flightEquiv= Math.round((co2eKg / 1_100) * 10) / 10;
  const provider   = tx?.provider ?? action.provider;

  return (
    <div className="min-h-screen bg-surface px-4 py-10 flex flex-col items-center">
      <Link href="/marketplace" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-10 self-start max-w-lg w-full mx-auto">
        <ArrowLeft className="w-4 h-4" /> Back to marketplace
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Receipt card */}
        <div className="glass-card overflow-hidden border-brand-glow">
          {/* Green header */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white,transparent)]" />
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <CheckCircle className="w-9 h-9 text-white" />
              </div>
              <div className="text-white font-black text-xl mb-1">Verified Impact Receipt</div>
              <div className="text-brand-100 text-sm opacity-80">Terraprint · {date}</div>
            </div>
          </div>

          {/* Action details */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{action.emoji}</span>
              <div>
                <div className="font-bold text-base">{action.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{provider}</div>
              </div>
            </div>

            {/* CO2e saved */}
            <div className="bg-brand-500/10 border border-brand-500/20 rounded-2xl p-4 mb-4 text-center">
              <div className="text-xs text-brand-400 uppercase tracking-wider mb-1 font-medium">CO₂e Saved Annually</div>
              <div className="text-4xl font-black text-gradient">
                {co2eKg >= 1000
                  ? `${(co2eKg / 1000).toFixed(1)} t`
                  : `${co2eKg} kg`}
              </div>
              <div className="text-sm text-slate-400 mt-1">CO₂-equivalent per year</div>
            </div>

            {/* Equivalents */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-surface-muted rounded-xl p-3 text-center">
                <Trees className="w-5 h-5 text-brand-400 mx-auto mb-1" />
                <div className="font-black text-lg">{treesEquiv}</div>
                <div className="text-xs text-slate-500">trees planted equiv.</div>
              </div>
              <div className="bg-surface-muted rounded-xl p-3 text-center">
                <Plane className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <div className="font-black text-lg">{flightEquiv}</div>
                <div className="text-xs text-slate-500">transatlantic flights</div>
              </div>
            </div>

            {/* Receipt metadata */}
            <div className="border-t border-surface-border pt-4 mb-6">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Receipt ID</span>
                <span className="font-mono text-slate-300">{receiptId}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Verified by</span>
                <span className="text-slate-300">Terraprint · {provider}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Standard</span>
                <span className="text-slate-300">GHG Protocol Scope 1 & 2</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                id="btn-share-receipt"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'My Climate Impact Receipt',
                      text: `I just saved ${co2eKg >= 1000 ? `${(co2eKg/1000).toFixed(1)}t` : `${co2eKg}kg`} CO₂e with Terraprint! 🌱`,
                      url: window.location.href,
                    });
                  }
                }}
                className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button
                id="btn-download-receipt"
                onClick={() => window.print()}
                className="btn-ghost flex items-center justify-center gap-2 text-sm px-4"
              >
                <Download className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>

        {/* Terraprint branding */}
        <div className="text-center mt-6 flex items-center justify-center gap-2 text-slate-500 text-sm">
          <Leaf className="w-4 h-4 text-brand-500" />
          <span>Verified by <span className="text-white font-semibold">Terraprint</span> · Methodology disclosed at terraprint.io/methodology</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function ImpactReceiptPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center text-slate-400">Loading receipt…</div>}>
      <ReceiptContent />
    </Suspense>
  );
}
