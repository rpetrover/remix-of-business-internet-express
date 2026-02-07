import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check, Wifi, Phone, Tv, CheckCircle, Mail, Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { getCustomerContext, clearCustomerContext } from '@/hooks/useCustomerContext';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import CheckoutUpsells from '@/components/CheckoutUpsells';
import IndustryAutocomplete from '@/components/IndustryAutocomplete';
import type { PlaceResult } from '@/hooks/useGooglePlaces';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import { trackPurchase, trackBeginCheckout, setUserData } from '@/lib/analytics';

const orderSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  businessName: z.string().min(1, "Business name is required").max(100, "Business name must be less than 100 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^\d{10,}$/, "Phone number must contain only digits"),
  address: z.string().min(1, "Address is required").max(100, "Address must be less than 100 characters"),
  city: z.string().min(1, "City is required").max(50, "City must be less than 50 characters"),
  state: z.string().min(2, "State is required").max(2, "State must be 2 characters"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 digits").max(10, "ZIP code must be less than 10 characters"),
  phoneNumberType: z.enum(['transfer', 'new']).optional(),
  existingNumber: z.string().optional(),
  preferredAreaCode: z.string().optional(),
  industry: z.string().max(100, "Industry must be less than 100 characters").optional(),
  hasLiquorLicense: z.boolean().optional(),
  licensedOccupancy: z.string().max(10, "Occupancy must be less than 10 characters").optional(),
  businessTaxId: z.string().max(20, "Tax ID must be less than 20 characters").optional(),
  additionalNotes: z.string().max(500, "Notes must be less than 500 characters").optional(),
});

const AREA_CODES = [
  '201', '202', '203', '205', '206', '207', '208', '209', '210',
  '212', '213', '214', '215', '216', '217', '218', '219', '224',
  '225', '228', '229', '231', '234', '239', '240', '248', '251',
  '252', '253', '254', '256', '260', '262', '267', '269', '270',
  '276', '281', '301', '302', '303', '304', '305', '307', '308',
  '309', '310', '312', '313', '314', '315', '316', '317', '318',
  '319', '320', '321', '323', '325', '330', '331', '334', '336',
  '337', '339', '341', '346', '347', '351', '352', '360', '361',
  '386', '401', '402', '404', '405', '406', '407', '408', '409',
  '410', '412', '413', '414', '415', '417', '419', '423', '424',
  '425', '430', '432', '434', '435', '440', '442', '443', '458',
  '463', '469', '470', '475', '478', '479', '480', '484', '501',
  '502', '503', '504', '505', '507', '508', '509', '510', '512',
  '513', '515', '516', '517', '518', '520', '530', '531', '534',
  '540', '541', '551', '559', '561', '562', '563', '564', '567',
  '570', '571', '573', '574', '575', '580', '585', '586', '601',
  '602', '603', '605', '606', '607', '608', '609', '610', '612',
  '614', '615', '616', '617', '618', '619', '620', '623', '626',
  '629', '630', '631', '636', '641', '646', '650', '651', '660',
  '661', '662', '667', '669', '678', '681', '682', '701', '702',
  '703', '704', '706', '707', '708', '712', '713', '714', '715',
  '716', '717', '718', '719', '720', '724', '725', '727', '731',
  '732', '734', '737', '740', '743', '747', '754', '757', '760',
  '762', '763', '765', '769', '770', '772', '773', '774', '775',
  '779', '781', '785', '786', '787', '801', '802', '803', '804',
  '805', '806', '808', '810', '812', '813', '814', '815', '816',
  '817', '818', '828', '830', '831', '832', '843', '845', '847',
  '848', '850', '856', '857', '858', '859', '860', '862', '863',
  '864', '865', '870', '872', '878', '901', '903', '904', '906',
  '907', '908', '909', '910', '912', '913', '914', '915', '916',
  '917', '918', '919', '920', '925', '928', '929', '930', '931',
  '934', '936', '937', '940', '941', '947', '949', '951', '952',
  '954', '956', '959', '970', '971', '972', '973', '978', '979',
  '980', '984', '985', '989'
];


