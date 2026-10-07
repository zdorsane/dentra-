import { AISection } from '@/components/landing/AISection';
import { ClinicOperations } from '@/components/landing/ClinicOperations';
import { DashboardPreview } from '@/components/landing/DashboardPreview';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';
import { Hero } from '@/components/landing/Hero';
import { Navbar } from '@/components/landing/Navbar';
import { PatientIntelligence } from '@/components/landing/PatientIntelligence';
import { Platform } from '@/components/landing/Platform';
import { Pricing } from '@/components/landing/Pricing';

export default function LandingPage() {
  return (
    <>
      <a href="#main" className="dt-skip-link">
        Skip to content
      </a>

      <Navbar />

      <main id="main">
        <Hero />
        <Platform />
        <PatientIntelligence />
        <ClinicOperations />
        <AISection />
        <DashboardPreview />
        <Pricing />
        <FinalCTA />
      </main>

      <Footer />
    </>
  );
}
