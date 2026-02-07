import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Mail, Megaphone, Bot, Phone, Package, UserCheck, BarChart3, Loader2, ShieldAlert, Settings, PhoneCall } from 'lucide-react';
import AdminEmailInbox from '@/components/admin/AdminEmailInbox';
import AdminEmailCompose from '@/components/admin/AdminEmailCompose';
import AdminCampaigns from '@/components/admin/AdminCampaigns';
import AdminAIConfig from '@/components/admin/AdminAIConfig';
import AdminVoiceAgent from '@/components/admin/AdminVoiceAgent';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminFollowUps from '@/components/admin/AdminFollowUps';
import AdminCallLog from '@/components/admin/AdminCallLog';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminSettings from '@/components/admin/AdminSettings';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const { isAdmin, isLoading, user } = useAdminAuth();

  // Loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not logged in — redirect to auth
  if (!user) {
    return <Navigate to="/auth?returnTo=/admin" replace />;
  }

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            Your account ({user.email}) does not have admin privileges.
          </p>
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
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
            <TabsTrigger value="call-log" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <PhoneCall className="h-4 w-4" />
              Call Log
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders"><AdminOrders /></TabsContent>
          <TabsContent value="inbox"><AdminEmailInbox /></TabsContent>
          <TabsContent value="compose"><AdminEmailCompose /></TabsContent>
          <TabsContent value="campaigns"><AdminCampaigns /></TabsContent>
          <TabsContent value="ai-agent"><AdminAIConfig /></TabsContent>
          <TabsContent value="voice-agent"><AdminVoiceAgent /></TabsContent>
          <TabsContent value="follow-ups"><AdminFollowUps /></TabsContent>
          <TabsContent value="call-log"><AdminCallLog /></TabsContent>
          <TabsContent value="analytics"><AdminAnalytics /></TabsContent>
          <TabsContent value="settings"><AdminSettings /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
