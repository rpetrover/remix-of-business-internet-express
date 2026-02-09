import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Loader2, Play, BarChart3, CheckCircle, XCircle, RotateCcw, Download, TrendingUp, TrendingDown, AlertTriangle, FileText, Zap } from 'lucide-react';
import { toast } from 'sonner';

const AdminOrchestrator = () => {
  const [activeTab, setActiveTab] = useState('metrics');
  const [reports, setReports] = useState<any[]>([]);
  const [openerWeights, setOpenerWeights] = useState<any[]>([]);
  const [changelog, setChangelog] = useState<any[]>([]);
  const [approvalQueue, setApprovalQueue] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [leadSources, setLeadSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadReports(), loadOpeners(), loadChangelog(), loadApprovalQueue(), loadInsights(), loadLeadSources()]);
    setLoading(false);
  };

  const loadReports = async () => {
    const { data } = await supabase.from('orchestrator_reports').select('*').order('created_at', { ascending: false }).limit(30);
    setReports(data || []);
  };

  const loadOpeners = async () => {
    const { data } = await supabase.from('opener_weights').select('*').order('variant');
    setOpenerWeights(data || []);
  };

  const loadChangelog = async () => {
    const { data } = await supabase.from('optimization_changelog').select('*').eq('status', 'applied').order('created_at', { ascending: false }).limit(50);
    setChangelog(data || []);
  };

  const loadApprovalQueue = async () => {
    const { data } = await supabase.from('optimization_changelog').select('*').eq('status', 'pending').order('created_at', { ascending: false });
    setApprovalQueue(data || []);
  };

  const loadInsights = async () => {
    const { data } = await supabase.from('transcript_insights').select('*').order('created_at', { ascending: false }).limit(50);
    setInsights(data || []);
  };

  const loadLeadSources = async () => {
    const { data } = await supabase.from('lead_source_allocations').select('*').order('conversion_rate', { ascending: false });
    setLeadSources(data || []);
  };

  const runOrchestrator = async (cadence: string) => {
    setRunning(cadence);
    try {
      const { data, error } = await supabase.functions.invoke('optimization-orchestrator', { body: { cadence } });
      if (error) throw error;
      toast.success(`${cadence} optimization completed!`);
      await loadAll();
    } catch (e: any) {
      toast.error(`Failed: ${e.message}`);
    } finally {
      setRunning(null);
    }
  };

  const approveChange = async (id: string) => {
    await supabase.from('optimization_changelog').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', id);
    toast.success('Change approved');
    await Promise.all([loadApprovalQueue(), loadChangelog()]);
  };

  const rejectChange = async (id: string) => {
    await supabase.from('optimization_changelog').update({ status: 'rejected' }).eq('id', id);
    toast.success('Change rejected');
    await loadApprovalQueue();
  };

  const rollbackChange = async (id: string) => {
    await supabase.from('optimization_changelog').update({ status: 'rolled_back', rolled_back_at: new Date().toISOString() }).eq('id', id);
    toast.success('Change rolled back');
    await loadChangelog();
  };

  const toggleOpenerPause = async (id: string, isPaused: boolean) => {
    await supabase.from('opener_weights').update({ is_paused: !isPaused, updated_at: new Date().toISOString() }).eq('id', id);
    await loadOpeners();
  };

  const updateOpenerWeight = async (id: string, weight: number) => {
    await supabase.from('opener_weights').update({ weight, updated_at: new Date().toISOString() }).eq('id', id);
    await loadOpeners();
  };

  const exportCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
  };

  const latestDaily = reports.find(r => r.report_type === 'daily');
  const latestWeekly = reports.find(r => r.report_type === 'weekly');
  const latestMonthly = reports.find(r => r.report_type === 'monthly');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Run Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-lg font-semibold text-foreground flex-1">Optimization Orchestrator</h2>
        {['daily', 'weekly', 'monthly'].map(c => (
          <Button key={c} size="sm" variant="outline" onClick={() => runOrchestrator(c)} disabled={!!running}>
            {running === c ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            Run {c}
          </Button>
        ))}
      </div>

      {/* Approval Banner */}
      {approvalQueue.length > 0 && (
        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="py-3 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span className="font-medium text-amber-800 dark:text-amber-200">{approvalQueue.length} change(s) need your approval</span>
            <Button size="sm" variant="outline" onClick={() => setActiveTab('approvals')} className="ml-auto">Review</Button>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border h-auto p-1 flex-wrap">
          <TabsTrigger value="metrics" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><BarChart3 className="h-3.5 w-3.5" />Metrics</TabsTrigger>
          <TabsTrigger value="openers" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Zap className="h-3.5 w-3.5" />A/B Openers</TabsTrigger>
          <TabsTrigger value="changelog" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><FileText className="h-3.5 w-3.5" />Changelog</TabsTrigger>
          <TabsTrigger value="approvals" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <AlertTriangle className="h-3.5 w-3.5" />Approvals{approvalQueue.length > 0 && <Badge variant="destructive" className="ml-1 text-xs">{approvalQueue.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="transcripts" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><FileText className="h-3.5 w-3.5" />Transcripts</TabsTrigger>
          <TabsTrigger value="lead-sources" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><TrendingUp className="h-3.5 w-3.5" />Lead Sources</TabsTrigger>
        </TabsList>

        {/* METRICS TAB */}
        <TabsContent value="metrics">
          <div className="space-y-4">
            {latestDaily?.metrics && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Latest Daily Report — {latestDaily.report_date}</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {Object.entries(latestDaily.metrics).map(([key, val]: [string, any]) => (
                      <div key={key} className="text-center">
                        <p className="text-xs text-muted-foreground">{key.replace(/_/g, ' ')}</p>
                        <p className="text-lg font-bold">{typeof val === 'number' && val < 1 && val > 0 ? `${(val * 100).toFixed(1)}%` : val}</p>
                      </div>
                    ))}
                  </div>
                  {latestDaily.bottleneck && latestDaily.bottleneck !== 'no_significant_bottleneck' && (
                    <div className="mt-4 p-3 bg-destructive/10 rounded-md">
                      <p className="text-sm font-medium text-destructive">⚠️ Bottleneck: {latestDaily.bottleneck.replace(/_/g, ' ')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reports History */}
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-sm">Report History</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => exportCSV(reports, 'orchestrator-reports')}><Download className="h-4 w-4 mr-1" />CSV</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Dialed</TableHead>
                      <TableHead>Connection</TableHead>
                      <TableHead>Close</TableHead>
                      <TableHead>Bottleneck</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.slice(0, 15).map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="text-xs">{r.report_date}</TableCell>
                        <TableCell><Badge variant={r.report_type === 'daily' ? 'default' : r.report_type === 'weekly' ? 'secondary' : 'outline'}>{r.report_type}</Badge></TableCell>
                        <TableCell>{r.metrics?.total_dialed ?? '-'}</TableCell>
                        <TableCell>{r.metrics?.connection_rate ? `${(r.metrics.connection_rate * 100).toFixed(1)}%` : '-'}</TableCell>
                        <TableCell>{r.metrics?.close_rate ? `${(r.metrics.close_rate * 100).toFixed(1)}%` : '-'}</TableCell>
                        <TableCell className="text-xs">{r.bottleneck?.replace(/_/g, ' ') || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* A/B OPENERS TAB */}
        <TabsContent value="openers">
          <Card>
            <CardHeader><CardTitle className="text-sm">Opener A/B Manager</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variant</TableHead>
                    <TableHead>Weight %</TableHead>
                    <TableHead>Calls</TableHead>
                    <TableHead>Answered</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Discovery</TableHead>
                    <TableHead>Close</TableHead>
                    <TableHead>Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openerWeights.map(o => (
                    <TableRow key={o.id} className={o.is_paused ? 'opacity-50' : ''}>
                      <TableCell className="font-bold">{o.variant}</TableCell>
                      <TableCell>
                        <input
                          type="number"
                          className="w-16 border rounded px-2 py-1 text-sm bg-background"
                          value={o.weight}
                          min={0}
                          max={100}
                          onChange={e => updateOpenerWeight(o.id, Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>{o.total_calls}</TableCell>
                      <TableCell>{o.total_answered}</TableCell>
                      <TableCell>{o.engagement_rate ? `${(o.engagement_rate * 100).toFixed(1)}%` : '-'}</TableCell>
                      <TableCell>{o.discovery_completion_rate ? `${(o.discovery_completion_rate * 100).toFixed(1)}%` : '-'}</TableCell>
                      <TableCell>{o.close_rate ? `${(o.close_rate * 100).toFixed(1)}%` : '-'}</TableCell>
                      <TableCell><Switch checked={!o.is_paused} onCheckedChange={() => toggleOpenerPause(o.id, o.is_paused)} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-xs text-muted-foreground mt-2">Weights auto-adjust daily when sample ≥ 50 answered calls. Top 2 get 40% each.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CHANGELOG TAB */}
        <TabsContent value="changelog">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm">Auto-Applied Changes</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => exportCSV(changelog, 'changelog')}><Download className="h-4 w-4 mr-1" />CSV</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changelog.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="text-xs">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant="outline">{c.change_type.replace(/_/g, ' ')}</Badge></TableCell>
                      <TableCell className="text-sm">{c.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{c.reason}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => rollbackChange(c.id)}><RotateCcw className="h-3.5 w-3.5 mr-1" />Rollback</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {changelog.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No changes yet</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* APPROVALS TAB */}
        <TabsContent value="approvals">
          <Card>
            <CardHeader><CardTitle className="text-sm">Needs Approval Queue</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {approvalQueue.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No pending changes</p>}
              {approvalQueue.map(q => (
                <div key={q.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="mb-1">{q.change_type.replace(/_/g, ' ')}</Badge>
                      <h4 className="font-medium text-sm">{q.title}</h4>
                      <p className="text-xs text-muted-foreground">{q.reason}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" onClick={() => approveChange(q.id)}><CheckCircle className="h-3.5 w-3.5 mr-1" />Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => rejectChange(q.id)}><XCircle className="h-3.5 w-3.5 mr-1" />Reject</Button>
                    </div>
                  </div>
                  {q.before_json && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-destructive/10 rounded p-2">
                        <p className="font-medium text-destructive mb-1">Before</p>
                        <pre className="whitespace-pre-wrap">{JSON.stringify(q.before_json, null, 2)}</pre>
                      </div>
                      <div className="bg-green-500/10 rounded p-2">
                        <p className="font-medium text-green-600 mb-1">After</p>
                        <pre className="whitespace-pre-wrap">{JSON.stringify(q.after_json, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TRANSCRIPTS TAB */}
        <TabsContent value="transcripts">
          <Card>
            <CardHeader><CardTitle className="text-sm">Transcript Insights</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead>Trigger Line</TableHead>
                    <TableHead>Objections</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {insights.map(i => (
                    <TableRow key={i.id}>
                      <TableCell className="text-xs">{new Date(i.created_at).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant={i.hangup_category === 'sub_10s' ? 'destructive' : i.hangup_category === 'sub_45s' ? 'secondary' : 'default'}>{i.hangup_category || 'normal'}</Badge></TableCell>
                      <TableCell className="text-xs">{i.sentiment_shift?.replace(/_/g, ' ') || '-'}</TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">{i.trigger_line || '-'}</TableCell>
                      <TableCell className="text-xs">{i.objection_detected?.join(', ') || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {insights.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No insights yet — run a daily loop</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LEAD SOURCES TAB */}
        <TabsContent value="lead-sources">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm">Lead Source Allocator</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => exportCSV(leadSources, 'lead-sources')}><Download className="h-4 w-4 mr-1" />CSV</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Current %</TableHead>
                    <TableHead>Min %</TableHead>
                    <TableHead>Max %</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Conv Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leadSources.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.source_name}</TableCell>
                      <TableCell>{s.current_pct}%</TableCell>
                      <TableCell>{s.min_pct}%</TableCell>
                      <TableCell>{s.max_pct}%</TableCell>
                      <TableCell>{s.total_leads}</TableCell>
                      <TableCell>{s.total_orders}</TableCell>
                      <TableCell>{s.conversion_rate ? `${(s.conversion_rate * 100).toFixed(1)}%` : '-'}</TableCell>
                    </TableRow>
                  ))}
                  {leadSources.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No sources yet — run a monthly loop</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminOrchestrator;
