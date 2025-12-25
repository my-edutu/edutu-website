import React, { useState, useEffect, useContext, createContext } from 'react';
import type { AppUser } from '../types/user';
import { authService } from '../lib/auth';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: (redirectTo?: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode, initialUser: AppUser | null }> = ({ 
  children, 
  initialUser 
}) => {
  const [user, setUser] = useState<AppUser | null>(initialUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set the initial user
    setUser(initialUser);
    setLoading(false);

    // Set up auth state change listener
    const { data: { subscription } } = authService.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // User is signed in
        const profile = authService.getProfileFromUser(session.user);
        if (profile) {
          setUser(profile);
        }
      } else {
        // User is signed out
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialUser]);

  const signInWithGoogle = async (redirectTo?: string) => {
    try {
      await authService.signInWithGoogle(redirectTo);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};