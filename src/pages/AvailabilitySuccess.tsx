import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SpectrumResults from "@/components/SpectrumResults";

const AvailabilitySuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const address = location.state?.address as string | undefined;

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
        <SpectrumResults address={address} />
      </div>
      <Footer />
    </div>
  );
};

export default AvailabilitySuccess;
