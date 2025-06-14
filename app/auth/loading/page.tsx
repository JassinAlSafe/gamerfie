"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AuthLoadingPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting with Google...');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    const success = searchParams.get('success');
    const customMessage = searchParams.get('message');

    if (error) {
      setStatus('error');
      
      // Set appropriate error message based on error type
      let errorMsg = 'Authentication failed. Please try again.';
      if (customMessage) {
        errorMsg = decodeURIComponent(customMessage);
      } else {
        switch (error) {
          case 'oauth':
            errorMsg = 'Google sign-in was cancelled or failed. Please try again.';
            break;
          case 'callback':
            errorMsg = 'There was an issue completing your sign-in. Please try again.';
            break;
          case 'invalid':
            errorMsg = 'Invalid authentication request. Please start the sign-in process again.';
            break;
          default:
            errorMsg = 'An unexpected error occurred. Please try signing in again.';
        }
      }
      
      setMessage(errorMsg);
      setTimeout(() => {
        router.push('/signin');
      }, 4000);
    } else if (success) {
      setStatus('success');
      setMessage('Successfully signed in! Welcome to Game Vault.');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } else {
      // Default loading state with progressive messages
      const messages = [
        'Connecting with Google...',
        'Verifying your account...',
        'Setting up your profile...',
        'Almost there...'
      ];
      
      let messageIndex = 0;
      const messageInterval = setInterval(() => {
        if (messageIndex < messages.length - 1 && status === 'loading') {
          messageIndex++;
          setMessage(messages[messageIndex]);
        }
      }, 2000);

      // If it takes too long, show error
      const errorTimeout = setTimeout(() => {
        if (status === 'loading') {
          setStatus('error');
          setMessage('Authentication is taking longer than expected. This might be due to a slow connection.');
          setTimeout(() => {
            router.push('/signin');
          }, 4000);
        }
      }, 10000);

      // Cleanup intervals
      return () => {
        clearInterval(messageInterval);
        clearTimeout(errorTimeout);
      };
    }
  }, [searchParams, router, status]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
          {/* Logo/Brand */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">GAME VAULT</h1>
            <p className="text-gray-400 text-sm">Your ultimate gaming platform</p>
          </div>

          {/* Status Icon */}
          <div className="mb-6">
            {status === 'loading' && (
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            )}
            {status === 'error' && (
              <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            )}
          </div>

          {/* Message */}
          <h2 className="text-xl font-semibold text-white mb-3">
            {status === 'loading' && 'Signing You In'}
            {status === 'success' && 'Welcome Back!'}
            {status === 'error' && 'Oops! Something Went Wrong'}
          </h2>
          
          <p className="text-gray-300 text-sm leading-relaxed mb-6">
            {message}
          </p>

          {/* Progress indicator for loading */}
          {status === 'loading' && (
            <div className="w-full bg-gray-700 rounded-full h-1.5 mb-4">
              <div className="bg-gradient-to-r from-purple-600 to-purple-400 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          )}

          {/* Additional actions */}
          {status === 'error' && (
            <button
              onClick={() => router.push('/signin')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
            >
              Try Again
            </button>
          )}

          {/* Security notice */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secured by OAuth 2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}