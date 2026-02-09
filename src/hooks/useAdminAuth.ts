import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const confirmedAdminUserId = useRef<string | null>(null);
  const checkInProgress = useRef(false);

  const checkAdminRole = useCallback(async (currentUser: any) => {
    if (!currentUser) {
      setUser(null);
      setIsAdmin(false);
      confirmedAdminUserId.current = null;
      setIsLoading(false);
      return;
    }

    setUser(currentUser);

    // If we already confirmed this user is admin, skip the RPC call
    if (confirmedAdminUserId.current === currentUser.id) {
      setIsAdmin(true);
      setIsLoading(false);
      return;
    }

    // Prevent concurrent checks
    if (checkInProgress.current) return;
    checkInProgress.current = true;

    try {
      // Retry up to 2 times on transient errors
      let lastError: any = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: currentUser.id,
          _role: 'admin'
        });

        if (!error) {
          const adminResult = data === true;
          setIsAdmin(adminResult);
          if (adminResult) {
            confirmedAdminUserId.current = currentUser.id;
          } else {
            confirmedAdminUserId.current = null;
          }
          lastError = null;
          break;
        }
        
        lastError = error;
        console.warn(`Admin check attempt ${attempt + 1} failed:`, error.message);
        // Brief delay before retry
        if (attempt < 1) await new Promise(r => setTimeout(r, 500));
      }

      if (lastError) {
        console.error('Error checking admin role after retries:', lastError);
        // Preserve existing admin status on transient errors
        if (confirmedAdminUserId.current === currentUser.id) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    } catch (err) {
      console.error('Admin auth check failed:', err);
      if (confirmedAdminUserId.current === currentUser.id) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } finally {
      checkInProgress.current = false;
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    confirmedAdminUserId.current = null;
    setIsAdmin(false);
    setUser(null);
    
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
    
    // Clear any stale tokens
    const keysToRemove = Object.keys(localStorage).filter(
      (key) => key.startsWith('sb-') || key.startsWith('supabase')
    );
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_IN') {
          setIsLoading(true);
          await checkAdminRole(session?.user ?? null);
        } else if (event === 'TOKEN_REFRESHED') {
          // On token refresh, update user but DON'T show loading spinner
          // if we already confirmed this user as admin
          const sessionUser = session?.user ?? null;
          setUser(sessionUser);
          if (sessionUser && confirmedAdminUserId.current === sessionUser.id) {
            // Already confirmed admin — no need to re-check or show loading
            return;
          }
          // Different user or not confirmed yet — re-check
          setIsLoading(true);
          await checkAdminRole(sessionUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAdmin(false);
          confirmedAdminUserId.current = null;
          setIsLoading(false);
        } else if (event === 'INITIAL_SESSION') {
          if (session?.user) {
            await checkAdminRole(session.user);
          } else {
            setUser(null);
            setIsAdmin(false);
            setIsLoading(false);
          }
        }
      }
    );

    // Fallback timeout — never stay stuck on "Verifying" for more than 8 seconds
    const timeout = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 8000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [checkAdminRole]);

  return { isAdmin, isLoading, user, signOut };
};
