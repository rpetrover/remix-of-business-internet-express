import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Shield, Zap, Users, CheckCircle, Network, Server, Lock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const EnterprisePage = () => {
  const solutions = [
    {
      icon: <Network className="h-12 w-12 text-primary" />,
      name: "Dedicated Fiber",
      description: "High-performance dedicated fiber connectivity",
      features: [
        "Symmetrical upload/download speeds",
        "99.9% uptime SLA guarantee",
        "Scalable bandwidth options",
        "Priority network access"
      ],
      pricing: "Starting at $299/month"
    },
    {
      icon: <Shield className="h-12 w-12 text-primary" />,
      name: "Managed Security",
      description: "Comprehensive cybersecurity solutions",
      features: [
        "24/7 security monitoring",
        "Threat detection & response",
        "Firewall management",
        "Security compliance reporting"
      ],
      pricing: "Custom pricing"
    },
    {
      icon: <Server className="h-12 w-12 text-primary" />,
      name: "Cloud Solutions",
      description: "Scalable cloud infrastructure and services",
      features: [
        "Private cloud hosting",
        "Disaster recovery solutions",
        "Data backup & storage",
        "Cloud migration support"
      ],
      pricing: "Starting at $199/month"
    }
  ];

  const networkServices = [
    {
      name: "Ethernet",
      description: "High-speed dedicated Ethernet connections",
      speeds: "10 Mbps to 10 Gbps",
      features: ["Dedicated bandwidth", "Class of Service options", "Flexible terms"]
    },
    {
      name: "Internet",
      description: "Scalable business internet solutions",
      speeds: "Up to 10 Gbps",
      features: ["No data caps", "Static IP addresses", "99.9% uptime SLA"]
    },
    {
      name: "Voice & UC",
      description: "Unified communications platforms",
      speeds: "Unlimited calling", 
      features: ["SIP trunking", "Hosted PBX", "Video conferencing"]
    }
  ];

  const industries = [
    { name: "Healthcare", icon: "🏥", description: "HIPAA-compliant solutions for healthcare providers" },
    { name: "Financial Services", icon: "🏦", description: "Secure networking for financial institutions" },
    { name: "Education", icon: "🏫", description: "Reliable connectivity for schools and universities" },
    { name: "Government", icon: "🏛️", description: "Secure solutions for government agencies" },
    { name: "Manufacturing", icon: "🏭", description: "Industrial-grade networking solutions" },
    { name: "Retail", icon: "🏪", description: "Multi-location connectivity and POS support" }
  ];

  const benefits = [
    {
      icon: <Lock className="h-8 w-8 text-primary" />,
      title: "Enterprise Security",
      description: "Advanced security features and compliance standards for enterprise requirements"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Dedicated Support",
      description: "24/7 enterprise support with dedicated account management and technical expertise"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Scalable Solutions",
      description: "Flexible solutions that scale with your business growth and changing needs"
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
              <Building2 className="h-16 w-16" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Spectrum Enterprise
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Scalable Solutions for Large Organizations
            </p>
            <p className="text-lg mb-8 text-white/80">
              Dedicated fiber, managed services, and custom solutions designed to meet the most demanding enterprise requirements with enterprise-level support and SLAs.
            </p>
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
              Explore Solutions
            </Button>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Why Enterprise Organizations Choose Spectrum
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Purpose-built solutions with the reliability, security, and support that large organizations require.
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

      {/* Enterprise Solutions */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Enterprise Solutions Portfolio
            </h2>
            <p className="text-xl text-muted-foreground">
              Comprehensive solutions designed for large-scale deployments and mission-critical operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <Card key={index} className="transition-all duration-300 hover:shadow-large">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {solution.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground mb-2">
                    {solution.name}
                  </CardTitle>
                  <p className="text-muted-foreground mb-4">{solution.description}</p>
                  <div className="text-center">
                    <span className="text-lg font-semibold text-primary">{solution.pricing}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="px-6 pb-8">
                  <ul className="space-y-3 mb-6">
                    {solution.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Network Services */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Network Services
            </h2>
            <p className="text-xl text-muted-foreground">
              High-performance network solutions built on our nationwide fiber infrastructure
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {networkServices.map((service, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-foreground mb-2">
                    {service.name}
                  </CardTitle>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <Badge variant="secondary" className="mb-4">
                    {service.speeds}
                  </Badge>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2 mb-6 text-sm">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button variant="outline" className="w-full">
                    Get Quote
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Solutions */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Industry-Specific Solutions
            </h2>
            <p className="text-xl text-muted-foreground">
              Tailored solutions that meet the unique requirements of your industry
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry, index) => (
              <Card key={index} className="text-center transition-all duration-300 hover:shadow-medium">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-4">{industry.icon}</div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{industry.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{industry.description}</p>
                  <Button variant="outline" size="sm">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Level Agreements */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Enterprise-Grade Service Level Agreements
            </h2>
            <p className="text-xl text-muted-foreground">
              Guaranteed performance and reliability with comprehensive SLAs
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Network Uptime</h3>
                <p className="text-muted-foreground text-sm">Guaranteed network availability</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">4 Hours</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Repair Time</h3>
                <p className="text-muted-foreground text-sm">Maximum time to repair</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Support</h3>
                <p className="text-muted-foreground text-sm">Always available technical support</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">30 Day</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Installation</h3>
                <p className="text-muted-foreground text-sm">Maximum installation timeline</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready for Enterprise-Grade Solutions?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Contact our enterprise specialists to discuss custom solutions for your organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
              Request Consultation
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Call Enterprise Sales
            </Button>
          </div>
          <div className="mt-8">
            <p className="text-white/80">
              Dedicated account management • Custom SLAs • 24/7 enterprise support
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EnterprisePage;