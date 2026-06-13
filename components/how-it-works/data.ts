import type { Step } from "./types"

const steps: Step[] = [
  {
    id: 1,
    title: "Découverte",
    subtitle:
      "Nous échangeons avec votre équipe afin de comprendre vos besoins, vos objectifs et les défis à résoudre. Cette phase nous permet d'identifier les opportunités où l'intelligence artificielle peut apporter une réelle valeur ajoutée.",
    description: [
      "Analyse des besoins",
      "Compréhension des enjeux",
      "Identification des opportunités IA",
    ],
    image: "/images/process/discovery.webp",
    imageAlt: "Découverte des besoins",
  },
  {
    id: 2,
    title: "Stratégie",
    subtitle:
      "Nous élaborons une approche adaptée à votre organisation en définissant les solutions, les technologies et les ressources nécessaires pour atteindre les objectifs fixés.",
    description: [
      "Définition de la stratégie",
      "Choix des technologies",
      "Planification du projet",
    ],
    image: "/images/process/strategy.webp",
    imageAlt: "Stratégie IA",
  },
  {
    id: 3,
    title: "Conception",
    subtitle:
      "Nos experts conçoivent l'architecture fonctionnelle et technique de la solution afin de garantir performance, évolutivité et intégration avec vos outils existants.",
    description: [
      "Architecture de la solution",
      "Expérience utilisateur",
      "Préparation des intégrations",
    ],
    image: "/images/process/design.webp",
    imageAlt: "Conception de la solution",
  },
  {
    id: 4,
    title: "Déploiement",
    subtitle:
      "La solution est mise en œuvre et intégrée dans votre environnement. Chaque composant est testé afin d'assurer un fonctionnement fiable et sécurisé.",
    description: [
      "Intégration des solutions IA",
      "Tests et validation",
      "Mise en production",
    ],
    image: "/images/process/deployment.webp",
    imageAlt: "Déploiement de la solution",
  },
  {
    id: 5,
    title: "Adoption",
    subtitle:
      "Nous accompagnons vos équipes dans la prise en main des nouveaux outils afin de garantir une adoption rapide et efficace des solutions déployées.",
    description: [
      "Formation des utilisateurs",
      "Accompagnement au changement",
      "Support initial",
    ],
    image: "/images/process/adoption.webp",
    imageAlt: "Adoption des solutions",
  },
  {
    id: 6,
    title: "Optimisation",
    subtitle:
      "Nous assurons un suivi continu des performances de la solution afin de l'améliorer, de l'adapter à vos besoins futurs et de maximiser votre retour sur investissement.",
    description: [
      "Suivi des performances",
      "Amélioration continue",
      "Satisfaction client",
    ],
    image: "/images/process/optimization.webp",
    imageAlt: "Optimisation et satisfaction client",
  },
]

export { steps }