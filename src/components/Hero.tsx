import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-primary">
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center lg:text-left lg:mx-0">
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
            <Button variant="cta" size="lg" className="text-lg px-8 py-4" asChild>
              <a href="#check-availability">Check Availability</a>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary" asChild>
              <a href="#plans">View Plans</a>
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
      </div>
    </section>
  );
};

export default Hero;