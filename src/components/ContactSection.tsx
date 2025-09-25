import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MessageSquare, MapPin, Clock, Users } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact-form" className="py-20 bg-gradient-primary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-primary-foreground text-primary font-semibold">
            Ready to Get Connected?
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Let's Find Your Perfect Solution
          </h2>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
            Our team of business connectivity experts is ready to help you find the right 
            Spectrum Business solution for your company's needs.
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
                Fill out the form below and we'll contact you within 30 minutes
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      First Name *
                    </label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Name *
                    </label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Business Name *
                  </label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Your Business Name"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number *
                    </label>
                    <input 
                      type="tel" 
                      required
                      className="w-full px-4 py-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <input 
                      type="email" 
                      required
                      className="w-full px-4 py-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="john@business.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Service Address
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="123 Business Ave, City, State, ZIP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Internet Speed Requirements
                  </label>
                  <select className="w-full px-4 py-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                    <option>Select your speed needs</option>
                    <option>Up to 100 Mbps - Small office (1-10 employees)</option>
                    <option>100-400 Mbps - Medium business (10-50 employees)</option>
                    <option>400 Mbps - 1 Gig - Large business (50+ employees)</option>
                    <option>1 Gig+ - Enterprise level requirements</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Additional Comments
                  </label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    placeholder="Tell us about your business needs, current challenges, or specific requirements..."
                  />
                </div>

                <Button variant="hero" className="w-full py-4 text-lg font-semibold">
                  Get My Free Quote Now
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  By submitting this form, you agree to be contacted by Business Internet Express 
                  regarding Spectrum Business services.
                </p>
              </form>
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
                      <p className="text-2xl font-bold text-primary mb-2">(555) 123-4567</p>
                      <p className="text-sm text-muted-foreground">
                        Speak directly with our business specialists
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
                        support@businessinternetexpress.com
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Detailed inquiries and technical support
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
                        Available Monday - Friday, 8 AM - 8 PM EST
                      </p>
                      <Button variant="outline" size="sm">
                        Start Chat
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours & Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="shadow-medium">
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">Business Hours</h4>
                  <p className="text-sm text-muted-foreground">
                    Mon-Fri: 8 AM - 8 PM<br />
                    Sat: 9 AM - 5 PM<br />
                    Sun: Emergency only
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-medium">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">Expert Team</h4>
                  <p className="text-sm text-muted-foreground">
                    Certified Spectrum<br />
                    Business specialists<br />
                    ready to help
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Service Area */}
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