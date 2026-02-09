import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Phone, Mail, Loader2, MapPin, Building2, RefreshCw, Play, Trash2, Newspaper, Flame, ExternalLink } from 'lucide-react';
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
  is_fiber_launch_area?: boolean;
  fiber_launch_source?: string | null;
}

interface NewsroomScanResult {
  url: string;
  title: string;
  date: string;
  locations: { county: string; state: string; stateAbbr: string }[];
  zipCodes: string[];
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
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<NewsroomScanResult[] | null>(null);
  const [zipInput, setZipInput] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [callingLeadId, setCallingLeadId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('outbound_leads')
      .select('*')
      .order('is_fiber_launch_area', { ascending: false, nullsFirst: false })
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

  const handleScanNewsroom = async () => {
    setIsScanning(true);
    setScanResults(null);
    try {
      const { data, error } = await supabase.functions.invoke('scan-spectrum-newsroom', {
        body: {},
      });

      if (error) throw error;

      setScanResults(data.articles || []);
      
      // If ZIPs were found, auto-populate the ZIP input for discovery
      const allZips = (data.articles || []).flatMap((a: NewsroomScanResult) => a.zipCodes);
      if (allZips.length > 0) {
        const uniqueZips = [...new Set(allZips)];
        setZipInput(uniqueZips.join(', '));
      }

      toast({
        title: '🔥 Newsroom Scan Complete',
        description: `Found ${data.articlesFound} articles, scanned ${data.newArticlesScanned} new ones. ${data.totalZipCodesFound} ZIP codes identified.`,
      });

      fetchLeads();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Scan Failed', description: err.message });
    } finally {
      setIsScanning(false);
    }
  };

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
        description: `Found ${data.totalFound} businesses, added ${data.totalInserted} new leads. ${data.totalEmailsFound || 0} emails found.`,
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
    fiberLaunch: leads.filter((l) => l.is_fiber_launch_area).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: 'Total Leads', value: stats.total, color: 'text-foreground' },
          { label: '🔥 Fiber Launch', value: stats.fiberLaunch, color: 'text-orange-600' },
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

      <Tabs defaultValue="newsroom">
        <TabsList>
          <TabsTrigger value="newsroom" className="gap-1">
            <Newspaper className="h-3.5 w-3.5" /> Newsroom Scanner
          </TabsTrigger>
          <TabsTrigger value="discover">Discover Leads</TabsTrigger>
          <TabsTrigger value="leads">Manage Leads ({leads.length})</TabsTrigger>
        </TabsList>

        {/* Newsroom Scanner Tab */}
        <TabsContent value="newsroom" className="space-y-4">
          <Card className="border-orange-200 bg-orange-50/30 dark:bg-orange-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Flame className="h-5 w-5" /> Spectrum Newsroom Fiber Launch Scanner
              </CardTitle>
              <CardDescription>
                Automatically scan Charter's newsroom for new fiber expansion announcements. 
                Discovered areas get <strong>priority targeting</strong> — ZIP codes are auto-populated for lead discovery.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleScanNewsroom} 
                disabled={isScanning}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isScanning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Newspaper className="h-4 w-4 mr-2" />
                )}
                {isScanning ? 'Scanning Newsroom...' : 'Scan for New Fiber Launches'}
              </Button>

              {scanResults && scanResults.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Recent Fiber Expansion Articles Found:</h4>
                  {scanResults.map((article, i) => (
                    <Card key={i} className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <a 
                            href={article.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                          >
                            {article.title} <ExternalLink className="h-3 w-3" />
                          </a>
                          {article.date && (
                            <p className="text-xs text-muted-foreground">{article.date}</p>
                          )}
                          {article.locations.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {article.locations.map((loc, j) => (
                                <Badge key={j} variant="outline" className="text-xs bg-orange-100 border-orange-300">
                                  <MapPin className="h-2.5 w-2.5 mr-1" />
                                  {loc.county}, {loc.stateAbbr}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {article.zipCodes.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              ZIP codes: {article.zipCodes.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {scanResults && scanResults.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No new articles found. All known articles have been scanned already.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" /> Discover Businesses in Spectrum Fiber Areas
              </CardTitle>
              <CardDescription>
                Enter ZIP codes to find businesses using Google Places. Only Spectrum-serviceable ZIPs will be searched.
                {zipInput && <span className="text-orange-600 font-medium"> ZIPs auto-filled from newsroom scan!</span>}
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
                        <TableRow key={lead.id} className={lead.is_fiber_launch_area ? 'bg-orange-50/50 dark:bg-orange-950/10' : ''}>
                          <TableCell>
                            <div>
                              <div className="flex items-center gap-1.5">
                                {lead.is_fiber_launch_area && (
                                  <span title="Fiber launch area — priority target">
                                    <Flame className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                                  </span>
                                )}
                                <p className="font-medium text-sm">{lead.business_name}</p>
                              </div>
                              {lead.is_fiber_launch_area && lead.fiber_launch_source && (
                                <p className="text-[10px] text-orange-600 mt-0.5 truncate max-w-[200px]" title={lead.fiber_launch_source}>
                                  🔥 {lead.fiber_launch_source}
                                </p>
                              )}
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
