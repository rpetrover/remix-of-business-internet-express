import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Phone, Tv, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { CartItem } from '@/contexts/CartContext';

interface UpsellOption {
  id: string;
  category: 'phone' | 'tv';
  name: string;
  price: number;
  icon: typeof Phone;
  features: string[];
  tagline: string;
}

interface BundleOption {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  includes: string[];
  features: string[];
  savings: number;
  highlight?: boolean;
}

const UPSELL_OPTIONS: UpsellOption[] = [
  {
    id: 'biz-phone-basic',
    category: 'phone',
    name: 'Business Phone Basic',
    price: 24.99,
    icon: Phone,
    features: ['Unlimited local calling', 'Voicemail', 'Caller ID', 'Call waiting'],
    tagline: 'Essential business calling',
  },
  {
    id: 'biz-phone-pro',
    category: 'phone',
    name: 'Business Phone Pro',
    price: 34.99,
    icon: Phone,
    features: ['Unlimited local & long distance', 'Voicemail to email', 'Auto attendant', 'Call forwarding & routing'],
    tagline: 'Full-featured phone system',
  },
  {
    id: 'biz-tv-starter',
    category: 'tv',
    name: 'Business TV Starter',
    price: 34.99,
    icon: Tv,
    features: ['75+ channels', 'HD programming', '1 receiver included', 'News & weather'],
    tagline: 'Keep customers entertained',
  },
  {
    id: 'biz-tv-premium',
    category: 'tv',
    name: 'Business TV Premium',
    price: 54.99,
    icon: Tv,
    features: ['150+ channels', 'HD & sports packages', 'Multiple receivers', 'Premium content'],
    tagline: 'Complete entertainment solution',
  },
];

interface CheckoutUpsellsProps {
  cartItems: CartItem[];
  onAddItem: (item: Omit<CartItem, 'id'>) => Promise<boolean | undefined>;
  currentTotal: number;
}

