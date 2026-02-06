import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Send, Megaphone, Users, Trash2, Eye } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  scheduled_at: string | null;
  sent_at: string | null;
}

const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [recipientEmails, setRecipientEmails] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // New campaign form
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setCampaigns(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const createCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim()) return;

    const { data, error } = await supabase
      .from('campaigns')
      .insert({ name, subject, body_html: bodyHtml })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to create campaign', variant: 'destructive' });
    } else {
      toast({ title: 'Campaign Created', description: `"${name}" created successfully` });
      setCampaigns(prev => [data, ...prev]);
      setName('');
      setSubject('');
      setBodyHtml('');
      setIsDialogOpen(false);
    }
  };

  const addRecipients = async () => {
    if (!selectedCampaign || !recipientEmails.trim()) return;

    const emails = recipientEmails
      .split(/[,\n]/)
      .map(e => e.trim())
      .filter(e => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    if (emails.length === 0) {
      toast({ title: 'No Valid Emails', description: 'Please enter valid email addresses.', variant: 'destructive' });
      return;
    }

    const contacts = emails.map(email => ({
      campaign_id: selectedCampaign.id,
      email,
    }));

    const { error } = await supabase.from('campaign_contacts').insert(contacts);

    if (error) {
      toast({ title: 'Error', description: 'Failed to add recipients', variant: 'destructive' });
    } else {
      await supabase.from('campaigns').update({ total_recipients: (selectedCampaign.total_recipients || 0) + emails.length }).eq('id', selectedCampaign.id);
      toast({ title: 'Recipients Added', description: `${emails.length} recipients added` });
      setRecipientEmails('');
      fetchCampaigns();
    }
  };

  const sendCampaign = async (campaign: Campaign) => {
    setIsSending(true);

    try {
      const { error } = await supabase.functions.invoke('send-campaign', {
        body: { campaignId: campaign.id },
      });

      if (error) throw error;

      toast({ title: 'Campaign Sending', description: `"${campaign.name}" is being sent` });
      fetchCampaigns();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send campaign', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (!error) {
      setCampaigns(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Deleted', description: 'Campaign deleted' });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-muted text-muted-foreground',
      scheduled: 'bg-primary/10 text-primary',
      sending: 'bg-accent/10 text-accent',
      sent: 'bg-success/10 text-success',
      cancelled: 'bg-destructive/10 text-destructive',
    };
    return <Badge className={colors[status] || ''}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Megaphone className="h-5 w-5" /> Marketing Campaigns
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
            </DialogHeader>
            <form onSubmit={createCampaign} className="space-y-4">
              <div className="space-y-2">
                <Label>Campaign Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Q1 Promo Blast" required />
              </div>
              <div className="space-y-2">
                <Label>Email Subject *</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Special Offer Inside!" required />
              </div>
              <div className="space-y-2">
                <Label>Email Body (HTML)</Label>
                <Textarea
                  value={bodyHtml}
                  onChange={(e) => setBodyHtml(e.target.value)}
                  placeholder="<h1>Hello!</h1><p>Check out our latest deals...</p>"
                  rows={8}
                />
              </div>
              <Button type="submit" className="w-full">Create Campaign</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No campaigns yet. Create one to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">Subject: {campaign.subject}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {campaign.total_recipients} recipients
                      </span>
                      {campaign.sent_count > 0 && <span>✓ {campaign.sent_count} sent</span>}
                      {campaign.failed_count > 0 && <span className="text-destructive">✕ {campaign.failed_count} failed</span>}
                      <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {campaign.status === 'draft' && (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedCampaign(campaign)}>
                              <Users className="h-4 w-4 mr-1" /> Recipients
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Recipients to "{campaign.name}"</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Email Addresses (comma or newline separated)</Label>
                                <Textarea
                                  value={recipientEmails}
                                  onChange={(e) => setRecipientEmails(e.target.value)}
                                  placeholder="john@example.com, jane@example.com"
                                  rows={6}
                                />
                              </div>
                              <Button onClick={addRecipients} className="w-full">
                                <Users className="h-4 w-4 mr-2" /> Add Recipients
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="sm"
                          onClick={() => sendCampaign(campaign)}
                          disabled={isSending || campaign.total_recipients === 0}
                        >
                          <Send className="h-4 w-4 mr-1" /> Send
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteCampaign(campaign.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCampaigns;
