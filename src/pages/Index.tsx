import { EmergencyBanner } from "@/components/EmergencyBanner";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Statistics } from "@/components/Statistics";
import { Testimonials } from "@/components/Testimonials";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <EmergencyBanner />
      <main className="flex-grow">
        <Hero />
        <HowItWorks />
        <Features />
        <Statistics />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;