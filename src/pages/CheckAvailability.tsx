import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, CheckCircle, Phone, Wifi, Tv, Smartphone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const CheckAvailabilityPage = () => {
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    businessName: "",
    phone: ""
  });
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.address || !formData.zipCode) {
      toast({
        title: "Missing Information",
        description: "Please enter your address and ZIP code to check availability.",
        variant: "destructive"
      });
      return;
    }

    setIsChecking(true);
    
    // Simulate API call
    setTimeout(() => {
      setResults({
        available: true,
        internet: [
          { name: "Internet Gig", speed: "1000 Mbps", price: "$69.99" },
          { name: "Internet Ultra", speed: "500 Mbps", price: "$59.99" },
          { name: "Internet", speed: "300 Mbps", price: "$49.99" }
        ],
        services: ["Business Phone", "Business TV", "Mobile"]
      });
      setIsChecking(false);
      toast({
        title: "Great News!",
        description: "Spectrum Business services are available at your location.",
      });
    }, 2000);
  };

  const services = [
    {
      icon: <Wifi className="h-12 w-12 text-primary" />,
      name: "Business Internet",
      description: "Reliable high-speed internet with speeds up to 1 Gig",
      features: ["No data caps", "Free installation", "24/7 support"]
    },
    {
      icon: <Phone className="h-12 w-12 text-primary" />,
      name: "Business Phone", 
      description: "Professional phone service with 35+ premium features",
      features: ["Unlimited calling", "Voicemail to email", "Auto attendant"]
    },
    {
      icon: <Tv className="h-12 w-12 text-primary" />,
      name: "Business TV",
      description: "Premium TV programming designed for businesses",
      features: ["125+ channels", "HD programming", "Sports packages"]
    },
    {
      icon: <Smartphone className="h-12 w-12 text-primary" />,
      name: "Mobile Service",
      description: "Flexible mobile plans with nationwide 5G coverage", 
      features: ["No contracts", "Unlimited options", "Device protection"]
    }
  ];

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
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Check Service Availability
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              See what Spectrum Business services are available at your location
            </p>
            <p className="text-lg text-white/80">
              Enter your business address below to get started with personalized pricing and availability
            </p>
          </div>
        </div>
      </section>

      {/* Availability Form */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Search className="h-6 w-6 text-primary" />
                  Enter Your Business Address
                </CardTitle>
                <p className="text-muted-foreground">
                  We'll check what services are available and provide personalized pricing
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder="Your Business Name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
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
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        placeholder="12345"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isChecking}
                  >
                    {isChecking ? "Checking Availability..." : "Check Availability"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {results && (
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Great News! Services Available
              </h2>
              <p className="text-xl text-muted-foreground">
                Spectrum Business services are available at your location
              </p>
            </div>

            {/* Internet Plans */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Available Internet Plans</h3>
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {results.internet.map((plan: any, index: number) => (
                  <Card key={index} className="text-center">
                    <CardHeader>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="text-2xl font-bold text-primary">{plan.speed}</div>
                      <div className="text-lg">
                        <span className="text-2xl font-bold text-primary">{plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        Select Plan
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Additional Services */}
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Additional Services Available</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((service, index) => (
                  <Card key={index} className="text-center">
                    <CardHeader>
                      <div className="flex justify-center mb-4">
                        {service.icon}
                      </div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                        {service.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-center justify-center gap-1">
                            <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button variant="outline" size="sm" className="w-full">
                        Add to Package
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Contact CTA */}
            <div className="text-center mt-16">
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
                  <p className="text-muted-foreground">
                    Contact a Spectrum Business specialist to customize your package
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="cta" className="flex-1">
                      Call (555) 123-4567
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Schedule Callback
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Available Monday-Friday, 8am-11pm ET
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Spectrum */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Why Choose Spectrum Business?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>No Annual Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Flexibility to change or cancel service without long-term commitments
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>24/7 Business Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  U.S.-based specialists available around the clock for your business needs
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Free Installation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Professional installation included with no additional setup fees
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CheckAvailabilityPage;