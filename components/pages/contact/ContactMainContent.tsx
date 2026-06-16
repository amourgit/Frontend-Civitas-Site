// ============================================================
// components/pages/contact/ContactMainContent.tsx
// Assemblage des sections de la page Contact CIVITAS
// ============================================================

import ContactHero from "./ContactHero"
import ContactInfo from "./ContactInfo"
import ContactFormSection from "./ContactFormSection"
import ContactFAQ from "./ContactFAQ"

export default function ContactMainContent({ className }: { className?: string }) {
  return (
    <div
      style={{
        width: "full",
        height: "auto",
        background: "transparent",
      }}
      className={className}
    >
      {/* Hero */}
      <ContactHero />

      {/* Informations de contact */}
      <ContactInfo />

      {/* Formulaire + Carte */}
      <ContactFormSection />

      {/* FAQ */}
      <ContactFAQ />
    </div>
  )
}
