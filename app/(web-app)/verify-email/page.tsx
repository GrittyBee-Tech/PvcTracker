"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Swal from 'sweetalert2';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your account...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    // Automatically trigger backend verification endpoint on mount
    const triggerVerification = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
          return;
        }

        setStatus('success');
        Swal.fire({
          icon: "success",
          title: "Email Verified!",
          text: 'Your email has been successfully verified! Redirecting to login...'
        })
        
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
        
      } catch (err) {
        setStatus('error');
        setMessage('A network error occurred. Please try again.');
      }
    };

    triggerVerification();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-accent/40 to-background text-white p-6">
      <div className="max-w-md w-full bg-zinc-700 border border-zinc-500 p-8 rounded-lg text-center space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Account Verification</h1>
        
        {status === 'loading' && (
          <div className="text-amber-500 animate-pulse font-medium">{message}</div>
        )}

        {status === 'success' && (
          <div className="text-green-400 font-medium bg-green-950/40 p-4 rounded border border-green-800">
            {message}
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="text-red-400 font-medium bg-red-950/40 p-4 rounded border border-red-800">
              {message}
            </div>
            <button 
              onClick={() => router.push('/register')}
              className="px-4 py-2 bg-amber-500 text-zinc-950 font-bold rounded hover:bg-amber-600 transition-colors text-sm"
            >
              Back to Registration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Main page wrapper satisfying Next.js build compilation rules
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#10200e] text-white">
        <p>Loading application contexts...</p>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}