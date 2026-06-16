// ============================================================
// components/pages/contact/ContactFAQ.tsx
// FAQ — questions fréquentes avant de contacter CIVITAS
// ============================================================

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Plus } from "lucide-react"

const faqs = [
  {
    question: "Sous combien de temps recevrai-je une réponse ?",
    answer:
      "Notre équipe répond généralement sous 24 à 48 heures ouvrées. Pour les demandes urgentes, privilégiez le téléphone ou WhatsApp.",
  },
  {
    question: "Proposez-vous des consultations gratuites ?",
    answer:
      "Oui, un premier échange de cadrage est offert afin de comprendre vos besoins et déterminer ensemble la meilleure approche pour votre projet.",
  },
  {
    question: "Travaillez-vous avec des entreprises hors du Gabon ?",
    answer:
      "Absolument. CIVITAS accompagne des organisations à travers l'Afrique centrale et au-delà, en présentiel ou à distance selon le projet.",
  },
  {
    question: "Quels types de projets pouvez-vous prendre en charge ?",
    answer:
      "De l'intégration de modèles d'IA et l'automatisation de processus, au développement logiciel sur mesure, en passant par la formation des équipes et le conseil stratégique digital.",
  },
]

export default function ContactFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="relative w-full py-16 sm:py-20">
      <div className="mx-auto w-full max-w-4xl px-6 sm:px-10 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-10 text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
            Questions fréquentes
          </p>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Avant de nous écrire
          </h2>
        </motion.div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.06 }}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-sm font-medium text-white sm:text-base">
                    {faq.question}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition-transform duration-300 ${
                      isOpen ? "rotate-45 border-emerald-500/50 text-emerald-500" : ""
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-white/60">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
