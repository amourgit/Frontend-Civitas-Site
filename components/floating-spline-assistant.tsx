"use client"

import { Suspense, lazy, useEffect, useRef, useState } from "react"
const Spline = lazy(() => import("@splinetool/react-spline"))

export function FloatingSplineAssistant() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // La scene 3D Spline (runtime WebGL + asset .splinecode de plusieurs Mo,
  // avec sa propre boucle de rendu permanente) ne se charge/initialise que
  // lorsque cette section approche du viewport, au lieu de demarrer dès le
  // premier rendu de la page (cette section est la 4e sur 14, hors-ecran
  // au chargement initial).
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" },
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-transparent">
      {/* Spline Scene Container with explicit height */}
      <div className="absolute inset-0 w-full h-full">
        {isVisible && (
          <Suspense fallback={null}>
            <Spline
              scene="https://prod.spline.design/UbM7F-HZcyTbZ4y3/scene.splinecode"
              className="w-full h-full"
            />
          </Suspense>
        )}
      </div>

      {/* Robot Viewport - Top Left, Compact */}
      <div className="absolute top-4 left-4 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 pointer-events-none overflow-hidden z-10" />
    </div>
  )
}
