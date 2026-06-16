// ============================================================
// components/pages/contact/ContactForm.tsx
// Formulaire de contact CIVITAS — UI moderne, glass / dark
// ============================================================

"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Send, CheckCircle2, User, Mail, Building2, MessageSquare } from "lucide-react"

const subjects = [
  "Demande générale",
  "Intégration d'IA",
  "Automatisation des processus",
  "Formation & accompagnement",
  "Conseil digital",
  "Autre",
]

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition-colors duration-200 focus:border-emerald-500/50 focus:bg-white/[0.05]"

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: subjects[0],
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) return

    setIsSubmitting(true)
    // Simulation d'envoi — à remplacer par l'appel API réel
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1200)
  }

  return (
    <div className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm sm:p-8 lg:p-10">
      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col items-center justify-center gap-4 py-16 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-white">Message envoyé</h3>
            <p className="max-w-sm text-sm text-white/60">
              Merci de nous avoir contactés. Notre équipe vous répondra dans les plus brefs
              délais.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false)
                setFormData({ name: "", email: "", company: "", subject: subjects[0], message: "" })
              }}
              className="mt-2 rounded-full border border-white/15 px-6 py-2 text-sm font-medium text-white/80 transition-colors hover:border-emerald-500 hover:text-emerald-500"
            >
              Envoyer un autre message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-xs font-medium uppercase tracking-widest text-white/50">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    className={`${fieldClass} pl-11`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-xs font-medium uppercase tracking-widest text-white/50">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vous@exemple.com"
                    className={`${fieldClass} pl-11`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="company" className="text-xs font-medium uppercase tracking-widest text-white/50">
                  Entreprise <span className="text-white/30">(optionnel)</span>
                </label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Nom de votre entreprise"
                    className={`${fieldClass} pl-11`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="subject" className="text-xs font-medium uppercase tracking-widest text-white/50">
                  Sujet
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`${fieldClass} appearance-none`}
                >
                  {subjects.map((subject) => (
                    <option key={subject} value={subject} className="bg-black text-white">
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-xs font-medium uppercase tracking-widest text-white/50">
                Message
              </label>
              <div className="relative">
                <MessageSquare className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-white/30" />
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Décrivez votre projet ou votre demande…"
                  className={`${fieldClass} resize-none pl-11 pt-3.5`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-black transition-all duration-300 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                  Envoi en cours…
                </>
              ) : (
                <>
                  Envoyer le message
                  <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
