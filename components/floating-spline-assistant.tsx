"use client"

import { Suspense, lazy, useRef, useEffect } from "react"
const Spline = lazy(() => import("@splinetool/react-spline"))

export function FloatingSplineAssistant() {
  const containerRef = useRef<HTMLDivElement>(null)
  const splineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const splineEl = splineRef.current
    if (!container || !splineEl) return

    const handleMouseMove = (e: MouseEvent) => {
      // Get exact position of Spline container relative to viewport
      const rect = splineEl.getBoundingClientRect()
      
      // Calculate mouse position relative to Spline container
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // Only dispatch if mouse is within container bounds
      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        const syntheticEvent = new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          clientX: e.clientX,
          clientY: e.clientY,
          view: window,
        })
        splineEl.dispatchEvent(syntheticEvent)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-transparent">
      {/* Spline Scene Container with explicit height */}
      <div ref={splineRef} className="absolute inset-0 w-full h-full">
        <Suspense fallback={null}>
          <Spline
            scene="https://prod.spline.design/UbM7F-HZcyTbZ4y3/scene.splinecode"
            className="w-full h-full"
          />
        </Suspense>
      </div>

      {/* Robot Viewport - Top Left, Compact */}
      <div className="absolute top-4 left-4 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 pointer-events-none overflow-hidden z-10" />
    </div>
  )
}
