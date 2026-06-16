// ============================================================
// components/layouts/Footer/global-footer.tsx
// Footer global CIVITAS — partagé par toutes les pages (App.tsx)
//
// Disposition : grille 5 colonnes, fond transparent
//  - Colonne 1 : Logo + Localisation/Contacts + Copyright
//  - Colonnes 2 à 4 : liens (Entreprise / Solutions / Ressources)
//  - Colonne 5 : Réseaux sociaux
// ============================================================

"use client"

import { Link } from "react-router-dom"
import { Facebook, Linkedin, Instagram, Youtube, MapPin, Mail, Phone } from "lucide-react"
import XLogoIcon from "@/components/icons/x"

const companyLinks = [
  { label: "À propos", href: "#about" },
  { label: "Notre vision", href: "#vision" },
  { label: "Notre mission", href: "#mission" },
  { label: "Le fondateur", href: "#fondateur" },
]

const servicesLinks = [
  { label: "Intelligence Artificielle", href: "#ia" },
  { label: "Automatisation", href: "#automatisation" },
  { label: "Développement logiciel", href: "#developpement" },
  { label: "Formation", href: "#formation" },
  { label: "Conseil digital", href: "#conseil" },
]

const resourcesLinks = [
  { label: "Blog", href: "#blog" },
  { label: "Études de cas", href: "#cas" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "/contact" },
]

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com/civitas", icon: Facebook },
  { label: "LinkedIn", href: "https://linkedin.com/company/civitas", icon: Linkedin },
  { label: "X (Twitter)", href: "https://x.com/civitas", icon: XLogoIcon },
  { label: "Instagram", href: "https://instagram.com/civitas", icon: Instagram },
  { label: "YouTube", href: "https://youtube.com/@civitas", icon: Youtube },
]

export default function GlobalFooter({ className }: { className?: string }) {
  const year = new Date().getFullYear()

  return (
    <footer
      className={`relative z-[2] w-full bg-transparent border-t border-white/10 ${className ?? ""}`}
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-10 lg:px-12">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {/* Colonne 1 — Logo + Localisation/Contacts + Copyright */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <Link to="/" className="inline-block w-fit transition-opacity hover:opacity-80">
              <img
                src="/images/logo-civitas-white-3D-RMBG.png"
                alt="Civitas Logo"
                className="h-16 w-auto"
              />
            </Link>

            <div className="flex flex-col gap-3 text-sm text-white/60">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>Libreville, Gabon</span>
              </div>
              <a
                href="mailto:contact@civitas.ga"
                className="flex items-center gap-3 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>contact@civitas.ga</span>
              </a>
              <a
                href="tel:+24100000000"
                className="flex items-center gap-3 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>+241 00 00 00 00</span>
              </a>
            </div>

            <p className="mt-2 text-xs text-white/40 lg:mt-auto">
              © {year} CIVITAS. Tous droits réservés.
            </p>
          </div>

          {/* Colonne 2 — Entreprise */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white">
              Entreprise
            </h3>
            <ul className="flex flex-col gap-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 — Services */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white">
              Services
            </h3>
            <ul className="flex flex-col gap-3">
              {servicesLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 4 — Ressources */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white">
              Ressources
            </h3>
            <ul className="flex flex-col gap-3">
              {resourcesLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 5 — Réseaux sociaux */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white">
              Suivez-nous
            </h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all hover:border-emerald-500 hover:text-emerald-500 hover:scale-105"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
