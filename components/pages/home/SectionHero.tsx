
import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function SectionHero() {
  // Scroll Animation Refs
  const containerRef = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLDivElement | null>(null)
  const paradoxRef = useRef<HTMLDivElement | null>(null)
  const overviewRef = useRef<HTMLDivElement | null>(null)
  const faqRef = useRef<HTMLDivElement | null>(null)

  const scrollToFeatures = () => {
    // The scroll animation ends at +=150%, so scrolling to 1.5x viewport height
    // should bring us to the fully revealed features section.
    window.scrollTo({
      top: window.innerHeight * 1.5,
      behavior: "smooth",
    })
  }

  useGSAP(
    () => {
      // Scroll Animation
      if (containerRef.current && heroRef.current && paradoxRef.current && overviewRef.current && faqRef.current) {
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=1800%", // Updated total scroll distance to 1800%
            scrub: true,
            pin: true,
          },
        })

        scrollTl
          .to({}, { duration: 2 })

          // First Transition: Hero -> Paradox (Features Section)
          .to(heroRef.current, {
            scale: 0.85,
            borderRadius: "40px",
            yPercent: -5,
            ease: "none",
            duration: 1, // Explicit duration for relative timing
          })
          .to(
            paradoxRef.current,
            {
              yPercent: -100,
              ease: "none",
              duration: 1, // Explicit duration
            },
            "<",
          )

          .to({}, { duration: 2 })

          // Second Transition: Paradox -> Overview
          .to(paradoxRef.current, {
            scale: 0.85,
            borderRadius: "40px",
            yPercent: -105,
            ease: "none",
            duration: 1, // Explicit duration
          })
          .to(
            overviewRef.current,
            {
              yPercent: -100,
              ease: "none",
              duration: 1, // Explicit duration
            },
            "<",
          )

          .to({}, { duration: 2 })

          // Third Transition: Overview -> FAQ
          .to(overviewRef.current, {
            scale: 0.85,
            borderRadius: "40px",
            yPercent: -105,
            ease: "none",
            duration: 1, // Explicit duration
          })
          .to(
            faqRef.current,
            {
              yPercent: -100,
              ease: "none",
              duration: 1, // Explicit duration
            },
            "<",
          )
      }
    },
    { scope: containerRef }, // Scope to container for scroll trigger
  )

  return (
    <div ref={containerRef} className="h-screen bg-black flex flex-col gap-[10px] pb-[10px] overflow-hidden">
      {/* SCROLL CONTAINER */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* HERO */}
        <div
          ref={heroRef}
          className="w-full h-full overflow-hidden rounded-xl bg-white isolate will-change-transform"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{
              transform: "scale(1.2) translateX(-10%) translateY(2%)",
            }}
          >
            <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bg-video-wfykIo9BQGqTS3Z6ocIIdDGgPyoApO.mp4" type="video/mp4" />
          </video>

          {/* Refactored positioning to use flexbox instead of transform. This prevents the creation of a stacking context that blocks mix-blend-mode. */}
          <div className="absolute inset-0 flex items-center justify-end pr-[2%] pointer-events-none">
            <div className="flex flex-col items-end pointer-events-auto w-full sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%]">
              <h1
                className="font-semibold text-white mix-blend-difference text-[12vw] lg:text-[10rem]"
                style={{
                  lineHeight: "0.9",
                  letterSpacing: "-0.13em",
                }}
              >
                C  I  V  I  T  A  S
              </h1>
              <div className="w-full flex flex-row justify-end">
                <p className="mt-4 sm:mt-6 font-thin max-w-md text-[#242424] text-base sm:text-lg text-right">
                  Integrateur de Solution IA a votre service
                </p>
              </div>

              <div className="w-full flex flex-row justify-end gap-4 mt-8">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-emerald-600 transition-colors border border-black inline-block"
                >
                  Nous Contacter
                </a>
                <button
                  onClick={scrollToFeatures}
                  className="bg-transparent text-black px-8 py-3 text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-colors border border-black"
                >
                  Explore
                </button>   
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2">
            <div className="flex h-10 w-16 sm:h-12 sm:w-20 items-center justify-center rounded-full border border-black/20 backdrop-blur-sm">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5 sm:h-6 sm:w-6"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
