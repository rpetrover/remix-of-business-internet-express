import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CheckAvailabilityPage from "./pages/CheckAvailability";
import EnterprisePage from "./pages/Enterprise";
import SupportPage from "./pages/Support";
import Auth from "./pages/Auth";
import OrderCompletion from "./pages/OrderCompletion";
import Upsell from "./pages/Upsell";
import AvailabilityResults from "./pages/AvailabilityResults";
import Unsubscribe from "./pages/Unsubscribe";
import Admin from "./pages/Admin";
import VerifyEmail from "./pages/VerifyEmail";
import OrderSuccess from "./pages/OrderSuccess";
import ChatWidget from "./components/ChatWidget";
import { ScrollToTop } from "./components/ScrollToTop";
import { CartProvider } from "./contexts/CartContext";
import { captureAttribution } from "./hooks/useAttribution";
import { trackPageView } from "./lib/analytics";

const queryClient = new QueryClient();

/** Track SPA route changes in GA4 */
const RouteTracker = () => {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location.pathname, location.search]);
  return null;
};

const App = () => {
  // Capture gclid / UTM params on initial load
  useEffect(() => {
    captureAttribution();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CartProvider>
          <ScrollToTop />
          <RouteTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/check-availability" element={<CheckAvailabilityPage />} />
            <Route path="/enterprise" element={<EnterprisePage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/upsell" element={<Upsell />} />
            <Route path="/order-completion" element={<OrderCompletion />} />
            <Route path="/availability/results" element={<AvailabilityResults />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatWidget />
        </CartProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
