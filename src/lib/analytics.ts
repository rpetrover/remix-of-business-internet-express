/**
 * Google Analytics 4 + Google Ads tracking utility.
 * All event tracking goes through this module for consistency.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

function gtag(...args: any[]) {
  if (window.gtag) {
    window.gtag(...args);
  }
}

// ─── Page Views ───
export function trackPageView(path: string, title?: string) {
  gtag("event", "page_view", {
    page_path: path,
    page_title: title,
  });
}

// ─── Core Funnel Events (Google Ads Optimized) ───

/** Fires when an address availability search completes. */
export function trackAddressLookup(state?: string, city?: string, zip?: string) {
  gtag("event", "address_lookup", {
    event_category: "engagement",
    state: state || "",
    city: city || "",
    zip: zip || "",
  });
}

/** Fires when pricing plans / providers are displayed on the results page. */
export function trackPlanView(providerCount: number, address?: string) {
  gtag("event", "plan_view", {
    event_category: "engagement",
    provider_count: providerCount,
    address: address || "",
  });
}

/** Fires when a user selects a specific provider/plan. */
export function trackPlanSelected(planName: string, providerName: string, price: number) {
  gtag("event", "plan_selected", {
    event_category: "engagement",
    plan_name: planName,
    provider_name: providerName,
    value: price,
    currency: "USD",
  });
}

/**
 * Fires when a lead is successfully submitted (PRIMARY conversion).
 * This replaces the old generate_lead event with a standardized name.
 */
export function trackLeadSubmit(planName: string, providerName: string, price: number) {
  // Fire as lead_submit (primary conversion for Google Ads)
  gtag("event", "lead_submit", {
    event_category: "conversion",
    event_label: `${providerName} - ${planName}`,
    plan_name: planName,
    provider_name: providerName,
    value: price,
    currency: "USD",
  });

  // Also fire GA4's standard generate_lead for backward compatibility
  gtag("event", "generate_lead", {
    event_category: "conversion",
    event_label: `${providerName} - ${planName}`,
    value: price,
    currency: "USD",
  });

  // Google Ads conversion — uncomment and replace with your Ads Conversion ID/Label
  // gtag("event", "conversion", {
  //   send_to: "AW-XXXXXXXXXX/LEAD_CONVERSION_LABEL",
  //   value: price,
  //   currency: "USD",
  // });
}

// ─── Legacy aliases (keep for backward compatibility) ───
export function trackCheckAvailability(address: string, zipCode: string) {
  trackAddressLookup(undefined, undefined, zipCode);
}

export function trackLeadCapture(planName: string, providerName: string, price: number) {
  trackLeadSubmit(planName, providerName, price);
}

export function trackContactFormSubmit() {
  gtag("event", "contact_form_submit", {
    event_category: "conversion",
    event_label: "quote_request",
  });
}

export function trackAddToCart(productName: string, price: number, speed?: string) {
  gtag("event", "add_to_cart", {
    event_category: "ecommerce",
    currency: "USD",
    value: price,
    items: [
      {
        item_name: productName,
        price,
        quantity: 1,
        ...(speed ? { item_variant: speed } : {}),
      },
    ],
  });
}

export function trackBeginCheckout(totalPrice: number, itemCount: number) {
  gtag("event", "begin_checkout", {
    event_category: "ecommerce",
    currency: "USD",
    value: totalPrice,
    items_count: itemCount,
  });
}

export function trackPurchase(orderId: string, totalPrice: number, items: { name: string; price: number }[]) {
  gtag("event", "purchase", {
    event_category: "ecommerce",
    transaction_id: orderId,
    currency: "USD",
    value: totalPrice,
    items: items.map((item) => ({
      item_name: item.name,
      price: item.price,
      quantity: 1,
    })),
  });

  // Google Ads conversion tracking — uncomment when Ads conversion ID is ready
  // gtag("event", "conversion", {
  //   send_to: "AW-XXXXXXXXXX/PURCHASE_CONVERSION_LABEL",
  //   value: totalPrice,
  //   currency: "USD",
  //   transaction_id: orderId,
  // });
}

// ─── Google Ads Enhanced Conversions ───
export function setUserData(email?: string, phone?: string) {
  if (email || phone) {
    gtag("set", "user_data", {
      ...(email ? { email } : {}),
      ...(phone ? { phone_number: phone } : {}),
    });
  }
}

// ─── Utility Events ───
export function trackChatOpen() {
  gtag("event", "chat_open", { event_category: "engagement" });
}

export function trackPhoneCall() {
  gtag("event", "phone_call", { event_category: "conversion" });
}

export function trackUpsellView() {
  gtag("event", "view_upsell", { event_category: "engagement" });
}
