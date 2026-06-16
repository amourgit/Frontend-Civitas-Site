// ============================================================
// components/layouts/Header/header.tsx
// Header global CIVITAS — Logo + bouton menu burger
// + Full Page Menu (overlay plein écran animé GSAP)
// Extrait de SectionHero.tsx pour être partagé par toutes les pages
// ============================================================

"use client"

import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(useGSAP)

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const menuRef = useRef<HTMLDivElement | null>(null)
  const menuLayersRef = useRef<HTMLDivElement | null>(null)
  const menuContentRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  const tl = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useGSAP(() => {
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
  }, [])

  useEffect(() => {
    if (!tl.current) return
    if (isMenuOpen) {
      tl.current.play()
    } else {
      tl.current.reverse()
    }
  }, [isMenuOpen])

  return (
    <>
      {/* Full Page Menu */}
      <div
        ref={menuRef}
        className={`fixed inset-0 z-[100] invisible opacity-0 ${
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
                  onClick={() => setIsMenuOpen(false)}
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
                  onClick={() => setIsMenuOpen(false)}
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
                  onClick={() => setIsMenuOpen(false)}
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
            aria-label="Fermer le menu"
          >
            <div className="relative w-8 h-8">
              <span className="absolute top-1/2 left-0 w-8 h-[2px] bg-current rotate-45 -translate-y-1/2" />
              <span className="absolute top-1/2 left-0 w-8 h-[2px] bg-current -rotate-45 -translate-y-1/2" />
            </div>
          </button>
        </div>
      </div>

      {/* HEADER */}
      <header
        className={`fixed top-0 left-0 right-0 flex items-center justify-between w-full py-2 px-4 sm:px-6 z-[90] transition-colors duration-300 ${
          isScrolled ? "bg-black" : "bg-transparent"
        }`}
      >
        <Link to="/" className="hover:opacity-70 transition-opacity opacity-100">
          <img
            src={isScrolled ? "images/logo-civitas-white-3D-RMBG.png" : "images/logo-civitas-black-3D-RMBG.png"}
            alt="Civitas Logo"
            width={600}
            height={600}
            className="h-16 w-auto opacity-100"
          />
        </Link>
        <button
          onClick={() => setIsMenuOpen(true)}
          className={`relative flex h-8 w-8 items-center justify-center hover:opacity-70 transition-opacity duration-300 group ${
            isMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          aria-label="Ouvrir le menu"
        >
          <span
            className={`absolute h-[2px] w-[32px] translate-y-[-4px] transition-colors duration-300 ${
              isScrolled ? "bg-white" : "bg-black"
            }`}
          />
          <span
            className={`absolute h-[2px] w-[32px] translate-y-[4px] transition-colors duration-300 ${
              isScrolled ? "bg-white" : "bg-black"
            }`}
          />
        </button>
      </header>
    </>
  )
}
