import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroBackground from "@/assets/hero-bg.jpg";
import { Phone, Mail, Clock } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-primary/80" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Main Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Business Internet
              <span className="block text-accent"> Express</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-2xl">
              Your trusted Spectrum Business Internet partner. Get enterprise-grade connectivity 
              with dedicated support and competitive pricing.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Button variant="hero" size="lg" className="text-lg px-8 py-4">
                Get Quote Now
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary">
                View Plans
              </Button>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start text-primary-foreground/90">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                <span className="font-medium">Call: (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <span className="font-medium">support@businessinternetexpress.com</span>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Quote Card */}
          <div className="flex justify-center lg:justify-end">
            <Card className="p-8 bg-gradient-card shadow-large border-0 w-full max-w-md">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Get Started Today</h3>
                <p className="text-muted-foreground">Free consultation and quote</p>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Business Name
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Your business name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Internet Speed Needed
                  </label>
                  <select className="w-full px-4 py-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option>Select speed requirement</option>
                    <option>Up to 100 Mbps</option>
                    <option>100-500 Mbps</option>
                    <option>500 Mbps - 1 Gig</option>
                    <option>1 Gig+</option>
                  </select>
                </div>
                
                <Button variant="professional" className="w-full py-3 text-lg">
                  Get Free Quote
                </Button>
              </form>
              
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Response within 30 minutes</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;