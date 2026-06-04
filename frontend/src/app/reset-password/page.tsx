'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { FiLock, FiAlertCircle, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import { Suspense } from 'react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
    }

    if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
    }

    if (!token) {
        setError('Missing reset token');
        return;
    }
    
    setLoading(true);

    try {
      await confirmPasswordReset(auth, token, password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      let errorMessage = 'An error occurred. Please try again.';
      
      if (err.code === 'auth/expired-action-code') {
        errorMessage = 'The reset link has expired. Please request a new one.';
      } else if (err.code === 'auth/invalid-action-code') {
        errorMessage = 'The reset link is invalid. Please request a new one.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
      return (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <FiCheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Password Reset Successful</h3>
            <p className="text-sm text-gray-500 mb-6">
            Your password has been successfully reset. You will be redirected to the login page shortly.
            </p>
            <Link href="/login" className="btn-primary w-full inline-block">
            Go to Login
            </Link>
        </div>
      );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
        {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-3">
            <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
        </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            New Password
            </label>
            <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="••••••••"
            />
            </div>
        </div>

        <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
            </label>
            <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="••••••••"
            />
            </div>
        </div>

        <button
            type="submit"
            disabled={loading || !token}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? 'Resetting Password...' : 'Reset Password'}
        </button>
        </form>

        <div className="mt-6 text-center">
        <Link href="/login" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
        </Link>
        </div>
    </div>
  );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen pt-20 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-200 to-purple-200 rounded-full blur-3xl opacity-30 -z-10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-30 -z-10" />
    
            <div className="max-w-md w-full">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-display font-bold mb-2 gradient-text">
                Reset Password
                </h1>
                <p className="text-gray-600">
                Enter your new password below.
                </p>
            </div>
            
            <Suspense fallback={<div className="text-center">Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
            </div>
        </div>
    );
}
