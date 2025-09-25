import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroBackground from "@/assets/hero-bg.jpg";
import { Phone, Mail, Clock } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-primary">
      {/* Clean Corporate Background */}
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Main Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Fast, Reliable
              <span className="block"> Business Internet</span>
            </h1>
            <div className="bg-accent text-accent-foreground px-4 py-2 rounded-lg inline-block mb-6 font-semibold">
              #1 in Customer Satisfaction for Small Business Internet Service
            </div>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-2xl">
              Get the speed and reliability your business needs with Spectrum Business Internet. 
              99.9% network uptime guaranteed with 24/7 support.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Button variant="cta" size="lg" className="text-lg px-8 py-4">
                Check Availability
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary">
                View Plans
              </Button>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start text-primary-foreground/90 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">✓ 99.9% Network Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">✓ 24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">✓ No Data Caps</span>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Quote Card */}
          <div className="flex justify-center lg:justify-end">
            <Card className="p-8 bg-gradient-card shadow-large border-0 w-full max-w-md">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Check Availability</h3>
                <p className="text-muted-foreground">Enter your business address</p>
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