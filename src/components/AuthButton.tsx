import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AuthButton = () => {
  const [user, setUser] = useState<any>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
    } catch (err) {
      console.error('Sign out exception:', err);
    } finally {
      // Clean up any stale tokens regardless of outcome
      const keysToRemove = Object.keys(localStorage).filter(
        (key) => key.startsWith('sb-') || key.startsWith('supabase')
      );
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      setUser(null);
      setIsSigningOut(false);
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out',
      });
      navigate('/', { replace: true });
    }
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  if (user) {
    return (
      <Button variant="outline" size="sm" onClick={handleSignOut} disabled={isSigningOut}>
        <LogOut className="h-4 w-4 mr-2" />
        {isSigningOut ? 'Signing Out...' : 'Sign Out'}
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
