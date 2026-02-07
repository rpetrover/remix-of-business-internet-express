import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  useEffect(() => {
    // Load guest cart from localStorage initially
    loadGuestCart();

    // Get current user
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser);
      if (currentUser) {
        // Migrate guest cart if any, then always load from DB
        migrateGuestCartForUser(currentUser).then(() => {
          loadCartItemsForUser(currentUser);
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      
      if (sessionUser && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        // User just logged in or verified — migrate guest cart then load DB cart
        await migrateGuestCartForUser(sessionUser);
        await loadCartItemsForUser(sessionUser);
      } else if (!sessionUser) {
        // User logged out - load guest cart
        loadGuestCart();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadGuestCart = () => {
    const guestCart = localStorage.getItem('guest-cart');
    if (guestCart) {
      try {
        const parsedCart = JSON.parse(guestCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error parsing guest cart:', error);
        localStorage.removeItem('guest-cart');
      }
    }
  };

  const saveGuestCart = (items: CartItem[]) => {
    localStorage.setItem('guest-cart', JSON.stringify(items));
  };

  const loadCartItemsForUser = async (authUser?: any) => {
    const targetUser = authUser || user;
    if (!targetUser) {
      loadGuestCart();
      return;
    }

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

  const loadCartItems = async () => loadCartItemsForUser();

  const migrateGuestCartForUser = async (authUser: any) => {
    const guestCart = localStorage.getItem('guest-cart');
    if (!guestCart || !authUser) return;

    try {
      const parsedCart: CartItem[] = JSON.parse(guestCart);
      if (parsedCart.length === 0) return;

      // Add guest cart items to database
      for (const item of parsedCart) {
        await supabase
          .from('cart_items')
          .upsert({
            user_id: authUser.id,
            product_name: item.product_name,
            product_type: item.product_type,
            price: item.price,
            speed: item.speed,
            features: item.features,
            is_bundle: item.is_bundle || false,
            bundle_components: item.bundle_components || []
          });
      }

      // Clear guest cart
      localStorage.removeItem('guest-cart');

      toast({
        title: "Cart Synced",
        description: "Your cart items have been saved to your account!"
      });
    } catch (error) {
      console.error('Error migrating guest cart:', error);
    }
  };

  const addItemDirect = async (item: Omit<CartItem, 'id'>) => {
    if (user) {
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
    } else {
      const existingItemIndex = cartItems.findIndex(
        cartItem => cartItem.product_type === item.product_type
      );
      let newCartItems;
      if (existingItemIndex >= 0) {
        newCartItems = [...cartItems];
        newCartItems[existingItemIndex] = { ...item, id: `guest-${Date.now()}` };
      } else {
        newCartItems = [...cartItems, { ...item, id: `guest-${Date.now()}` }];
      }
      setCartItems(newCartItems);
      saveGuestCart(newCartItems);
    }
  };

  const addToCart = async (item: Omit<CartItem, 'id'>, options?: { skipNavigation?: boolean }) => {
    try {
      // Check if we should suggest a bundle
      const currentTypes = cartItems.map(item => item.product_type);
      const newTypes = [...currentTypes, item.product_type];
      
      const suggestedBundle = BUNDLES.find(bundle => 
        bundle.components.every(comp => newTypes.includes(comp as any))
      );

      if (suggestedBundle && !cartItems.some(item => item.is_bundle)) {
        const useBundle = window.confirm(
          `Would you like the ${suggestedBundle.name} instead? You'll save $${suggestedBundle.savings}!`
        );
        
        if (useBundle) {
          await clearCart();
          await addBundleToCart(suggestedBundle);
          return true;
        }
      }

      await addItemDirect(item);

      toast({
        title: "Added to Cart",
        description: `${item.product_name} has been added to your cart`
      });
      
      if (!options?.skipNavigation) {
        navigate('/order-completion');
      }
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

    if (user) {
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          ...bundleItem
        });

      if (error) throw error;
      await loadCartItems();
    } else {
      const newCartItems = [{ ...bundleItem, id: `guest-bundle-${Date.now()}` }];
      setCartItems(newCartItems);
      saveGuestCart(newCartItems);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      if (user && !itemId.startsWith('guest-')) {
        // Remove from database for authenticated users
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId);

        if (error) throw error;
        await loadCartItems();
      } else {
        // Remove from localStorage for guest users
        const newCartItems = cartItems.filter(item => item.id !== itemId);
        setCartItems(newCartItems);
        saveGuestCart(newCartItems);
      }

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
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        localStorage.removeItem('guest-cart');
      }
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
    loadCartItems,
    isGuestUser: !user
  };
};