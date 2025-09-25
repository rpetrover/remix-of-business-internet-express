import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id?: string;
  product_name: string;
  product_type: 'internet' | 'phone' | 'tv' | 'bundle';
  price: number;
  speed?: string;
  features: string[];
  is_bundle?: boolean;
  bundle_components?: string[];
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

// Bundle definitions
const BUNDLES = [
  {
    name: "Essential Business Bundle",
    price: 149.99,
    components: ['internet', 'phone'],
    features: ['High-speed Internet', 'Business Phone', '15% Bundle Discount'],
    savings: 35
  },
  {
    name: "Complete Communication Bundle", 
    price: 219.99,
    components: ['internet', 'phone', 'tv'],
    features: ['High-speed Internet', 'Business Phone', 'Business TV', '20% Bundle Discount'],
    savings: 70
  },
  {
    name: "Media Business Bundle",
    price: 179.99,
    components: ['internet', 'tv'],
    features: ['High-speed Internet', 'Business TV', '10% Bundle Discount'],
    savings: 25
  }
];

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        loadCartItems();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadCartItems();
      } else {
        setCartItems([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadCartItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCartItems((data || []).map(item => ({
        ...item,
        product_type: item.product_type as 'internet' | 'phone' | 'tv' | 'bundle'
      })));
    } catch (error) {
      console.error('Error loading cart items:', error);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to your cart",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Check if we should suggest a bundle
      const currentTypes = cartItems.map(item => item.product_type);
      const newTypes = [...currentTypes, item.product_type];
      
      const suggestedBundle = BUNDLES.find(bundle => 
        bundle.components.every(comp => newTypes.includes(comp as any))
      );

      if (suggestedBundle && !cartItems.some(item => item.is_bundle)) {
        // Ask user if they want the bundle instead
        const useBundle = window.confirm(
          `Would you like the ${suggestedBundle.name} instead? You'll save $${suggestedBundle.savings}!`
        );
        
        if (useBundle) {
          // Clear existing items and add bundle
          await clearCart();
          await addBundleToCart(suggestedBundle);
          return true;
        }
      }

      const { error } = await supabase
        .from('cart_items')
        .upsert({
          user_id: user.id,
          product_name: item.product_name,
          product_type: item.product_type,
          price: item.price,
          speed: item.speed,
          features: item.features,
          is_bundle: item.is_bundle || false,
          bundle_components: item.bundle_components || []
        });

      if (error) throw error;

      await loadCartItems();
      toast({
        title: "Added to Cart",
        description: `${item.product_name} has been added to your cart`
      });
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
      return false;
    }
  };

  const addBundleToCart = async (bundle: typeof BUNDLES[0]) => {
    const bundleItem: Omit<CartItem, 'id'> = {
      product_name: bundle.name,
      product_type: 'bundle',
      price: bundle.price,
      features: bundle.features,
      is_bundle: true,
      bundle_components: bundle.components
    };

    const { error } = await supabase
      .from('cart_items')
      .insert({
        user_id: user.id,
        ...bundleItem
      });

    if (error) throw error;
    await loadCartItems();
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      await loadCartItems();
      toast({
        title: "Removed from Cart",
        description: "Item has been removed from your cart"
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error", 
        description: "Failed to remove item from cart",
        variant: "destructive"
      });
    }
  };

  const clearCart = async () => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  const getCartCount = () => {
    return cartItems.length;
  };

  return {
    cartItems,
    isLoading,
    user,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getCartCount,
    loadCartItems
  };
};