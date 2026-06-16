"use client"

import { motion } from "framer-motion"

export default function SectionHistoryAITimeline() {
  const events = [
    {
      year: "1950",
      date: "OCT",
      title: "Le Test de Turing",
      description:
        "Alan Turing publie « Computing Machinery and Intelligence » et propose un test pour évaluer si une machine peut imiter l'intelligence humaine. Acte fondateur de la réflexion sur l'IA.",
      image: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Alan_Turing_Aged_16.jpg",
    },
    {
      year: "1956",
      date: "ÉTÉ",
      title: "Conférence de Dartmouth",
      description:
        "John McCarthy, Marvin Minsky, Claude Shannon et Nathaniel Rochester organisent la conférence de Dartmouth. Le terme « Intelligence Artificielle » est officiellement créé.",
      image: "history/dartmouth.jpeg",
    },
    {
      year: "1958",
      date: "JUL",
      title: "Le Perceptron",
      description:
        "Frank Rosenblatt présente le Perceptron, premier réseau de neurones artificiels capable d'apprentissage, ancêtre des réseaux de neurones modernes.",
      image: "history/ai-perceptron.png",
    },
    {
      year: "1966",
      date: "JAN",
      title: "ELIZA, le premier chatbot",
      description:
        "Joseph Weizenbaum crée ELIZA au MIT, un programme simulant une conversation avec un psychothérapeute, posant les bases du traitement du langage naturel.",
      image: "history/eliza.png",
    },
    {
      year: "1973",
      date: "—",
      title: "Premier hiver de l'IA",
      description:
        "Le rapport Lighthill critique les limites des systèmes existants. Les financements s'effondrent au Royaume-Uni et aux États-Unis, marquant le premier « hiver de l'IA ».",
      image: "history/hiver-ia.png",
    },
    {
      year: "1980",
      date: "—",
      title: "Essor des systèmes experts",
      description:
        "Les systèmes experts comme XCON deviennent commercialement viables, relançant l'investissement industriel dans l'IA durant les années 1980.",
      image: "history/systeme-expert.png",
    },
    {
      year: "1986",
      date: "—",
      title: "La rétropropagation",
      description:
        "Rumelhart, Hinton et Williams popularisent l'algorithme de rétropropagation, permettant l'entraînement efficace des réseaux de neurones multicouches.",
      image: "https://upload.wikimedia.org/wikipedia/commons/4/46/Colored_neural_network.svg",
    },
    {
      year: "1997",
      date: "MAI 11",
      title: "Deep Blue bat Kasparov",
      description:
        "Le supercalculateur Deep Blue d'IBM bat le champion du monde d'échecs Garry Kasparov, symbole de la puissance de calcul appliquée à l'IA.",
      image: "history/game-echec.png",
    },
    {
      year: "2011",
      date: "FÉV",
      title: "IBM Watson gagne à Jeopardy!",
      description:
        "Watson bat les meilleurs champions humains du jeu télévisé Jeopardy!, démontrant la puissance du traitement du langage naturel et de la recherche d'information.",
      image: "history/IBM-Watson.jpeg",
    },
    {
      year: "2012",
      date: "—",
      title: "AlexNet et le Deep Learning",
      description:
        "AlexNet remporte le concours ImageNet avec une marge spectaculaire grâce aux réseaux de neurones convolutifs sur GPU, déclenchant la révolution du deep learning.",
      image: "history/alexNet.png",
    },
    {
      year: "2016",
      date: "MAR",
      title: "AlphaGo bat Lee Sedol",
      description:
        "Le programme AlphaGo de DeepMind bat le champion du monde de Go Lee Sedol, un exploit jugé impossible quelques années plus tôt.",
      image: "history/game-go.png",
    },
    {
      year: "2017",
      date: "JUIN",
      title: "L'architecture Transformer",
      description:
        "Des chercheurs de Google publient « Attention Is All You Need », introduisant l'architecture Transformer qui deviendra le socle des grands modèles de langage modernes.",
      image: "history/transformer.jpeg",
    },
    {
      year: "2020",
      date: "MAI",
      title: "GPT-3",
      description:
        "OpenAI dévoile GPT-3, un modèle de 175 milliards de paramètres capable de générer du texte d'une qualité inédite, ouvrant l'ère des grands modèles génératifs.",
      image: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    },
    {
      year: "2022",
      date: "NOV 30",
      title: "Lancement de ChatGPT",
      description:
        "OpenAI lance ChatGPT, qui atteint 100 millions d'utilisateurs en deux mois et propulse l'IA générative dans le grand public à l'échelle mondiale.",
      image: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    },
    {
      year: "2023",
      date: "MAR",
      title: "GPT-4 et l'IA multimodale",
      description:
        "GPT-4 et d'autres modèles multimodaux apprennent à comprendre texte, image et son. La course mondiale à l'IA générative s'intensifie entre acteurs publics et privés.",
      image: "https://upload.wikimedia.org/wikipedia/commons/a/a4/GPT-4.png",
    },
    {
      year: "2024-2025",
      date: "—",
      title: "L'ère des agents IA",
      description:
        "Les modèles évoluent vers des agents autonomes capables de raisonner, d'utiliser des outils et d'agir sur des tâches complexes, transformant entreprises, éducation et administrations à travers le monde.",
      image: "history/agent-ai.jpeg",
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-16 lg:p-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-20 md:mb-28 text-center">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-zinc-50 mb-4 tracking-tight leading-none">
            L'IA et son histoire
          </h1>
          <p className="font-mono text-sm md:text-base text-amber-500/80 tracking-wider">1950 — 2025</p>
        </div>

        <div className="relative">
          {/* Ligne centrale */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/20 via-amber-500/40 to-amber-500/20" />

          <div className="space-y-28 md:space-y-40">
            {events.map((event, index) => {
              const isLeft = index % 2 === 0
              return (
                <div key={index} className="relative">
                  {/* Point sur la ligne */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-2 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-500/20 z-10" />

                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <motion.div
                      className={
                        isLeft
                          ? "md:col-start-1 md:pr-16 md:text-right"
                          : "md:col-start-2 md:pl-16"
                      }
                      initial={{ opacity: 0, x: isLeft ? -50 : 50, y: 30 }}
                      whileInView={{ opacity: 1, x: 0, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    >
                      <TimelineCard event={event} align={isLeft ? "right" : "left"} />
                    </motion.div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Perspectives */}
        <div className="relative mt-32 md:mt-48">
          <div className="absolute left-1/2 -translate-x-1/2 top-2 w-3 h-3 rounded-full bg-zinc-600 z-10" />

          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="font-mono text-xs md:text-sm text-zinc-600 tracking-widest mb-6">
              2025 — AU-DELÀ
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent mb-12" />

            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-zinc-300 leading-tight tracking-tight mb-6">
              Perspectives
            </h2>

            <p className="text-zinc-500 text-lg md:text-xl leading-relaxed font-light mb-8">
              L'avenir de l'intelligence artificielle se joue désormais à l'échelle
              mondiale : course vers des systèmes toujours plus autonomes,
              régulation naissante, et émergence de nouveaux acteurs — y compris
              en Afrique — déterminés à façonner cette révolution plutôt qu'à la subir.
            </p>

            <p className="text-zinc-600 text-base md:text-lg leading-relaxed italic border-l-2 border-zinc-800 pl-6 text-left">
              « L'intelligence artificielle ne remplacera pas ceux qui la
              maîtrisent — elle distancera ceux qui l'ignorent. La prochaine
              page de cette histoire reste à écrire, et l'Afrique a toute sa
              place pour la rédiger. »
            </p>

            <div className="pt-8">
              <p className="font-mono text-xs text-zinc-700 tracking-wider">À SUIVRE</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function TimelineCard({
  event,
  align,
}: {
  event: { year: string; date: string; title: string; description: string; image: string }
  align: "left" | "right"
}) {
  return (
    <div className={`space-y-4 group ${align === "right" ? "md:flex md:flex-col md:items-end" : ""}`}>
      <div className={`flex flex-col gap-1 ${align === "right" ? "items-end" : ""}`}>
        <div className="font-mono text-xs md:text-sm text-amber-500/60 tracking-widest">{event.date}</div>
        <div className="font-mono text-2xl md:text-3xl text-amber-500 tracking-tight font-bold">{event.year}</div>
      </div>

      <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-zinc-50 leading-tight tracking-tight transition-colors duration-300 group-hover:text-amber-500/90">
        {event.title}
      </h2>

      <p className="text-zinc-400 text-base md:text-lg leading-relaxed">{event.description}</p>

      <div className="relative overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800 transition-all duration-500 group-hover:border-amber-500/30 group-hover:shadow-2xl group-hover:shadow-amber-500/10 mt-2 w-full">
        <div className="aspect-[16/10] relative">
          <img
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </div>
    </div>
  )
}