import { useState } from "react";
import { Button } from "@/components/ui/button";
import AddressImagery from "@/components/AddressImagery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Phone,
  Star,
  ChevronDown,
  ChevronUp,
  Globe,
  AlertTriangle,
  Award,
  Wifi,
  Building2,
  MessageCircle,
} from "lucide-react";
import { type InternetProvider, type InternetPlan } from "@/data/providers";
import { useCart } from "@/contexts/CartContext";
import LeadCaptureModal from "@/components/LeadCaptureModal";
import { trackPlanSelected } from "@/lib/analytics";

interface ProviderResultsProps {
  address: string;
  allProviders: InternetProvider[];
  spectrumAvailable: boolean;
  fccMapUrl?: string;
}

const parsePrice = (price: string): number => {
  const match = price.replace(/[^0-9.]/g, "");
  return parseFloat(match) || 0;
};

const ProviderPlanCards = ({
  provider,
  isPreferred,
  onSelectPlan,
}: {
  provider: InternetProvider;
  isPreferred: boolean;
  onSelectPlan: (plan: InternetPlan, provider: InternetProvider) => void;
}) => (
  <div className="grid sm:grid-cols-3 gap-4">
    {provider.plans.map((plan, index) => (
      <Card
        key={index}
        className={`text-center relative ${
          plan.recommended
            ? isPreferred
              ? "border-primary border-2 shadow-md"
              : "border-primary border-2"
            : "border-border"
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
            onClick={() => onSelectPlan(plan, provider)}
          >
            Select Plan
          </Button>
        </CardContent>
      </Card>
    ))}
  </div>
);

const ProviderLogo = ({ provider, size = "md" }: { provider: InternetProvider; size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-12 w-12" };
  if (provider.logo) {
    return (
      <img
        src={provider.logo}
        alt={`${provider.name} logo`}
        className={`${sizeClasses[size]} object-contain rounded`}
        onError={(e) => {
          e.currentTarget.style.display = "none";
          e.currentTarget.nextElementSibling?.classList.remove("hidden");
        }}
      />
    );
  }
  return null;
};

const PreferredProviderCard = ({
  provider,
  onSelectPlan,
}: {
  provider: InternetProvider;
  onSelectPlan: (plan: InternetPlan, provider: InternetProvider) => void;
}) => (
  <Card className="border-2 border-primary shadow-lg overflow-hidden">
    <div className="bg-primary text-primary-foreground px-6 py-3 flex items-center gap-2">
      <Award className="h-5 w-5" />
      <span className="font-semibold">Our Top Recommendation</span>
    </div>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-2xl flex items-center gap-2">
            {provider.logo ? (
              <ProviderLogo provider={provider} size="lg" />
            ) : (
              <Wifi className="h-6 w-6 text-primary" />
            )}
            {provider.name}
          </CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{provider.technology}</Badge>
            <Badge className="bg-primary/10 text-primary border-primary">
              Preferred Partner
            </Badge>
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-2">{provider.description}</p>
    </CardHeader>
    <CardContent>
      <ProviderPlanCards provider={provider} isPreferred onSelectPlan={onSelectPlan} />
    </CardContent>
  </Card>
);

const OtherProviderCard = ({
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
                <ProviderLogo provider={provider} />
              ) : provider.dedicatedFiber ? (
                <Building2 className="h-5 w-5 text-primary" />
              ) : (
                <Globe className="h-5 w-5 text-primary" />
              )}
              {provider.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="secondary">{provider.technology}</Badge>
              {provider.dedicatedFiber && (
                <Badge className="bg-accent/10 text-accent border-accent">
                  Enterprise Grade
                </Badge>
              )}
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
          <ProviderPlanCards provider={provider} isPreferred={false} onSelectPlan={onSelectPlan} />
        </CardContent>
      )}
    </Card>
  );
};

const ProviderResults = ({ address, allProviders, spectrumAvailable, fccMapUrl }: ProviderResultsProps) => {
  const { addToCart } = useCart();
  const hasProviders = allProviders.length > 0;
  const preferredProvider = spectrumAvailable ? allProviders.find((p) => p.id === "spectrum") : null;
  const otherProviders = allProviders.filter((p) => p.id !== "spectrum");
  const broadbandProviders = otherProviders.filter((p) => !p.dedicatedFiber);
  const dedicatedFiberProviders = otherProviders.filter((p) => p.dedicatedFiber);

  // Lead capture modal state
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<{ plan: InternetPlan; provider: InternetProvider } | null>(null);

  const handleSelectPlan = (plan: InternetPlan, provider: InternetProvider) => {
    // Fire plan_selected event
    trackPlanSelected(plan.name, provider.name, parsePrice(plan.price));
    // Show lead capture modal first
    setPendingPlan({ plan, provider });
    setLeadModalOpen(true);
  };

  const handleLeadContinue = (leadData: { email: string; phone: string; name: string }) => {
    setLeadModalOpen(false);
    if (pendingPlan) {
      addToCart({
        product_name: `${pendingPlan.provider.name} — ${pendingPlan.plan.name}`,
        product_type: "internet",
        price: parsePrice(pendingPlan.plan.price),
        speed: pendingPlan.plan.speed,
        features: pendingPlan.plan.features,
      });
    }
  };

  const openChat = () => {
    window.dispatchEvent(new CustomEvent("open-chat-widget"));
  };

  return (
    <section className="py-16 bg-secondary/30 animate-in fade-in duration-500">
      <div className="container mx-auto px-4">
        {/* Results Banner */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {hasProviders
              ? `We Found ${allProviders.length} Provider${allProviders.length !== 1 ? "s" : ""} in Your Area`
              : "Searching Your Area"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Results for <span className="font-semibold text-foreground">{address}</span>
          </p>
          {fccMapUrl && (
            <a
              href={fccMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline"
            >
              View official FCC Broadband Map data for this address →
            </a>
          )}
        </div>

        {/* Address Imagery */}
        <AddressImagery address={address} />

        {/* Preferred Provider (Spectrum) */}
        {preferredProvider && (
          <div className="max-w-5xl mx-auto mb-8">
            <PreferredProviderCard provider={preferredProvider} onSelectPlan={handleSelectPlan} />
          </div>
        )}

        {/* Other Broadband Providers */}
        {broadbandProviders.length > 0 && (
          <div className="max-w-5xl mx-auto space-y-4 mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
              {preferredProvider ? "Other Broadband Providers" : "Broadband Providers in Your Area"}
            </h3>
            {broadbandProviders.map((provider) => (
              <OtherProviderCard key={provider.id} provider={provider} onSelectPlan={handleSelectPlan} />
            ))}
          </div>
        )}

        {/* Dedicated Fiber Providers */}
        {dedicatedFiberProviders.length > 0 && (
          <div className="max-w-5xl mx-auto space-y-4 mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
              <Building2 className="inline h-6 w-6 mr-2 text-primary" />
              Dedicated Fiber Providers
            </h3>
            <p className="text-center text-muted-foreground mb-6 max-w-2xl mx-auto">
              Enterprise-grade dedicated internet with guaranteed bandwidth, SLA-backed uptime, and symmetrical speeds
            </p>
            {dedicatedFiberProviders.map((provider) => (
              <OtherProviderCard key={provider.id} provider={provider} onSelectPlan={handleSelectPlan} />
            ))}
          </div>
        )}

        {/* No providers */}
        {!hasProviders && (
          <div className="max-w-2xl mx-auto mb-12">
            <Card className="text-center border-dashed">
              <CardHeader>
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <CardTitle className="text-xl">Limited Coverage Area</CardTitle>
                <p className="text-muted-foreground">
                  We don't currently show provider coverage for your ZIP code.
                  Contact us and we'll research options for your location.
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
        {/* Lead Capture Modal */}
        <LeadCaptureModal
          open={leadModalOpen}
          onOpenChange={setLeadModalOpen}
          planName={pendingPlan?.plan.name || ""}
          providerName={pendingPlan?.provider.name || ""}
          price={pendingPlan ? parsePrice(pendingPlan.plan.price) : 0}
          speed={pendingPlan?.plan.speed}
          onContinue={handleLeadContinue}
        />
      </div>
    </section>
  );
};

export default ProviderResults;
