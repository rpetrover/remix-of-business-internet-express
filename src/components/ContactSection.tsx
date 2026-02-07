import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MessageSquare, MapPin, Clock, Users, Loader2, CheckCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { trackContactFormSubmit, setUserData } from "@/lib/analytics";

const ContactSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { executeRecaptcha } = useRecaptcha();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    phone: "",
    email: "",
    serviceAddress: "",
    speedRequirements: "",
    comments: "",
    smsConsent: false,
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.businessName || !formData.phone || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // reCAPTCHA verification
      const recaptchaToken = await executeRecaptcha("contact_form");
      const { data: captchaResult, error: captchaError } = await supabase.functions.invoke("verify-recaptcha", {
        body: { token: recaptchaToken, action: "contact_form" },
      });
      if (captchaError || !captchaResult?.success) {
        toast({ title: "Verification Failed", description: "Please try again.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: formData,
      });

      if (error) throw error;

      setIsSubmitted(true);
      trackContactFormSubmit();
      setUserData(formData.email, formData.phone);
      toast({
        title: "Quote Request Sent!",
        description: "We'll get back to you within 1 business day.",
      });
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again or call us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact-form" className="py-20 bg-gradient-primary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-primary-foreground text-primary font-semibold">
            Ready to Get Connected?
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Get Spectrum Business Internet
          </h2>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
            Connect with a Spectrum Business specialist to find the right internet solution for your business. 
            Get competitive pricing and dedicated support.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <Card className="shadow-large">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Get Your Free Business Quote
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Complete the form to receive a personalized quote for your business
              </p>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-12 space-y-4">
                  <CheckCircle className="h-16 w-16 text-[hsl(var(--success))] mx-auto" />
                  <h3 className="text-2xl font-bold text-foreground">Thank You!</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Your quote request has been submitted. A specialist will contact you within 1 business day.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        firstName: "", lastName: "", businessName: "", phone: "",
                        email: "", serviceAddress: "", speedRequirements: "", comments: "",
                        smsConsent: false,
                      });
                    }}
                  >
                    Submit Another Request
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">First Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        maxLength={100}
                        className="w-full px-4 py-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                        maxLength={100}
                        className="w-full px-4 py-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Smith"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Business Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => handleChange("businessName", e.target.value)}
                      maxLength={200}
                      className="w-full px-4 py-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Your Business Name"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        maxLength={20}
                        className="w-full px-4 py-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        maxLength={255}
                        className="w-full px-4 py-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="john@business.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Service Address</label>
                    <input
                      type="text"
                      value={formData.serviceAddress}
                      onChange={(e) => handleChange("serviceAddress", e.target.value)}
                      maxLength={300}
                      className="w-full px-4 py-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="123 Business Ave, City, State, ZIP"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Internet Speed Requirements</label>
                    <select
                      value={formData.speedRequirements}
                      onChange={(e) => handleChange("speedRequirements", e.target.value)}
                      className="w-full px-4 py-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="">Select your speed needs</option>
                      <option>Up to 100 Mbps - Small office (1-10 employees)</option>
                      <option>100-400 Mbps - Medium business (10-50 employees)</option>
                      <option>400 Mbps - 1 Gig - Large business (50+ employees)</option>
                      <option>1 Gig+ - Enterprise level requirements</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Additional Comments</label>
                    <textarea
                      rows={4}
                      value={formData.comments}
                      onChange={(e) => handleChange("comments", e.target.value)}
                      maxLength={1000}
                      className="w-full px-4 py-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                      placeholder="Tell us about your business needs, current challenges, or specific requirements..."
                    />
                  </div>

                  {/* SMS Consent */}
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="smsConsentContact"
                      checked={formData.smsConsent}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, smsConsent: checked === true }))
                      }
                    />
                    <label htmlFor="smsConsentContact" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                      I agree to receive SMS/text messages from Business Internet Express regarding my quote, 
                      service updates, and support communications. Message and data rates may apply. 
                      Reply STOP to unsubscribe. Reply HELP for help.
                    </label>
                  </div>

                  <Button variant="cta" className="w-full py-4 text-lg font-semibold" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Get My Free Quote Now"
                    )}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    By submitting this form, you agree to be contacted by Business Internet Express
                    regarding internet services for your business.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="shadow-large">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  Multiple Ways to Connect
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 rounded-full p-3">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Call Us Now</h4>
                      <a href="tel:+18882303278" className="text-2xl font-bold text-primary mb-2 block hover:text-primary/80 transition-colors">1-888-230-FAST</a>
                      <p className="text-sm text-muted-foreground">
                        AI-powered sales & support — available 24/7
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 rounded-full p-3">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Email Support</h4>
                      <p className="text-lg font-medium text-primary mb-2">
                        service@businessinternetexpress.com
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Business inquiries and support
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 rounded-full p-3">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Live Chat</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Available 24/7 — 365 days a year
                      </p>
                      <Button variant="outline" size="sm">
                        Start Chat
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="shadow-medium">
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">Always Available</h4>
                  <p className="text-sm text-muted-foreground">
                    24 Hours a Day<br />
                    7 Days a Week<br />
                    365 Days a Year
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-medium">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">AI-Powered Team</h4>
                  <p className="text-sm text-muted-foreground">
                    Intelligent AI agents<br />
                    available around the clock<br />
                    to help your business
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-medium bg-gradient-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                  <h4 className="text-lg font-semibold text-foreground">Service Areas</h4>
                </div>
                <p className="text-muted-foreground mb-4">
                  We serve businesses throughout the Spectrum coverage area with same-day 
                  service calls available in most locations.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Check Service Availability
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
