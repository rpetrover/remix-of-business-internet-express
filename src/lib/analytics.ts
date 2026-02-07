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

// ─── Core Business Events ───
export function trackCheckAvailability(address: string, zipCode: string) {
  gtag("event", "check_availability", {
    event_category: "engagement",
    event_label: zipCode,
    address_zip: zipCode,
  });
}

export function trackLeadCapture(planName: string, providerName: string, price: number) {
  gtag("event", "generate_lead", {
    event_category: "conversion",
    event_label: `${providerName} - ${planName}`,
    value: price,
    currency: "USD",
  });
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
  //   send_to: "AW-XXXXXXXXXX/CONVERSION_LABEL",
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
