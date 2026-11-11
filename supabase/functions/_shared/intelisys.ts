// Automatic Intelisys submission for non-Spectrum orders.
// Subject/body mirror handleSubmitToIntelisys in src/components/admin/AdminOrders.tsx — keep them in sync.
import { Resend } from "npm:resend@2.0.0";

export interface IntelisysOrder {
  id: string;
  customer_name: string;
  service_address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  contact_phone: string;
  contact_email: string;
  service_type?: string | null;
  preferred_provider?: string | null;
  selected_plan?: string | null;
  speed?: string | null;
  monthly_price?: number | null;
  notes?: string | null;
  intelisys_email_sent?: boolean;
}

export function isSpectrumOrder(o: Partial<IntelisysOrder>): boolean {
  return [o.preferred_provider, o.selected_plan, o.service_type]
    .some((v) => typeof v === "string" && v.toLowerCase().includes("spectrum"));
}

export function buildIntelisysEmail(order: IntelisysOrder): { subject: string; body: string } {
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

  return {
    body: lines.join("\n"),
    subject: `[Business Internet Express] Internet Service Request – ${order.customer_name}`,
  };
}

/**
 * Sends the order to Intelisys once. Never throws — failures are logged and the flag stays false.
 * Atomically claims the order (intelisys_email_sent false -> true) before sending so it can never go twice.
 */
// deno-lint-ignore no-explicit-any
export async function autoSubmitToIntelisys(supabase: any, order: IntelisysOrder): Promise<void> {
  try {
    if (!order?.id) return;
    if (isSpectrumOrder(order)) {
      console.log(`[intelisys] Order ${order.id} is Spectrum — skipping (manual Buyflow).`);
      return;
    }
    if (order.intelisys_email_sent) return;

    const { data: claimed, error: claimErr } = await supabase
      .from("orders")
      .update({ intelisys_email_sent: true })
      .eq("id", order.id)
      .eq("intelisys_email_sent", false)
      .select("id");
    if (claimErr || !claimed || claimed.length === 0) {
      console.log(`[intelisys] Order ${order.id} already sent/claimed — skipping.`, claimErr ?? "");
      return;
    }

    const { subject, body } = buildIntelisysEmail(order);
    try {
      const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
      const res = await resend.emails.send({
        from: "Business Internet Express <service@businessinternetexpress.com>",
        to: ["intelisys_orders@scansource.com"],
        cc: ["service@businessinternetexpress.com"],
        subject,
        text: body,
      });
      // deno-lint-ignore no-explicit-any
      if ((res as any)?.error) throw new Error(JSON.stringify((res as any).error));
      await supabase.from("orders")
        .update({ intelisys_sent_at: new Date().toISOString() })
        .eq("id", order.id);
      console.log(`[intelisys] Order ${order.id} sent to Intelisys.`, res);
    } catch (sendErr) {
      console.error(`[intelisys] Send failed for order ${order.id}:`, sendErr);
      await supabase.from("orders")
        .update({ intelisys_email_sent: false, intelisys_sent_at: null })
        .eq("id", order.id);
    }
  } catch (err) {
    console.error("[intelisys] Unexpected error:", err);
  }
}
