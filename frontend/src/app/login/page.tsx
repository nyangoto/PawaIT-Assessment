'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Assuming shadcn/ui
import { Github, Chrome } from 'lucide-react'; // Example icons for social login
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithPassword, signInWithOAuth, session, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
      if (!isAuthLoading && session && !session.user.is_anonymous) {
          router.replace('/chat'); // Redirect to chat if logged in
      }
  }, [session, isAuthLoading, router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const { error: loginError } = await signInWithPassword(email, password);
    setIsLoading(false);
    if (loginError) {
      setError(loginError.message || 'Login failed. Please check your credentials.');
    } else {
      // Redirect is handled by onAuthStateChange in AuthContext or the useEffect above
       router.push('/chat'); // Explicit push after successful action
    }
  };

   const handleSocialLogin = async (provider: 'github' | 'google') => {
       setError(null);
       setIsLoading(true);
       const { error: oauthError } = await signInWithOAuth(provider);
       setIsLoading(false); // Loading state might end before redirect happens
       if (oauthError) {
           setError(oauthError.message || `Failed to sign in with ${provider}.`);
       }
       // Supabase handles the redirect flow
   };

  if (isAuthLoading || (!isAuthLoading && session && !session.user.is_anonymous)) {
     return <div>Loading...</div>; // Or a spinner
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Sign In</h1>
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Login Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              disabled={isLoading}
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
              placeholder="••••••••"
              disabled={isLoading}
            />
            {/* Add Forgot Password link here if needed */}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

         <div className="relative my-4">
             <div className="absolute inset-0 flex items-center">
                 <span className="w-full border-t border-gray-300 dark:border-gray-600" />
             </div>
             <div className="relative flex justify-center text-xs uppercase">
                 <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                 Or continue with
                 </span>
             </div>
         </div>

          <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => handleSocialLogin('github')} disabled={isLoading}>
                  <Github className="mr-2 h-4 w-4" /> GitHub
              </Button>
               <Button variant="outline" onClick={() => handleSocialLogin('google')} disabled={isLoading}>
                   <Chrome className="mr-2 h-4 w-4" /> Google
               </Button>
          </div>


        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:underline dark:text-blue-500">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
} 