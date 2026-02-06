import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SpectrumResults from "@/components/SpectrumResults";
import AlternativeResults from "@/components/AlternativeResults";
import { useToast } from "@/hooks/use-toast";
import { checkSpectrumAvailability } from "@/data/providers";

type ResultType = "spectrum" | "alternative" | null;

const CheckAvailabilityPage = () => {
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    businessName: "",
    phone: "",
  });
  const [isChecking, setIsChecking] = useState(false);
  const [resultType, setResultType] = useState<ResultType>(null);
  const [checkedAddress, setCheckedAddress] = useState("");
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getFullAddress = () => {
    const parts = [formData.address, formData.city, formData.state, formData.zipCode].filter(Boolean);
    return parts.join(", ");
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
    setResultType(null);

    // Simulate network delay for UX
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const isSpectrumAvailable = checkSpectrumAvailability(formData.zipCode);
    const fullAddress = getFullAddress();
    setCheckedAddress(fullAddress);

    if (isSpectrumAvailable) {
      setResultType("spectrum");
      toast({
        title: "Great News!",
        description: "Spectrum Business services are available at your location.",
      });
    } else {
      setResultType("alternative");
      toast({
        title: "Spectrum Not Available",
        description: "We found other internet providers for your area.",
      });
    }

    setIsChecking(false);
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex justify-center mb-6">
              <MapPin className="h-16 w-16" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Check Internet Availability
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-white/90">
              Find the best business internet options for your location
            </p>
            <p className="text-base text-white/70">
              We partner with multiple providers to ensure your business gets connected
            </p>
          </div>
        </div>
      </section>

      {/* Availability Form */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Search className="h-6 w-6 text-primary" />
                  Enter Your Business Address
                </CardTitle>
                <p className="text-muted-foreground">
                  We'll check Spectrum availability first, then show all options for your area
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange("businessName", e.target.value)}
                      placeholder="Your Business Name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">
                      Street Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="123 Business Street"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        placeholder="ST"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">
                        ZIP Code <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value.replace(/\D/g, "").slice(0, 5))}
                        placeholder="12345"
                        required
                        maxLength={5}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="(555) 123-4567"
                    />
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

      {/* Results */}
      {resultType === "spectrum" && <SpectrumResults address={checkedAddress} />}
      {resultType === "alternative" && <AlternativeResults address={checkedAddress} />}

      <Footer />
    </div>
  );
};

export default CheckAvailabilityPage;
