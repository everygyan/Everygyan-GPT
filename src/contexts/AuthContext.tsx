import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null; requiresConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: { full_name?: string; bio?: string; avatar_url?: string }) => Promise<{ error: string | null }>;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isAuthor: boolean;
  isModerator: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('reader');
  const [loading, setLoading] = useState(true);

  // Fetch verified profile from public.profiles table
  const fetchProfile = async (userId: string, userEmail?: string) => {
    if (!isSupabaseConfigured) {
      // Offline fallback state
      const fallback: UserProfile = {
        id: userId,
        email: userEmail || 'member@everygyan.com',
        full_name: 'Member',
        role: 'reader',
        created_at: new Date().toISOString(),
      };
      setProfile(fallback);
      setRole('reader');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as UserProfile);
        setRole(data.role as UserRole);
      } else {
        // Fallback default if profile trigger is pending
        const safeProfile: UserProfile = {
          id: userId,
          email: userEmail || '',
          full_name: 'Reader',
          role: 'reader',
          created_at: new Date().toISOString(),
        };
        setProfile(safeProfile);
        setRole('reader');
      }
    } catch (err) {
      console.warn('[AuthContext] Error fetching user profile:', err);
      setRole('reader');
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initializeSession() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!error && session?.user && mounted) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user.email);
        }
      } catch (err) {
        console.warn('[AuthContext] Session init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeSession();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session: Session | null) => {
          if (!mounted) return;
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id, session.user.email);
          } else {
            setUser(null);
            setProfile(null);
            setRole('reader');
          }
          setLoading(false);
        }
      );

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      // Mock login for offline development
      const mockUser = { id: 'mock-user-1', email } as User;
      setUser(mockUser);
      setProfile({
        id: 'mock-user-1',
        email,
        full_name: email.split('@')[0],
        role: 'reader',
        created_at: new Date().toISOString(),
      });
      setRole('reader');
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Login failed' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error: string | null; requiresConfirmation?: boolean }> => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      // Check if email confirmation is required by Supabase settings
      const requiresConfirmation = Boolean(data.user && !data.session);
      return { error: null, requiresConfirmation };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Registration failed' };
    }
  };

  const signOut = async (): Promise<void> => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setRole('reader');
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Password reset failed' };
    }
  };

  const updatePassword = async (password: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Password update failed' };
    }
  };

  const updateProfile = async (updates: {
    full_name?: string;
    bio?: string;
    avatar_url?: string;
  }): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not authenticated' };

    if (!isSupabaseConfigured) {
      if (profile) {
        setProfile({ ...profile, ...updates });
      }
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) return { error: error.message };
      await fetchProfile(user.id, user.email);
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Profile update failed' };
    }
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    return allowedRoles.includes(role);
  };

  const isAdmin = role === 'admin';
  const isEditor = role === 'editor' || isAdmin;
  const isAuthor = role === 'author' || isEditor;
  const isModerator = role === 'moderator' || isEditor;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        hasRole,
        isAdmin,
        isEditor,
        isAuthor,
        isModerator,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
