// ============================================================
// components/pages/home/HomePageContent.tsx
// Page Home CIVITAS — Layout avec TopBar 3 niveaux
// ============================================================

import React from "react";
import HomeMainContent from "./HomeMainContent";
import FooterSection from "@/components/layouts/Footer/footer";
import ParticlesBackground from "@/components/kokonutui/particles-background";

export default function HomePageContent() {
  return (
    <div className="flex flex-col h-full bg-transparent w-full overflow-x-hidden">
      <ParticlesBackground className='absolute inset-0 w-100vw h-100vh z-[1]' />
      <HomeMainContent className='relative z-[2]' />
      <FooterSection className='relative z-[2]' />
    </div>
  );
}
