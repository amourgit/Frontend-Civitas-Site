// ============================================================
// components/pages/contact/ContactFormSection.tsx
// Grille 2 colonnes : Formulaire + Carte/Réseaux
// ============================================================

"use client"

import { motion } from "motion/react"
import ContactForm from "./ContactForm"
import ContactMap from "./ContactMap"

export default function ContactFormSection() {
  return (
    <section className="relative w-full pb-20 sm:pb-24">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="mb-2 text-2xl font-semibold text-white sm:text-3xl">
              Envoyez-nous un message
            </h2>
            <p className="mb-8 text-sm text-white/60 sm:text-base">
              Remplissez le formulaire ci-dessous, notre équipe revient vers vous rapidement.
            </p>
            <ContactForm />
          </motion.div>

          <ContactMap />
        </div>
      </div>
    </section>
  )
}
