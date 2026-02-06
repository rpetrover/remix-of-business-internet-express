import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Clock, Wrench, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { checkSpectrumAvailability, getAvailableProviders } from "@/data/providers";

const Hero = () => {
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getFullAddress = () => {
    return [formData.address, formData.city, formData.state, formData.zipCode].filter(Boolean).join(", ");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.address || !formData.zipCode) {
      toast({
        title: "Missing Information",
        description: "Please enter your street address and ZIP code.",
        variant: "destructive",
      });
      return;
    }

    if (formData.zipCode.length < 5) {
      toast({
        title: "Invalid ZIP Code",
        description: "Please enter a valid 5-digit ZIP code.",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const isSpectrumAvailable = checkSpectrumAvailability(formData.zipCode);
    const fullAddress = getFullAddress();

    if (isSpectrumAvailable) {
      navigate("/availability/success", { state: { address: fullAddress } });
    } else {
      const altProviders = getAvailableProviders(formData.zipCode);
      navigate("/availability/no-coverage", {
        state: { address: fullAddress, availableProviders: altProviders },
      });
    }

    setIsChecking(false);
  };

  return (
    <section id="check-availability" className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-primary">
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Headlines */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Get Connected
              <span className="block">In Under 24 Hours</span>
            </h1>
            <div className="bg-accent text-accent-foreground px-4 py-2 rounded-lg inline-block mb-6 font-semibold">
              Same-Day & Next-Day Installation Available
            </div>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-2xl">
              Lightning-fast business internet with the easiest setup in the industry.
              No long waits, no complicated installs — just plug in and grow.
            </p>

            {/* Trust Signals */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start text-primary-foreground/90 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Installed in Under 24 Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="font-medium">Speeds Up to 1 Gbps</span>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                <span className="font-medium">Easy, Hassle-Free Setup</span>
              </div>
            </div>
          </div>

          {/* Right: Availability Form */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 md:p-8">
            <div className="text-center mb-6">
              <Search className="h-8 w-8 text-primary-foreground mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-primary-foreground">Check Availability</h2>
              <p className="text-primary-foreground/70 text-sm mt-1">
                Enter your address to see plans available at your location
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="hero-address" className="text-primary-foreground/90">
                  Street Address <span className="text-accent">*</span>
                </Label>
                <Input
                  id="hero-address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 Business Street"
                  className="bg-white/90 border-white/30"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="hero-city" className="text-primary-foreground/90">City</Label>
                  <Input
                    id="hero-city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="City"
                    className="bg-white/90 border-white/30"
                  />
                </div>
                <div>
                  <Label htmlFor="hero-state" className="text-primary-foreground/90">State</Label>
                  <Input
                    id="hero-state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="ST"
                    maxLength={2}
                    className="bg-white/90 border-white/30"
                  />
                </div>
                <div>
                  <Label htmlFor="hero-zip" className="text-primary-foreground/90">
                    ZIP Code <span className="text-accent">*</span>
                  </Label>
                  <Input
                    id="hero-zip"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value.replace(/\D/g, "").slice(0, 5))}
                    placeholder="12345"
                    required
                    maxLength={5}
                    className="bg-white/90 border-white/30"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="cta"
                className="w-full"
                size="lg"
                disabled={isChecking}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking Availability...
                  </>
                ) : (
                  "Check Availability"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;