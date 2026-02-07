import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { updateCustomerContext } from "@/hooks/useCustomerContext";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { trackLeadCapture, setUserData } from "@/lib/analytics";

interface LeadCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  providerName: string;
  price: number;
  speed?: string;
  onContinue: (leadData: { email: string; phone: string; name: string }) => void;
}

const LeadCaptureModal = ({
  open,
  onOpenChange,
  planName,
  providerName,
  price,
  speed,
  onContinue,
}: LeadCaptureModalProps) => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [smsConsent, setSmsConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { executeRecaptcha } = useRecaptcha();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    if (!formData.phone || formData.phone.length < 10) {
      newErrors.phone = "Valid phone number is required";
    }
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = "Name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // reCAPTCHA verification
      const recaptchaToken = await executeRecaptcha("lead_capture");
      const { data: captchaResult, error: captchaError } = await supabase.functions.invoke("verify-recaptcha", {
        body: { token: recaptchaToken, action: "lead_capture" },
      });
      if (captchaError || !captchaResult?.success) {
        toast({ title: "Verification Failed", description: "Please try again.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      // Save lead as abandoned checkout
      const { error } = await supabase.from("abandoned_checkouts").insert({
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        customer_name: formData.name.trim(),
        selected_plan: planName,
        selected_provider: providerName,
        monthly_price: price,
        speed: speed || null,
        status: "abandoned",
      });

      if (error) {
        console.error("Error saving lead:", error);
        // Don't block the user — still continue to checkout
      }

      // Save lead data to customer context for order form pre-fill
      const nameParts = formData.name.trim().split(/\s+/);
      updateCustomerContext({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });

      trackLeadCapture(planName, providerName, price);
      setUserData(formData.email.trim(), formData.phone.trim());

      onContinue({
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        name: formData.name.trim(),
      });
    } catch (err) {
      console.error("Lead capture error:", err);
      // Still save to context and continue even if DB save fails
      const nameParts = formData.name.trim().split(/\s+/);
      updateCustomerContext({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });

      onContinue({
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        name: formData.name.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Great Choice!
          </DialogTitle>
          <DialogDescription>
            Enter your info to continue with <strong>{providerName} — {planName}</strong>
            {speed && <> at <strong>{speed}</strong></>} for <strong>${price}/mo</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="lead-name">Your Name *</Label>
            <Input
              id="lead-name"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder="John Smith"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="lead-email">Email Address *</Label>
            <Input
              id="lead-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              placeholder="john@business.com"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="lead-phone">Phone Number *</Label>
            <Input
              id="lead-phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))
              }
              placeholder="1234567890"
              maxLength={11}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="sms-consent"
              checked={smsConsent}
              onCheckedChange={(checked) => setSmsConsent(!!checked)}
            />
            <Label htmlFor="sms-consent" className="text-xs text-muted-foreground leading-tight">
              I consent to receive SMS and calls about my internet service inquiry. 
              Message & data rates may apply. Reply STOP to opt out.
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || !smsConsent}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Continue to Checkout"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            We'll never share your information. See our privacy policy.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureModal;
