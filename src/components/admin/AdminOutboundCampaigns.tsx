import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search, Phone, Mail, Loader2, MapPin, Building2, RefreshCw, Play, Trash2,
  Newspaper, Flame, ExternalLink, ChevronLeft, ChevronRight, ArrowUpDown,
  ArrowUp, ArrowDown, Filter, CheckSquare, Edit, X,
} from 'lucide-react';
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
  business_type: string | null;
  campaign_status: string;
  drip_step: number;
  last_email_sent_at: string | null;
  last_call_at: string | null;
  call_outcome: string | null;
  created_at: string;
  is_fiber_launch_area?: boolean;
  fiber_launch_source?: string | null;
  opening_variant?: string | null;
}

interface NewsroomScanResult {
  url: string;
  title: string;
  date: string;
  locations: { county: string; state: string; stateAbbr: string }[];
  zipCodes: string[];
}

type SortField = 'business_name' | 'created_at' | 'campaign_status' | 'city' | 'state' | 'drip_step' | 'last_call_at';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 50;

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-700 border-blue-200',
  email_sent: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  called: 'bg-purple-500/10 text-purple-700 border-purple-200',
  interested: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  converted: 'bg-green-500/10 text-green-700 border-green-200',
  not_interested: 'bg-red-500/10 text-red-700 border-red-200',
  do_not_contact: 'bg-gray-500/10 text-gray-700 border-gray-200',
  dnc: 'bg-gray-500/10 text-gray-700 border-gray-200',
};

const ALL_STATUSES = ['new', 'email_sent', 'called', 'interested', 'converted', 'not_interested', 'do_not_contact', 'dnc'];

