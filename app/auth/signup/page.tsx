'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GeistSans } from 'geist/font/sans';
import { BookOpen, Mail, Lock, User, AlertCircle, Loader2, Check, MailCheck } from 'lucide-react';

export default function SignUp() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { signUp, signInWithGoogle, user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecial: false,
  });

  useEffect(() => {
    if (!authLoading && user) {
      if (userProfile && !userProfile.onboardingCompleted) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, userProfile, authLoading, router]);

  useEffect(() => {
    setPasswordStrength({
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  const validateForm = () => {
    if (!displayName.trim()) {
      setError('Please enter your name.');
      return false;
    }

    if (!email.trim()) {
      setError('Please enter your email.');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }

    if (!passwordStrength.hasNumber || !passwordStrength.hasSpecial) {
      setError('Password must include at least one number and one special character.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, displayName);
      setEmailSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      // Note: For OAuth, the page will redirect, so no need to manually route
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google.');
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className={`${GeistSans.className} bg-black text-[#8a8f98] antialiased min-h-screen flex items-center justify-center px-6 py-12`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent blur-[120px] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md"
        >
          <Link href="/" className="flex items-center gap-2 mb-8 text-white hover:text-gray-300 transition-colors" aria-label="Go to homepage">
            <div className="w-6 h-6 bg-white/10 rounded-md flex items-center justify-center">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <span className="text-sm font-medium tracking-tight">Enfinotes</span>
          </Link>
          <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <MailCheck className="w-7 h-7 text-indigo-400" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-medium text-white mb-2">Check your email</h1>
            <p className="text-sm text-[#8a8f98] mb-1">
              We sent a confirmation link to
            </p>
            <p className="text-sm font-medium text-white mb-6">{email}</p>
            <p className="text-xs text-[#8a8f98] mb-8">
              Click the link in the email to activate your account. The link expires in 24 hours. Check your spam folder if you don&apos;t see it.
            </p>
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center w-full h-11 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-medium hover:bg-white/10 transition-all"
            >
              Back to sign in
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`${GeistSans.className} bg-black text-[#8a8f98] antialiased min-h-screen flex items-center justify-center px-6 py-12`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <Link href="/" className="flex items-center gap-2 mb-8 text-white hover:text-gray-300 transition-colors" aria-label="Go to homepage">
          <div className="w-6 h-6 bg-white/10 rounded-md flex items-center justify-center">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium tracking-tight">Enfinotes</span>
        </Link>

        <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-medium text-white mb-2">Create your account</h1>
          <p className="text-sm text-[#8a8f98] mb-8">Start creating amazing content today</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3" role="alert" aria-live="polite">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-red-400" id="error-message">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-white mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
                  placeholder="John Doe"
                  aria-describedby={error ? "error-message" : undefined}
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
                  placeholder="you@example.com"
                  aria-describedby={error ? "error-message" : undefined}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
                  placeholder="••••••••"
                  aria-describedby="password-requirements"
                  autoComplete="new-password"
                />
              </div>

              {password && (
                <div className="mt-3 space-y-2" id="password-requirements" role="status" aria-live="polite">
                  <div className="flex items-center gap-2 text-xs">
                    <Check className={`w-3 h-3 ${passwordStrength.minLength ? 'text-green-400' : 'text-gray-600'}`} aria-hidden="true" />
                    <span className={passwordStrength.minLength ? 'text-green-400' : 'text-gray-500'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Check className={`w-3 h-3 ${passwordStrength.hasNumber ? 'text-green-400' : 'text-gray-600'}`} aria-hidden="true" />
                    <span className={passwordStrength.hasNumber ? 'text-green-400' : 'text-gray-500'}>
                      Contains a number
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Check className={`w-3 h-3 ${passwordStrength.hasSpecial ? 'text-green-400' : 'text-gray-600'}`} aria-hidden="true" />
                    <span className={passwordStrength.hasSpecial ? 'text-green-400' : 'text-gray-500'}>
                      Contains a special character
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
                  placeholder="••••••••"
                  aria-describedby={error ? "error-message" : undefined}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Creating account...</span>
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[#0c0c0c] text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full h-12 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-label="Sign up with Google"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google</span>
              </>
            )}
          </button>

          <p className="mt-6 text-center text-sm text-[#8a8f98]">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
