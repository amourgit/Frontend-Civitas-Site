// ============================================================
// components/pages/home/HomeMainContent.tsx
// Assemblage des sections de la page Home CIVITAS
// ============================================================

import CivitasHero     from "./CivitasHero";
import CivitasFeatures from "./CivitasFeatures";
import { FloatingSplineAssistant } from "@/components/floating-spline-assistant";
import Gallerie from "./Gallerie";
import { HowItWorks } from "@/components/how-it-works"
import AnimatedBeamDemo from "./SectionBeam"
import SectionsProduits from "./SectionsProduits"
import SectionTestimonials from "./SectionTestimonials"
import SectionHistoryAITimeline from "./SectionHistoryAITimeline"
import SectionFondateur from "./SectionFondateur"
import SectionStatistique from "./SectionStatistique"
import SectionHero from "./SectionHero"
import SectionFollowMe from "./SectionFollowMe"
import SectionService from "./SectionService"

export default function HomeMainContent({ className }: { className?: string }) {
  return (
    <div
      style={{
        width:      "full",
        height:     "auto",
        background: "white",
      }}
      className={className}
    >
      {/* Section Hero */}
      <SectionHero />

      {/* History AI Timeline */}
      <SectionHistoryAITimeline />

      {/* Section 1 — Hero plein écran */}
      <CivitasHero />

      {/* Floating Spline Assistant */}
      <FloatingSplineAssistant />

      {/* Section Fondateur */}
      <SectionFondateur />

      {/* Section Services */}
      <SectionService />

      {/* Gallery */}
      <Gallerie />

      {/* Section Savoir */}
      {/* <SectionSavoir /> */}

      {/* Section 2 — Features Bento Grid */}
      <CivitasFeatures />

      <AnimatedBeamDemo />

      <HowItWorks />

      {/* Statistique */}
      <SectionStatistique />

      {/* Solutions AI Preview */}
      <SectionsProduits />

      {/* Follow Me */}
      <SectionFollowMe />
      
      {/* Testimonials */}
      <SectionTestimonials />
    </div>
  );
}
