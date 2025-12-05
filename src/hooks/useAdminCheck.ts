import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface AdminCheckState {
  isAdmin: boolean;
  loading: boolean;
  user: User | null;
}

const DEFAULT_ADMIN_EMAILS = ['admin@edutu.ai', 'founder@edutu.ai'];
const LOCAL_OVERRIDE_KEY = 'edutu.admin.override';

const hasAdminOverride = () => {
  try {
    return localStorage.getItem(LOCAL_OVERRIDE_KEY) === 'true';
  } catch {
    return false;
  }
};

const isWhitelistedAdmin = (user: User | null) => {
  if (!user?.email) {
    return false;
  }

  return DEFAULT_ADMIN_EMAILS.some(
    (email) => email.trim().toLowerCase() === user.email?.trim().toLowerCase()
  );
};

export function useAdminCheck(): AdminCheckState {
  const [state, setState] = useState<AdminCheckState>({
    isAdmin: false,
    loading: true,
    user: null
  });

  useEffect(() => {
    // Get initial user state
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        console.error('Error getting user:', error);
        setState(prev => ({ ...prev, loading: false, user: null, isAdmin: false }));
        return;
      }

      const override = hasAdminOverride();
      const isAdmin = override || isWhitelistedAdmin(user);

      setState({
        user: user,
        loading: false,
        isAdmin
      });
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const supabaseUser = session?.user || null;
      const override = hasAdminOverride();
      const isAdmin = override || isWhitelistedAdmin(supabaseUser);

      setState({
        user: supabaseUser,
        loading: false,
        isAdmin
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return state;
}

export function setAdminOverride(value: boolean) {
  try {
    localStorage.setItem(LOCAL_OVERRIDE_KEY, value ? 'true' : 'false');
  } catch {
    // no-op
  }
}
