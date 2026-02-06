import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { checkSpectrumAvailability, getAvailableProviders } from "@/data/providers";

const AvailabilityChecker = () => {
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
    <section id="check-availability" className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <MapPin className="h-10 w-10 text-primary mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Check Internet Availability
            </h2>
            <p className="text-muted-foreground">
              Enter your address to see which providers and plans are available at your location
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Enter Your Business Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="home-address">
                    Street Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="home-address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="123 Business Street"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="home-city">City</Label>
                    <Input
                      id="home-city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="home-state">State</Label>
                    <Input
                      id="home-state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="ST"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="home-zip">
                      ZIP Code <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="home-zip"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value.replace(/\D/g, "").slice(0, 5))}
                      placeholder="12345"
                      required
                      maxLength={5}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
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
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AvailabilityChecker;
