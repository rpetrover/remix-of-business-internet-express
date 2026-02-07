import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Wifi, Shield, Headphones, Zap, CheckCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const ProductShowcase = () => {
  const { addToCart, cartItems } = useCart();
  
  const plans = [
    {
      name: "Internet 100",
      speed: "100 Mbps",
      price: "$49.99",
      period: "/month",
      features: [
        "Up to 100 Mbps download",
        "10 Mbps upload",
        "No data caps",
        "24/7 technical support",
        "Professional installation",
        "99.9% network uptime"
      ],
      recommended: false,
      icon: <Wifi className="h-8 w-8 text-primary" />
    },
    {
      name: "Internet 200",
      speed: "200 Mbps", 
      price: "$69.99",
      period: "/month",
      features: [
        "Up to 200 Mbps download",
        "10 Mbps upload", 
        "No data caps",
        "Priority technical support",
        "Free professional installation",
        "Security suite included"
      ],
      recommended: true,
      icon: <Zap className="h-8 w-8 text-primary" />
    },
    {
      name: "Internet 400",
      speed: "400 Mbps",
      price: "$89.99", 
      period: "/month",
      features: [
        "Up to 400 Mbps download",
        "20 Mbps upload",
        "No data caps", 
        "Dedicated account manager",
        "Static IP included",
        "Advanced security suite"
      ],
      recommended: false,
      icon: <Shield className="h-8 w-8 text-primary" />
    },
    {
      name: "Internet Gig",
      speed: "1 Gig",
      price: "$109.99",
      period: "/month", 
      features: [
        "Up to 1 Gig download",
        "35 Mbps upload",
        "No data caps",
        "Priority support",
        "Multiple static IPs",
        "SLA guarantee"
      ],
      recommended: false,
      icon: <Zap className="h-8 w-8 text-primary" />
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Spectrum Business Internet
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Fast, reliable internet service that keeps your business connected. 
            Choose the speed that's right for your business needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-large ${
                plan.recommended 
                  ? 'ring-2 ring-primary shadow-glow transform hover:scale-105' 
                  : 'hover:shadow-medium hover:transform hover:scale-102'
              }`}
            >
              {plan.recommended && (
                <div className="absolute top-0 left-0 right-0">
                  <div className="bg-gradient-primary text-center py-2">
                    <Badge variant="secondary" className="bg-accent text-accent-foreground font-semibold">
                      Most Popular
                    </Badge>
                  </div>
                </div>
              )}
              
              <CardHeader className={`text-center ${plan.recommended ? 'pt-12' : 'pt-8'}`}>
                <div className="flex justify-center mb-4">
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  {plan.name}
                </CardTitle>
                <div className="text-center">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-lg font-semibold text-primary">{plan.speed}</p>
              </CardHeader>
              
              <CardContent className="px-6 pb-8">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {(() => {
                  const isInCart = cartItems.some(item => 
                    item.product_type === 'internet' && item.product_name === plan.name
                  );
                  return (
                    <Button 
                      variant={isInCart ? "secondary" : (plan.recommended ? "cta" : "professional")} 
                      className="w-full py-3"
                      onClick={() => addToCart({
                        product_name: plan.name,
                        product_type: 'internet',
                        price: parseFloat(plan.price.replace('$', '')),
                        speed: plan.speed,
                        features: plan.features
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

        {/* Additional Services */}
        <div className="bg-gradient-card rounded-2xl p-8 shadow-medium">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Additional Business Services
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enhance your business connectivity with our premium add-on services
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Security Suite</h4>
              <p className="text-sm text-muted-foreground">Advanced threat protection</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Wifi className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">WiFi Pro</h4>
              <p className="text-sm text-muted-foreground">Managed wireless solution</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Headphones className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Priority Support</h4>
              <p className="text-sm text-muted-foreground">Dedicated technical support</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Static IP</h4>
              <p className="text-sm text-muted-foreground">Dedicated IP addresses</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;