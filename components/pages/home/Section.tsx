'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Twitter, Linkedin, Facebook, Instagram } from "lucide-react"


interface Slide {
  id: string
  title: string
  subtitle: string
  heading: string
  description?: string
  image: string
  alt: string
  accentColor?: string
}

const SLIDES: Slide[] = [
  {
    id: 'vision',
    title: 'VISION',
    subtitle: 'NOTRE VISION :',
    heading: 'UNE AFRIQUE\nNUMÉRIQUE\nSOUVERAINE',
    description: 'Construire une Afrique où chaque citoyen, chaque entreprise et chaque institution peut exploiter pleinement le potentiel des technologies numériques et de l\'Intelligence Artificielle pour améliorer sa productivité, sa compétitivité et sa qualité de vie.',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2812%29-AUzcUJl45XueiOf0D1t9cvkzHg1wce.png',
    alt: 'Vision CIVITAS',
  },
  {
    id: 'mission',
    title: 'MISSION',
    subtitle: 'NOTRE MISSION :',
    heading: 'DÉMOCRATISER\nL\'ACCÈS À\nL\'INTELLIGENCE IA',
    description: 'Accompagner la transformation numérique des organisations africaines en formant les talents, développant des solutions intelligentes adaptées aux réalités locales et en favorisant l\'innovation et l\'entrepreneuriat technologique.',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2812%29-AUzcUJl45XueiOf0D1t9cvkzHg1wce.png',
    alt: 'Mission CIVITAS',
  },
  {
    id: 'innovation',
    title: 'INNOVATION',
    subtitle: 'VALEUR FONDATRICE :',
    heading: 'CRÉER LES\nSOLUTIONS DE\nDEMAIN AUJOURD\'HUI',
    description: 'Nous encourageons la créativité et la recherche constante de solutions nouvelles. CIVITAS croit que l\'Afrique doit être actrice de la révolution numérique mondiale, et non simple consommatrice des technologies développées ailleurs.',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2812%29-AUzcUJl45XueiOf0D1t9cvkzHg1wce.png',
    alt: 'Innovation CIVITAS',
  },
  {
    id: 'formation',
    title: 'FORMATION',
    subtitle: 'OBJECTIF COURT TERME :',
    heading: 'FORMER\nDES MILLIERS\nD\'AFRICAINS À L\'IA',
    description: 'Développer des programmes accessibles permettant à des milliers d\'Africains de découvrir et maîtriser les outils d\'Intelligence Artificielle. Rassembler étudiants, entrepreneurs et professionnels autour d\'un même objectif : apprendre, collaborer et innover.',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2812%29-AUzcUJl45XueiOf0D1t9cvkzHg1wce.png',
    alt: 'Formation CIVITAS',
  },
  {
    id: 'academie',
    title: 'ACADÉMIE',
    subtitle: 'OBJECTIF LONG TERME :',
    heading: 'BÂTIR L\'ACADÉMIE\nIAFRICAINE\nDE L\'IA',
    description: 'Créer un centre de formation spécialisé dans les métiers de l\'IA, de l\'automatisation et du numérique. Former une nouvelle génération d\'ingénieurs, de consultants, de développeurs et d\'entrepreneurs spécialisés dans l\'Intelligence Artificielle.',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2812%29-AUzcUJl45XueiOf0D1t9cvkzHg1wce.png',
    alt: 'Académie IA CIVITAS',
  },
  {
    id: 'impact',
    title: 'IMPACT',
    subtitle: 'NOTRE ENGAGEMENT :',
    heading: 'DES SOLUTIONS\nÀ IMPACT\nMESURABLE',
    description: 'Nous développons des solutions qui répondent à des problématiques concrètes et produisent des résultats mesurables. Participer à la souveraineté numérique africaine en contribuant à la création de technologies développées par des Africains pour les Africains.',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2812%29-AUzcUJl45XueiOf0D1t9cvkzHg1wce.png',
    alt: 'Impact CIVITAS',
  },
]

type AnimationDirection = 'left' | 'right'

