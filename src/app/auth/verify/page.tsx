'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email and try again.');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Your email has been verified successfully! You can now sign in to your account.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed. Please try again.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-6">
              {status === 'loading' && (
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Loading className="h-8 w-8 text-primary" />
                </div>
              )}
              {status === 'success' && (
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
              )}
              {status === 'error' && (
                <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold tracking-tight mb-2">
              {status === 'loading' && 'Verifying your email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </h1>

            {/* Message */}
            <p className="text-muted-foreground mb-6">
              {message}
            </p>

            {/* Actions */}
            {status === 'success' && (
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/auth/signin">
                    Sign In to Your Account
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/">
                    Go to Home
                  </Link>
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/auth/signup">
                    Try Signing Up Again
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/">
                    Go to Home
                  </Link>
                </Button>
              </div>
            )}

            {/* Additional info for success */}
            {status === 'success' && (
              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 text-primary">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm font-medium">Welcome to Recall!</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your account is now active and ready to use.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Loading className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight mb-2">Loading...</h1>
              <p className="text-muted-foreground">Please wait while we verify your email.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
} 