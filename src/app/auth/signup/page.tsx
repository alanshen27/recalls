'use client';

export const dynamic = 'force-dynamic';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Loading } from '@/components/ui/loading';
import { Brain, Zap, Users, TrendingUp, Eye, EyeOff, Mail } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

function SignUp() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const router = useRouter();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    console.log(formData)

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      console.log(response)

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Show success message
      toast.success('Registration successful');
      setIsSuccess(true);
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Registration failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signIn('google', { 
        callbackUrl: callbackUrl,
        redirect: false 
      });
      
      if (result?.error) {
        if (result.error.includes('verify your email')) {
          setErrors({ general: 'Please verify your email address before signing in with Google.' });
        } else {
          setErrors({ general: 'Google sign-up failed. Please try again.' });
        }
        setIsGoogleLoading(false);
      } else if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error('Google sign-up error:', error);
      setErrors({ general: 'Google sign-up failed. Please try again.' });
      setIsGoogleLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-md">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Join Recall
            </h1>
            <p className="text-muted-foreground">
              Create your account to start your learning journey
            </p>
          </div>
          
          {/* Sign Up Card */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              {isSuccess ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight mb-4">
                    Check your email!
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    We've sent a verification link to <strong>{formData.email}</strong>. 
                    Click the link in your email to verify your account and start learning.
                  </p>
                  <div className="space-y-3">
                    <Button asChild className="w-full">
                      <Link href="/auth/signin">
                        Go to Sign In
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setIsSuccess(false)}
                    >
                      Sign up with different email
                    </Button>
                  </div>
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm text-primary">
                      <strong>Didn't receive the email?</strong> Check your spam folder or 
                      try signing up again with a different email address.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Google Sign Up */}
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base font-medium mb-6"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Signing up...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                      </div>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or skibidi sigma continue with email</span>
                    </div>
                  </div>

                  {/* Email/Password Form */}
                  <form onSubmit={handleSignUp} className="space-y-4">
                    {errors.general && (
                      <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                        {errors.general}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Create a password"
                          className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-600">{errors.password}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                      />
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Creating account...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{' '}
                      <Link href="/auth/signin" className="text-primary hover:underline">
                        Sign in
                      </Link>
                    </p>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      By creating an account, you agree to our{' '}
                      <Link href="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Features Preview */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Smart Learning</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Collaborate</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Track Progress</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Hero */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/5 via-background to-muted/30 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(254,143,84,0.1),transparent_50%)]" />
        
        <div className="relative flex items-center justify-center w-full">
          <div className="max-w-lg text-center px-8">
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Brain className="h-12 w-12 text-primary" />
            </div>
            
            <h2 className="text-4xl font-bold tracking-tight mb-6">
              Start Your Learning Journey
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Join thousands of students who are already using Recall to improve their grades, 
              boost retention, and achieve their learning goals.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">50K+</div>
                <div className="text-sm text-muted-foreground">Active Learners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">1M+</div>
                <div className="text-sm text-muted-foreground">Flashcards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
            
            {/* Testimonial */}
            <div className="mt-12 p-6 bg-background/50 backdrop-blur-sm rounded-2xl border">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "This app has completely changed how I study. The spaced repetition system 
                is incredibly effective and I've seen a huge improvement in my retention."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">S</span>
                </div>
                <div>
                  <div className="font-semibold text-sm">Sarah Mitchell</div>
                  <div className="text-xs text-muted-foreground">Medical Student</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loading /></div>}>
      <SignUp />
    </Suspense>
  );
} 