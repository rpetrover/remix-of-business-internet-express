import { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Megaphone, Bot, Phone, Shield, Package, UserCheck } from 'lucide-react';
import AdminEmailInbox from '@/components/admin/AdminEmailInbox';
import AdminEmailCompose from '@/components/admin/AdminEmailCompose';
import AdminCampaigns from '@/components/admin/AdminCampaigns';
import AdminAIConfig from '@/components/admin/AdminAIConfig';
import AdminVoiceAgent from '@/components/admin/AdminVoiceAgent';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminFollowUps from '@/components/admin/AdminFollowUps';

const Admin = () => {
  const { isAdmin, isLoading, user } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('orders');

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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Admin Access Required</h1>
          <p className="text-muted-foreground">Please sign in to access the admin panel.</p>
          <Link to="/auth?returnTo=/admin">
            <Button>Sign In</Button>
          </Link>
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
