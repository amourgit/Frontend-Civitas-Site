"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GlitchBackground } from "@/components/glitch-background"

export default function WaitlistPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [heroReady, setHeroReady] = useState(false)

  useEffect(() => {
    // Trigger video scale-up after 2 seconds
    const timer1 = setTimeout(() => setVideoReady(true), 2000)
    return () => clearTimeout(timer1)
  }, [])

  useEffect(() => {
    // Trigger hero content animation after 3.5 seconds
    const timer2 = setTimeout(() => setHeroReady(true), 3500)
    return () => clearTimeout(timer2)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubmitted(true)
    }
  }

  return (
    <main className="relative bg-zinc-950" style={{ width: "100%", height: "100vh" }}>
      {/* Fullscreen Background Image with Three.js Glitch Effect */}
      <GlitchBackground isHovered={isHovered} />

      {/* Content Overlay */}
      <div className="relative z-20 h-full flex flex-col justify-between p-8 md:p-12 lg:p-16 text-white">
        {/* Video background — zooms in once intro is done */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-screen object-cover z-0"
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/agentic-hero-9yW3wnTNMfn2U6lsVhTTZSJFEvAoSj.mp4"
          />
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Title and Input - Top Left */}
          <div className="max-w-md order-1">
            <h1 className="tracking-tight text-balance text-white drop-shadow-2xl font-serif font-thin lg:text-8xl md:text-8xl text-7xl">
              L'Intelligence Artificielle au service de l'Afrique
            </h1>

            {/* Email Input Form */}
            <div 
              className="mt-6 backdrop-blur-md p-2 bg-white rounded-2xl"
              style={{
                boxShadow: "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px"
              }}
            >
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Votre adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 border-none text-zinc-900 placeholder:text-zinc-400 h-12 px-4 bg-transparent rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button 
                    type="submit"
                    className="h-12 px-6 hover:bg-fuchsia-500 text-white font-medium transition-colors bg-black rounded-xl"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    Commencer
                  </Button>
                </form>
              ) : (
                <div className="text-center py-3">
                  <p className="text-fuchsia-600 font-medium">
                    Merci ! Nous vous contacterons très prochainement.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Description - Top Right */}
          <div className="max-w-sm md:text-right order-2">
            <p className="text-white/90 text-base leading-relaxed drop-shadow-lg md:text-base">
              Innover, Former, Transformer.
              <br />
              L'Afrique doit être actrice de la révolution numérique mondiale.
              <br />
              Rejoignez l'écosystème CIVITAS aujourd'hui.
            </p>
          </div>
        </header>

        {/* Stats Section - Bottom */}
        <footer className="z-30 p-8 md:p-12 lg:p-16">
          <div className="grid grid-cols-3 gap-4 md:gap-8 lg:gap-12">
            {/* Stat 1 */}
            <div className="text-center sm:text-left">
              <div className="md:text-7xl lg:text-8xl text-white drop-shadow-2xl text-center font-extralight text-4xl">
                500+
              </div>
              <div className="mt-2 md:text-base text-white/70 tracking-widest uppercase text-center text-xs">
                Organisations accompagnées
              </div>
            </div>

            {/* Stat 2 */}
            <div className="text-center">
              <div className="md:text-7xl lg:text-8xl text-white drop-shadow-2xl font-extralight text-4xl">
                5+
              </div>
              <div className="mt-2 md:text-base text-white/70 tracking-widest uppercase text-xs">
                Domaines d'expertise IA
              </div>
            </div>

            {/* Stat 3 */}
            <div className="text-center sm:text-right">
              <div className="md:text-7xl lg:text-8xl text-white drop-shadow-2xl text-center font-extralight text-4xl">
                100%
              </div>
              <div className="mt-2 md:text-base text-white/70 tracking-widest uppercase text-center text-xs">
                Solutions made in Africa
              </div>
            </div>
          </div>
        </footer>
      </div>      
    </main>
  )
}
