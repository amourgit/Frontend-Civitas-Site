// ============================================================
// components/pages/contact/ContactInfo.tsx
// Cartes d'informations de contact CIVITAS
// ============================================================

"use client"

import { motion } from "motion/react"
import { MapPin, Mail, Phone, Clock } from "lucide-react"

const infoCards = [
  {
    icon: MapPin,
    title: "Notre bureau",
    lines: ["Libreville, Gabon", "Quartier des Affaires"],
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["contact@civitas.ga"],
    href: "mailto:contact@civitas.ga",
  },
  {
    icon: Phone,
    title: "Téléphone",
    lines: ["+241 00 00 00 00"],
    href: "tel:+24100000000",
  },
  {
    icon: Clock,
    title: "Horaires",
    lines: ["Lun – Ven : 8h00 – 18h00", "Sam : 9h00 – 13h00"],
  },
]

export default function ContactInfo() {
  return (
    <section className="relative w-full pb-16 sm:pb-20">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {infoCards.map(({ icon: Icon, title, lines, href }, index) => {
            const Content = (
              <div className="group relative flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/40 hover:bg-white/[0.05]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 transition-colors duration-300 group-hover:bg-emerald-500/15">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-white">
                    {title}
                  </h3>
                  <div className="mt-2 flex flex-col gap-1">
                    {lines.map((line) => (
                      <span key={line} className="text-sm text-white/60">
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )

            return (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.08 }}
              >
                {href ? (
                  <a href={href} className="block h-full">
                    {Content}
                  </a>
                ) : (
                  Content
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
