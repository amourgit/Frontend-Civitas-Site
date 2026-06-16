// ============================================================
// components/pages/contact/ContactHero.tsx
// Section d'en-tête de la page Contact CIVITAS
// ============================================================

"use client"

import { motion } from "motion/react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"

export default function ContactHero() {
  return (
    <section className="relative w-full overflow-hidden pt-40 pb-20 sm:pt-48 sm:pb-24 lg:pt-56 lg:pb-28">
      {/* Glow décoratif */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-emerald-400/5 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6 flex items-center gap-2 text-sm text-white/50"
        >
          <Link to="/" className="transition-colors hover:text-emerald-500">
            Accueil
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-white">Contact</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
          className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500"
        >
          Parlons de votre projet
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="max-w-3xl text-4xl font-semibold leading-[1.05] text-white sm:text-5xl lg:text-6xl"
        >
          Contactez l&apos;équipe CIVITAS
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className="mt-6 max-w-2xl text-base text-white/60 sm:text-lg"
        >
          Une question, un projet d&apos;intégration IA, une démonstration ? Notre équipe basée à
          Libreville vous répond rapidement et vous accompagne à chaque étape.
        </motion.p>
      </div>
    </section>
  )
}
