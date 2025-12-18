'use client';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  // Load remembered email on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('rememberedEmail');
      if (savedEmail) {
        setRememberMe(true);
        // Pre-fill email input
        const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
        if (emailInput) {
          emailInput.value = savedEmail;
        }
      }
    }
  }, []);

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetMessage('If that email exists in our system, a reset link has been sent. Check your email.');
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetMessage('');
          setResetEmail('');
        }, 4000);
      } else {
        setResetMessage(data.error || 'Failed to send reset email');
      }
    } catch (error) {
      setResetMessage('An error occurred. Please try again.');
    } finally {
      setResetLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Save or remove email from localStorage based on rememberMe
    if (typeof window !== 'undefined') {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-purple-500/10"
    >
      {/* Logo Section */}
      <div className="text-center mb-5">
        <Link href="/" className="inline-flex items-center gap-2 justify-center">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">&lt;/&gt;</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            DevCollab
          </span>
        </Link>
      </div>

      {/* Heading */}
      <div className="text-center mb-5">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-slate-400 text-sm mt-1">Sign in to your DevCollab account</p>
      </div>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-500/10 border border-red-500/20 text-red-400 p-2 rounded-xl mb-4 text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </motion.div>
      )}

      {/* OAuth Buttons */}
      <div className="space-y-2 mb-4">
        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl })}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-xl text-sm font-medium transition-all cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
        
        <button
          type="button"
          onClick={() => signIn('github', { callbackUrl })}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium transition-all cursor-pointer"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Continue with GitHub
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center my-5">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="px-3 text-xs text-slate-500 bg-transparent">or continue with email</span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>

      {/* Email Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-slate-500 transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              placeholder="Enter your password"
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-slate-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-slate-400">Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-400">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
          Sign up
        </Link>
      </p>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowForgotPassword(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-2">Reset Password</h3>
            <p className="text-slate-400 text-sm mb-4">
              Enter your email and we&apos;ll send you a reset link
            </p>

            {resetMessage && (
              <div className={`p-3 rounded-xl mb-4 text-sm ${
                resetMessage.includes('sent') 
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {resetMessage}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-slate-500"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetMessage('');
                    setResetEmail('');
                  }}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {resetLoading ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Animated gradient blobs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      <Suspense fallback={
        <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 animate-pulse">
          <div className="h-10 w-10 bg-slate-700 rounded-lg mx-auto mb-4"></div>
          <div className="h-6 bg-slate-700 rounded w-1/2 mx-auto mb-8"></div>
          <div className="h-8 bg-slate-700 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2 mx-auto mb-8"></div>
          <div className="space-y-3">
            <div className="h-12 bg-slate-700 rounded-xl"></div>
            <div className="h-12 bg-slate-700 rounded-xl"></div>
          </div>
        </div>
      }>
        <SignInForm />
      </Suspense>
    </div>
  );
}
