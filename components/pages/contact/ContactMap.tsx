// ============================================================
// components/pages/contact/ContactMap.tsx
// Localisation (carte) + réseaux sociaux — colonne latérale Contact
// ============================================================

"use client"

import { motion } from "motion/react"
import { Facebook, Linkedin, Instagram, Youtube, ArrowUpRight } from "lucide-react"
import XLogoIcon from "@/components/icons/x"

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com/civitas", icon: Facebook },
  { label: "LinkedIn", href: "https://linkedin.com/company/civitas", icon: Linkedin },
  { label: "X (Twitter)", href: "https://x.com/civitas", icon: XLogoIcon },
  { label: "Instagram", href: "https://instagram.com/civitas", icon: Instagram },
  { label: "YouTube", href: "https://youtube.com/@civitas", icon: Youtube },
]

export default function ContactMap() {
  return (
    <div className="flex flex-col gap-6">
      {/* Carte */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl border border-white/10"
      >
        <iframe
          title="Localisation CIVITAS — Libreville, Gabon"
          src="https://www.openstreetmap.org/export/embed.html?bbox=9.40%2C0.34%2C9.52%2C0.46&layer=mapnik&marker=0.4162%2C9.4673"
          className="h-[280px] w-full grayscale invert sm:h-[320px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <a
          href="https://www.openstreetmap.org/?mlat=0.4162&mlon=9.4673#map=12/0.4162/9.4673"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-xs font-medium uppercase tracking-widest text-white backdrop-blur-sm transition-colors hover:bg-emerald-500 hover:text-black"
        >
          Voir sur la carte
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </motion.div>

      {/* Réseaux sociaux */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8"
      >
        <h3 className="text-sm font-semibold uppercase tracking-widest text-white">
          Suivez CIVITAS
        </h3>
        <p className="mt-2 text-sm text-white/60">
          Actualités, projets et coulisses de l&apos;équipe sur nos réseaux.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {socialLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all duration-300 hover:border-emerald-500 hover:text-emerald-500 hover:scale-105"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
