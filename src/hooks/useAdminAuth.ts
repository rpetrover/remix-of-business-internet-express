import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const confirmedAdminUserId = useRef<string | null>(null);

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

    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: currentUser.id,
        _role: 'admin'
      });

      if (error) {
        console.error('Error checking admin role:', error);
        // On token refresh errors, keep existing admin state if we had it
        if (confirmedAdminUserId.current === currentUser.id) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        const adminResult = data === true;
        setIsAdmin(adminResult);
        if (adminResult) {
          confirmedAdminUserId.current = currentUser.id;
        } else {
          confirmedAdminUserId.current = null;
        }
      }
    } catch (err) {
      console.error('Admin auth check failed:', err);
      // Preserve existing admin status on transient errors
      if (confirmedAdminUserId.current !== currentUser.id) {
        setIsAdmin(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    confirmedAdminUserId.current = null;
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
