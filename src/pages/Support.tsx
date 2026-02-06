import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, Mail, Clock, Users, BookOpen, AlertCircle, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SupportPage = () => {
  const supportChannels = [
    {
      icon: <Phone className="h-12 w-12 text-primary" />,
      title: "24/7 Phone Support",
      description: "Speak with U.S.-based specialists anytime",
      contact: "(855) 757-7328",
      availability: "Available 24/7",
      features: ["Technical support", "Billing assistance", "Service changes"]
    },
    {
      icon: <MessageCircle className="h-12 w-12 text-primary" />,
      title: "Live Chat",
      description: "Get instant help through live chat",
      contact: "Chat Now",
      availability: "24/7 — 365 days a year",
      features: ["Real-time support", "Screen sharing", "Quick solutions"]
    },
    {
      icon: <Mail className="h-12 w-12 text-primary" />,
      title: "Email Support",
      description: "Send detailed support requests via email",
      contact: "Submit Ticket",
      availability: "24-48 hour response",
      features: ["Detailed responses", "File attachments", "Case tracking"]
    }
  ];

  const supportTypes = [
    {
      icon: <AlertCircle className="h-8 w-8 text-red-500" />,
      title: "Service Outage",
      description: "Report or check status of service interruptions",
      priority: "Critical",
      response: "Immediate",
      contact: "(855) 757-7328"
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: "Technical Issues",
      description: "Internet, phone, or TV technical problems",
      priority: "High",
      response: "< 2 hours",
      contact: "Chat or Call"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Account Changes",
      description: "Billing, service upgrades, or account modifications",
      priority: "Standard",
      response: "< 24 hours",
      contact: "Any Channel"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "General Questions",
      description: "Product information and general inquiries",
      priority: "Standard",
      response: "< 24 hours",
      contact: "Chat or Email"
    }
  ];

  const businessHours = [
    { department: "Sales", hours: "24/7 — AI-Powered", phone: "1-888-230-FAST" },
    { department: "Technical Support", hours: "24/7 — AI-Powered", phone: "1-888-230-FAST" },
    { department: "Billing", hours: "24/7 — AI-Powered", phone: "1-888-230-FAST" },
    { department: "Enterprise Sales", hours: "24/7 — AI-Powered", phone: "1-888-230-FAST" }
  ];

  const resources = [
    {
      title: "Service Status",
      description: "Check current service status and outages in your area",
      link: "Check Status"
    },
    {
      title: "User Guides",
      description: "Step-by-step guides for common tasks and troubleshooting",
      link: "Browse Guides"
    },
    {
      title: "Bill Pay & Account",
      description: "Manage your account, pay bills, and view service details",
      link: "My Account"
    },
    {
      title: "Speed Test",
      description: "Test your internet connection speed and performance",
      link: "Run Test"
    },
    {
      title: "Equipment Support",
      description: "Setup guides and troubleshooting for modems and routers",
      link: "Equipment Help"
    },
    {
      title: "Business Portal",
      description: "Access business-specific tools and account management",
      link: "Business Portal"
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
              <Users className="h-16 w-16" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Spectrum Business Support
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Expert Support When You Need It Most
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
              <Badge variant="secondary" className="bg-accent text-accent-foreground text-lg px-6 py-2">
                24/7 Technical Support
              </Badge>
              <Badge variant="outline" className="border-white text-white text-lg px-6 py-2">
                U.S.-Based Specialists
              </Badge>
            </div>
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
              Get Support Now
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Contact Spectrum Business Support
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Multiple ways to get the help you need, when you need it. Our U.S.-based specialists are here to help.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {supportChannels.map((channel, index) => (
              <Card key={index} className="text-center transition-all duration-300 hover:shadow-large">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {channel.icon}
                  </div>
                  <CardTitle className="text-xl">{channel.title}</CardTitle>
                  <p className="text-muted-foreground mb-4">{channel.description}</p>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">{channel.contact}</div>
                    <Badge variant="secondary">{channel.availability}</Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2 mb-6 text-sm">
                    {channel.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button variant="cta" className="w-full">
                    Contact Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Support Types */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Support by Issue Type
            </h2>
            <p className="text-xl text-muted-foreground">
              Get prioritized support based on the type of issue you're experiencing
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {supportTypes.map((type, index) => (
              <Card key={index} className="transition-all duration-300 hover:shadow-medium">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-foreground">{type.title}</h3>
                        <Badge variant={type.priority === "Critical" ? "destructive" : "secondary"}>
                          {type.priority}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{type.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Response: <span className="font-semibold text-primary">{type.response}</span>
                        </span>
                        <Button variant="outline" size="sm">
                          {type.contact}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Business Hours */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Department Hours & Contact
            </h2>
            <p className="text-xl text-muted-foreground">
              Specific contact information and hours for different departments
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {businessHours.map((dept, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{dept.department}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{dept.hours}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Phone className="h-4 w-4" />
                        <span className="font-semibold">{dept.phone}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Call Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Self-Service Resources */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Self-Service Resources
            </h2>
            <p className="text-xl text-muted-foreground">
              Find answers and solve issues on your own with our comprehensive resources
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <Card key={index} className="text-center transition-all duration-300 hover:shadow-medium">
                <CardHeader>
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                  <p className="text-muted-foreground text-sm">{resource.description}</p>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    {resource.link}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Support */}
      <section className="py-20 bg-red-50 dark:bg-red-950/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Emergency Service Issues?
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              If you're experiencing a service outage or critical issue that affects your business operations, contact us immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="destructive" size="lg">
                Call Emergency Line: (855) 757-7328
              </Button>
              <Button variant="outline" size="lg">
                Check Service Status
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Emergency support is available 24/7 for critical business service issues
            </p>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Help Us Improve Our Support
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Your feedback helps us provide better service. Share your experience with Spectrum Business support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="cta">
                Submit Feedback
              </Button>
              <Button variant="outline">
                Rate Your Experience
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SupportPage;