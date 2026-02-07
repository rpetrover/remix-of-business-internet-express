import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllAvailableProviders } from "@/data/providers";
import { supabase } from "@/integrations/supabase/client";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import type { PlaceResult } from "@/hooks/useGooglePlaces";
import { updateCustomerContext } from "@/hooks/useCustomerContext";

const AvailabilityChecker = () => {
  const [formData, setFormData] = useState({
    businessName: "",
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

  const handlePlaceSelect = (place: PlaceResult) => {
    setFormData((prev) => ({
      ...prev,
      address: place.address,
      city: place.city,
      state: place.state,
      zipCode: place.zipCode,
      ...(place.businessName ? { businessName: place.businessName } : {}),
    }));
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

    try {
      const { data: geocodeData } = await supabase.functions.invoke("fcc-broadband-lookup", {
        body: { address: formData.address, city: formData.city, state: formData.state, zip: formData.zipCode },
      });

      const verifiedZip = geocodeData?.location?.zip || formData.zipCode;
      const verifiedAddress = geocodeData?.location?.matchedAddress || getFullAddress();
      const fccMapUrl = geocodeData?.fccMapUrl || "";
      const result = getAllAvailableProviders(verifiedZip.substring(0, 5));

      updateCustomerContext({
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: verifiedZip.substring(0, 5),
        businessName: formData.businessName,
      });

      navigate("/availability/results", {
        state: { address: verifiedAddress, allProviders: result.allProviders, spectrumAvailable: result.spectrumAvailable, fccMapUrl },
      });
    } catch (err) {
      console.error("Availability check error:", err);
      updateCustomerContext({
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        businessName: formData.businessName,
      });

      const result = getAllAvailableProviders(formData.zipCode);
      navigate("/availability/results", {
        state: { address: getFullAddress(), allProviders: result.allProviders, spectrumAvailable: result.spectrumAvailable },
      });
    } finally {
      setIsChecking(false);
    }
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
                  <Label htmlFor="home-businessName">Business Name</Label>
                  <AddressAutocomplete
                    id="home-businessName"
                    value={formData.businessName}
                    onChange={(value) => handleInputChange("businessName", value)}
                    onPlaceSelect={handlePlaceSelect}
                    placeholder="Search by business name..."
                  />
                </div>

                <div>
                  <Label htmlFor="home-address">
                    Street Address <span className="text-destructive">*</span>
                  </Label>
                  <AddressAutocomplete
                    id="home-address"
                    value={formData.address}
                    onChange={(value) => handleInputChange("address", value)}
                    onPlaceSelect={handlePlaceSelect}
                    placeholder="Start typing your address..."
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
