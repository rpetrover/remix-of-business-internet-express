import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_CACHE_KEY = 'bie_admin_verified';

interface AdminCache {
  userId: string;
  verified: boolean;
  timestamp: number;
}

function readCache(): AdminCache | null {
  try {
    const raw = sessionStorage.getItem(ADMIN_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminCache;
    // Cache valid for 30 minutes
    if (Date.now() - parsed.timestamp > 30 * 60 * 1000) {
      sessionStorage.removeItem(ADMIN_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(userId: string, verified: boolean) {
  try {
    sessionStorage.setItem(
      ADMIN_CACHE_KEY,
      JSON.stringify({ userId, verified, timestamp: Date.now() } as AdminCache)
    );
  } catch {}
}

function clearCache() {
  try {
    sessionStorage.removeItem(ADMIN_CACHE_KEY);
  } catch {}
}

export const useAdminAuth = () => {
  // Initialize from cache immediately to avoid flicker
  const [state, setState] = useState(() => {
    const cache = readCache();
    return {
      isAdmin: cache?.verified ?? false,
      isLoading: !cache, // only loading if no cache
      user: null as any,
    };
  });

  const verifyAdmin = useCallback(async (currentUser: any) => {
    if (!currentUser) {
      clearCache();
      setState({ isAdmin: false, isLoading: false, user: null });
      return;
    }

    // Check cache first — if same user is cached as admin, trust it immediately
    const cache = readCache();
    if (cache && cache.userId === currentUser.id && cache.verified) {
      setState({ isAdmin: true, isLoading: false, user: currentUser });
      // Background re-verify (don't block UI)
      supabase.rpc('has_role', { _user_id: currentUser.id, _role: 'admin' as any })
        .then(({ data, error }) => {
          if (!error && data === false) {
            // Admin role was revoked
            clearCache();
            setState({ isAdmin: false, isLoading: false, user: currentUser });
          } else if (!error && data === true) {
            // Refresh cache timestamp
            writeCache(currentUser.id, true);
          }
          // On error, keep cached status (network glitch)
        });
      return;
    }

    // No cache or different user — must verify with loading state
    setState(prev => ({ ...prev, user: currentUser, isLoading: true }));

    try {
      let verified = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: currentUser.id,
          _role: 'admin' as any,
        });
        if (!error) {
          verified = data === true;
          break;
        }
        console.warn(`Admin check attempt ${attempt + 1} failed:`, error.message);
        if (attempt < 2) await new Promise(r => setTimeout(r, 800));
      }

      writeCache(currentUser.id, verified);
      setState({ isAdmin: verified, isLoading: false, user: currentUser });
    } catch (err) {
      console.error('Admin auth check failed:', err);
      // On complete failure, check cache as fallback
      if (cache && cache.userId === currentUser.id) {
        setState({ isAdmin: cache.verified, isLoading: false, user: currentUser });
      } else {
        setState({ isAdmin: false, isLoading: false, user: currentUser });
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    clearCache();
    setState({ isAdmin: false, isLoading: false, user: null });

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }

    // Clear stale tokens
    Object.keys(localStorage)
      .filter(key => key.startsWith('sb-') || key.startsWith('supabase'))
      .forEach(key => localStorage.removeItem(key));
  }, []);

  useEffect(() => {
    let mounted = true;

    // 1. Get current session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        verifyAdmin(session.user);
      } else {
        clearCache();
        setState({ isAdmin: false, isLoading: false, user: null });
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT') {
          clearCache();
          setState({ isAdmin: false, isLoading: false, user: null });
        } else if (event === 'SIGNED_IN') {
          verifyAdmin(session?.user ?? null);
        } else if (event === 'TOKEN_REFRESHED') {
          // Token refreshed — update user ref but DON'T re-verify if cached
          const u = session?.user ?? null;
          if (u) {
            const cache = readCache();
            if (cache && cache.userId === u.id && cache.verified) {
              setState(prev => ({ ...prev, user: u }));
              return;
            }
          }
          verifyAdmin(u);
        }
      }
    );

    // 3. Re-verify on tab visibility change (covers the exact user complaint)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && mounted) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!mounted) return;
          if (session?.user) {
            // Cache will short-circuit this if already verified
            verifyAdmin(session.user);
          } else {
            clearCache();
            setState({ isAdmin: false, isLoading: false, user: null });
          }
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [verifyAdmin]);

  return {
    isAdmin: state.isAdmin,
    isLoading: state.isLoading,
    user: state.user,
    signOut,
  };
};
