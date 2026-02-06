import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import VideoSplashBanner from "@/components/VideoSplashBanner";
import AvailabilityChecker from "@/components/AvailabilityChecker";

const Index = () => {
  return (
    <div className="min-h-screen">
      <VideoSplashBanner />
      <Header />
      <main>
        <div id="home">
          <Hero />
        </div>
        <AvailabilityChecker />
        <div id="about">
          <About />
        </div>
        <div id="contact">
          <ContactSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
