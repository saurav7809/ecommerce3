// ─── Auth Modal ───────────────────────────────────────────────────────────────

import { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { login, register } from '../../api/client';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type Mode = 'login' | 'register';

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAccount = useAuthStore((s) => s.setAccount);

  if (!open) return null;

  const reset = () => { setName(''); setEmail(''); setPassword(''); setError(''); };
  const switchMode = (m: Mode) => { setMode(m); reset(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const resp =
        mode === 'register'
          ? await register({ name, email, password })
          : await login({ email, password });
      setAccount({ name: resp.name, email: resp.email, token: resp.token });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      <form
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 space-y-5"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs tracking-widest uppercase text-stone-400">Your own little corner</p>
            <h2 className="text-xl font-semibold text-stone-900 mt-0.5">
              {mode === 'login' ? 'Welcome back' : 'Make an account'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 -mr-2 hover:bg-stone-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-stone-500">Save your details and keep track of your orders.</p>

        <div className="space-y-3">
          {mode === 'register' && (
            <label className="block">
              <span className="text-xs font-medium text-stone-600">Your name</span>
              <input
                required
                maxLength={100}
                placeholder="First and last name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-stone-500 transition-colors"
              />
            </label>
          )}
          <label className="block">
            <span className="text-xs font-medium text-stone-600">Email address</span>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-stone-500 transition-colors"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-stone-600">Password</span>
            <input
              type="password"
              required
              minLength={8}
              maxLength={100}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-stone-500 transition-colors"
            />
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl py-3.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          {loading
            ? 'Please wait…'
            : <>{mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></>}
        </button>

        <button
          type="button"
          onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
          className="w-full text-sm text-stone-500 hover:text-stone-900 transition-colors text-center"
        >
          {mode === 'login'
            ? 'New here? Create an account'
            : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  );
}

