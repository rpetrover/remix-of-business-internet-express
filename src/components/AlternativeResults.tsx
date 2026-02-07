import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Phone, Star, ChevronDown, ChevronUp, Globe, AlertTriangle, MessageCircle } from "lucide-react";
import { type InternetProvider, type InternetPlan } from "@/data/providers";
import { useCart } from "@/contexts/CartContext";

interface AlternativeResultsProps {
  address: string;
  availableProviders: InternetProvider[];
}

const parsePrice = (price: string): number => {
  const match = price.replace(/[^0-9.]/g, "");
  return parseFloat(match) || 0;
};

const ProviderCard = ({
  provider,
  onSelectPlan,
}: {
  provider: InternetProvider;
  onSelectPlan: (plan: InternetPlan, provider: InternetProvider) => void;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader
        className="cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              {provider.logo ? (
                <img
                  src={provider.logo}
                  alt={`${provider.name} logo`}
                  className="h-10 w-10 object-contain rounded"
                />
              ) : (
                <Globe className="h-5 w-5 text-primary" />
              )}
              {provider.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{provider.technology}</Badge>
              {provider.nationwide && (
                <Badge variant="outline" className="text-primary border-primary">
                  Available Nationwide
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon">
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{provider.description}</p>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          <div className="grid sm:grid-cols-3 gap-4">
            {provider.plans.map((plan, index) => (
              <Card
                key={index}
                className={`text-center relative ${
                  plan.recommended ? "border-primary border-2" : "border-border"
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
                      <Star className="h-2.5 w-2.5 mr-1" /> Best Value
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-2 pt-6">
                  <CardTitle className="text-sm font-semibold">{plan.name}</CardTitle>
                  <div className="text-xl font-bold text-primary">{plan.speed}</div>
                  <div>
                    <span className="text-xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-xs text-muted-foreground">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-xs text-muted-foreground space-y-1 mb-3 text-left">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-1.5">
                        <CheckCircle className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.recommended ? "default" : "outline"}
                    size="sm"
                    className="w-full text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlan(plan, provider);
                    }}
                  >
                    Select Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const AlternativeResults = ({ address, availableProviders }: AlternativeResultsProps) => {
  const { addToCart } = useCart();
  const hasProviders = availableProviders.length > 0;

  const handleSelectPlan = (plan: InternetPlan, provider: InternetProvider) => {
    addToCart({
      product_name: `${provider.name} — ${plan.name}`,
      product_type: "internet",
      price: parsePrice(plan.price),
      speed: plan.speed,
      features: plan.features,
    });
  };

  const openChat = () => {
    window.dispatchEvent(new CustomEvent("open-chat-widget"));
  };

  return (
    <section className="py-16 bg-secondary/30 animate-in fade-in duration-500">
      <div className="container mx-auto px-4">
        {/* Not Available Banner */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
            <XCircle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Spectrum Isn't Available at This Location
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
            Unfortunately, Spectrum Business doesn't service <span className="font-semibold text-foreground">{address}</span> yet.
          </p>
          {hasProviders ? (
            <p className="text-lg text-primary font-semibold">
              We found {availableProviders.length} other provider{availableProviders.length !== 1 ? "s" : ""} available in your area!
            </p>
          ) : (
            <p className="text-lg text-muted-foreground">
              Contact us for help finding internet service in your area.
            </p>
          )}
        </div>

        {/* Available Alternative Providers */}
        {hasProviders && (
          <div className="max-w-5xl mx-auto space-y-4 mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
              Available Internet Providers in Your Area
            </h3>
            {availableProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} onSelectPlan={handleSelectPlan} />
            ))}
          </div>
        )}

        {/* No providers message */}
        {!hasProviders && (
          <div className="max-w-2xl mx-auto mb-12">
            <Card className="text-center border-dashed">
              <CardHeader>
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <CardTitle className="text-xl">Limited Coverage Area</CardTitle>
                <p className="text-muted-foreground">
                  Our standard provider partners don't currently show coverage for your ZIP code. 
                  Contact us and we'll research additional options for your location.
                </p>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Help CTA */}
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Not Sure Which Provider Is Right?</CardTitle>
            <p className="text-muted-foreground">
              Our AI agents can help you find the best internet solution for your business
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="default" size="lg" className="flex-1" asChild>
                <a href="tel:+18882303278">
                  <Phone className="h-4 w-4 mr-2" />
                  Call 1-888-230-FAST
                </a>
              </Button>
              <Button variant="outline" size="lg" className="flex-1" onClick={openChat}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat with AI Agent
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AlternativeResults;
