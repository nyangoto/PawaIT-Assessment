// Provides authentication state and functions using Supabase.
// Manages user session, loading state, and provides auth methods.

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User, AuthError, Provider } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router

interface AuthContextData {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isGuest: boolean; // True if user is anonymous or null
  isAuthenticated: boolean; // True only if logged in and not anonymous
  signInWithOAuth: (provider: Provider) => Promise<{ error: AuthError | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  updateUserCredentials: (email?: string, password?: string) => Promise<{ error: AuthError | null }>; // For linking anonymous
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    // Check initial session state
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
       if (isMounted) {
         if (error) {
           console.error("Error getting initial session:", error);
         }
         setSession(initialSession);
         setUser(initialSession?.user ?? null);
         setIsLoading(false);
       }
    }).catch(err => {
        if (isMounted) {
            console.error("Exception getting initial session:", err);
            setIsLoading(false);
        }
    });


    // Listen for auth state changes (login, logout, token refresh, signup, anonymous conversion)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, sessionState) => {
         if (isMounted) {
            console.log("Auth state changed:", _event, sessionState?.user?.id, sessionState?.user?.role);
            setSession(sessionState);
            setUser(sessionState?.user ?? null);
            // Ensure loading is false once we have definitive state
            if (isLoading) setIsLoading(false);
         }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []); // Run only once on mount


  const isGuest = !user || !!user.is_anonymous;
  const isAuthenticated = !!user && !user.is_anonymous;

  // Wrap Supabase methods to handle errors and potentially add logging/side effects
  const signInWithOAuth = async (provider: Provider) => {
    console.log(`Attempting OAuth sign-in with ${provider}...`);
    const { data, error } = await supabase.auth.signInWithOAuth({
       provider,
       options: {
         redirectTo: window.location.origin + '/auth/callback', // Ensure this callback route exists or adjust
       },
    });
    if (error) console.error(`OAuth Sign In Error (${provider}):`, error.message);
    return { error };
  };

  const signInWithPassword = async (email: string, password: string) => {
    console.log("Attempting password sign-in...");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) console.error("Password Sign In Error:", error.message);
    else console.log("Password sign-in successful for:", data.user?.id);
    return { error };
  };

  const signOut = async () => {
    console.log("Signing out...");
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Sign Out Error:", error.message);
    else {
        setSession(null);
        setUser(null);
        console.log("Sign out successful.");
        // Optionally redirect to home or login page
        // router.push('/');
    }
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    console.log("Attempting sign-up...");
    // Options can include redirect URLs or custom data
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            // emailRedirectTo: `${window.location.origin}/welcome`, // Example redirect after email confirm
        }
    });
    if (error) console.error("Sign Up Error:", error.message);
    else console.log("Sign up successful (check email for confirmation if enabled):", data.user?.id);
    // Note: User might be in session but needs email verification depending on settings
    return { error };
  };

  const updateUserCredentials = async (email?: string, password?: string) => {
      console.log("Attempting to update user credentials (link anonymous)...");
      if (!user || !user.is_anonymous) {
          const msg = "User must be anonymous to link account.";
          console.error(msg);
          return { error: new AuthError(msg) };
      }
      if (!email || !password) {
          const msg = "Email and password required to link anonymous user.";
          console.error(msg);
          return { error: new AuthError(msg) };
      }

      const { data, error } = await supabase.auth.updateUser({ email, password });
      if (error) console.error("Update User (Link Anonymous) Error:", error.message);
      else console.log("Anonymous user linked successfully:", data.user?.id);
      return { error };
  };


  const value: AuthContextData = {
    session,
    user,
    isLoading,
    isGuest,
    isAuthenticated,
    signInWithOAuth,
    signInWithPassword,
    signOut,
    signUp,
    updateUserCredentials,
  };

  // Don't render children until initial auth check is complete
  return (
    <AuthContext.Provider value={value}>
      {isLoading ? <div>Loading Authentication...</div> : children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 