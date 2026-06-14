// ============================================================
// components/pages/home/HomePageContent.tsx
// Page Home CIVITAS — Layout avec TopBar 3 niveaux
// ============================================================

import React from "react";
import HomeMainContent from "./HomeMainContent";
import ParticlesBackground from "@/components/kokonutui/particles-background";

export default function HomePageContent() {
  return (
    <div className="flex flex-col h-full bg-transparent w-full overflow-x-hidden">
      <HomeMainContent className='relative z-[2]' />
    </div>
  );
}
