import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Phone, Wifi, Tv, Smartphone, Star } from "lucide-react";
import { spectrumPlans } from "@/data/providers";

interface SpectrumResultsProps {
  address: string;
}

const SpectrumResults = ({ address }: SpectrumResultsProps) => {
  const additionalServices = [
    {
      icon: <Phone className="h-10 w-10 text-primary" />,
      name: "Business Phone",
      description: "Professional phone with 35+ features",
      price: "From $19.99/mo",
    },
    {
      icon: <Tv className="h-10 w-10 text-primary" />,
      name: "Business TV",
      description: "125+ channels in HD",
      price: "From $44.99/mo",
    },
    {
      icon: <Smartphone className="h-10 w-10 text-primary" />,
      name: "Mobile Service",
      description: "Unlimited 5G plans",
      price: "From $29.99/line",
    },
  ];

  return (
    <section className="py-16 bg-secondary/30 animate-in fade-in duration-500">
      <div className="container mx-auto px-4">
        {/* Success Banner */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Great News! Spectrum Business is Available
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Spectrum Business services are available at <span className="font-semibold text-foreground">{address}</span>
          </p>
        </div>

        {/* Internet Plans */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
            <Wifi className="inline h-6 w-6 mr-2 text-primary" />
            Available Internet Plans
          </h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {spectrumPlans.map((plan, index) => (
              <Card
                key={index}
                className={`text-center relative transition-shadow hover:shadow-lg ${
                  plan.recommended ? "border-primary border-2 shadow-md" : ""
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      <Star className="h-3 w-3 mr-1" /> Recommended
                    </Badge>
                  </div>
                )}
                <CardHeader className="pt-8">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary mt-2">{plan.speed}</div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2 mb-6 text-left">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.recommended ? "default" : "outline"}
                    className="w-full"
                  >
                    Select Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Services */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
            Bundle & Save with Additional Services
          </h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {additionalServices.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-3">{service.icon}</div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  <p className="text-primary font-semibold mt-1">{service.price}</p>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    Add to Package
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
            <p className="text-muted-foreground">
              Speak with a specialist to customize your package and schedule installation
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="default" size="lg" className="flex-1" asChild>
                <a href="tel:+18882303278">
                  <Phone className="h-4 w-4 mr-2" />
                  Call 1-888-230-FAST
                </a>
              </Button>
              <Button variant="outline" size="lg" className="flex-1">
                Schedule Callback
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SpectrumResults;
