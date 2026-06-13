"use client"

import { useEffect, useState } from "react"

export function ArtDecoSunburst({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const rays = 24

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <img src="/images/moi3.jpg" alt="Fondateur" className="w-full h-full object-cover" />
    </div>
  )
}
