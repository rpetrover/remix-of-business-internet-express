import { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Megaphone, Bot, Phone, Shield, Package, UserCheck, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminEmailInbox from '@/components/admin/AdminEmailInbox';
import AdminEmailCompose from '@/components/admin/AdminEmailCompose';
import AdminCampaigns from '@/components/admin/AdminCampaigns';
import AdminAIConfig from '@/components/admin/AdminAIConfig';
import AdminVoiceAgent from '@/components/admin/AdminVoiceAgent';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminFollowUps from '@/components/admin/AdminFollowUps';

type LoginStep = 'email' | 'otp';

const Admin = () => {
  const { isAdmin, isLoading, user } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loginStep, setLoginStep] = useState<LoginStep>('email');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) throw error;

      setLoginStep('otp');
      toast({
        title: "Code Sent",
        description: "Check your email for a 6-digit verification code",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message === 'Signups not allowed for otp' 
          ? 'This email is not registered as an admin account.' 
          : error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email',
      });

      if (error) throw error;

      toast({
        title: "Verified",
        description: "Access granted",
      });
      // Auth state change will handle the rest
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle>Admin Access</CardTitle>
              <CardDescription>
                {loginStep === 'email'
                  ? 'Enter your admin email to receive a verification code'
                  : `Enter the 6-digit code sent to ${email}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loginStep === 'email' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email Address</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={isSending}>
                    <Mail className="h-4 w-4" />
                    {isSending ? 'Sending...' : 'Send Verification Code'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp-code">Verification Code</Label>
                    <Input
                      id="otp-code"
                      type="text"
                      inputMode="numeric"
                      placeholder="000000"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      required
                      className="text-center text-2xl tracking-[0.5em] font-mono"
                      autoFocus
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={isSending || otpCode.length !== 6}>
                    <KeyRound className="h-4 w-4" />
                    {isSending ? 'Verifying...' : 'Verify & Access Dashboard'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setLoginStep('email');
                      setOtpCode('');
                    }}
                  >
                    Use a different email
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Shield className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">You do not have admin privileges.</p>
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between max-w-[1400px] mx-auto">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <div className="max-w-[1400px] mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border border-border h-auto p-1 flex-wrap">
            <TabsTrigger value="orders" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="inbox" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Mail className="h-4 w-4" />
              Inbox
            </TabsTrigger>
            <TabsTrigger value="compose" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Mail className="h-4 w-4" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Megaphone className="h-4 w-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="ai-agent" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bot className="h-4 w-4" />
              AI Agent
            </TabsTrigger>
            <TabsTrigger value="voice-agent" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Phone className="h-4 w-4" />
              Voice Agent
            </TabsTrigger>
            <TabsTrigger value="follow-ups" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <UserCheck className="h-4 w-4" />
              Follow-ups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <AdminOrders />
          </TabsContent>

          <TabsContent value="inbox">
            <AdminEmailInbox />
          </TabsContent>

          <TabsContent value="compose">
            <AdminEmailCompose />
          </TabsContent>

          <TabsContent value="campaigns">
            <AdminCampaigns />
          </TabsContent>

          <TabsContent value="ai-agent">
            <AdminAIConfig />
          </TabsContent>

          <TabsContent value="voice-agent">
            <AdminVoiceAgent />
          </TabsContent>

          <TabsContent value="follow-ups">
            <AdminFollowUps />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
