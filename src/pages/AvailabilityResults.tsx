import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProviderResults from "@/components/ProviderResults";
import { type InternetProvider } from "@/data/providers";

const AvailabilityResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const address = location.state?.address as string | undefined;
  const allProviders = (location.state?.allProviders ?? []) as InternetProvider[];
  const spectrumAvailable = (location.state?.spectrumAvailable ?? false) as boolean;
  const fccMapUrl = (location.state?.fccMapUrl ?? "") as string;

  useEffect(() => {
    if (!address) {
      navigate("/check-availability", { replace: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [address, navigate]);

  if (!address) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-16">
        <ProviderResults
          address={address}
          allProviders={allProviders}
          spectrumAvailable={spectrumAvailable}
          fccMapUrl={fccMapUrl}
        />
      </div>
      <Footer />
    </div>
  );
};

export default AvailabilityResults;
