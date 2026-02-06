const STORAGE_KEY = 'customer-context';

export interface CustomerContext {
  // From availability check
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  businessName?: string;
  // From lead capture
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export const getCustomerContext = (): CustomerContext => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const updateCustomerContext = (partial: Partial<CustomerContext>) => {
  const existing = getCustomerContext();
  const merged = { ...existing, ...partial };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
};

export const clearCustomerContext = () => {
  localStorage.removeItem(STORAGE_KEY);
};
