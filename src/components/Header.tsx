import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import ShoppingCart from "@/components/ShoppingCart";
import AuthButton from "@/components/AuthButton";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: "Internet", href: "/#plans" },
    { name: "Phone", href: "/phone" },
    { name: "TV", href: "/tv" },
    { name: "Mobile", href: "/mobile" },
    { name: "Enterprise", href: "/enterprise" },
    { name: "Support", href: "/support" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="#home" className="flex items-center gap-2">
              <span className="text-base md:text-lg font-bold tracking-tight text-primary whitespace-nowrap">
                Business Internet Express
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="h-4 w-4 mr-2" />
              <span className="font-medium">(555) 123-4567</span>
            </div>
            <AuthButton />
            <ShoppingCart />
            <Button variant="professional" size="sm" asChild>
              <a href="/check-availability">Check Availability</a>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground hover:text-primary transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center text-sm text-muted-foreground mb-3">
                <Phone className="h-4 w-4 mr-2" />
                <span className="font-medium">(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 mb-3">
                <AuthButton />
                <ShoppingCart />
              </div>
              <Button variant="professional" size="sm" className="w-full" asChild>
                <a href="/check-availability">Check Availability</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;