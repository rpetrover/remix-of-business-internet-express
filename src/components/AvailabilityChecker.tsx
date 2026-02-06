import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AvailabilityChecker = () => {
  const [formData, setFormData] = useState({
    businessName: "",
    phone: "",
    speed: "",
  });
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.businessName) {
      toast({
        title: "Missing Information",
        description: "Please enter your business name.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    // Navigate to the full check-availability page with pre-filled info
    navigate("/check-availability", {
      state: {
        businessName: formData.businessName,
        phone: formData.phone,
        speed: formData.speed,
      },
    });

    setIsChecking(false);
  };

  return (
    <section id="check-availability" className="py-16 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-background rounded-xl shadow-lg p-8 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Check Availability
              </h2>
              <p className="text-muted-foreground">
                Enter your business address
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="home-business" className="text-sm font-semibold text-foreground">
                  Business Name
                </Label>
                <Input
                  id="home-business"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange("businessName", e.target.value)}
                  placeholder="Your business name"
                  className="mt-1.5 h-12 rounded-lg border-border"
                />
              </div>

              <div>
                <Label htmlFor="home-phone" className="text-sm font-semibold text-foreground">
                  Phone Number
                </Label>
                <Input
                  id="home-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                  className="mt-1.5 h-12 rounded-lg border-border"
                />
              </div>

              <div>
                <Label htmlFor="home-speed" className="text-sm font-semibold text-foreground">
                  Internet Speed Needed
                </Label>
                <Select
                  value={formData.speed}
                  onValueChange={(value) => handleInputChange("speed", value)}
                >
                  <SelectTrigger id="home-speed" className="mt-1.5 h-12 rounded-lg border-border">
                    <SelectValue placeholder="Select speed requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Up to 100 Mbps</SelectItem>
                    <SelectItem value="standard">100–300 Mbps</SelectItem>
                    <SelectItem value="fast">300–500 Mbps</SelectItem>
                    <SelectItem value="ultra">500 Mbps – 1 Gbps</SelectItem>
                    <SelectItem value="enterprise">1 Gbps+</SelectItem>
                    <SelectItem value="unsure">Not sure yet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold rounded-lg"
                size="lg"
                disabled={isChecking}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Get Free Quote"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                <Clock className="h-4 w-4" />
                Response within 30 minutes
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AvailabilityChecker;
