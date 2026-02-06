import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, MailX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleUnsubscribe = async () => {
    if (!email) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const { error } = await supabase.rpc("handle_opt_out", {
        checkout_email: email,
      });

      if (error) throw error;
      setStatus("success");
    } catch (err) {
      console.error("Unsubscribe error:", err);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            {status === "success" ? (
              <>
                <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl">You've Been Unsubscribed</CardTitle>
              </>
            ) : (
              <>
                <MailX className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="text-2xl">Unsubscribe</CardTitle>
              </>
            )}
          </CardHeader>
          <CardContent>
            {status === "success" ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  We've removed <strong>{email}</strong> from our follow-up list.
                  You won't receive any more emails or calls from us about this inquiry.
                </p>
                <p className="text-sm text-muted-foreground">
                  If you change your mind, you can always visit our site or call
                  <strong> 1-888-230-FAST</strong> anytime.
                </p>
              </div>
            ) : status === "error" ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  There was an issue processing your request. Please try again or
                  contact us at <strong>1-888-230-FAST</strong>.
                </p>
                <Button onClick={handleUnsubscribe}>Try Again</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Click below to unsubscribe <strong>{email || "your email"}</strong> from
                  all follow-up communications about your internet service inquiry.
                </p>
                <Button
                  onClick={handleUnsubscribe}
                  disabled={status === "loading" || !email}
                  className="w-full"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Unsubscribe"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  You can always reach us at 1-888-230-FAST if you need help later.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Unsubscribe;
