import { Separator } from "@/components/ui/separator";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">
              Business Internet<span className="text-accent">Express</span>
            </h3>
            <p className="text-primary-foreground/80">
              Your trusted Spectrum Business Internet partner, delivering reliable 
              connectivity solutions for businesses of all sizes.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span>Serving businesses nationwide</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              <a href="#home" className="text-primary-foreground/80 hover:text-accent transition-colors">
                Home
              </a>
              <a href="#plans" className="text-primary-foreground/80 hover:text-accent transition-colors">
                Business Plans
              </a>
              <a href="#about" className="text-primary-foreground/80 hover:text-accent transition-colors">
                About Us
              </a>
              <a href="#contact" className="text-primary-foreground/80 hover:text-accent transition-colors">
                Contact
              </a>
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Services</h4>
            <nav className="flex flex-col space-y-2">
              <span className="text-primary-foreground/80">Business Internet</span>
              <span className="text-primary-foreground/80">Fiber Connectivity</span>
              <span className="text-primary-foreground/80">Security Solutions</span>
              <span className="text-primary-foreground/80">WiFi Management</span>
              <span className="text-primary-foreground/80">Technical Support</span>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent" />
                <div>
                  <div className="font-medium">(555) 123-4567</div>
                  <div className="text-sm text-primary-foreground/80">Sales & Support</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent" />
                <div>
                  <div className="font-medium">support@businessinternetexpress.com</div>
                  <div className="text-sm text-primary-foreground/80">General Inquiries</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-accent" />
                <div>
                  <div className="font-medium">24/7 Support Available</div>
                  <div className="text-sm text-primary-foreground/80">Emergency Technical Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-primary-foreground/20" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-primary-foreground/80">
            © {currentYear} Business Internet Express. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6 text-sm text-primary-foreground/80">
            <span>Authorized Spectrum Business Partner</span>
            <span>|</span>
            <a href="#" className="hover:text-accent transition-colors">
              Privacy Policy
            </a>
            <span>|</span>
            <a href="#" className="hover:text-accent transition-colors">
              Terms of Service
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 pt-6 border-t border-primary-foreground/20">
          <p className="text-xs text-primary-foreground/60 text-center">
            Business Internet Express is an authorized agent of Spectrum Business. 
            All Spectrum trademarks and service marks are the property of Charter Communications, Inc. 
            Pricing and availability subject to change. Service not available in all areas.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;