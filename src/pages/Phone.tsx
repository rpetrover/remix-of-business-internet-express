import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, CheckCircle, Users, Settings, Shield } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PhonePage = () => {
  const features = [
    "Unlimited Local & Long Distance",
    "Voicemail to Email",
    "Auto Attendant",
    "Call Forwarding",
    "Call Waiting",
    "3-Way Calling",
    "Call Hold",
    "Caller ID",
    "Call Screening",
    "Conference Calling",
    "Speed Dialing",
    "Call Blocking"
  ];

  const plans = [
    {
      name: "Business Voice Essentials",
      price: "$29.99",
      description: "Perfect for small businesses",
      features: [
        "1 Business Line",
        "25+ Premium Features",
        "Local & Long Distance",
        "Voicemail to Email"
      ],
      popular: false
    },
    {
      name: "Business Voice Pro",
      price: "$49.99", 
      description: "Ideal for growing teams",
      features: [
        "Up to 5 Business Lines",
        "35+ Premium Features",
        "Auto Attendant",
        "Conference Calling",
        "Call Analytics"
      ],
      popular: true
    },
    {
      name: "Business Voice Enterprise",
      price: "Custom",
      description: "Scalable for large organizations",
      features: [
        "Unlimited Business Lines",
        "All Premium Features",
        "Dedicated Support",
        "Custom Integration",
        "Advanced Analytics"
      ],
      popular: false
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
              <Phone className="h-16 w-16" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Spectrum Business Voice
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Reach Your Customers with Professional Business Phone Service
            </p>
            <p className="text-lg mb-8 text-white/80">
              Save more on connectivity by bundling Voice with Internet, unlocking your full business potential with 35+ premium features.
            </p>
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
              View Plans & Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Advanced Voice Solutions for Your Business
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Give every call a professional edge with premium features that make every interaction smooth and effortless.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Premium Call Features</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Essential features like Call Hold, 3-Way Calling, Call Waiting and more for professional communication.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Smart Call Screening</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Stay responsive and reliable with advanced call screening tools and automated attendant services.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Settings className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Easy Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Manage all your business phone features through our intuitive online portal and mobile app.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Choose Your Business Voice Plan
            </h2>
            <p className="text-xl text-muted-foreground">
              Flexible plans designed to grow with your business
            </p>
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
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className="bg-gradient-primary text-center py-2">
                      <Badge variant="secondary" className="bg-accent text-accent-foreground font-semibold">
                        Most Popular
                      </Badge>
                    </div>
                  </div>
                )}
                
                <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-8'}`}>
                  <CardTitle className="text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </CardTitle>
                  <p className="text-muted-foreground mb-4">{plan.description}</p>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-primary">{plan.price}</span>
                    {plan.price !== "Custom" && (
                      <span className="text-muted-foreground">/month</span>
                    )}
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
                    {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              35+ Premium Business Features Included
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything your business needs for professional communication
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-card border">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-foreground font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Upgrade Your Business Phone?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Get professional business phone service with all the features you need to succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
              Check Availability
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Call (555) 123-4567
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PhonePage;