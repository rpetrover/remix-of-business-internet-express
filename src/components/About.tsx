import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, Award, Clock, Shield } from "lucide-react";

const About = () => {
  const stats = [
    { icon: <Users className="h-8 w-8 text-primary" />, number: "500+", label: "Happy Businesses" },
    { icon: <Award className="h-8 w-8 text-primary" />, number: "5+", label: "Years Experience" },
    { icon: <Clock className="h-8 w-8 text-primary" />, number: "24/7", label: "Support Available" },
    { icon: <Shield className="h-8 w-8 text-primary" />, number: "99.9%", label: "Uptime Guarantee" },
  ];

  const benefits = [
    "Multiple Provider Options in One Place",
    "Competitive Pricing & Special Offers",
    "Dedicated Account Management",
    "Professional Installation & Support",
    "Same-Day Service Calls Available",
    "No Hidden Fees or Contracts"
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Column */}
          <div>
            <Badge variant="secondary" className="mb-4 text-primary font-semibold">
              About Business Internet Express
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Your Business Internet Partner
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              We partner with the top internet service providers to help businesses find 
              the fastest, most reliable connectivity at the best price. Our team compares 
              plans from multiple carriers so you don't have to.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-1 flex-shrink-0" />
                  <span className="text-foreground font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-card p-6 rounded-xl shadow-medium">
              <h3 className="text-xl font-bold text-foreground mb-3">
                Why Choose Business Internet Express?
              </h3>
              <p className="text-muted-foreground">
                We're not just another internet reseller. We're your local business connectivity 
                partner, committed to finding the right provider and plan that fits 
                your budget and performance needs.
              </p>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center p-6 shadow-medium hover:shadow-large transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex justify-center mb-4">
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Testimonial */}
            <Card className="p-6 shadow-medium bg-gradient-card">
              <CardContent className="p-0">
                <div className="mb-4">
                  <div className="flex text-accent text-lg">
                    {'★'.repeat(5)}
                  </div>
                </div>
                <blockquote className="text-foreground font-medium mb-4">
                  "Business Internet Express found us a plan that was faster AND cheaper 
                  than what we had before. Their team handled everything from comparing providers 
                  to scheduling installation. Excellent service!"
                </blockquote>
                <div className="text-sm">
                  <div className="font-semibold text-foreground">Sarah Johnson</div>
                  <div className="text-muted-foreground">IT Director, TechFlow Solutions</div>
                </div>
              </CardContent>
            </Card>

            {/* Multi-Provider Badge */}
            <Card className="p-6 shadow-medium border-2 border-primary/20">
              <CardContent className="p-0 text-center">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Multi-Provider Partner
                </h3>
                <p className="text-sm text-muted-foreground">
                  Authorized to sell plans from Spectrum, Comcast, Frontier, Verizon, 
                  Optimum, and more — so you always get the best option.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
