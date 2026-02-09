import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Phone, Mail, Loader2, MapPin, Building2, RefreshCw, Play, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OutboundLead {
  id: string;
  business_name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  campaign_status: string;
  drip_step: number;
  last_email_sent_at: string | null;
  last_call_at: string | null;
  call_outcome: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-700 border-blue-200',
  email_sent: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  called: 'bg-purple-500/10 text-purple-700 border-purple-200',
  interested: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  converted: 'bg-green-500/10 text-green-700 border-green-200',
  not_interested: 'bg-red-500/10 text-red-700 border-red-200',
  do_not_contact: 'bg-gray-500/10 text-gray-700 border-gray-200',
};

const AdminOutboundCampaigns = () => {
  const [leads, setLeads] = useState<OutboundLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isSendingDrip, setIsSendingDrip] = useState(false);
  const [zipInput, setZipInput] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [callingLeadId, setCallingLeadId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('outbound_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error('Failed to fetch leads:', error);
    } else {
      setLeads((data as any[]) || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleDiscoverLeads = async () => {
    const zips = zipInput
      .split(/[,\s]+/)
      .map((z) => z.trim())
      .filter((z) => /^\d{5}$/.test(z));

    if (zips.length === 0) {
      toast({ variant: 'destructive', title: 'Enter at least one valid 5-digit ZIP code' });
      return;
    }

    setIsDiscovering(true);
    try {
      const { data, error } = await supabase.functions.invoke('discover-leads', {
        body: { zipCodes: zips, businessType: businessType || undefined },
      });

      if (error) throw error;

      toast({
        title: 'Discovery Complete',
        description: `Found ${data.totalFound} businesses, added ${data.totalInserted} new leads from ${data.spectrumZipsSearched} Spectrum ZIPs.`,
      });
      fetchLeads();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Discovery Failed', description: err.message });
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleSendDrip = async () => {
    setIsSendingDrip(true);
    try {
      const { data, error } = await supabase.functions.invoke('outbound-drip', {
        body: { action: 'send-next-step' },
      });

      if (error) throw error;

      toast({
        title: 'Drip Emails Sent',
        description: `Sent ${data.sent} emails (${data.failed} failed)`,
      });
      fetchLeads();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Drip Failed', description: err.message });
    } finally {
      setIsSendingDrip(false);
    }
  };

  const handleCallLead = async (leadId: string) => {
    setCallingLeadId(leadId);
    try {
      const { data, error } = await supabase.functions.invoke('outbound-sales-call', {
        body: {},
        headers: {},
      });

      // Use fetch directly since we need query params
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/outbound-sales-call?action=call&lead_id=${leadId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({}),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Call failed');

      toast({ title: 'Call Initiated', description: `Call SID: ${result.callSid}` });
      fetchLeads();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Call Failed', description: err.message });
    } finally {
      setCallingLeadId(null);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    const { error } = await supabase.from('outbound_leads').delete().eq('id', leadId);
    if (error) {
      toast({ variant: 'destructive', title: 'Delete Failed', description: error.message });
    } else {
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
    }
  };

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.campaign_status === 'new').length,
    emailed: leads.filter((l) => l.campaign_status === 'email_sent').length,
    called: leads.filter((l) => l.campaign_status === 'called').length,
    converted: leads.filter((l) => l.campaign_status === 'converted').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Leads', value: stats.total, color: 'text-foreground' },
          { label: 'New', value: stats.new, color: 'text-blue-600' },
          { label: 'Emailed', value: stats.emailed, color: 'text-yellow-600' },
          { label: 'Called', value: stats.called, color: 'text-purple-600' },
          { label: 'Converted', value: stats.converted, color: 'text-green-600' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="discover">
        <TabsList>
          <TabsTrigger value="discover">Discover Leads</TabsTrigger>
          <TabsTrigger value="leads">Manage Leads ({leads.length})</TabsTrigger>
        </TabsList>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" /> Discover Businesses in Spectrum Fiber Areas
              </CardTitle>
              <CardDescription>
                Enter ZIP codes to find businesses using Google Places. Only Spectrum-serviceable ZIPs will be searched.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ZIP Codes (comma or space separated)</Label>
                  <Input
                    placeholder="e.g. 10001, 10002, 90210"
                    value={zipInput}
                    onChange={(e) => setZipInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Business Type (optional)</Label>
                  <Input
                    placeholder="e.g. restaurant, office, retail"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleDiscoverLeads} disabled={isDiscovering || !zipInput.trim()}>
                  {isDiscovering ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MapPin className="h-4 w-4 mr-2" />}
                  {isDiscovering ? 'Discovering...' : 'Discover Leads'}
                </Button>
                <Button variant="outline" onClick={handleSendDrip} disabled={isSendingDrip || stats.total === 0}>
                  {isSendingDrip ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                  {isSendingDrip ? 'Sending...' : 'Send Next Drip Email'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" /> Outbound Leads
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={fetchLeads}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : leads.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No leads yet. Use the Discover tab to find businesses.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Drip Step</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{lead.business_name}</p>
                              {lead.website && (
                                <a
                                  href={lead.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline"
                                >
                                  {new URL(lead.website).hostname}
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {[lead.city, lead.state].filter(Boolean).join(', ')}
                            {lead.zip && ` ${lead.zip}`}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs space-y-0.5">
                              {lead.phone && <p>📞 {lead.phone}</p>}
                              {lead.email && <p>📧 {lead.email}</p>}
                              {!lead.phone && !lead.email && (
                                <span className="text-muted-foreground">No contact info</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[lead.campaign_status] || ''}>
                              {lead.campaign_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{lead.drip_step}/5</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              {lead.phone && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCallLead(lead.id)}
                                  disabled={callingLeadId === lead.id}
                                  title="Call this business"
                                >
                                  {callingLeadId === lead.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Phone className="h-3 w-3" />
                                  )}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteLead(lead.id)}
                                title="Delete lead"
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminOutboundCampaigns;
