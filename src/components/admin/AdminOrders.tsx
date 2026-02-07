import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Package, RefreshCw, MapPin, Phone, Mail, Globe, ChevronRight, ExternalLink, FileText } from 'lucide-react';

interface Order {
  id: string;
  customer_name: string;
  service_address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  contact_phone: string;
  contact_email: string;
  service_type: string;
  preferred_provider: string | null;
  selected_plan: string | null;
  speed: string | null;
  monthly_price: number | null;
  status: string;
  channel: string;
  intelisys_email_sent: boolean;
  intelisys_sent_at: string | null;
  notes: string | null;
  porting_bill_url: string | null;
  created_at: string;
  updated_at: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to load orders', variant: 'destructive' });
    } else {
      setOrders((data as unknown as Order[]) || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
      toast({ title: 'Updated', description: `Order status changed to ${newStatus}` });
    }
  };

  const updateIntelisysStatus = async (orderId: string) => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('orders')
      .update({ intelisys_email_sent: true, intelisys_sent_at: now } as any)
      .eq('id', orderId);

    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, intelisys_email_sent: true, intelisys_sent_at: now } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, intelisys_email_sent: true, intelisys_sent_at: now } : null);
      }
      toast({ title: 'Marked as Submitted', description: 'Order flagged as submitted to Intelisys.' });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-amber-500/10 text-amber-600',
      submitted: 'bg-primary/10 text-primary',
      processing: 'bg-blue-500/10 text-blue-600',
      confirmed: 'bg-emerald-500/10 text-emerald-600',
      installed: 'bg-green-600/10 text-green-700',
      cancelled: 'bg-destructive/10 text-destructive',
    };
    return <Badge className={variants[status] || 'bg-muted text-muted-foreground'}>{status}</Badge>;
  };

  const getChannelBadge = (channel: string) => {
    const icons: Record<string, string> = { chat: '💬', email: '📧', phone: '📞', web: '🌐' };
    return <Badge variant="outline" className="text-xs">{icons[channel] || '📋'} {channel}</Badge>;
  };

  const handleSubmitToIntelisys = (order: Order) => {
    const lines: string[] = [];
    lines.push("Dear Team,");
    lines.push("");
    lines.push("I hope you are doing well.");
    lines.push("");
    lines.push("We are requesting available options and pricing to start internet service at the location listed below. No order has been placed yet. This request is for evaluation and to proceed with the most cost-effective option.");
    lines.push("");
    lines.push(`Customer Name: ${order.customer_name}`);
    lines.push("Service Address:");
    lines.push(order.service_address);
    lines.push(`${order.city}, ${order.state} ${order.zip}`);
    lines.push(order.country);
    lines.push("");
    lines.push(`Contact Phone: ${order.contact_phone}`);
    lines.push(`Email: ${order.contact_email}`);
    lines.push("");
    lines.push("Service Requested:");
    lines.push(`• ${order.service_type || "Business internet service only"}`);
    if (order.preferred_provider) lines.push(`• Preferred provider: ${order.preferred_provider}`);
    if (order.selected_plan) lines.push(`• Selected plan: ${order.selected_plan}`);
    if (order.speed) lines.push(`• Speed: ${order.speed}`);
    if (order.monthly_price) lines.push(`• Estimated monthly price: $${order.monthly_price}/month`);
    lines.push("• Most cost-effective available option");
    lines.push("");
    lines.push("Requested Information:");
    if (order.preferred_provider) {
      lines.push(`• ${order.preferred_provider} business internet availability`);
    } else {
      lines.push("• Business internet availability");
    }
    lines.push("• Pricing and bandwidth options");
    lines.push("• Installation details and timeline");
    lines.push("• Any one-time or recurring charges");
    lines.push("");
    lines.push("Please let us know if you need any additional information to move forward.");
    if (order.notes) {
      lines.push("");
      lines.push(`Additional Notes: ${order.notes}`);
    }
    lines.push("");
    lines.push("");
    lines.push("Best,");
    lines.push("Business Internet Express");
    lines.push("Sales Team");
    lines.push("www.businessinternetexpress.com");

    const body = lines.join("\n");
    const subject = `[Business Internet Express] Internet Service Request – ${order.customer_name}`;
    const mailto = `mailto:intelisys_orders@scansource.com?cc=service@businessinternetexpress.com&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Orders List */}
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            Orders ({orders.length})
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={fetchOrders}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            {orders.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No orders yet</p>
                <p className="text-sm mt-1">Orders from chat, email, and phone will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                      selectedOrder?.id === order.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium truncate">{order.customer_name}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {order.service_address}, {order.city}, {order.state}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {getChannelBadge(order.channel)}
                          {order.preferred_provider && (
                            <span className="text-xs text-muted-foreground">{order.preferred_provider}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Order Detail */}
      <Card className="lg:col-span-2">
        {selectedOrder ? (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedOrder.customer_name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Order ID: {selectedOrder.id.slice(0, 8)}... • {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
                {getStatusBadge(selectedOrder.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Service Address
                  </h4>
                  <div className="text-sm text-muted-foreground">
                    <p>{selectedOrder.service_address}</p>
                    <p>{selectedOrder.city}, {selectedOrder.state} {selectedOrder.zip}</p>
                    <p>{selectedOrder.country}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Contact Info
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="flex items-center gap-2">
                      <Phone className="h-3 w-3" /> {selectedOrder.contact_phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-3 w-3" /> {selectedOrder.contact_email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold">Service Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>{' '}
                    <span>{selectedOrder.service_type}</span>
                  </div>
                  {selectedOrder.preferred_provider && (
                    <div>
                      <span className="text-muted-foreground">Provider:</span>{' '}
                      <span>{selectedOrder.preferred_provider}</span>
                    </div>
                  )}
                  {selectedOrder.selected_plan && (
                    <div>
                      <span className="text-muted-foreground">Plan:</span>{' '}
                      <span>{selectedOrder.selected_plan}</span>
                    </div>
                  )}
                  {selectedOrder.speed && (
                    <div>
                      <span className="text-muted-foreground">Speed:</span>{' '}
                      <span>{selectedOrder.speed}</span>
                    </div>
                  )}
                  {selectedOrder.monthly_price && (
                    <div>
                      <span className="text-muted-foreground">Price:</span>{' '}
                      <span>${selectedOrder.monthly_price}/mo</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Channel:</span>{' '}
                    {getChannelBadge(selectedOrder.channel)}
                  </div>
                </div>
                {selectedOrder.notes && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <span className="text-muted-foreground text-sm">Notes:</span>
                    <p className="text-sm mt-1">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* Porting Bill Document */}
              {selectedOrder.porting_bill_url && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Porting Bill Document
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Customer uploaded a phone bill for number porting.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const { data } = await supabase.storage
                        .from('order-documents')
                        .createSignedUrl(selectedOrder.porting_bill_url!, 3600);
                      if (data?.signedUrl) {
                        window.open(data.signedUrl, '_blank');
                      }
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View / Download Bill
                  </Button>
                </div>
              )}

              {/* Intelisys Submission */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Intelisys Submission
                </h4>
                <div className="flex items-center gap-3">
                  {selectedOrder.intelisys_email_sent ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600">✓ Submitted</Badge>
                  ) : (
                    <Badge className="bg-amber-500/10 text-amber-600">Not Submitted</Badge>
                  )}
                  <Button
                    size="sm"
                    variant={selectedOrder.intelisys_email_sent ? 'outline' : 'default'}
                    onClick={() => {
                      handleSubmitToIntelisys(selectedOrder);
                      // Mark as sent in DB
                      updateIntelisysStatus(selectedOrder.id);
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {selectedOrder.intelisys_email_sent ? 'Re-send to Intelisys' : 'Submit to Intelisys'}
                  </Button>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground self-center mr-2">Update Status:</span>
                {['pending', 'submitted', 'processing', 'confirmed', 'installed', 'cancelled'].map(status => (
                  <Button
                    key={status}
                    size="sm"
                    variant={selectedOrder.status === status ? 'default' : 'outline'}
                    onClick={() => updateStatus(selectedOrder.id, status)}
                    disabled={selectedOrder.status === status}
                    className="text-xs capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex items-center justify-center h-[600px] text-muted-foreground">
            <div className="text-center">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Select an order to view details</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminOrders;
