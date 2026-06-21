'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Chrome } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [mode, setMode]         = useState<'login' | 'signup'>('login');
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const router                  = useRouter();

  function switchMode(next: 'login' | 'signup') {
    setMode(next);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      redirect:    false,
      email,
      password,
      mode,                        // ← tells the server: "login" or "signup"
      callbackUrl: '/dashboard',
    });

    setLoading(false);

    if (result?.error) {
      // NextAuth wraps the thrown message — strip the prefix if present
      const msg = result.error.replace(/^.*Error:\s*/i, '');
      setError(msg);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 relative overflow-hidden">

      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full
                      bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full
                      bg-violet-600/8 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <Link href="/" className="flex items-center mb-6">
            <span className="text-3xl tracking-tighter">
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-500">
                Terra
              </span>
              <span className="font-light text-white">print</span>
              <span className="text-brand-500">.</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-center">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-slate-400 text-sm mt-1 text-center">
            {mode === 'login'
              ? 'Sign in to your carbon footprint dashboard'
              : 'Start tracking your impact for free'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-7"
        >
          {/* Mode tabs */}
          <div role="tablist" aria-label="Authentication mode" className="flex rounded-xl bg-surface-muted p-1 mb-6 gap-1">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                  ${mode === m
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            id="btn-google-auth"
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="btn-ghost w-full flex items-center justify-center gap-3 py-3 mb-4"
          >
            <Chrome className="w-4 h-4" />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-surface-muted" />
            <span className="text-xs text-slate-500">or with email</span>
            <div className="flex-1 h-px bg-surface-muted" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/40 rounded-xl p-3
                             text-red-400 text-sm text-center leading-snug"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" aria-hidden="true" />
              <label htmlFor="input-email" className="sr-only">Email address</label>
              <input
                id="input-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-required="true"
                aria-label="Email address"
                autoComplete="email"
                className="w-full bg-surface-muted border border-surface-border rounded-xl
                           py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600
                           focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30
                           transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" aria-hidden="true" />
              <label htmlFor="input-password" className="sr-only">Password</label>
              <input
                id="input-password"
                type={showPass ? 'text' : 'password'}
                placeholder={mode === 'signup' ? 'Min. 8 characters' : 'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-required="true"
                aria-label="Password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                minLength={mode === 'signup' ? 8 : 1}
                className="w-full bg-surface-muted border border-surface-border rounded-xl
                           py-3 pl-10 pr-10 text-sm text-white placeholder-slate-600
                           focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30
                           transition-all duration-200"
              />
              <button
                type="button"
                aria-label={showPass ? 'Hide password' : 'Show password'}
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                {showPass ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>

            <button
              id="btn-submit-auth"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-1 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <span className="animate-pulse">
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        <p className="text-center text-xs text-slate-600 mt-5">
          By continuing you agree to our{' '}
          <span className="text-slate-400 hover:text-white cursor-pointer">Terms</span> and{' '}
          <span className="text-slate-400 hover:text-white cursor-pointer">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