export default function Section() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState<AnimationDirection>('right')
  const [isAnimating, setIsAnimating] = useState(false)

  const slide = SLIDES[currentSlide]

  const handleSlideChange = (newIndex: number) => {
    if (isAnimating || newIndex === currentSlide) return

    // Déterminer la direction en fonction de la position relative du slide
    if (newIndex > currentSlide) {
      setDirection('right')
    } else {
      setDirection('left')
    }

    setIsAnimating(true)
    setCurrentSlide(newIndex)
  }

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isAnimating])

  const getContentAnimation = () => {
    if (!isAnimating) return ''
    return direction === 'right' 
      ? 'animate-slide-in-right' 
      : 'animate-slide-in-left'
  }

  const getImageAnimation = () => {
    if (!isAnimating) return ''
    return direction === 'right' 
      ? 'animate-image-in-right' 
      : 'animate-image-in-left'
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent">
      {/* Background Spline */}
      <div className="absolute inset-0 z-0">
        <iframe
          src="https://my.spline.design/motiontrails-mQJiWP02BoJRJj7QScWZ8Yil/"
          frameBorder="0"
          width="100%"
          height="100%"
          className="h-full w-full"
        />
      </div>

      {/* Navigation Tabs */}
      <nav className="relative z-10 border-b border-white/10 bg-black/10 backdrop-blur-sm">
        <ul className="flex gap-1 px-16 py-4">
          {SLIDES.map((s, index) => (
            <li
              key={s.id}
              onClick={() => handleSlideChange(index)}
              className={`cursor-pointer px-4 py-2 text-sm font-bold tracking-wide transition-all duration-300 ${
                currentSlide === index
                  ? 'border-b-2 border-red-400 text-white drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                  : 'border-b-2 border-transparent text-white/60 hover:text-white hover:border-white/30'
              }`}
            >
              {s.title}
            </li>
          ))}
        </ul>
      </nav>

      {/* Carousel Content */}
      <div className="relative z-10 flex items-center justify-between px-16 pt-12 pb-12">
        {/* Left Content */}
        <div 
          key={`content-${currentSlide}`}
          className={`max-w-2xl transition-all duration-500 ${getContentAnimation()}`}
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-red-200/90">
            {slide.subtitle}
          </p>
          <h1 className="mb-6 text-6xl font-bold leading-tight text-white whitespace-pre-line">
            {slide.heading}
          </h1>
          <p className="mb-10 max-w-xl text-base leading-relaxed text-white/90">
            {slide.description || 'Explorez notre sélection exclusive et découvrez les meilleures offres.'}
          </p>

          {/* Buttons */}
          <div className="mb-12 flex gap-4">
            <Button
              size="lg"
              className="rounded-full bg-white px-8 text-sm font-semibold uppercase tracking-wide text-[#7B6BA8] transition-all duration-300 hover:bg-white/90 hover:shadow-[0_0_20px_rgba(239,68,68,0.8),0_0_40px_rgba(239,68,68,0.5)]"
            >
              EN SAVOIR PLUS
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-2 border-white bg-transparent px-8 text-sm font-semibold uppercase tracking-wide text-white transition-all duration-300 hover:border-red-400 hover:bg-white/10 hover:text-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.8),0_0_40px_rgba(239,68,68,0.5)]"
            >
              NOUS CONTACTER
            </Button>
          </div>

          {/* Slide Indicators */}
          <div className="flex gap-3">
            {SLIDES.map((_, index) => (
              <div
                key={index}
                onClick={() => handleSlideChange(index)}
                className={`h-2.5 w-2.5 rounded-full cursor-pointer transition-all duration-300 ${
                  currentSlide === index
                    ? 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Image */}
        <div
          key={`image-${currentSlide}`}
          className={`relative transition-all duration-500 ${getImageAnimation()}`}
        >
          <div className="relative h-[720px] w-[540px] group">
            <img
              src={slide.image}
              alt={slide.alt}
             
              className="object-contain transition-all duration-500 group-hover:scale-110"
              style={{
                filter:
                  "drop-shadow(0 0 50px rgba(239, 68, 68, 0.8)) drop-shadow(0 0 100px rgba(239, 68, 68, 0.6)) drop-shadow(0 0 150px rgba(239, 68, 68, 0.4))",
              }}
            />
          </div>
        </div>
      </div>

      {/* Social Media Icons */}
      <div className="absolute bottom-12 left-16 z-10 flex gap-6">
        <Twitter className="h-5 w-5 cursor-pointer text-white transition-all duration-300 hover:text-red-400 hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
        <Linkedin className="h-5 w-5 cursor-pointer text-white transition-all duration-300 hover:text-red-400 hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
        <Facebook className="h-5 w-5 cursor-pointer text-white transition-all duration-300 hover:text-red-400 hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
        <Instagram className="h-5 w-5 cursor-pointer text-white transition-all duration-300 hover:text-red-400 hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes image-in-right {
          from {
            opacity: 0;
            transform: translateX(100px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes image-in-left {
          from {
            opacity: 0;
            transform: translateX(-100px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out;
        }

        .animate-image-in-right {
          animation: image-in-right 0.5s ease-out;
        }

        .animate-image-in-left {
          animation: image-in-left 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
