import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Zap, Shield, Users, CheckCircle, Wifi } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MobilePage = () => {
  const plans = [
    {
      name: "By the Gig",
      price: "$14",
      unit: "per GB",
      description: "Pay only for what you use",
      features: [
        "Shared data across all lines",
        "No contracts or commitments",
        "Unlimited talk & text",
        "Nationwide 5G included"
      ],
      popular: false,
      badge: "Most Flexible"
    },
    {
      name: "Unlimited",
      price: "$29.99",
      unit: "per line/month",
      description: "Unlimited everything for your team",
      features: [
        "Unlimited talk, text & data",
        "Mobile hotspot included",
        "HD streaming included",
        "International texting"
      ],
      popular: true,
      badge: "Most Popular"
    },
    {
      name: "Unlimited Plus",
      price: "$45",
      unit: "per line/month",
      description: "Premium unlimited with perks",
      features: [
        "Everything in Unlimited",
        "FREE Anytime Upgrade",
        "Premium mobile hotspot",
        "International calling",
        "Device protection included"
      ],
      popular: false,
      badge: "Premium Features"
    }
  ];

  const benefits = [
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Anytime Upgrade",
      description: "Get a new phone whenever you want with Unlimited Plus plans"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Device Protection",
      description: "Keep your business devices protected with comprehensive coverage"
    },
    {
      icon: <Wifi className="h-8 w-8 text-primary" />,
      title: "Nationwide 5G",
      description: "Fast, reliable 5G coverage across the country"
    }
  ];

  const businessFeatures = [
    "Multi-line account management",
    "Business billing and invoicing", 
    "Employee device management",
    "Usage monitoring and controls",
    "Bring your own device support",
    "Number porting included",
    "24/7 business support",
    "No annual contracts",
    "Shared data plans available",
    "International roaming options"
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex justify-center mb-6">
              <Smartphone className="h-16 w-16" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Spectrum Mobile for Business
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Upgrade Your Business Phone Service with Unlimited Plans and 5G Access
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
              <Badge variant="secondary" className="bg-accent text-accent-foreground text-lg px-6 py-2">
                No Contracts • No Hidden Fees
              </Badge>
              <Badge variant="outline" className="border-white text-white text-lg px-6 py-2">
                We'll Pay Off Your Current Phone
              </Badge>
            </div>
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
              View Mobile Plans
            </Button>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Why Businesses Choose Spectrum Mobile
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Flexible plans, nationwide 5G coverage, and business-focused features to keep your team connected.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Plans */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Business Mobile Plans
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Choose the plan that fits your business needs and budget
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-primary font-semibold">
                💰 Switch to Spectrum Mobile and we'll pay off your phone balance up to $2,500 per line!
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <Card 
                key={index}
                className={`relative transition-all duration-300 ${
                  plan.popular 
                    ? 'ring-2 ring-primary shadow-glow scale-105' 
                    : 'hover:shadow-medium'
                }`}
              >
                <div className="absolute top-0 left-0 right-0">
                  <div className="bg-gradient-primary text-center py-2">
                    <Badge variant="secondary" className="bg-accent text-accent-foreground font-semibold">
                      {plan.badge}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="text-center pt-12">
                  <CardTitle className="text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </CardTitle>
                  <p className="text-muted-foreground mb-4">{plan.description}</p>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-primary">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.unit}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="px-6 pb-8">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    variant={plan.popular ? "cta" : "outline"} 
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">Add more lines, get more savings:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="outline">2-4 lines: Save $5/line</Badge>
              <Badge variant="outline">5+ lines: Save $10/line</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Business Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Business-Focused Features
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything your business needs to manage mobile service efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {businessFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-card border">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-foreground font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Device Showcase */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Latest Business Devices
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose from the latest smartphones and business devices
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-lg font-bold text-foreground mb-2">iPhone 15 Pro</h3>
                <p className="text-muted-foreground text-sm">Starting at $0/month</p>
                <Button variant="outline" size="sm" className="mt-3">View Details</Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-lg font-bold text-foreground mb-2">Samsung Galaxy S24</h3>
                <p className="text-muted-foreground text-sm">Starting at $0/month</p>
                <Button variant="outline" size="sm" className="mt-3">View Details</Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-lg font-bold text-foreground mb-2">Google Pixel 8</h3>
                <p className="text-muted-foreground text-sm">Starting at $0/month</p>
                <Button variant="outline" size="sm" className="mt-3">View Details</Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-lg font-bold text-foreground mb-2">Bring Your Own</h3>
                <p className="text-muted-foreground text-sm">Use your current device</p>
                <Button variant="outline" size="sm" className="mt-3">Check Compatibility</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Switch Your Business Mobile?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Get better coverage, flexible plans, and business features designed for success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
              Shop Phones
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Bring Your Own Device
            </Button>
          </div>
          <div className="mt-8">
            <p className="text-white/80">
              No contracts • We'll pay off your current phone up to $2,500
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MobilePage;