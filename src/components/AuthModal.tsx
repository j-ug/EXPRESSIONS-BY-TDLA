import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { User } from '../types';
import { loginUser, signUpUser, ADMIN_CREDENTIALS } from '../utils/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: User) => void;
  onLoginSuccess?: (user: User) => void;
  initialMode?: 'signin' | 'signup';
  promptMessage?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onLoginSuccess,
  initialMode = 'signin',
  promptMessage,
}) => {
  const handleSuccess = (user: User) => {
    if (onLoginSuccess) onLoginSuccess(user);
    if (onSuccess) onSuccess(user);
    onClose();
  };
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = loginUser(email, password);
        if (res.success && res.user) {
          handleSuccess(res.user);
        } else {
          setError(res.error || 'Login failed.');
        }
      } else {
        const res = signUpUser(name, email, password);
        if (res.success && res.user) {
          handleSuccess(res.user);
        } else {
          setError(res.error || 'Sign up failed.');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillAdmin = () => {
    setEmail(ADMIN_CREDENTIALS.email);
    setPassword(ADMIN_CREDENTIALS.password);
    if (mode === 'signup') {
      setName('Gallery Curator (Admin)');
    }
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#21160e]/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#fffdf9] border border-[#ded0be] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#f5ece0] hover:bg-[#ede0ce] text-[#5e4530] hover:text-[#2d1f14] transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header decoration */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#f4ebe0] border border-[#dfd2c0] flex items-center justify-center text-[#85582f]">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#78573a]">
            Atelier Community & Curator Access
          </span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl text-[#2d1f14] tracking-wide mb-1">
          {mode === 'signin' ? 'Sign In to Atelier' : 'Create an Account'}
        </h2>

        <p className="text-xs text-[#6e543f] leading-relaxed mb-4">
          {promptMessage ||
            'Sign in to leave reviews and botanical reflections on artworks, or access curator canvas tools.'}
        </p>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-[#f5ecdf] p-1 mb-5 border border-[#dfd2c0]">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-[#fffdf9] text-[#2d1f14] shadow-sm font-semibold'
                : 'text-[#7d6148] hover:text-[#2d1f14]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#fffdf9] text-[#2d1f14] shadow-sm font-semibold'
                : 'text-[#7d6148] hover:text-[#2d1f14]'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#fdf1f1] border border-[#f5c6c6] text-xs text-[#a33232]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7d6148] mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#9c816a] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Botanical Enthusiast / Curator"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#fffefc] border border-[#d6c4af] text-xs text-[#2d1f14] focus:outline-none focus:border-[#85582f] transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7d6148] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9c816a] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#fffefc] border border-[#d6c4af] text-xs text-[#2d1f14] focus:outline-none focus:border-[#85582f] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7d6148] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9c816a] absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#fffefc] border border-[#d6c4af] text-xs text-[#2d1f14] focus:outline-none focus:border-[#85582f] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-[#85582f] hover:bg-[#6e4622] active:scale-98 text-[#fffefa] text-xs font-semibold shadow-md border border-[#9e6d3d] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{mode === 'signin' ? 'Sign In to Continue' : 'Create Account & Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Fill Admin Helper */}
        <div className="mt-5 pt-4 border-t border-[#dfd2c0] flex items-center justify-between text-[11px] text-[#7d6148]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#85582f]" />
            <span>Admin credentials:</span>
          </div>
          <button
            type="button"
            onClick={handleFillAdmin}
            className="px-2 py-1 rounded bg-[#f5ecdf] hover:bg-[#ede0ce] text-[#6b5038] font-mono text-[10px] border border-[#ded0be] transition-colors cursor-pointer"
          >
            Autofill Admin
          </button>
        </div>
      </div>
    </div>
  );
};
