import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Tv, Smartphone, Building2 } from "lucide-react";

const BusinessServices = () => {
  const services = [
    {
      name: "Business Phone",
      icon: <Phone className="h-12 w-12 text-primary" />,
      description: "Unlimited calling with advanced features",
      features: [
        "Unlimited local & long distance",
        "Voicemail to email",
        "Auto attendant",
        "Call forwarding"
      ],
      startingPrice: "$29.99",
      popular: false
    },
    {
      name: "Business TV",
      icon: <Tv className="h-12 w-12 text-primary" />,
      description: "Premium TV service for your business",
      features: [
        "125+ channels",
        "HD programming",
        "Multiple receivers",
        "24/7 news & weather"
      ],
      startingPrice: "$44.99", 
      popular: false
    },
    {
      name: "Business Mobile",
      icon: <Smartphone className="h-12 w-12 text-primary" />,
      description: "Reliable mobile service with business features",
      features: [
        "Unlimited talk, text & data",
        "Mobile hotspot included", 
        "International calling",
        "Device protection"
      ],
      startingPrice: "$45.00",
      popular: true
    },
    {
      name: "Enterprise Solutions", 
      icon: <Building2 className="h-12 w-12 text-primary" />,
      description: "Scalable solutions for large businesses",
      features: [
        "Dedicated fiber",
        "Managed services",
        "Custom solutions",
        "24/7 enterprise support"
      ],
      startingPrice: "Custom",
      popular: false
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Complete Business Solutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Beyond internet, Spectrum Business offers comprehensive communication and 
            entertainment solutions to keep your business connected and productive.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-large ${
                service.popular 
                  ? 'ring-2 ring-primary shadow-glow' 
                  : 'hover:shadow-medium'
              }`}
            >
              {service.popular && (
                <div className="absolute top-0 left-0 right-0">
                  <div className="bg-gradient-primary text-center py-2">
                    <Badge variant="secondary" className="bg-accent text-accent-foreground font-semibold">
                      Popular Choice
                    </Badge>
                  </div>
                </div>
              )}
              
              <CardHeader className={`text-center ${service.popular ? 'pt-12' : 'pt-8'}`}>
                <div className="flex justify-center mb-4">
                  {service.icon}
                </div>
                <CardTitle className="text-xl font-bold text-foreground mb-2">
                  {service.name}
                </CardTitle>
                <p className="text-muted-foreground text-sm mb-4">
                  {service.description}
                </p>
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">Starting at</span>
                  <div>
                    <span className="text-2xl font-bold text-primary">{service.startingPrice}</span>
                    {service.startingPrice !== "Custom" && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="px-6 pb-8">
                <ul className="space-y-2 mb-6 text-sm">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={service.popular ? "cta" : "outline"} 
                  className="w-full"
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BusinessServices;