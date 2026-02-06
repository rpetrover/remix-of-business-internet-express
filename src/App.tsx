import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PhonePage from "./pages/Phone";
import TVPage from "./pages/TV";
import MobilePage from "./pages/Mobile";
import CheckAvailabilityPage from "./pages/CheckAvailability";
import EnterprisePage from "./pages/Enterprise";
import SupportPage from "./pages/Support";
import Auth from "./pages/Auth";
import OrderCompletion from "./pages/OrderCompletion";
import Upsell from "./pages/Upsell";
import AvailabilitySuccess from "./pages/AvailabilitySuccess";
import AvailabilityFailure from "./pages/AvailabilityFailure";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/phone" element={<PhonePage />} />
          <Route path="/tv" element={<TVPage />} />
          <Route path="/mobile" element={<MobilePage />} />
          <Route path="/check-availability" element={<CheckAvailabilityPage />} />
          <Route path="/enterprise" element={<EnterprisePage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/upsell" element={<Upsell />} />
          <Route path="/order-completion" element={<OrderCompletion />} />
          <Route path="/availability/success" element={<AvailabilitySuccess />} />
          <Route path="/availability/no-coverage" element={<AvailabilityFailure />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
