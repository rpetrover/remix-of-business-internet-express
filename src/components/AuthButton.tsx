import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthButton = () => {
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Error",
          description: "Failed to sign out. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out"
        });
        // Force reload to clear all cached state
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Sign out exception:', err);
      // Force sign out even on error
      localStorage.clear();
      window.location.href = '/';
    }
  };

  const handleSignIn = () => {
    // Redirect to auth page (we'll create this next)
    window.location.href = '/auth';
  };

  if (user) {
    return (
      <Button variant="outline" size="sm" onClick={handleSignOut}>
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSignIn}>
      <User className="h-4 w-4 mr-2" />
      Sign In
    </Button>
  );
};

export default AuthButton;