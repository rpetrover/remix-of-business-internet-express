import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Phone, Star, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { alternativeProviders, type InternetProvider } from "@/data/providers";

interface AlternativeResultsProps {
  address: string;
}

const ProviderCard = ({ provider }: { provider: InternetProvider }) => {
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
              <Globe className="h-5 w-5 text-primary" />
              {provider.name}
            </CardTitle>
            <Badge variant="secondary" className="mt-2">{provider.technology}</Badge>
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

const AlternativeResults = ({ address }: AlternativeResultsProps) => {
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
          <p className="text-lg text-primary font-semibold">
            But don't worry — we have other great options for your business!
          </p>
        </div>

        {/* Alternative Providers */}
        <div className="max-w-5xl mx-auto space-y-4 mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
            Available Internet Providers
          </h3>
          {alternativeProviders.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>

        {/* Help CTA */}
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Not Sure Which Provider Is Right?</CardTitle>
            <p className="text-muted-foreground">
              Our experts can help you find the best internet solution for your business location and needs
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="default" size="lg" className="flex-1">
                <Phone className="h-4 w-4 mr-2" />
                Call (555) 123-4567
              </Button>
              <Button variant="outline" size="lg" className="flex-1">
                Get a Free Consultation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AlternativeResults;