const OrderCompletion = () => {
  const { cartItems, getTotalPrice, addToCart, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { executeRecaptcha } = useRecaptcha();
  const location = useLocation();
  
  const [justVerified, setJustVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  // Detect if user arrived via email verification (URL contains auth tokens in hash)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && (hash.includes('access_token') || hash.includes('type=signup') || hash.includes('type=email'))) {
      setJustVerified(true);
      // Get user email after auth completes
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.email) {
          setVerifiedEmail(user.email);
        }
      });
    }
    // Also listen for auth state change in case token exchange is still processing
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        const hash = window.location.hash;
        if (hash && (hash.includes('access_token') || hash.includes('type=signup') || hash.includes('type=email'))) {
          setJustVerified(true);
          setVerifiedEmail(session.user.email ?? null);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Pre-fill from customer context (availability check + lead capture data)
  const savedContext = getCustomerContext();

  const [formData, setFormData] = useState({
    firstName: savedContext.firstName || '',
    lastName: savedContext.lastName || '',
    businessName: savedContext.businessName || '',
    email: savedContext.email || '',
    phone: savedContext.phone || '',
    address: savedContext.address || '',
    aptUnit: '',
    city: savedContext.city || '',
    state: savedContext.state || '',
    zipCode: savedContext.zipCode || '',
    phoneNumberType: 'new' as 'transfer' | 'new',
    existingNumber: '',
    preferredAreaCode: '212',
    smsConsent: false,
    industry: '',
    hasLiquorLicense: false,
    licensedOccupancy: '',
    businessTaxId: '',
    additionalNotes: '',
  });

  // Also pre-fill email from verified auth user if available
  useEffect(() => {
    if (verifiedEmail && !formData.email) {
      setFormData(prev => ({ ...prev, email: verifiedEmail }));
    }
  }, [verifiedEmail]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [portingBillFile, setPortingBillFile] = useState<File | null>(null);
  const orderSubmittedRef = useRef(false);

  // Give the cart time to load/migrate after auth before redirecting
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoadDone(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (initialLoadDone && cartItems.length === 0 && !orderSubmittedRef.current) {
      navigate('/');
    }
  }, [cartItems, navigate, initialLoadDone]);

  // Track begin_checkout event
  useEffect(() => {
    if (cartItems.length > 0 && initialLoadDone) {
      trackBeginCheckout(getTotalPrice(), cartItems.length);
    }
  }, [initialLoadDone, cartItems.length]);

  const hasPhoneProduct = cartItems.some(item => 
    item.product_type === 'phone' || 
    (item.is_bundle && item.bundle_components?.includes('phone'))
  );

  
  const handlePlaceSelect = (place: PlaceResult) => {
    setFormData(prev => ({
      ...prev,
      address: place.address,
      city: place.city,
      state: place.state,
      zipCode: place.zipCode,
    }));
    // Clear related errors
    setErrors(prev => ({ ...prev, address: '', city: '', state: '', zipCode: '' }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    try {
      const validation = orderSchema.parse({
        ...formData,
        phoneNumberType: hasPhoneProduct ? formData.phoneNumberType : undefined,
        existingNumber: hasPhoneProduct && formData.phoneNumberType === 'transfer' ? formData.existingNumber : undefined,
        preferredAreaCode: hasPhoneProduct && formData.phoneNumberType === 'new' ? formData.preferredAreaCode : undefined,
      });
      
      // Additional validation for phone fields
      if (hasPhoneProduct) {
        if (formData.phoneNumberType === 'transfer' && !formData.existingNumber) {
          throw new Error('Existing phone number is required when transferring');
        }
        if (formData.phoneNumberType === 'transfer' && !/^\d{10}$/.test(formData.existingNumber)) {
          throw new Error('Existing phone number must be 10 digits');
        }
      }
      
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        setErrors({ general: (error as Error).message });
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // reCAPTCHA verification
      const recaptchaToken = await executeRecaptcha("submit_order");
      const { data: captchaResult, error: captchaError } = await supabase.functions.invoke("verify-recaptcha", {
        body: { token: recaptchaToken, action: "submit_order" },
      });
      if (captchaError || !captchaResult?.success) {
        toast({ title: "Verification Failed", description: "Please try again.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      const customerName = `${formData.firstName} ${formData.lastName}`;
      const totalPrice = getTotalPrice();

      // Upload porting bill if provided
      let portingBillUrl: string | null = null;
      if (portingBillFile && formData.phoneNumberType === 'transfer') {
        const fileExt = portingBillFile.name.split('.').pop();
        const filePath = `porting-bills/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('order-documents')
          .upload(filePath, portingBillFile, { upsert: false });

        if (uploadError) {
          console.error('File upload error:', uploadError);
          toast({ title: "Upload Error", description: "Failed to upload phone bill. Please try again.", variant: "destructive" });
          setIsSubmitting(false);
          return;
        }

        // Get the file path for admin access
        portingBillUrl = filePath;
      }

      // Build items summary for notes
      const itemsSummary = cartItems
        .map(item => `${item.product_name} - $${item.price}/mo${item.speed ? ` (${item.speed})` : ''}`)
        .join('; ');

      // Submit order via edge function (sends customer + admin + Intelisys emails)
      const { data: submitResult, error: submitError } = await supabase.functions.invoke("submit-order", {
        body: {
          customer_name: customerName,
          service_address: formData.aptUnit ? `${formData.address}, ${formData.aptUnit}` : formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zipCode,
          contact_phone: formData.phone,
          contact_email: formData.email,
          service_type: itemsSummary || "Business internet service only",
          preferred_provider: cartItems[0]?.product_name?.split('—')[0]?.trim() || null,
          selected_plan: cartItems[0]?.product_name || null,
          speed: cartItems[0]?.speed || null,
          monthly_price: totalPrice,
          channel: "web",
          notes: [
            formData.businessName ? `Business: ${formData.businessName}` : '',
            formData.industry ? `Industry: ${formData.industry}` : '',
            formData.businessTaxId ? `Tax ID: ${formData.businessTaxId}` : '',
            formData.hasLiquorLicense ? `Liquor License: Yes${formData.licensedOccupancy ? `, Occupancy: ${formData.licensedOccupancy}` : ''}` : '',
            formData.additionalNotes ? `Notes: ${formData.additionalNotes}` : '',
          ].filter(Boolean).join(' | ') || null,
          cart_items: cartItems.map(item => ({
            product_name: item.product_name,
            price: item.price,
            speed: item.speed,
            is_bundle: item.is_bundle,
          })),
          business_name: formData.businessName,
          porting_bill_url: portingBillUrl,
        },
      });

      if (submitError) throw submitError;

      // Build order data to pass to success page
      const orderData = {
        customerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        items: cartItems.map(item => ({
          product_name: item.product_name,
          price: item.price,
          speed: item.speed,
          is_bundle: item.is_bundle,
        })),
        totalPrice,
        orderId: submitResult?.order_id,
      };
      
      toast({
        title: "Order Submitted!",
        description: "We'll be in touch within 1-2 business days to schedule installation.",
      });

      // Track purchase conversion
      trackPurchase(
        submitResult?.order_id || 'unknown',
        totalPrice,
        cartItems.map(item => ({ name: item.product_name, price: item.price }))
      );
      setUserData(formData.email, formData.phone);
      
      // Clear saved customer context and cart after successful order
      clearCustomerContext();
      orderSubmittedRef.current = true;
      await clearCart();
      
      // Navigate to success page with order details
      navigate('/order-success', { state: orderData, replace: true });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (cartItems.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Email Verified Banner */}
        {justVerified && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="flex items-center gap-4 py-5">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email Verified Successfully!
                </h3>
                {verifiedEmail && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    <span className="font-medium text-foreground">{verifiedEmail}</span> has been confirmed.
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Please fill out the information below to activate your service.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-6">
          <Link to="/upsell" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Add Services
          </Link>
          <h1 className="text-3xl font-bold mb-2">Complete Your Order</h1>
          <p className="text-muted-foreground">Enter your business details to finalize your order</p>
        </div>
        {/* Checkout Upsells */}
        <CheckoutUpsells
          cartItems={cartItems}
          onAddItem={(item) => addToCart(item, { skipNavigation: true })}
          currentTotal={getTotalPrice()}
        />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item, index) => (
                <div key={index} className="pb-4 border-b border-border last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{item.product_name}</h4>
                    <p className="font-bold">${item.price}/mo</p>
                  </div>
                  {item.speed && (
                    <p className="text-sm text-muted-foreground">{item.speed}</p>
                  )}
                  {item.is_bundle && (
                    <Badge variant="secondary" className="mt-1">Bundle Discount</Badge>
                  )}
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Monthly:</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={errors.firstName ? 'border-destructive' : ''}
                    />
                    {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={errors.lastName ? 'border-destructive' : ''}
                    />
                    {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName || ''}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className={errors.businessName ? 'border-destructive' : ''}
                  />
                  {errors.businessName && <p className="text-sm text-destructive mt-1">{errors.businessName}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Mobile Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                      placeholder="1234567890"
                      className={errors.phone ? 'border-destructive' : ''}
                    />
                    {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <Label htmlFor="address">Business Address *</Label>
                  <AddressAutocomplete
                    id="address"
                    value={formData.address}
                    onChange={(value) => handleInputChange('address', value)}
                    onPlaceSelect={handlePlaceSelect}
                    placeholder="Start typing your address..."
                    className={errors.address ? 'border-destructive' : ''}
                  />
                  {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="aptUnit">Apt / Unit #</Label>
                    <Input
                      id="aptUnit"
                      value={formData.aptUnit}
                      onChange={(e) => handleInputChange('aptUnit', e.target.value)}
                      placeholder="Suite 200"
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={errors.city ? 'border-destructive' : ''}
                    />
                    {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value.toUpperCase().slice(0, 2))}
                      placeholder="NY"
                      maxLength={2}
                      className={errors.state ? 'border-destructive' : ''}
                    />
                    {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value.replace(/\D/g, ''))}
                      className={errors.zipCode ? 'border-destructive' : ''}
                    />
                    {errors.zipCode && <p className="text-sm text-destructive mt-1">{errors.zipCode}</p>}
                  </div>
                </div>

                {/* Business Details */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-semibold">Business Details</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <IndustryAutocomplete
                        id="industry"
                        value={formData.industry}
                        onChange={(value) => handleInputChange('industry', value)}
                        className={errors.industry ? 'border-destructive' : ''}
                      />
                      {errors.industry && <p className="text-sm text-destructive mt-1">{errors.industry}</p>}
                    </div>
                    <div>
                      <Label htmlFor="businessTaxId">Business Tax ID (EIN)</Label>
                      <Input
                        id="businessTaxId"
                        value={formData.businessTaxId}
                        onChange={(e) => handleInputChange('businessTaxId', e.target.value.replace(/[^0-9-]/g, '').slice(0, 20))}
                        placeholder="XX-XXXXXXX"
                        className={errors.businessTaxId ? 'border-destructive' : ''}
                      />
                      {errors.businessTaxId && <p className="text-sm text-destructive mt-1">{errors.businessTaxId}</p>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="hasLiquorLicense"
                        checked={formData.hasLiquorLicense}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, hasLiquorLicense: checked === true }))
                        }
                      />
                      <Label htmlFor="hasLiquorLicense" className="cursor-pointer">
                        This business has a liquor license
                      </Label>
                    </div>

                    {formData.hasLiquorLicense && (
                      <div className="ml-7">
                        <Label htmlFor="licensedOccupancy">Licensed Occupancy</Label>
                        <Input
                          id="licensedOccupancy"
                          value={formData.licensedOccupancy}
                          onChange={(e) => handleInputChange('licensedOccupancy', e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="e.g. 150"
                          className={cn("max-w-[200px]", errors.licensedOccupancy ? 'border-destructive' : '')}
                        />
                        {errors.licensedOccupancy && <p className="text-sm text-destructive mt-1">{errors.licensedOccupancy}</p>}
                        <p className="text-sm text-muted-foreground mt-1">
                          Maximum number of persons allowed by your liquor license
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="additionalNotes">Additional Information or Notes</Label>
                    <Textarea
                      id="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={(e) => handleInputChange('additionalNotes', e.target.value.slice(0, 500))}
                      placeholder="Any special requirements, installation preferences, or other details..."
                      rows={3}
                      className={errors.additionalNotes ? 'border-destructive' : ''}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.additionalNotes.length}/500 characters
                    </p>
                    {errors.additionalNotes && <p className="text-sm text-destructive mt-1">{errors.additionalNotes}</p>}
                  </div>
                </div>


                {hasPhoneProduct && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <h3 className="font-semibold">Phone Number Setup</h3>
                    <RadioGroup
                      value={formData.phoneNumberType}
                      onValueChange={(value) => handleInputChange('phoneNumberType', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new" id="new-number" />
                        <Label htmlFor="new-number">Get a new phone number</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="transfer" id="transfer-number" />
                        <Label htmlFor="transfer-number">Transfer my existing number</Label>
                      </div>
                    </RadioGroup>

                    {formData.phoneNumberType === 'new' && (
                      <div>
                        <Label htmlFor="areaCode">Preferred Area Code</Label>
                        <Select value={formData.preferredAreaCode} onValueChange={(value) => handleInputChange('preferredAreaCode', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AREA_CODES.map(code => (
                              <SelectItem key={code} value={code}>{code}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {formData.phoneNumberType === 'transfer' && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="existingNumber">Current Phone Number *</Label>
                          <Input
                            id="existingNumber"
                            value={formData.existingNumber}
                            onChange={(e) => handleInputChange('existingNumber', e.target.value.replace(/\D/g, ''))}
                            placeholder="1234567890"
                            className={errors.existingNumber ? 'border-destructive' : ''}
                          />
                          {errors.existingNumber && <p className="text-sm text-destructive mt-1">{errors.existingNumber}</p>}
                          <p className="text-sm text-muted-foreground mt-1">
                            We'll help you transfer your existing number at no extra cost
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="portingBill">Upload Current Phone Bill (for number porting)</Label>
                          <div className="mt-1">
                            <Input
                              id="portingBill"
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setPortingBillFile(file);
                              }}
                              className="cursor-pointer"
                            />
                          </div>
                          {portingBillFile && (
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                              <Check className="h-3 w-3 text-green-600" />
                              {portingBillFile.name} ({(portingBillFile.size / 1024).toFixed(0)} KB)
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            A copy of your most recent bill is required to port your number. Accepted: PDF, JPG, PNG, DOC (max 10MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {errors.general && (
                  <p className="text-sm text-destructive">{errors.general}</p>
                )}

                {/* SMS Consent */}
                <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="smsConsent"
                      checked={formData.smsConsent}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, smsConsent: checked === true }))
                      }
                    />
                    <label htmlFor="smsConsent" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                      I agree to receive SMS/text messages from Business Internet Express regarding my order status, 
                      service updates, and support communications at the mobile phone number provided above. 
                      Message and data rates may apply. Message frequency varies. Reply STOP to unsubscribe at any time. 
                      Reply HELP for help. View our{' '}
                      <a href="/privacy" className="text-primary underline hover:text-primary/80">Privacy Policy</a>{' '}
                      and{' '}
                      <a href="/terms" className="text-primary underline hover:text-primary/80">Terms of Service</a>.
                    </label>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting Order...' : 'Submit Order'}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  By submitting this order, you agree to our Terms of Service. 
                  A representative will contact you within 1-2 business days to confirm installation details.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderCompletion;