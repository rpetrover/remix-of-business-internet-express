import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Admin auth rules:
 * - Never trust client storage for admin status.
 * - Only show "Access Denied" after a confirmed server response (has_role === false).
 * - If verification fails (network/token refresh), keep UI in loading state and retry.
 */

type AdminState = {
  isAdmin: boolean;
  isLoading: boolean;
  user: any;
};

export const useAdminAuth = () => {
  const [state, setState] = useState<AdminState>({
    isAdmin: false,
    isLoading: true,
    user: null,
  });

  const retryTimerRef = useRef<number | null>(null);
  const retryAttemptRef = useRef(0);

  const clearRetry = useCallback(() => {
    if (retryTimerRef.current) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    retryAttemptRef.current = 0;
  }, []);

  const scheduleRetry = useCallback(
    (fn: () => void) => {
      // exponential backoff: 1.0s, 2.0s, 4.0s ... capped at 15s
      const attempt = retryAttemptRef.current;
      const delay = Math.min(15000, 1000 * Math.pow(2, attempt));
      retryAttemptRef.current = Math.min(attempt + 1, 4);

      if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = window.setTimeout(fn, delay);
    },
    []
  );

  const verifyAdmin = useCallback(
    async (currentUser: any) => {
      if (!currentUser) {
        clearRetry();
        setState({ isAdmin: false, isLoading: false, user: null });
        return;
      }

      setState(prev => ({ ...prev, user: currentUser, isLoading: true }));

      try {
        for (let attempt = 0; attempt < 3; attempt++) {
          const { data, error } = await supabase.rpc('has_role', {
            _user_id: currentUser.id,
            _role: 'admin' as any,
          });

          if (!error) {
            clearRetry();
            setState({ isAdmin: data === true, isLoading: false, user: currentUser });
            return;
          }

          console.warn(`Admin check attempt ${attempt + 1} failed:`, error.message);
          if (attempt < 2) await new Promise(r => setTimeout(r, 800));
        }

        // If we couldn't verify due to errors, DO NOT deny access.
        // Keep loading state and retry in background.
        scheduleRetry(() => verifyAdmin(currentUser));
        setState(prev => ({ ...prev, isLoading: true, user: currentUser }));
      } catch (err) {
        console.error('Admin auth check failed:', err);
        scheduleRetry(() => verifyAdmin(currentUser));
        setState(prev => ({ ...prev, isLoading: true, user: currentUser }));
      }
    },
    [clearRetry, scheduleRetry]
  );

  const signOut = useCallback(async () => {
    clearRetry();
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
  }, [clearRetry]);

  useEffect(() => {
    let mounted = true;

    // 1) Listen for auth changes FIRST (recommended)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        clearRetry();
        setState({ isAdmin: false, isLoading: false, user: null });
        return;
      }

      // For SIGNED_IN / TOKEN_REFRESHED / USER_UPDATED, verify server-side.
      verifyAdmin(session?.user ?? null);
    });

    // 2) Then resolve current session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        verifyAdmin(session?.user ?? null);
      })
      .catch(err => {
        console.error('getSession failed:', err);
        if (!mounted) return;
        // Keep loading and retry; don’t deny access.
        scheduleRetry(() => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return;
            verifyAdmin(session?.user ?? null);
          });
        });
      });

    // 3) Re-verify on tab visibility change (switching apps often triggers this)
    const handleVisibility = async () => {
      if (document.visibilityState !== 'visible' || !mounted) return;

      try {
        // Attempt a refresh to prevent "lost session" due to stale tokens.
        await supabase.auth.refreshSession();
      } catch (err) {
        console.warn('refreshSession failed (will retry):', err);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      verifyAdmin(session?.user ?? null);
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibility);
      if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current);
    };
  }, [verifyAdmin, clearRetry, scheduleRetry]);

  return {
    isAdmin: state.isAdmin,
    isLoading: state.isLoading,
    user: state.user,
    signOut,
  };
};

