import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tv, Trophy, Users, Clock, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/hooks/useCart";

const TVPage = () => {
  const { addToCart, cartItems } = useCart();
  const packages = [
    {
      name: "Business TV Select",
      price: "$44.99",
      channels: "125+",
      description: "Essential programming for your business",
      features: [
        "125+ popular channels",
        "HD programming included",
        "Local news & weather", 
        "Business-friendly content"
      ],
      popular: false
    },
    {
      name: "Sports Fan TV",
      price: "$89.99",
      channels: "180+",
      description: "Perfect for bars, restaurants & sports venues",
      features: [
        "45+ sports channels",
        "NFL, NBA, NHL, MLB coverage",
        "No occupancy requirements",
        "Save $3,000+ vs competitors"
      ],
      popular: true
    },
    {
      name: "Business TV Premium",
      price: "$129.99", 
      channels: "200+",
      description: "Complete entertainment solution",
      features: [
        "200+ premium channels",
        "Premium movie channels",
        "International programming",
        "Multiple receiver support"
      ],
      popular: false
    }
  ];

  const benefits = [
    {
      icon: <Trophy className="h-8 w-8 text-primary" />,
      title: "Save Over $3,000",
      description: "Sports Fan TV saves you over $3,000 compared to DirecTV over two years"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "No Occupancy Requirements", 
      description: "Unlike competitors, we don't require minimum occupancy for commercial rates"
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "3-Year Price Guarantee",
      description: "Lock in your rate with our 3-year price guarantee for budget certainty"
    }
  ];

  const sportsChannels = [
    "ESPN", "ESPN2", "Fox Sports 1", "Fox Sports 2", "NFL Network", 
    "NBA TV", "MLB Network", "NHL Network", "Golf Channel", "Tennis Channel",
    "Big Ten Network", "SEC Network", "ACC Network", "Pac-12 Network"
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex justify-center mb-6">
              <Tv className="h-16 w-16" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Spectrum Business TV
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Entertain and Engage with TV Designed for Your Business
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
              <Badge variant="secondary" className="bg-accent text-accent-foreground text-lg px-6 py-2">
                Save Over $3,000 vs DirecTV
              </Badge>
              <Badge variant="outline" className="border-white text-white text-lg px-6 py-2">
                3-Year Price Guarantee
              </Badge>
            </div>
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
              View TV Packages
            </Button>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Why Choose Spectrum Business TV?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Flexible packages, competitive pricing, and reliable service designed specifically for business needs.
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

      {/* TV Packages */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Business TV Packages
            </h2>
            <p className="text-xl text-muted-foreground">
              Find the perfect package for your business type and customer needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {packages.map((pkg, index) => (
              <Card 
                key={index}
                className={`relative transition-all duration-300 ${
                  pkg.popular 
                    ? 'ring-2 ring-primary shadow-glow scale-105' 
                    : 'hover:shadow-medium'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className="bg-gradient-primary text-center py-2">
                      <Badge variant="secondary" className="bg-accent text-accent-foreground font-semibold">
                        Best for Sports Venues
                      </Badge>
                    </div>
                  </div>
                )}
                
                <CardHeader className={`text-center ${pkg.popular ? 'pt-12' : 'pt-8'}`}>
                  <CardTitle className="text-2xl font-bold text-foreground mb-2">
                    {pkg.name}
                  </CardTitle>
                  <p className="text-muted-foreground mb-4">{pkg.description}</p>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-primary">{pkg.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-lg font-semibold text-foreground">{pkg.channels} Channels</span>
                  </div>
                </CardHeader>
                
                <CardContent className="px-6 pb-8">
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {(() => {
                    const isInCart = cartItems.some(item => 
                      item.product_type === 'tv' && item.product_name === pkg.name
                    );
                    return (
                      <Button 
                        variant={isInCart ? "secondary" : (pkg.popular ? "cta" : "outline")} 
                        className="w-full"
                        onClick={() => addToCart({
                          product_name: pkg.name,
                          product_type: 'tv',
                          price: parseFloat(pkg.price.replace('$', '')),
                          features: pkg.features
                        })}
                      >
                        {isInCart ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Added to Cart
                          </div>
                        ) : (
                          "Add to Cart"
                        )}
                      </Button>
                    );
                  })()}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sports Channels Showcase */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Complete Sports Coverage
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Sports Fan TV includes all the channels your customers want to watch
            </p>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                45+ Premium Sports Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {sportsChannels.map((channel, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded bg-secondary/50">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-foreground font-medium text-sm">{channel}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 p-2 rounded bg-secondary/50">
                  <span className="text-primary font-semibold text-sm">And Many More...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Business Types */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Perfect for Any Business Type
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">🍺</div>
                <h3 className="text-xl font-bold text-foreground mb-2">Bars & Pubs</h3>
                <p className="text-muted-foreground text-sm">Keep customers engaged with live sports and entertainment</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">🍽️</div>
                <h3 className="text-xl font-bold text-foreground mb-2">Restaurants</h3>
                <p className="text-muted-foreground text-sm">Create the perfect dining atmosphere with quality programming</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">🏨</div>
                <h3 className="text-xl font-bold text-foreground mb-2">Hotels</h3>
                <p className="text-muted-foreground text-sm">Provide guests with premium entertainment options</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="text-xl font-bold text-foreground mb-2">Offices</h3>
                <p className="text-muted-foreground text-sm">Keep employees informed with news and business channels</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Switch and Save?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Get premium business TV service with better pricing and no occupancy requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
              Check Availability
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Call (555) 123-4567
            </Button>
          </div>
          <div className="mt-8">
            <p className="text-white/80">
              30-Day Money-Back Guarantee • Contract Buyout up to $1,000
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TVPage;