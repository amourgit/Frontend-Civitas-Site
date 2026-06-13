
import { useState, useRef, useEffect } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function SectionHero() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const menuLayersRef = useRef<HTMLDivElement | null>(null)
  const menuContentRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  // Scroll Animation Refs
  const containerRef = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLDivElement | null>(null)
  const paradoxRef = useRef<HTMLDivElement | null>(null)
  const overviewRef = useRef<HTMLDivElement | null>(null)
  const faqRef = useRef<HTMLDivElement | null>(null)

  const tl = useRef<gsap.core.Timeline | null>(null)

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
      // Menu Animation
      if (!menuRef.current || !menuLayersRef.current || !menuContentRef.current || !closeButtonRef.current) return

      gsap.set(menuRef.current, { autoAlpha: 0 })
      gsap.set(closeButtonRef.current, { opacity: 0, scale: 0.8 })

      const layers = Array.from(menuLayersRef.current.children)
      const content = Array.from(menuContentRef.current.children)

      tl.current = gsap
        .timeline({ paused: true })
        .to(menuRef.current, { autoAlpha: 1, duration: 0 })
        .fromTo(
          layers,
          { clipPath: "circle(0% at 100% 100%)" },
          {
            clipPath: "circle(150% at 100% 100%)",
            duration: 1.2,
            ease: "power4.inOut",
            stagger: 0.1,
          },
        )
        .fromTo(
          content,
          { y: 100, opacity: 0, skewY: 5 },
          {
            y: 0,
            opacity: 1,
            skewY: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.05,
          },
          "-=0.8",
        )
        .to(
          closeButtonRef.current,
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: "back.out(1.7)",
          },
          "-=0.6",
        )

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

  useEffect(() => {
    if (!tl.current) return
    if (isMenuOpen) {
      tl.current.play()
    } else {
      tl.current.reverse()
    }
  }, [isMenuOpen])

  return (
    <div ref={containerRef} className="h-screen bg-black flex flex-col gap-[10px] pb-[10px] overflow-hidden">
      {/* Full Page Menu */}
      <div
        ref={menuRef}
        className={`fixed inset-0 z-50 invisible opacity-0 ${
          isMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div ref={menuLayersRef} className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-emerald-700" />
          <div className="absolute inset-0 bg-emerald-600" />
          <div className="absolute inset-0 bg-emerald-500" />
        </div>

        <div className="relative z-10 h-full w-full flex items-center justify-center px-4 sm:px-8 lg:px-12 py-20 sm:py-12">
          <div
            ref={menuContentRef}
            className="w-full h-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 content-center sm:content-start lg:content-center"
          >
            <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 justify-center h-full">
              <span className="text-emerald-900 text-xs sm:text-sm font-bold tracking-widest uppercase mb-2 sm:mb-4">
                Navigation
              </span>
              {["Home", "Models", "Research", "Company"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-white hover:text-emerald-900 transition-colors uppercase tracking-tighter font-semibold leading-[0.95]
                             text-[10vw] sm:text-[6vw] md:text-[5vw] lg:text-[3.5vw] xl:text-[3vw]"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 justify-center h-full">
              <span className="text-emerald-900 text-xs sm:text-sm font-bold tracking-widest uppercase mb-2 sm:mb-4">
                Products
              </span>
              {["Moravec 04", "Paradox", "Legacy", "Parts"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-white hover:text-emerald-900 transition-colors uppercase tracking-tighter font-semibold leading-[0.95]
                             text-[10vw] sm:text-[6vw] md:text-[5vw] lg:text-[3.5vw] xl:text-[3vw]"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 justify-center h-full">
              <span className="text-emerald-900 text-xs sm:text-sm font-bold tracking-widest uppercase mb-2 sm:mb-4">
                Social
              </span>
              {["Twitter", "Instagram", "LinkedIn", "Youtube"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-white hover:text-emerald-900 transition-colors uppercase tracking-tighter font-semibold leading-[0.95]
                            text-[10vw] sm:text-[6vw] md:text-[5vw] lg:text-[3.5vw] xl:text-[3vw]"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <button
            ref={closeButtonRef}
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-8 right-8 text-white hover:text-emerald-900 transition-colors z-50"
          >
            <div className="relative w-8 h-8">
              <span className="absolute top-1/2 left-0 w-8 h-[2px] bg-current rotate-45 -translate-y-1/2" />
              <span className="absolute top-1/2 left-0 w-8 h-[2px] bg-current -rotate-45 -translate-y-1/2" />
            </div>
          </button>
        </div> 
      </div>

      {/* HEADER */}
      <header className="flex-none flex items-center justify-between w-full py-4 sm:py-6 lg:py-8 px-[10px] relative z-40">
        <a href="/" className="hover:opacity-70 transition-opacity opacity-100">
          <img src="images/logo-civitas-white-3D-RMBG.png" alt="Civitas Logo" width={600} height={600} className="h-32 w-auto opacity-100" />
        </a>
        <button
          onClick={() => setIsMenuOpen(true)}
          className={`relative flex h-8 w-8 items-center justify-center hover:opacity-70 transition-opacity duration-300 group ${
            isMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <span className="absolute h-[2px] w-[32px] bg-white translate-y-[-4px]" />
          <span className="absolute h-[2px] w-[32px] bg-white translate-y-[4px]" />
        </button>
      </header>

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
