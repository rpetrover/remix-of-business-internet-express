import { useState } from 'react';
import { ShoppingCart as ShoppingCartIcon, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const ShoppingCart = () => {
  const { cartItems, removeFromCart, getTotalPrice, getCartCount, user, isGuestUser } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckout = () => {
    if (isGuestUser) {
      // For guest users, suggest creating account or proceed as guest
      const createAccount = window.confirm(
        'Create an account to save your order and get updates, or continue as guest?'
      );
      if (createAccount) {
        window.location.href = '/auth';
        return;
      }
    }
    
    // For now, just show a toast - you can integrate with payment processing later
    alert(`Checkout initiated for $${getTotalPrice().toFixed(2)}. Payment integration coming soon!`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingCartIcon className="h-4 w-4" />
          {getCartCount() > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {getCartCount()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            Shopping Cart ({getCartCount()})
            {isGuestUser && (
              <div className="text-sm font-normal text-muted-foreground mt-1">
                Sign in to save your cart
              </div>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 flex-1 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCartIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <>
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.product_name}</h4>
                        {item.is_bundle && (
                          <Badge variant="secondary" className="mt-1">Bundle</Badge>
                        )}
                        {item.speed && (
                          <p className="text-sm text-muted-foreground mt-1">{item.speed}</p>
                        )}
                        <div className="mt-2">
                          {item.features.map((feature, index) => (
                            <div key={index} className="text-sm text-muted-foreground">
                              • {feature}
                            </div>
                          ))}
                        </div>
                        <p className="font-bold text-lg mt-2">${item.price.toFixed(2)}/month</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id!)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Separator />
              
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span>${getTotalPrice().toFixed(2)}/month</span>
                  </div>
                  
                  {isGuestUser && (
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      💡 Sign in to save your cart and get order updates
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleCheckout} 
                    className="w-full" 
                    size="lg"
                    disabled={cartItems.length === 0}
                  >
                    {isGuestUser ? 'Continue as Guest' : 'Proceed to Checkout'}
                  </Button>
                  
                  {isGuestUser && (
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = '/auth'}
                      className="w-full"
                    >
                      Sign In to Save Cart
                    </Button>
                  )}
                </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingCart;