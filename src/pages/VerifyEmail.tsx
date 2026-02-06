import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, ShoppingCart, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Supabase will automatically handle the token exchange from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth error:", error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          setUserEmail(session.user.email ?? null);
          setUserName(session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? null);
          setVerified(true);
        }
      } catch (err) {
        console.error("Verification error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for auth state changes (the token exchange triggers this)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUserEmail(session.user.email ?? null);
        setUserName(session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? null);
        setVerified(true);
        setIsLoading(false);
      }
    });

    handleAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Verifying your email...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-destructive">Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We couldn't verify your email. The link may have expired or already been used.
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link to="/auth">Try Signing In</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl">Email Verified!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="text-sm">Verified Email</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{userEmail}</p>
            {userName && (
              <p className="text-sm text-muted-foreground">Welcome, {userName}!</p>
            )}
          </div>

          <p className="text-muted-foreground">
            Your email has been successfully verified. Your account is now active and you're signed in.
          </p>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              size="lg"
              className="w-full"
              onClick={() => navigate("/order-completion")}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Continue to Checkout
            </Button>
            <Button variant="outline" onClick={() => navigate("/check-availability")}>
              Browse More Plans
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/">Go to Home Page</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
