import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Wifi, Phone, Tv, Smartphone, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PRODUCT_RECOMMENDATIONS = [
  {
    category: 'internet',
    name: 'Business Internet Pro',
    price: 79.99,
    speed: '500 Mbps',
    icon: Wifi,
    features: ['High-speed fiber', 'Static IP included', '24/7 support'],
    description: 'Upgrade your connectivity with our premium internet service'
  },
  {
    category: 'phone',
    name: 'Business Phone System',
    price: 29.99,
    icon: Phone,
    features: ['Unlimited calling', 'Voicemail to email', 'Auto attendant'],
    description: 'Professional phone system for seamless communication'
  },
  {
    category: 'tv',
    name: 'Business TV Premium',
    price: 49.99,
    icon: Tv,
    features: ['150+ channels', 'HD programming', 'Multiple receivers'],
    description: 'Keep customers engaged with premium entertainment'
  },
  {
    category: 'mobile',
    name: 'Business Mobile Unlimited',
    price: 29.99,
    icon: Smartphone,
    features: ['Unlimited data', '5G coverage', 'Mobile hotspot'],
    description: 'Stay connected anywhere with unlimited mobile service'
  }
];

const BUNDLES = [
  {
    name: "Essential Business Bundle",
    price: 149.99,
    originalPrice: 184.97,
    components: ['internet', 'phone'],
    features: ['High-speed Internet', 'Business Phone', '15% Bundle Discount'],
    savings: 35,
    description: 'Perfect starter bundle for small businesses'
  },
  {
    name: "Complete Communication Bundle", 
    price: 219.99,
    originalPrice: 289.97,
    components: ['internet', 'phone', 'tv'],
    features: ['High-speed Internet', 'Business Phone', 'Business TV', '20% Bundle Discount'],
    savings: 70,
    description: 'Everything your business needs to stay connected'
  },
  {
    name: "Media Business Bundle",
    price: 179.99,
    originalPrice: 204.98,
    components: ['internet', 'tv'],
    features: ['High-speed Internet', 'Business TV', '10% Bundle Discount'],
    savings: 25,
    description: 'Great for customer-facing businesses'
  }
];

const Upsell = () => {
  const { cartItems, addToCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    // Redirect if cart is empty
    if (cartItems.length === 0) {
      navigate('/');
    }
  }, [cartItems, navigate]);

  const currentProductTypes = cartItems.map(item => item.product_type);
  const availableRecommendations = PRODUCT_RECOMMENDATIONS.filter(rec => 
    !currentProductTypes.includes(rec.category as any) && 
    !cartItems.some(item => item.is_bundle && item.bundle_components?.includes(rec.category))
  );

  const suggestedBundles = BUNDLES.filter(bundle => 
    bundle.components.some(comp => currentProductTypes.includes(comp as any)) &&
    !cartItems.some(item => item.is_bundle)
  );

  const handleAddRecommendation = async (recommendation: typeof PRODUCT_RECOMMENDATIONS[0]) => {
    setSelectedItems(prev => [...prev, recommendation.category]);
    await addToCart({
      product_name: recommendation.name,
      product_type: recommendation.category as any,
      price: recommendation.price,
      speed: recommendation.speed,
      features: recommendation.features
    });
  };

  const handleSelectBundle = async (bundle: typeof BUNDLES[0]) => {
    await clearCart();
    await addToCart({
      product_name: bundle.name,
      product_type: 'bundle',
      price: bundle.price,
      features: bundle.features,
      is_bundle: true,
      bundle_components: bundle.components
    });
    // Navigate to order completion after selecting bundle
    navigate('/order-completion');
  };

  const proceedToCheckout = () => {
    navigate('/order-completion');
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  if (cartItems.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
          <h1 className="text-4xl font-bold mb-2">Great Choice!</h1>
          <p className="text-xl text-muted-foreground">
            Save more by adding complementary services to your order
          </p>
        </div>

        {/* Current Cart Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-success" />
              Items in Your Cart
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <div>
                    <h4 className="font-semibold">{item.product_name}</h4>
                    {item.speed && <p className="text-sm text-muted-foreground">{item.speed}</p>}
                    {item.is_bundle && <Badge variant="secondary" className="mt-1">Bundle</Badge>}
                  </div>
                  <p className="font-bold text-lg">${item.price}/mo</p>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-lg font-semibold">Current Total:</span>
                <span className="text-xl font-bold text-primary">${getTotalPrice().toFixed(2)}/mo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bundle Recommendations */}
        {suggestedBundles.length > 0 && (
          <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                💰 Save Even More with a Bundle!
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Get more services for less money with our popular bundles
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {suggestedBundles.map((bundle, index) => (
                  <Card key={index} className="border-primary/30 hover:border-primary transition-colors">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl">{bundle.name}</CardTitle>
                        <Badge variant="default" className="bg-success text-success-foreground">
                          Save ${bundle.savings}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{bundle.description}</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-bold text-primary">${bundle.price}/mo</span>
                        <span className="text-sm text-muted-foreground line-through">${bundle.originalPrice}/mo</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-4">
                        {bundle.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-success" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full" 
                        variant="default"
                        onClick={() => handleSelectBundle(bundle)}
                      >
                        Switch to This Bundle
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Individual Product Recommendations */}
        {availableRecommendations.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add More Services</CardTitle>
              <p className="text-muted-foreground">
                Complete your business communication setup
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableRecommendations.map((rec) => {
                  const IconComponent = rec.icon;
                  const isSelected = selectedItems.includes(rec.category);
                  
                  return (
                    <Card key={rec.category} className={`transition-all duration-200 ${
                      isSelected ? 'border-success bg-success/5' : 'hover:border-primary'
                    }`}>
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <IconComponent className="h-8 w-8 text-primary" />
                          <div>
                            <h4 className="font-semibold">{rec.name}</h4>
                            <p className="text-lg font-bold text-primary">${rec.price}/mo</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                          {rec.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <Check className="h-3 w-3 text-success" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button 
                          variant={isSelected ? "secondary" : "outline"}
                          size="sm" 
                          className="w-full"
                          onClick={() => handleAddRecommendation(rec)}
                          disabled={isSelected}
                        >
                          {isSelected ? (
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4" />
                              Added to Cart
                            </div>
                          ) : (
                            "Add to Cart"
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Proceed to Checkout */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Ready to Complete Your Order?</h3>
                <p className="text-muted-foreground">
                  Current total: <span className="font-semibold text-foreground">${getTotalPrice().toFixed(2)}/month</span>
                </p>
              </div>
              <Button 
                size="lg" 
                className="flex items-center gap-2"
                onClick={proceedToCheckout}
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Upsell;