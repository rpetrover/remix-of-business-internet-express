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
    "Authorized Spectrum Business Partner",
    "Competitive Pricing & Special Offers",
    "Dedicated Account Management",
    "Local Expert Installation & Support",
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
              Your Trusted Spectrum Business Partner
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              As an authorized Spectrum Business agent, we've been helping businesses across the region 
              get connected with reliable, high-speed internet solutions since 2019. Our team of experts 
              understands the unique connectivity needs of modern businesses.
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
                We're not just another internet provider. We're your local business connectivity 
                partner, committed to understanding your needs and delivering solutions that help 
                your business thrive in today's digital landscape.
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
                  "Business Internet Express made our transition to Spectrum seamless. Their team 
                  handled everything from consultation to installation. Excellent service!"
                </blockquote>
                <div className="text-sm">
                  <div className="font-semibold text-foreground">Sarah Johnson</div>
                  <div className="text-muted-foreground">IT Director, TechFlow Solutions</div>
                </div>
              </CardContent>
            </Card>

            {/* Spectrum Authorization */}
            <Card className="p-6 shadow-medium border-2 border-primary/20">
              <CardContent className="p-0 text-center">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Authorized Spectrum Partner
                </h3>
                <p className="text-sm text-muted-foreground">
                  Licensed and certified to sell Spectrum Business solutions with full manufacturer warranty and support.
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