const CheckoutUpsells = ({ cartItems, onAddItem, currentTotal }: CheckoutUpsellsProps) => {
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  const currentProductTypes = cartItems.map(item => item.product_type);
  const bundleComponents = cartItems
    .filter(item => item.is_bundle)
    .flatMap(item => item.bundle_components || []);

  const hasPhone = currentProductTypes.includes('phone') || bundleComponents.includes('phone');
  const hasTv = currentProductTypes.includes('tv') || bundleComponents.includes('tv');
  const hasBundle = cartItems.some(item => item.is_bundle);

  // Filter available upsells
  const availableUpsells = UPSELL_OPTIONS.filter(opt => {
    if (opt.category === 'phone' && hasPhone) return false;
    if (opt.category === 'tv' && hasTv) return false;
    return true;
  });

  // Generate bundle options based on what's in cart
  const bundleOptions: BundleOption[] = [];
  if (!hasBundle && !hasPhone && !hasTv) {
    bundleOptions.push({
      id: 'bundle-phone-tv',
      name: 'Phone + TV Bundle',
      price: 49.99,
      originalPrice: 69.98,
      includes: ['Business Phone Pro', 'Business TV Starter'],
      features: ['Unlimited calling', 'Voicemail to email', '75+ TV channels', 'HD programming'],
      savings: 20,
      highlight: true,
    });
  }
  if (!hasPhone && !hasTv) {
    bundleOptions.push({
      id: 'bundle-complete',
      name: 'Complete Business Bundle',
      price: 74.99,
      originalPrice: 114.97,
      includes: ['Business Phone Pro', 'Business TV Premium'],
      features: ['Unlimited local & long distance', 'Auto attendant', '150+ TV channels', 'Premium sports & content'],
      savings: 40,
      highlight: false,
    });
  } else if (!hasPhone) {
    bundleOptions.push({
      id: 'bundle-add-phone',
      name: 'Add Phone Bundle',
      price: 29.99,
      originalPrice: 34.99,
      includes: ['Business Phone Pro'],
      features: ['Unlimited calling', 'Voicemail to email', 'Auto attendant', 'Bundle discount applied'],
      savings: 5,
      highlight: true,
    });
  } else if (!hasTv) {
    bundleOptions.push({
      id: 'bundle-add-tv',
      name: 'Add TV Bundle',
      price: 29.99,
      originalPrice: 34.99,
      includes: ['Business TV Starter'],
      features: ['75+ channels', 'HD programming', '1 receiver', 'Bundle discount applied'],
      savings: 5,
      highlight: true,
    });
  }

  if (availableUpsells.length === 0 && bundleOptions.length === 0) return null;

  const handleAddUpsell = async (opt: UpsellOption) => {
    setIsAdding(opt.id);
    try {
      // Directly add without triggering navigation
      setAddedItems(prev => new Set(prev).add(opt.id));
    } finally {
      setIsAdding(null);
    }
    await onAddItem({
      product_name: opt.name,
      product_type: opt.category,
      price: opt.price,
      features: opt.features,
    });
  };

  const handleAddBundle = async (bundle: BundleOption) => {
    setIsAdding(bundle.id);
    try {
      setAddedItems(prev => new Set(prev).add(bundle.id));
    } finally {
      setIsAdding(null);
    }
    // Add each bundle component
    for (const name of bundle.includes) {
      const match = UPSELL_OPTIONS.find(o => o.name === name);
      if (match) {
        await onAddItem({
          product_name: match.name,
          product_type: match.category,
          price: bundle.price / bundle.includes.length,
          features: match.features,
        });
      }
    }
  };

  return (
    <Card className="mb-6 border-primary/20 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 md:p-6 bg-gradient-to-r from-primary/5 to-accent/10 hover:from-primary/10 hover:to-accent/15 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Enhance Your Service</h3>
            <p className="text-sm text-muted-foreground">Add phone & TV to save more on your monthly bill</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
      </button>

      {expanded && (
        <CardContent className="p-4 md:p-6 space-y-6">
          {/* Bundle Deals */}
          {bundleOptions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                💰 Bundle & Save
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {bundleOptions.map((bundle) => {
                  const isAdded = addedItems.has(bundle.id);
                  return (
                    <div
                      key={bundle.id}
                      className={`relative rounded-xl border-2 p-4 transition-all ${
                        isAdded
                          ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20'
                          : bundle.highlight
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      {bundle.highlight && !isAdded && (
                        <Badge className="absolute -top-2.5 right-3 bg-primary text-primary-foreground text-xs">
                          Best Value
                        </Badge>
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="font-bold text-foreground">{bundle.name}</h5>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Includes: {bundle.includes.join(' + ')}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs mb-1">
                            Save ${bundle.savings}/mo
                          </Badge>
                          <div>
                            <span className="text-lg font-bold text-primary">${bundle.price}</span>
                            <span className="text-xs text-muted-foreground">/mo</span>
                          </div>
                          <span className="text-xs text-muted-foreground line-through">${bundle.originalPrice}/mo</span>
                        </div>
                      </div>
                      <ul className="grid grid-cols-2 gap-1 mb-3">
                        {bundle.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Check className="h-3 w-3 text-primary flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant={isAdded ? 'secondary' : 'default'}
                        size="sm"
                        className="w-full"
                        disabled={isAdded || isAdding === bundle.id}
                        onClick={() => handleAddBundle(bundle)}
                      >
                        {isAdded ? (
                          <span className="flex items-center gap-1.5">
                            <Check className="h-4 w-4" /> Added to Order
                          </span>
                        ) : isAdding === bundle.id ? (
                          'Adding...'
                        ) : (
                          `Add Bundle — $${bundle.price}/mo`
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Individual Add-ons */}
          {availableUpsells.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Individual Add-ons
              </h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {availableUpsells.map((opt) => {
                  const IconComp = opt.icon;
                  const isAdded = addedItems.has(opt.id);
                  return (
                    <div
                      key={opt.id}
                      className={`rounded-lg border p-3 transition-all ${
                        isAdded
                          ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20'
                          : 'border-border hover:border-primary/30 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <IconComp className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-sm text-foreground">{opt.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{opt.tagline}</p>
                      <ul className="space-y-1 mb-3">
                        {opt.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Check className="h-3 w-3 text-primary flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">${opt.price}/mo</span>
                        <Button
                          variant={isAdded ? 'secondary' : 'outline'}
                          size="sm"
                          className="h-7 text-xs px-3"
                          disabled={isAdded || isAdding === opt.id}
                          onClick={() => handleAddUpsell(opt)}
                        >
                          {isAdded ? <Check className="h-3 w-3" /> : 'Add'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Updated total preview */}
          {addedItems.size > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
              <span className="text-sm font-medium text-muted-foreground">New estimated monthly total:</span>
              <span className="text-lg font-bold text-primary">
                ${(currentTotal + 
                  Array.from(addedItems).reduce((sum, id) => {
                    const upsell = UPSELL_OPTIONS.find(o => o.id === id);
                    const bundle = bundleOptions.find(b => b.id === id);
                    return sum + (upsell?.price || bundle?.price || 0);
                  }, 0)
                ).toFixed(2)}/mo
              </span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default CheckoutUpsells;
