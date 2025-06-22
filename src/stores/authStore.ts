
import { create } from 'zustand';
import { User, AuthState } from '../types';
import { SupabaseAuthService } from '../services/supabase/auth';
import { supabase } from '../services/supabase/config';

interface AuthActions {
  // Auth state actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  
  // Session management
  initializeAuth: () => Promise<void>;
  clearAuth: () => void;
}

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  isLoading: false,
  isAuthenticated: false,

  // Actions
  setUser: (user) => 
    set({ 
      user, 
      isAuthenticated: !!user 
    }),

  setLoading: (isLoading) => 
    set({ isLoading }),

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { user: supabaseUser } = await SupabaseAuthService.signIn(email, password);
      
      if (supabaseUser) {
        const user = SupabaseAuthService.mapSupabaseUser(supabaseUser);
        get().setUser(user);
        set({ isLoading: false });
        return true;
      }
      
      set({ isLoading: false });
      return false;
    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false });
      return false;
    }
  },

  signup: async (email, password, firstName, lastName) => {
    set({ isLoading: true });
    try {
      const { user: supabaseUser } = await SupabaseAuthService.signUp(
        email, 
        password, 
        firstName, 
        lastName
      );
      
      if (supabaseUser) {
        const user = SupabaseAuthService.mapSupabaseUser(supabaseUser);
        get().setUser(user);
        set({ isLoading: false });
        return true;
      }
      
      set({ isLoading: false });
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await SupabaseAuthService.signOut();
      get().clearAuth();
    } catch (error) {
      console.error('Logout error:', error);
      set({ isLoading: false });
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const session = await SupabaseAuthService.getCurrentSession();
      
      if (session?.user) {
        const user = SupabaseAuthService.mapSupabaseUser(session.user);
        get().setUser(user);
      }
      
      set({ isLoading: false });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false });
    }
  },

  clearAuth: () => 
    set({ 
      user: null, 
      isAuthenticated: false, 
      isLoading: false 
    }),
}));

// Set up auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  const { setUser, clearAuth } = useAuthStore.getState();
  
  if (event === 'SIGNED_IN' && session?.user) {
    const user = SupabaseAuthService.mapSupabaseUser(session.user);
    setUser(user);
  } else if (event === 'SIGNED_OUT') {
    clearAuth();
  }
});