const AdminOutboundCampaigns = () => {
  const [leads, setLeads] = useState<OutboundLead[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isSendingDrip, setIsSendingDrip] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<NewsroomScanResult[] | null>(null);
  const [zipInput, setZipInput] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [callingLeadId, setCallingLeadId] = useState<string | null>(null);

  // Pagination, sorting, filtering
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterFiber, setFilterFiber] = useState(false);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const { toast } = useToast();

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);

    // Build count query
    let countQuery = supabase.from('outbound_leads').select('*', { count: 'exact', head: true });
    let dataQuery = supabase.from('outbound_leads').select('*');

    // Apply filters
    if (filterStatus !== 'all') {
      countQuery = countQuery.eq('campaign_status', filterStatus);
      dataQuery = dataQuery.eq('campaign_status', filterStatus);
    }
    if (filterFiber) {
      countQuery = countQuery.eq('is_fiber_launch_area', true);
      dataQuery = dataQuery.eq('is_fiber_launch_area', true);
    }
    if (searchQuery.trim()) {
      const q = `%${searchQuery.trim()}%`;
      countQuery = countQuery.or(`business_name.ilike.${q},city.ilike.${q},state.ilike.${q},zip.ilike.${q},phone.ilike.${q},email.ilike.${q}`);
      dataQuery = dataQuery.or(`business_name.ilike.${q},city.ilike.${q},state.ilike.${q},zip.ilike.${q},phone.ilike.${q},email.ilike.${q}`);
    }

    // Get count
    const { count } = await countQuery;
    setTotalCount(count || 0);

    // Apply sorting + pagination
    dataQuery = dataQuery
      .order(sortField, { ascending: sortDir === 'asc' })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    const { data, error } = await dataQuery;

    if (error) {
      console.error('Failed to fetch leads:', error);
    } else {
      setLeads((data as any[]) || []);
    }
    setIsLoading(false);
  }, [page, sortField, sortDir, searchQuery, filterStatus, filterFiber]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
    setSelectedIds(new Set());
  }, [searchQuery, filterStatus, filterFiber, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  // Bulk operations
  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map(l => l.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkAction = async () => {
    if (selectedIds.size === 0 || !bulkAction) return;
    setIsBulkProcessing(true);
    const ids = Array.from(selectedIds);

    try {
      if (bulkAction === 'delete') {
        const { error } = await supabase.from('outbound_leads').delete().in('id', ids);
        if (error) throw error;
        toast({ title: 'Deleted', description: `${ids.length} leads deleted.` });
      } else if (ALL_STATUSES.includes(bulkAction)) {
        const { error } = await supabase.from('outbound_leads').update({ campaign_status: bulkAction }).in('id', ids);
        if (error) throw error;
        toast({ title: 'Updated', description: `${ids.length} leads set to "${bulkAction}".` });
      } else if (bulkAction === 'reset_drip') {
        const { error } = await supabase.from('outbound_leads').update({ drip_step: 0 }).in('id', ids);
        if (error) throw error;
        toast({ title: 'Reset', description: `${ids.length} leads drip step reset to 0.` });
      }
      setSelectedIds(new Set());
      setBulkAction('');
      fetchLeads();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Bulk action failed', description: err.message });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleScanNewsroom = async () => {
    setIsScanning(true);
    setScanResults(null);
    try {
      const { data, error } = await supabase.functions.invoke('scan-spectrum-newsroom', { body: {} });
      if (error) throw error;
      setScanResults(data.articles || []);
      const allZips = (data.articles || []).flatMap((a: NewsroomScanResult) => a.zipCodes);
      if (allZips.length > 0) setZipInput([...new Set(allZips)].join(', '));
      toast({ title: '🔥 Newsroom Scan Complete', description: `Found ${data.articlesFound} articles, ${data.totalZipCodesFound} ZIP codes.` });
      fetchLeads();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Scan Failed', description: err.message });
    } finally { setIsScanning(false); }
  };

  const handleDiscoverLeads = async () => {
    const zips = zipInput.split(/[,\s]+/).map(z => z.trim()).filter(z => /^\d{5}$/.test(z));
    if (zips.length === 0) { toast({ variant: 'destructive', title: 'Enter at least one valid 5-digit ZIP code' }); return; }
    setIsDiscovering(true);
    try {
      const { data, error } = await supabase.functions.invoke('discover-leads', { body: { zipCodes: zips, businessType: businessType || undefined } });
      if (error) throw error;
      toast({ title: 'Discovery Complete', description: `Found ${data.totalFound} businesses, added ${data.totalInserted} new leads.` });
      fetchLeads();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Discovery Failed', description: err.message });
    } finally { setIsDiscovering(false); }
  };

  const handleSendDrip = async () => {
    setIsSendingDrip(true);
    try {
      const { data, error } = await supabase.functions.invoke('outbound-drip', { body: { action: 'send-next-step' } });
      if (error) throw error;
      toast({ title: 'Drip Emails Sent', description: `Sent ${data.sent} emails (${data.failed} failed)` });
      fetchLeads();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Drip Failed', description: err.message });
    } finally { setIsSendingDrip(false); }
  };

  const handleCallLead = async (leadId: string) => {
    setCallingLeadId(leadId);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/outbound-sales-call?action=call&lead_id=${leadId}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` }, body: JSON.stringify({}) }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Call failed');
      toast({ title: 'Call Initiated', description: `Call SID: ${result.callSid}` });
      fetchLeads();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Call Failed', description: err.message });
    } finally { setCallingLeadId(null); }
  };

  const handleDeleteLead = async (leadId: string) => {
    const { error } = await supabase.from('outbound_leads').delete().eq('id', leadId);
    if (error) {
      toast({ variant: 'destructive', title: 'Delete Failed', description: error.message });
    } else {
      setLeads(prev => prev.filter(l => l.id !== leadId));
      setTotalCount(c => c - 1);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Stats from total count query (approximate from current filtered view)
  const filteredStats = {
    showing: leads.length,
    total: totalCount,
    selected: selectedIds.size,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalCount}</p>
            <p className="text-xs text-muted-foreground">Total Leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{leads.length}</p>
            <p className="text-xs text-muted-foreground">Showing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">Page {page + 1}/{totalPages || 1}</p>
            <p className="text-xs text-muted-foreground">Pagination</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{selectedIds.size}</p>
            <p className="text-xs text-muted-foreground">Selected</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leads">
        <TabsList>
          <TabsTrigger value="leads" className="gap-1">
            <Building2 className="h-3.5 w-3.5" /> Leads ({totalCount})
          </TabsTrigger>
          <TabsTrigger value="newsroom" className="gap-1">
            <Newspaper className="h-3.5 w-3.5" /> Newsroom Scanner
          </TabsTrigger>
          <TabsTrigger value="discover">Discover Leads</TabsTrigger>
        </TabsList>

        {/* ── LEADS TAB ── */}
        <TabsContent value="leads" className="space-y-4">
          {/* Search + Filters */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, city, state, zip, phone, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="h-3.5 w-3.5 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {ALL_STATUSES.map(s => (
                      <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant={filterFiber ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterFiber(!filterFiber)}
                  className="gap-1.5"
                >
                  <Flame className="h-3.5 w-3.5" />
                  Fiber Only
                </Button>
                <Button variant="ghost" size="sm" onClick={fetchLeads}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Bulk Actions Bar */}
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{selectedIds.size} selected</span>
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-[200px] h-8">
                      <SelectValue placeholder="Bulk action..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delete">🗑️ Delete Selected</SelectItem>
                      <SelectItem value="reset_drip">🔄 Reset Drip Step</SelectItem>
                      <SelectItem value="new">→ Set: New</SelectItem>
                      <SelectItem value="email_sent">→ Set: Email Sent</SelectItem>
                      <SelectItem value="called">→ Set: Called</SelectItem>
                      <SelectItem value="interested">→ Set: Interested</SelectItem>
                      <SelectItem value="converted">→ Set: Converted</SelectItem>
                      <SelectItem value="not_interested">→ Set: Not Interested</SelectItem>
                      <SelectItem value="do_not_contact">→ Set: Do Not Contact</SelectItem>
                      <SelectItem value="dnc">→ Set: DNC</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={handleBulkAction}
                    disabled={!bulkAction || isBulkProcessing}
                  >
                    {isBulkProcessing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Edit className="h-3 w-3 mr-1" />}
                    Apply
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setSelectedIds(new Set()); setBulkAction(''); }}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : leads.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">
                  No leads found matching your criteria.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox
                            checked={selectedIds.size === leads.length && leads.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('business_name')}>
                          <div className="flex items-center gap-1">Business <SortIcon field="business_name" /></div>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('city')}>
                          <div className="flex items-center gap-1">City <SortIcon field="city" /></div>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('state')}>
                          <div className="flex items-center gap-1">State <SortIcon field="state" /></div>
                        </TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('campaign_status')}>
                          <div className="flex items-center gap-1">Status <SortIcon field="campaign_status" /></div>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('drip_step')}>
                          <div className="flex items-center gap-1">Drip <SortIcon field="drip_step" /></div>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('last_call_at')}>
                          <div className="flex items-center gap-1">Last Call <SortIcon field="last_call_at" /></div>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('created_at')}>
                          <div className="flex items-center gap-1">Added <SortIcon field="created_at" /></div>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow
                          key={lead.id}
                          className={`${lead.is_fiber_launch_area ? 'bg-orange-50/50 dark:bg-orange-950/10' : ''} ${selectedIds.has(lead.id) ? 'bg-primary/5' : ''}`}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.has(lead.id)}
                              onCheckedChange={() => toggleSelect(lead.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="flex items-center gap-1.5">
                                {lead.is_fiber_launch_area && (
                                  <span title="Fiber launch area"><Flame className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" /></span>
                                )}
                                <p className="font-medium text-sm">{lead.business_name}</p>
                              </div>
                              {lead.business_type && (
                                <p className="text-[10px] text-muted-foreground">{lead.business_type}</p>
                              )}
                              {lead.website && (
                                <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                  {(() => { try { return new URL(lead.website).hostname; } catch { return lead.website; } })()}
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{lead.city || '—'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {lead.state || '—'}{lead.zip ? ` ${lead.zip}` : ''}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs space-y-0.5">
                              {lead.phone && <p>📞 {lead.phone}</p>}
                              {lead.email && <p className="truncate max-w-[150px]" title={lead.email}>📧 {lead.email}</p>}
                              {!lead.phone && !lead.email && <span className="text-muted-foreground">—</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[lead.campaign_status] || ''}>
                              {lead.campaign_status.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-sm">{lead.drip_step}/5</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {lead.last_call_at ? new Date(lead.last_call_at).toLocaleDateString() : '—'}
                            {lead.call_outcome && (
                              <p className="text-[10px]">{lead.call_outcome}</p>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(lead.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              {lead.phone && (
                                <Button
                                  size="sm" variant="outline"
                                  onClick={() => handleCallLead(lead.id)}
                                  disabled={callingLeadId === lead.id}
                                  title="Call"
                                >
                                  {callingLeadId === lead.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Phone className="h-3 w-3" />}
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteLead(lead.id)} title="Delete">
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 7) {
                        pageNum = i;
                      } else if (page < 3) {
                        pageNum = i;
                      } else if (page > totalPages - 4) {
                        pageNum = totalPages - 7 + i;
                      } else {
                        pageNum = page - 3 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum + 1}
                        </Button>
                      );
                    })}
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── NEWSROOM TAB ── */}
        <TabsContent value="newsroom" className="space-y-4">
          <Card className="border-orange-200 bg-orange-50/30 dark:bg-orange-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Flame className="h-5 w-5" /> Spectrum Newsroom Fiber Launch Scanner
              </CardTitle>
              <CardDescription>
                Scan Charter's newsroom for fiber expansion announcements. Discovered areas get <strong>priority targeting</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleScanNewsroom} disabled={isScanning} className="bg-orange-600 hover:bg-orange-700">
                {isScanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Newspaper className="h-4 w-4 mr-2" />}
                {isScanning ? 'Scanning...' : 'Scan for New Fiber Launches'}
              </Button>
              {scanResults && scanResults.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Recent Fiber Expansion Articles:</h4>
                  {scanResults.map((article, i) => (
                    <Card key={i} className="p-3">
                      <div className="space-y-1">
                        <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                          {article.title} <ExternalLink className="h-3 w-3" />
                        </a>
                        {article.date && <p className="text-xs text-muted-foreground">{article.date}</p>}
                        {article.locations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {article.locations.map((loc, j) => (
                              <Badge key={j} variant="outline" className="text-xs bg-orange-100 border-orange-300">
                                <MapPin className="h-2.5 w-2.5 mr-1" /> {loc.county}, {loc.stateAbbr}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {article.zipCodes.length > 0 && <p className="text-xs text-muted-foreground mt-1">ZIPs: {article.zipCodes.join(', ')}</p>}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              {scanResults && scanResults.length === 0 && (
                <p className="text-sm text-muted-foreground">No new articles found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── DISCOVER TAB ── */}
        <TabsContent value="discover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" /> Discover Businesses</CardTitle>
              <CardDescription>
                Enter ZIP codes to find businesses via Google Places.
                {zipInput && <span className="text-orange-600 font-medium"> ZIPs auto-filled from newsroom scan!</span>}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ZIP Codes (comma or space separated)</Label>
                  <Input placeholder="e.g. 10001, 10002, 90210" value={zipInput} onChange={(e) => setZipInput(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Business Type (optional)</Label>
                  <Input placeholder="e.g. restaurant, office, retail" value={businessType} onChange={(e) => setBusinessType(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleDiscoverLeads} disabled={isDiscovering || !zipInput.trim()}>
                  {isDiscovering ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MapPin className="h-4 w-4 mr-2" />}
                  {isDiscovering ? 'Discovering...' : 'Discover Leads'}
                </Button>
                <Button variant="outline" onClick={handleSendDrip} disabled={isSendingDrip || totalCount === 0}>
                  {isSendingDrip ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                  {isSendingDrip ? 'Sending...' : 'Send Next Drip Email'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminOutboundCampaigns;
