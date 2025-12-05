import { supabase } from './supabaseClient';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import type { AppUser } from '../types/user';
import type { OnboardingState } from '../types/onboarding';

export interface ProfilePreferences {
  onboarding?: OnboardingState;
  [key: string]: unknown;
}

export interface Profile {
  user_id: string;
  full_name?: string;
  name?: string;
  age?: number;
  email?: string;
  bio?: string;
  avatar_url?: string;
  preferences?: ProfilePreferences;
  last_seen_at?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export const authService = {
  async signInWithGoogle(redirectTo?: string) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo ?? window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async updateUserProfile(updates: { name?: string; full_name?: string; age?: number; [key: string]: unknown }) {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });

    if (error) throw error;
    return data;
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if ('code' in error && error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as Profile | null;
  },

  async upsertProfile(profile: Profile) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert([{ ...profile }], { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const rest: Partial<Profile> = { ...updates };
    delete rest.user_id;
    delete rest.created_at;
    delete rest.updated_at;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...rest,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

export function getProfileFromUser(user: User | null): AppUser | null {
  if (!user) return null;

  const metadata = user.user_metadata ?? {};
  const resolvedName =
    (typeof metadata.full_name === 'string' && metadata.full_name.trim()) ||
    (typeof metadata.name === 'string' && metadata.name.trim()) ||
    (user.email ? user.email.split('@')[0] : null) ||
    'New Edutu member';

  const rawAge = metadata.age;
  const parsedAge =
    typeof rawAge === 'number' && Number.isFinite(rawAge)
      ? rawAge
      : typeof rawAge === 'string' && rawAge.trim()
        ? Number.parseInt(rawAge, 10)
        : null;

  const rawCourse =
    typeof metadata.course_of_study === 'string' && metadata.course_of_study.trim()
      ? metadata.course_of_study.trim()
      : undefined;

  return {
    id: user.id,
    name: resolvedName,
    email: user.email ?? undefined,
    ...(Number.isFinite(parsedAge) && parsedAge !== null ? { age: parsedAge as number } : {}),
    ...(rawCourse ? { courseOfStudy: rawCourse } : {})
  };
}

// Helper function to determine if a user is new (just signed up)
// by comparing account creation time with last seen time
export function isNewUser(profile: Profile | null, user: User | null): boolean {
  if (!user || !profile) {
    // If there's no profile, the user is new or hasn't completed onboarding
    return true;
  }

  // Check if the account was just created by comparing creation times
  // If the profile doesn't exist yet, the user needs onboarding
  const userCreatedAt = new Date(user.created_at).getTime();
  const profileCreatedAt = profile.created_at ? new Date(profile.created_at).getTime() : null;

  // If there's no profile, user needs to be onboarded
  if (!profileCreatedAt) return true;

  // Check if profile was just created (within a few seconds of auth account creation)
  // This indicates a new user who hasn't gone through onboarding yet
  const timeDiff = Math.abs(userCreatedAt - profileCreatedAt);
  return timeDiff < 10000; // 10 seconds threshold
}
