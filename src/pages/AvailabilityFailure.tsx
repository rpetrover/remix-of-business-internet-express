import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AlternativeResults from "@/components/AlternativeResults";
import { type InternetProvider } from "@/data/providers";

const AvailabilityFailure = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const address = location.state?.address as string | undefined;
  const availableProviders = (location.state?.availableProviders ?? []) as InternetProvider[];

  useEffect(() => {
    if (!address) {
      navigate("/check-availability", { replace: true });
    }
  }, [address, navigate]);

  if (!address) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-16">
        <AlternativeResults address={address} availableProviders={availableProviders} />
      </div>
      <Footer />
    </div>
  );
};

export default AvailabilityFailure;
