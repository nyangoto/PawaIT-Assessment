'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Assuming shadcn/ui
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, session, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

 // Redirect if already logged in
  useEffect(() => {
      if (!isAuthLoading && session && !session.user.is_anonymous) {
          router.replace('/chat'); // Redirect to chat if logged in
      }
  }, [session, isAuthLoading, router]);


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
     if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }


    setIsLoading(true);
    const { error: signUpError, data } = await signUp(email, password);
    setIsLoading(false);

    if (signUpError) {
      setError(signUpError.message || 'Registration failed. Please try again.');
    } else {
       // Check if email confirmation is required
        if (data.user && data.user.identities && data.user.identities.length === 0) {
             setSuccessMessage('Registration successful! Please check your email to confirm your account.');
             // Don't redirect yet, user needs to confirm email
        } else {
            // Auto-confirmed or confirmation not required
            setSuccessMessage('Registration successful! Redirecting...');
            // The onAuthStateChange listener might handle redirect, but we can push too
            setTimeout(() => router.push('/chat'), 1500);
        }
    }
  };

   if (isAuthLoading || (!isAuthLoading && session && !session.user.is_anonymous)) {
     return <div>Loading...</div>; // Or a spinner
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Create Account</h1>
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Registration Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
         {successMessage && (
          <Alert variant="default" className="bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              disabled={isLoading || !!successMessage}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="•••••••• (min. 6 characters)"
              disabled={isLoading || !!successMessage}
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={isLoading || !!successMessage}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || !!successMessage}>
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
        </form>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-500">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
} 