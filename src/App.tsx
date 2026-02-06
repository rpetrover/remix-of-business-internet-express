import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CheckAvailabilityPage from "./pages/CheckAvailability";
import EnterprisePage from "./pages/Enterprise";
import SupportPage from "./pages/Support";
import Auth from "./pages/Auth";
import OrderCompletion from "./pages/OrderCompletion";
import Upsell from "./pages/Upsell";
import AvailabilityResults from "./pages/AvailabilityResults";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/check-availability" element={<CheckAvailabilityPage />} />
          <Route path="/enterprise" element={<EnterprisePage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/upsell" element={<Upsell />} />
          <Route path="/order-completion" element={<OrderCompletion />} />
          <Route path="/availability/results" element={<AvailabilityResults />} />
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
