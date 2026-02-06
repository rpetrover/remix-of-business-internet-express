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
import Unsubscribe from "./pages/Unsubscribe";
import Admin from "./pages/Admin";
import VerifyEmail from "./pages/VerifyEmail";
import ChatWidget from "./components/ChatWidget";

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
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatWidget />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
