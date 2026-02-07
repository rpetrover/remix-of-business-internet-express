import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  PartyPopper,
  Phone,
  Mail,
  Calendar,
  Shield,
  Clock,
  MapPin,
  ArrowRight,
  MessageCircle,
  Star,
  Zap,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface OrderData {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  items: {
    product_name: string;
    price: number;
    speed?: string;
    is_bundle?: boolean;
  }[];
  totalPrice: number;
  orderId?: string;
}

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  const { clearCart } = useCart();

  useEffect(() => {
    const data = location.state as OrderData | null;
    if (!data) {
      navigate("/", { replace: true });
      return;
    }
    setOrderData(data);
    // Ensure cart is cleared on success page
    clearCart();
  }, [location.state, navigate]);

  const openChat = () => {
    window.dispatchEvent(new CustomEvent("open-chat-widget"));
  };

  if (!orderData) return null;

  const confirmationNumber = orderData.orderId
    ? orderData.orderId.slice(0, 8).toUpperCase()
    : `BIE-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      <Header />

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Hero Celebration */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-24 h-24 rounded-full bg-primary/10 animate-ping opacity-30" />
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            🎉 Order Confirmed!
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Thank you, <span className="font-semibold text-foreground">{orderData.customerName}</span>! 
            Your business internet service order has been successfully submitted.
          </p>
        </div>

        {/* Confirmation Number */}
        <Card className="mb-6 border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <CardContent className="py-5 text-center">
            <p className="text-sm text-muted-foreground mb-1">Confirmation Number</p>
            <p className="text-2xl font-bold font-mono tracking-widest text-primary">
              {confirmationNumber}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Save this number for your records
            </p>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Zap className="h-5 w-5 text-primary" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderData.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-start p-3 bg-muted/30 rounded-lg"
              >
                <div>
                  <h4 className="font-semibold">{item.product_name}</h4>
                  {item.speed && (
                    <p className="text-sm text-muted-foreground">{item.speed}</p>
                  )}
                  {item.is_bundle && (
                    <Badge variant="secondary" className="mt-1">
                      Bundle Discount
                    </Badge>
                  )}
                </div>
                <p className="font-bold">${item.price.toFixed(2)}/mo</p>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Monthly Total</span>
              <span className="text-primary">
                ${orderData.totalPrice.toFixed(2)}/mo
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Service Address & Contact */}
        <Card className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="h-5 w-5 text-primary" />
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Service Address</p>
                <p className="font-medium">
                  {orderData.address}
                  <br />
                  {orderData.city}, {orderData.state} {orderData.zipCode}
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Contact Email</p>
                  <p className="font-medium">{orderData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Contact Phone</p>
                  <p className="font-medium">{orderData.phone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What Happens Next */}
        <Card className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5 text-primary" />
              What Happens Next
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {[
                {
                  icon: Mail,
                  title: "Order Confirmation Email",
                  description:
                    "You'll receive a detailed confirmation email at " +
                    orderData.email +
                    " within the next few minutes.",
                  time: "Within minutes",
                },
                {
                  icon: Phone,
                  title: "Dedicated Account Specialist Call",
                  description:
                    "A dedicated account specialist will call you to confirm your service details and answer any questions.",
                  time: "Within 1-2 business days",
                },
                {
                  icon: Calendar,
                  title: "Professional Installation Scheduled",
                  description:
                    "We'll schedule a convenient installation date that works for your business. Our certified technicians handle everything.",
                  time: "Within 3-5 business days",
                },
                {
                  icon: Zap,
                  title: "You're Connected!",
                  description:
                    "Your high-speed business internet is live. Our support team is available 24/7 if you need anything.",
                  time: "Installation day",
                },
              ].map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    {index < 3 && (
                      <div className="w-px h-full bg-border mt-2 min-h-[20px]" />
                    )}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{step.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {step.time}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trust & Guarantee */}
        <Card className="mb-6 border-primary/10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <CardContent className="py-6">
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                <h4 className="font-semibold text-sm">30-Day Money-Back Guarantee</h4>
                <p className="text-xs text-muted-foreground">
                  Not satisfied? Full refund, no questions asked.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Star className="h-8 w-8 text-primary" />
                <h4 className="font-semibold text-sm">99.9% Uptime SLA</h4>
                <p className="text-xs text-muted-foreground">
                  Enterprise-grade reliability for your business.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Phone className="h-8 w-8 text-primary" />
                <h4 className="font-semibold text-sm">24/7 U.S.-Based Support</h4>
                <p className="text-xs text-muted-foreground">
                  Real humans ready to help whenever you need.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600">
          <CardContent className="py-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">Need Assistance?</h3>
              <p className="text-sm text-muted-foreground">
                Our team is here to make your transition seamless.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="default" size="lg" asChild>
                  <a href="tel:+18882303278">
                    <Phone className="h-4 w-4 mr-2" />
                    Call 1-888-230-FAST
                  </a>
                </Button>
                <Button variant="outline" size="lg" onClick={openChat}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with AI Agent
                </Button>
              </div>
              <div className="pt-4">
                <Button variant="ghost" asChild>
                  <Link to="/">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Return to Home
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default OrderSuccess;
