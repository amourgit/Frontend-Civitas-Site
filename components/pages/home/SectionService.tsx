"use client"

import { useState } from "react"
import {
  Brain,
  Workflow,
  MessageSquareCode,
  Database,
  LineChart,
  ShieldCheck,
  Bot,
  Languages,
  ImageIcon,
  Cloud,
  Cpu,
  GraduationCap,
} from "lucide-react"

const services = [
  {
    id: "ia-integration",
    icon: Brain,
    title: "Intégration de l'IA",
    description:
      "Intégration de modèles d'intelligence artificielle (LLMs, vision, audio) directement dans vos outils, sites et applications métiers existants.",
  },
  {
    id: "automatisation",
    icon: Workflow,
    title: "Automatisation des processus",
    description:
      "Conception de workflows intelligents qui automatisent vos tâches répétitives : facturation, support client, gestion documentaire et plus.",
  },
  {
    id: "assistants-virtuels",
    icon: Bot,
    title: "Assistants & Agents IA",
    description:
      "Développement d'agents conversationnels et assistants virtuels autonomes capables de comprendre, répondre et agir en temps réel.",
  },
  {
    id: "developpement-logiciel",
    icon: MessageSquareCode,
    title: "Développement de solutions sur mesure",
    description:
      "Conception et développement d'applications web, mobiles et systèmes ERP adaptés aux réalités et besoins des organisations africaines.",
  },
  {
    id: "analyse-donnees",
    icon: LineChart,
    title: "Analyse & Visualisation de données",
    description:
      "Transformation de vos données brutes en tableaux de bord clairs et exploitables pour une prise de décision basée sur les faits.",
  },
  {
    id: "gestion-donnees",
    icon: Database,
    title: "Gestion & Architecture de données",
    description:
      "Mise en place d'infrastructures de données robustes : bases de données, pipelines ETL et entrepôts de données pour vos projets IA.",
  },
  {
    id: "traitement-langage",
    icon: Languages,
    title: "Traitement du Langage Naturel (NLP)",
    description:
      "Analyse de texte, résumé automatique, traduction et compréhension du langage naturel adaptés au contexte multilingue africain.",
  },
  {
    id: "vision-par-ordinateur",
    icon: ImageIcon,
    title: "Vision par Ordinateur",
    description:
      "Solutions de reconnaissance d'images, détection d'objets et analyse vidéo pour la sécurité, l'agriculture et l'industrie.",
  },
  {
    id: "cloud-infrastructure",
    icon: Cloud,
    title: "Cloud & Infrastructure IA",
    description:
      "Déploiement et hébergement de vos modèles et applications IA sur des infrastructures cloud sécurisées, scalables et performantes.",
  },
  {
    id: "securite-ia",
    icon: ShieldCheck,
    title: "Sécurité & Conformité IA",
    description:
      "Audit, sécurisation et mise en conformité de vos systèmes intelligents pour garantir confidentialité et fiabilité des données.",
  },
  {
    id: "edge-computing",
    icon: Cpu,
    title: "IA Embarquée & Edge Computing",
    description:
      "Déploiement de modèles IA légers directement sur des appareils locaux pour un fonctionnement rapide, même hors connexion.",
  },
  {
    id: "formation",
    icon: GraduationCap,
    title: "Formation & Accompagnement",
    description:
      "Programmes de formation et d'accompagnement pour aider vos équipes à comprendre, adopter et exploiter pleinement l'intelligence artificielle.",
  },
]

export default function ServicesSection() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-black overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/3 w-px h-full bg-white/5" />
        <div className="absolute top-0 left-2/3 w-px h-full bg-white/5" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/5" />
      </div>

      {/* Header */}
      <div className="relative z-10 text-center max-w-3xl mx-auto mb-16">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-px bg-white/40" />
            <div className="w-2.5 h-2.5 rotate-45 border border-white/40" />
            <div className="w-12 h-px bg-white/40" />
          </div>
        </div>
        <p className="text-white/50 tracking-[0.3em] uppercase text-sm mb-4">
          Nos Domaines d'Expertise
        </p>
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white leading-tight">
          Services <span className="text-white/40">CIVITAS</span>
        </h2>
        <p className="text-white/50 text-lg mt-6 leading-relaxed">
          Des solutions d'intelligence artificielle pensées et conçues pour répondre
          aux réalités et ambitions du continent africain.
        </p>
      </div>

      {/* Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px w-full max-w-6xl border border-white/10 bg-white/10">
        {services.map((service) => {
          const Icon = service.icon
          const isHovered = hoveredId === service.id

          return (
            <div
              key={service.id}
              onMouseEnter={() => setHoveredId(service.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`
                group relative flex flex-col gap-4 p-8 cursor-pointer
                transition-all duration-500 ease-out
                ${isHovered ? "bg-white text-black" : "bg-black text-white"}
              `}
            >
              {/* Icon */}
              <div
                className={`
                  w-12 h-12 flex items-center justify-center rounded-xl border
                  transition-all duration-500 ease-out
                  ${
                    isHovered
                      ? "border-black bg-black text-white scale-110 rotate-6"
                      : "border-white/20 bg-white/5 text-white"
                  }
                `}
              >
                <Icon size={22} />
              </div>

              {/* Title */}
              <h3
                className={`
                  font-serif text-xl md:text-2xl transition-colors duration-500
                  ${isHovered ? "text-black" : "text-white"}
                `}
              >
                {service.title}
              </h3>

              {/* Description */}
              <p
                className={`
                  text-sm leading-relaxed transition-colors duration-500
                  ${isHovered ? "text-black/70" : "text-white/50"}
                `}
              >
                {service.description}
              </p>

              {/* Bottom accent line */}
              <div
                className={`
                  absolute bottom-0 left-0 h-[2px] bg-black
                  transition-all duration-500 ease-out
                  ${isHovered ? "w-full" : "w-0"}
                `}
              />

              {/* Corner arrow on hover */}
              <div
                className={`
                  absolute top-6 right-6 transition-all duration-500 ease-out
                  ${isHovered ? "opacity-100 translate-x-0 translate-y-0" : "opacity-0 -translate-x-2 translate-y-2"}
                `}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-black"
                >
                  <path d="M7 17L17 7M17 7H8M17 7V16" />
                </svg>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer note */}
      <p className="relative z-10 text-white/30 text-sm mt-12 tracking-widest uppercase text-center">
        + de solutions sur mesure selon vos besoins
      </p>
    </section>
  )
}