import { EmergencyBanner } from "@/components/EmergencyBanner";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <EmergencyBanner />
      <main className="flex-grow">
        <Hero />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;