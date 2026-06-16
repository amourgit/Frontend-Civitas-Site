// ============================================================
// components/pages/contact/ContactPageContent.tsx
// Page Contact CIVITAS — layout global (fond + contenu)
// ============================================================

import ParticlesBackground from "@/components/kokonutui/particles-background"
import ContactMainContent from "./ContactMainContent"

export default function ContactPageContent() {
  return (
    <div className="flex flex-col w-full bg-transparent overflow-x-hidden">
      <ParticlesBackground className="absolute inset-0 w-full h-full z-[1]" />
      <ContactMainContent className="relative z-[2]" />
    </div>
  )
}
