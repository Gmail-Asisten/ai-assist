"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar1 } from "@/components/ui/navbar-1";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { LoginModal } from "@/components/ui/login-modal";

// Landing page sections
import { HeroSection } from "@/components/ui/landing/hero-section";
import { TrustBar } from "@/components/ui/landing/trust-bar";
import { ProblemSolutionSection } from "@/components/ui/landing/problem-solution";
import { HowItWorksSection } from "@/components/ui/landing/how-it-works";
import { FeaturesGrid } from "@/components/ui/landing/features-grid";
import { ProductShowcase } from "@/components/ui/landing/product-showcase";
import { TestimonialSection } from "@/components/ui/landing/testimonials";
import { PricingPreview } from "@/components/ui/landing/pricing-preview";
import { FAQSection } from "@/components/ui/landing/faq-section";

export default function Page() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleCta = () => {
    if (session) {
      router.push("/inbox");
    } else {
      setIsLoginOpen(true);
    }
  };

  return (
    <>
      <div className="bg-[#09090b] min-h-screen">
        {/* 1. Navbar */}
        <div className="fixed top-0 left-0 w-full z-50">
          <Navbar1 onLoginOpen={() => setIsLoginOpen(true)} />
        </div>

        <main>
          {/* 2. Hero */}
          <HeroSection onCtaClick={handleCta} />

          {/* 3. Trust Bar */}
          <TrustBar />

          {/* 4. Problem / Solution */}
          <ProblemSolutionSection />

          {/* 5. How It Works */}
          <HowItWorksSection />

          {/* 6. Features Grid */}
          <FeaturesGrid />

          {/* 7. Product Showcase */}
          <ProductShowcase />

          {/* 8. Testimonials */}
          <TestimonialSection />

          {/* 9. Pricing Preview */}
          <PricingPreview onCtaClick={handleCta} />

          {/* 10. FAQ */}
          <FAQSection />

          {/* 11 + 12. Final CTA + Footer (CinematicFooter handles both) */}
          <CinematicFooter />
        </main>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
