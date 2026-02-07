import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Database, Trash2, Download, RefreshCw, Loader2, AlertTriangle, Package, ShoppingCart, Mail
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type TableName = 'orders' | 'abandoned_checkouts' | 'emails' | 'campaigns';

interface TableConfig {
  name: TableName;
  label: string;
  icon: React.ReactNode;
  columns: string[];
}

const TABLES: TableConfig[] = [
  {
    name: 'orders',
    label: 'Orders',
    icon: <Package className="h-4 w-4" />,
    columns: ['id', 'customer_name', 'contact_email', 'service_address', 'city', 'state', 'status', 'created_at'],
  },
  {
    name: 'abandoned_checkouts',
    label: 'Abandoned Checkouts',
    icon: <ShoppingCart className="h-4 w-4" />,
    columns: ['id', 'email', 'customer_name', 'service_address', 'status', 'converted', 'created_at'],
  },
  {
    name: 'emails',
    label: 'Emails',
    icon: <Mail className="h-4 w-4" />,
    columns: ['id', 'from_email', 'to_email', 'subject', 'direction', 'status', 'created_at'],
  },
  {
    name: 'campaigns',
    label: 'Campaigns',
    icon: <Mail className="h-4 w-4" />,
    columns: ['id', 'name', 'subject', 'status', 'sent_count', 'total_recipients', 'created_at'],
  },
];

const AdminDataManager = () => {
  const [selectedTable, setSelectedTable] = useState<TableName>('orders');
  const [records, setRecords] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const tableConfig = TABLES.find((t) => t.name === selectedTable)!;

  const fetchRecords = async () => {
    setIsLoading(true);
    setSelectedIds(new Set());
    try {
      const { data, error } = await supabase
        .from(selectedTable)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      setRecords(data || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableChange = (value: string) => {
    setSelectedTable(value as TableName);
    setRecords([]);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === records.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(records.map((r) => r.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      const { error } = await supabase
        .from(selectedTable)
        .delete()
        .in('id', ids);

      if (error) throw error;

      toast({
        title: 'Deleted',
        description: `${ids.length} record(s) deleted from ${tableConfig.label}`,
      });
      setRecords((prev) => prev.filter((r) => !selectedIds.has(r.id)));
      setSelectedIds(new Set());
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const dataToExport = selectedIds.size > 0
        ? records.filter((r) => selectedIds.has(r.id))
        : records;

      if (dataToExport.length === 0) {
        toast({ title: 'No Data', description: 'No records to export', variant: 'destructive' });
        return;
      }

      const headers = Object.keys(dataToExport[0]);
      const csvRows = [
        headers.join(','),
        ...dataToExport.map((row) =>
          headers.map((h) => {
            const val = row[h];
            if (val === null || val === undefined) return '';
            const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
            return `"${str.replace(/"/g, '""')}"`;
          }).join(',')
        ),
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTable}_export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Exported',
        description: `${dataToExport.length} records exported as CSV`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2 min-w-[200px]">
              <Label>Select Table</Label>
              <Select value={selectedTable} onValueChange={handleTableChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TABLES.map((t) => (
                    <SelectItem key={t.name} value={t.name}>
                      <span className="flex items-center gap-2">
                        {t.icon} {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchRecords} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Load Data
            </Button>
            <Button variant="outline" onClick={handleExportCSV} disabled={records.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV {selectedIds.size > 0 ? `(${selectedIds.size})` : `(All)`}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={selectedIds.size === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedIds.size})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            {tableConfig.label}
            {records.length > 0 && (
              <Badge variant="outline">{records.length} records</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {records.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Click "Load Data" to view records</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="p-3 text-left w-10">
                        <Checkbox
                          checked={selectedIds.size === records.length && records.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </th>
                      {tableConfig.columns.map((col) => (
                        <th key={col} className="p-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                          {col.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {records.map((record) => (
                      <tr
                        key={record.id}
                        className={`hover:bg-muted/30 ${selectedIds.has(record.id) ? 'bg-primary/5' : ''}`}
                      >
                        <td className="p-3">
                          <Checkbox
                            checked={selectedIds.has(record.id)}
                            onCheckedChange={() => toggleSelect(record.id)}
                          />
                        </td>
                        {tableConfig.columns.map((col) => (
                          <td key={col} className="p-3 whitespace-nowrap max-w-[200px] truncate">
                            {col === 'id' ? (
                              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                {String(record[col]).slice(0, 8)}...
                              </code>
                            ) : col === 'created_at' ? (
                              new Date(record[col]).toLocaleDateString()
                            ) : col === 'converted' ? (
                              <Badge className={record[col] ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}>
                                {record[col] ? 'Yes' : 'No'}
                              </Badge>
                            ) : col === 'status' ? (
                              <Badge variant="outline">{record[col]}</Badge>
                            ) : (
                              String(record[col] ?? '—')
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Bulk Delete
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete <strong>{selectedIds.size}</strong> record(s)
              from <strong>{tableConfig.label}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                `Delete ${selectedIds.size} Records`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDataManager;
