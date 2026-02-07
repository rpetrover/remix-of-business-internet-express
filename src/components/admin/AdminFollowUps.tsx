import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RefreshCw, Mail, Phone, UserX, CheckCircle, Clock, TrendingUp, Archive, Trash2, Filter } from "lucide-react";

interface AbandonedCheckout {
  id: string;
  email: string;
  phone: string | null;
  customer_name: string | null;
  selected_plan: string | null;
  selected_provider: string | null;
  monthly_price: number | null;
  speed: string | null;
  status: string;
  opted_out: boolean;
  converted: boolean;
  follow_up_count: number;
  last_follow_up_at: string | null;
  created_at: string;
}

interface FollowUpAction {
  id: string;
  checkout_id: string;
  action_type: string;
  sequence_step: number;
  subject: string | null;
  status: string;
  executed_at: string | null;
  created_at: string;
}

const AdminFollowUps = () => {
  const [checkouts, setCheckouts] = useState<AbandonedCheckout[]>([]);
  const [actions, setActions] = useState<FollowUpAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [deleteTarget, setDeleteTarget] = useState<AbandonedCheckout | null>(null);
  const { toast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      let checkoutQuery = supabase
        .from("abandoned_checkouts")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter === "active") {
        checkoutQuery = checkoutQuery.not("status", "in", '("archived")');
      } else if (statusFilter !== "all") {
        checkoutQuery = checkoutQuery.eq("status", statusFilter);
      }

      const [checkoutsRes, actionsRes] = await Promise.all([
        checkoutQuery,
        supabase
          .from("follow_up_actions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      if (checkoutsRes.data) setCheckouts(checkoutsRes.data);
      if (actionsRes.data) setActions(actionsRes.data as FollowUpAction[]);
    } catch (error) {
      console.error("Error loading follow-up data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const triggerProcessing = async () => {
    setIsProcessing(true);
    try {
      const { error } = await supabase.functions.invoke("process-abandoned-checkouts");
      if (error) throw error;
      toast({ title: "Processing Complete", description: "Follow-up sequences have been processed." });
      await loadData();
    } catch (error) {
      console.error("Processing error:", error);
      toast({ title: "Error", description: "Failed to process follow-ups.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const markConverted = async (id: string) => {
    try {
      const { error } = await supabase
        .from("abandoned_checkouts")
        .update({ converted: true, converted_at: new Date().toISOString(), status: "converted" })
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Marked as Converted" });
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update.", variant: "destructive" });
    }
  };

  const archiveCheckout = async (id: string) => {
    try {
      const { error } = await supabase
        .from("abandoned_checkouts")
        .update({ status: "archived" })
        .eq("id", id);
      if (error) throw error;
      setCheckouts(prev => prev.filter(c => c.id !== id));
      toast({ title: "Archived", description: "Checkout moved to archive." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to archive.", variant: "destructive" });
    }
  };

  const deleteCheckout = async () => {
    if (!deleteTarget) return;
    try {
      // Delete related follow-up actions first
      await supabase.from("follow_up_actions").delete().eq("checkout_id", deleteTarget.id);
      const { error } = await supabase.from("abandoned_checkouts").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      setCheckouts(prev => prev.filter(c => c.id !== deleteTarget.id));
      toast({ title: "Deleted", description: "Checkout permanently deleted." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const restoreCheckout = async (id: string) => {
    try {
      const { error } = await supabase
        .from("abandoned_checkouts")
        .update({ status: "abandoned" })
        .eq("id", id);
      if (error) throw error;
      if (statusFilter === "archived") {
        setCheckouts(prev => prev.filter(c => c.id !== id));
      } else {
        setCheckouts(prev => prev.map(c => c.id === id ? { ...c, status: "abandoned" } : c));
      }
      toast({ title: "Restored", description: "Checkout restored to active." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to restore.", variant: "destructive" });
    }
  };

  // Stats
  const totalLeads = checkouts.length;
  const activeLeads = checkouts.filter((c) => !c.opted_out && !c.converted && c.status === "abandoned").length;
  const convertedLeads = checkouts.filter((c) => c.converted).length;
  const optedOut = checkouts.filter((c) => c.opted_out).length;
  const emailsSent = actions.filter((a) => a.action_type === "email" && a.status === "sent").length;
  const callsMade = actions.filter((a) => a.action_type === "call").length;

  const getStatusBadge = (checkout: AbandonedCheckout) => {
    if (checkout.status === "archived") return <Badge variant="secondary">Archived</Badge>;
    if (checkout.converted) return <Badge className="bg-primary/10 text-primary">Converted</Badge>;
    if (checkout.opted_out) return <Badge variant="secondary">Opted Out</Badge>;
    if (checkout.follow_up_count >= 5) return <Badge variant="outline">Sequence Complete</Badge>;
    return <Badge className="bg-accent/10 text-accent">Active — Step {checkout.follow_up_count}/5</Badge>;
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <TrendingUp className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{totalLeads}</p>
            <p className="text-xs text-muted-foreground">Total Leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Clock className="h-6 w-6 text-accent mx-auto mb-1" />
            <p className="text-2xl font-bold">{activeLeads}</p>
            <p className="text-xs text-muted-foreground">Active Follow-ups</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <CheckCircle className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{convertedLeads}</p>
            <p className="text-xs text-muted-foreground">Converted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <UserX className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
            <p className="text-2xl font-bold">{optedOut}</p>
            <p className="text-xs text-muted-foreground">Opted Out</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Mail className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{emailsSent}</p>
            <p className="text-xs text-muted-foreground">Emails Sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Phone className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{callsMade}</p>
            <p className="text-xs text-muted-foreground">Calls Made</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-xl font-bold">Abandoned Checkout Follow-ups</h2>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[150px] text-xs">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="abandoned">Abandoned</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={triggerProcessing} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Run Follow-up Sequence"
            )}
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Follow-up</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checkouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No abandoned checkouts found
                  </TableCell>
                </TableRow>
              ) : (
                checkouts.map((checkout) => (
                  <TableRow key={checkout.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{checkout.customer_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{checkout.email}</p>
                        {checkout.phone && (
                          <p className="text-xs text-muted-foreground">{checkout.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{checkout.selected_plan || "—"}</p>
                        <p className="text-xs text-muted-foreground">{checkout.selected_provider}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {checkout.monthly_price ? `$${checkout.monthly_price}/mo` : "—"}
                    </TableCell>
                    <TableCell>{getStatusBadge(checkout)}</TableCell>
                    <TableCell className="text-sm">
                      {checkout.last_follow_up_at ? formatDate(checkout.last_follow_up_at) : "—"}
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(checkout.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {!checkout.converted && !checkout.opted_out && checkout.status !== "archived" && (
                          <Button size="sm" variant="outline" onClick={() => markConverted(checkout.id)} title="Mark as converted">
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                        {checkout.status === "archived" ? (
                          <Button size="sm" variant="outline" onClick={() => restoreCheckout(checkout.id)} title="Restore">
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => archiveCheckout(checkout.id)} title="Archive">
                            <Archive className="h-3 w-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(checkout)} title="Delete permanently">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Checkout Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the checkout for <strong>{deleteTarget?.customer_name || deleteTarget?.email}</strong> and all related follow-up actions.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteCheckout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminFollowUps;
