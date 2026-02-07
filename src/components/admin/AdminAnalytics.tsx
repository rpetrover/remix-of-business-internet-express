import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Globe,
  Smartphone,
  Target,
  Download,
  RefreshCw,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Megaphone,
  FileText,
  Sheet,
} from "lucide-react";
import { useGA4Analytics, type ReportType, type AnalyticsData } from "@/hooks/useGA4Analytics";
import { exportToPDF, exportToXLS } from "@/lib/reportExport";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const CHART_COLORS = [
  "hsl(210, 100%, 50%)",
  "hsl(150, 60%, 45%)",
  "hsl(35, 90%, 55%)",
  "hsl(0, 70%, 55%)",
  "hsl(270, 60%, 55%)",
  "hsl(180, 50%, 45%)",
];

const DATE_RANGES = [
  { value: "7d", label: "Last 7 Days", start: "7daysAgo" },
  { value: "14d", label: "Last 14 Days", start: "14daysAgo" },
  { value: "30d", label: "Last 30 Days", start: "30daysAgo" },
  { value: "90d", label: "Last 90 Days", start: "90daysAgo" },
];

const AdminAnalytics = () => {
  const { fetchReport, loading, error, needsSetup } = useGA4Analytics();
  const [dateRange, setDateRange] = useState("30d");
  const [activeReport, setActiveReport] = useState("overview");

  const [overviewData, setOverviewData] = useState<AnalyticsData | null>(null);
  const [trafficData, setTrafficData] = useState<AnalyticsData | null>(null);
  const [topPagesData, setTopPagesData] = useState<AnalyticsData | null>(null);
  const [sourcesData, setSourcesData] = useState<AnalyticsData | null>(null);
  const [geoData, setGeoData] = useState<AnalyticsData | null>(null);
  const [devicesData, setDevicesData] = useState<AnalyticsData | null>(null);
  const [campaignsData, setCampaignsData] = useState<AnalyticsData | null>(null);
  const [conversionsData, setConversionsData] = useState<AnalyticsData | null>(null);

  const selectedRange = DATE_RANGES.find((r) => r.value === dateRange) || DATE_RANGES[2];

  const loadAllData = async () => {
    const reports: { type: ReportType; setter: (d: AnalyticsData | null) => void }[] = [
      { type: "overview", setter: setOverviewData },
      { type: "traffic_over_time", setter: setTrafficData },
      { type: "top_pages", setter: setTopPagesData },
      { type: "traffic_sources", setter: setSourcesData },
      { type: "geography", setter: setGeoData },
      { type: "devices", setter: setDevicesData },
      { type: "campaigns", setter: setCampaignsData },
      { type: "conversions", setter: setConversionsData },
    ];

    await Promise.all(
      reports.map(async ({ type, setter }) => {
        const data = await fetchReport(type, selectedRange.start, "today");
        setter(data);
      })
    );
  };

  useEffect(() => {
    loadAllData();
  }, [dateRange]);

  const getOverviewMetric = (metricName: string): string => {
    if (!overviewData?.rows?.[0]) return "—";
    const val = overviewData.rows[0][metricName];
    if (val === undefined) return "—";
    if (typeof val === "number") {
      if (metricName.includes("Rate")) return `${(val * 100).toFixed(1)}%`;
      if (metricName === "averageSessionDuration") return `${Math.round(val)}s`;
      return val.toLocaleString();
    }
    return String(val);
  };

  const handleExportPDF = (title: string, data: AnalyticsData | null) => {
    if (!data) return;
    const rows = data.rows.map((row) => data.headers.map((h) => row[h] ?? ""));
    exportToPDF(
      `${title} — ${selectedRange.label}`,
      data.headers.map(formatHeader),
      rows,
      `bie-${title.toLowerCase().replace(/\s+/g, "-")}-${dateRange}`
    );
  };

  const handleExportXLS = (title: string, data: AnalyticsData | null) => {
    if (!data) return;
    const rows = data.rows.map((row) => data.headers.map((h) => row[h] ?? ""));
    exportToXLS(
      title,
      data.headers.map(formatHeader),
      rows,
      `bie-${title.toLowerCase().replace(/\s+/g, "-")}-${dateRange}`
    );
  };

  if (needsSetup) {
    return <SetupGuide />;
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics & Traffic</h2>
          <p className="text-sm text-muted-foreground">Google Analytics 4 data for your website</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={loadAllData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={Users} title="Total Users" value={getOverviewMetric("totalUsers")} />
        <MetricCard icon={Eye} title="Page Views" value={getOverviewMetric("screenPageViews")} />
        <MetricCard icon={TrendingUp} title="Sessions" value={getOverviewMetric("sessions")} />
        <MetricCard icon={Target} title="Conversions" value={getOverviewMetric("conversions")} />
        <MetricCard icon={Users} title="New Users" value={getOverviewMetric("newUsers")} />
        <MetricCard icon={BarChart3} title="Bounce Rate" value={getOverviewMetric("bounceRate")} />
        <MetricCard icon={TrendingUp} title="Engagement" value={getOverviewMetric("engagementRate")} />
        <MetricCard icon={BarChart3} title="Avg Duration" value={getOverviewMetric("averageSessionDuration")} />
      </div>

      {/* Report Tabs */}
      <Tabs value={activeReport} onValueChange={setActiveReport}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Traffic Trends</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ReportCard
            title="Traffic Over Time"
            data={trafficData}
            loading={loading}
            onExportPDF={() => handleExportPDF("Traffic Over Time", trafficData)}
            onExportXLS={() => handleExportXLS("Traffic Over Time", trafficData)}
          >
            {trafficData && trafficData.rows.length > 0 && (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trafficData.rows.map(r => ({
                    ...r,
                    date: formatDate(String(r.date)),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sessions" stroke={CHART_COLORS[0]} name="Sessions" strokeWidth={2} />
                    <Line type="monotone" dataKey="totalUsers" stroke={CHART_COLORS[1]} name="Users" strokeWidth={2} />
                    <Line type="monotone" dataKey="screenPageViews" stroke={CHART_COLORS[2]} name="Page Views" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </ReportCard>
        </TabsContent>

        <TabsContent value="pages">
          <ReportCard
            title="Top Pages"
            data={topPagesData}
            loading={loading}
            onExportPDF={() => handleExportPDF("Top Pages", topPagesData)}
            onExportXLS={() => handleExportXLS("Top Pages", topPagesData)}
          >
            {topPagesData && <DataTable data={topPagesData} />}
          </ReportCard>
        </TabsContent>

        <TabsContent value="sources">
          <ReportCard
            title="Traffic Sources"
            data={sourcesData}
            loading={loading}
            onExportPDF={() => handleExportPDF("Traffic Sources", sourcesData)}
            onExportXLS={() => handleExportXLS("Traffic Sources", sourcesData)}
          >
            <div className="grid md:grid-cols-2 gap-6">
              {sourcesData && sourcesData.rows.length > 0 && (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourcesData.rows.slice(0, 6).map((r, i) => ({
                          name: `${r.sessionSource}/${r.sessionMedium}`,
                          value: Number(r.sessions) || 0,
                          fill: CHART_COLORS[i % CHART_COLORS.length],
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={(e) => e.name}
                      >
                        {sourcesData.rows.slice(0, 6).map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div>{sourcesData && <DataTable data={sourcesData} />}</div>
            </div>
          </ReportCard>
        </TabsContent>

        <TabsContent value="geography">
          <ReportCard
            title="Geographic Distribution"
            data={geoData}
            loading={loading}
            onExportPDF={() => handleExportPDF("Geography", geoData)}
            onExportXLS={() => handleExportXLS("Geography", geoData)}
          >
            <div className="grid md:grid-cols-2 gap-6">
              {geoData && geoData.rows.length > 0 && (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={geoData.rows.slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" fontSize={12} />
                      <YAxis dataKey="region" type="category" fontSize={11} width={100} />
                      <Tooltip />
                      <Bar dataKey="sessions" fill={CHART_COLORS[0]} name="Sessions" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div>{geoData && <DataTable data={geoData} />}</div>
            </div>
          </ReportCard>
        </TabsContent>

        <TabsContent value="devices">
          <ReportCard
            title="Device Breakdown"
            data={devicesData}
            loading={loading}
            onExportPDF={() => handleExportPDF("Devices", devicesData)}
            onExportXLS={() => handleExportXLS("Devices", devicesData)}
          >
            <div className="grid md:grid-cols-2 gap-6">
              {devicesData && devicesData.rows.length > 0 && (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={devicesData.rows.map((r, i) => ({
                          name: String(r.deviceCategory),
                          value: Number(r.sessions) || 0,
                          fill: CHART_COLORS[i % CHART_COLORS.length],
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={(e) => `${e.name}: ${e.value}`}
                      >
                        {devicesData.rows.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div>{devicesData && <DataTable data={devicesData} />}</div>
            </div>
          </ReportCard>
        </TabsContent>

        <TabsContent value="campaigns">
          <ReportCard
            title="Campaign Performance"
            data={campaignsData}
            loading={loading}
            onExportPDF={() => handleExportPDF("Campaigns", campaignsData)}
            onExportXLS={() => handleExportXLS("Campaigns", campaignsData)}
          >
            {campaignsData && campaignsData.rows.length > 0 ? (
              <>
                <div className="h-[300px] mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={campaignsData.rows.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="sessionCampaignName" fontSize={11} angle={-20} textAnchor="end" height={60} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sessions" fill={CHART_COLORS[0]} name="Sessions" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="conversions" fill={CHART_COLORS[1]} name="Conversions" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <DataTable data={campaignsData} />
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium">No campaign data yet</p>
                <p className="text-sm mt-2">
                  Use UTM parameters in your Google Ads campaigns to track performance here.
                  <br />
                  Example: <code className="text-xs bg-muted px-2 py-1 rounded">?utm_source=google&utm_medium=cpc&utm_campaign=spring_promo</code>
                </p>
              </div>
            )}
          </ReportCard>
        </TabsContent>

        <TabsContent value="conversions">
          <ReportCard
            title="Conversion Events"
            data={conversionsData}
            loading={loading}
            onExportPDF={() => handleExportPDF("Conversions", conversionsData)}
            onExportXLS={() => handleExportXLS("Conversions", conversionsData)}
          >
            {conversionsData && conversionsData.rows.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={conversionsData.rows}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="eventName" fontSize={11} angle={-20} textAnchor="end" height={80} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="eventCount" fill={CHART_COLORS[0]} name="Event Count" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <DataTable data={conversionsData} />
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium">No conversion data yet</p>
                <p className="text-sm mt-2">Conversion events will appear here as users interact with your site.</p>
              </div>
            )}
          </ReportCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ─── Sub-components ───

function MetricCard({ icon: Icon, title, value }: { icon: any; title: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{title}</p>
            <p className="text-xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportCard({
  title,
  data,
  loading,
  children,
  onExportPDF,
  onExportXLS,
}: {
  title: string;
  data: AnalyticsData | null;
  loading: boolean;
  children: React.ReactNode;
  onExportPDF: () => void;
  onExportXLS: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        {data && data.rows.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onExportPDF}>
              <FileText className="h-3 w-3 mr-1" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={onExportXLS}>
              <Sheet className="h-3 w-3 mr-1" />
              XLS
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : data && data.rows.length > 0 ? (
          children
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No data available for this period</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DataTable({ data }: { data: AnalyticsData }) {
  return (
    <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {data.headers.map((h) => (
              <TableHead key={h} className="text-xs whitespace-nowrap">
                {formatHeader(h)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.map((row, i) => (
            <TableRow key={i}>
              {data.headers.map((h) => (
                <TableCell key={h} className="text-sm whitespace-nowrap">
                  {formatCellValue(h, row[h])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SetupGuide() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Google Analytics Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          To display analytics data, you need to configure GA4 API access. Follow these steps:
        </p>

        <div className="space-y-4">
          <SetupStep
            number={1}
            title="Create a GA4 Property"
            description="Go to analytics.google.com and create a GA4 property for your site. Note your Measurement ID (G-XXXXXXXXXX) and update it in index.html."
          />
          <SetupStep
            number={2}
            title="Enable GA4 Data API"
            description="Go to the Google Cloud Console → APIs & Services → Enable the 'Google Analytics Data API'."
          />
          <SetupStep
            number={3}
            title="Create a Service Account"
            description="In Google Cloud Console → IAM & Admin → Service Accounts → Create a new service account. Download the JSON key file."
          />
          <SetupStep
            number={4}
            title="Grant GA4 Access"
            description="In GA4 Admin → Property Access → Add the service account email as a Viewer."
          />
          <SetupStep
            number={5}
            title="Configure Secrets"
            description="Add two secrets: GA4_SERVICE_ACCOUNT_KEY (paste the entire JSON key file contents) and GA4_PROPERTY_ID (your numeric GA4 property ID, not the G- measurement ID)."
          />
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">Need your GA4 Property ID?</p>
          <p className="text-sm text-muted-foreground">
            Go to GA4 Admin → Property Settings → You'll see the Property ID (a number like 123456789).
            This is different from the Measurement ID (G-XXXXXXXXXX).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SetupStep({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-primary">{number}</span>
      </div>
      <div>
        <h4 className="font-semibold text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// ─── Formatting Helpers ───

function formatHeader(key: string): string {
  const map: Record<string, string> = {
    sessions: "Sessions",
    totalUsers: "Users",
    newUsers: "New Users",
    screenPageViews: "Page Views",
    bounceRate: "Bounce Rate",
    averageSessionDuration: "Avg Duration",
    engagementRate: "Engagement Rate",
    conversions: "Conversions",
    pagePath: "Page",
    sessionSource: "Source",
    sessionMedium: "Medium",
    region: "Region",
    deviceCategory: "Device",
    date: "Date",
    eventName: "Event",
    eventCount: "Count",
    sessionCampaignName: "Campaign",
  };
  return map[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

function formatDate(dateStr: string): string {
  if (dateStr.length === 8) {
    return `${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`;
  }
  return dateStr;
}

function formatCellValue(header: string, value: string | number | undefined): string {
  if (value === undefined || value === "") return "—";
  if (typeof value === "number") {
    if (header.includes("Rate")) return `${(value * 100).toFixed(1)}%`;
    if (header === "averageSessionDuration") return `${Math.round(value)}s`;
    return value.toLocaleString();
  }
  if (header === "date") return formatDate(String(value));
  return String(value);
}

export default AdminAnalytics;
