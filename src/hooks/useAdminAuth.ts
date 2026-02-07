import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const checkAdminRole = useCallback(async (currentUser: any) => {
    if (!currentUser) {
      setUser(null);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    setUser(currentUser);

    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: currentUser.id,
        _role: 'admin'
      });

      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data === true);
      }
    } catch (err) {
      console.error('Admin auth check failed:', err);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // IMPORTANT: Set up auth state listener FIRST — this catches
    // magic link tokens from URL hash before getSession runs
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('Auth state change:', event, session?.user?.email);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // User just signed in (e.g. magic link) — reset loading and check role
          setIsLoading(true);
          await checkAdminRole(session?.user ?? null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAdmin(false);
          setIsLoading(false);
        } else if (event === 'INITIAL_SESSION') {
          // Initial session load — check the session
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

    // Fallback timeout — never stay stuck on "Verifying" for more than 5 seconds
    const timeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn('Admin auth check timed out');
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [checkAdminRole]);

  return { isAdmin, isLoading, user };
};
