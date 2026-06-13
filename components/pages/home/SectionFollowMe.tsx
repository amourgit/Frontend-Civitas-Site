"use client"

import type React from "react"

// import Image from "next/image"
import { useState, useRef, useCallback } from "react"
import VariableProximity from "@/components/variable-proximity"

const initialImages = [
  // Top left area
  {
    src: "/majestic-mountain-vista.png",
    alt: "Mountain landscape",
    top: 3,
    left: -2,
    rotate: -12,
    width: 280,
    height: 200,
  },
  {
    src: "/ocean-waves-beach-photography.jpg",
    alt: "Ocean waves",
    top: 5,
    left: 18,
    rotate: 5,
    width: 180,
    height: 140,
  },
  {
    src: "/forest-trees-nature-photography.jpg",
    alt: "Forest trees",
    top: -3,
    left: 38,
    rotate: -3,
    width: 200,
    height: 180,
  },
  // Top right area
  {
    src: "/city-skyline-night-photography.jpg",
    alt: "City skyline",
    top: 2,
    left: 58,
    rotate: 8,
    width: 220,
    height: 160,
  },
  {
    src: "/desert-sand-dunes-photography.jpg",
    alt: "Desert dunes",
    top: 5,
    left: 78,
    rotate: -5,
    width: 200,
    height: 150,
  },
  {
    src: "/waterfall-nature-photography.jpg",
    alt: "Waterfall",
    top: 0,
    left: 92,
    rotate: 12,
    width: 180,
    height: 220,
  },
  // Left side middle
  {
    src: "/ocean-waves-beach-photography.jpg",
    alt: "Beach scene",
    top: 32,
    left: -5,
    rotate: 6,
    width: 240,
    height: 180,
  },
  {
    src: "/majestic-mountain-vista.png",
    alt: "Mountain view",
    top: 45,
    left: 8,
    rotate: -8,
    width: 160,
    height: 200,
  },
  // Right side middle
  {
    src: "/forest-trees-nature-photography.jpg",
    alt: "Forest path",
    top: 28,
    left: 85,
    rotate: -6,
    width: 200,
    height: 160,
  },
  {
    src: "/city-skyline-night-photography.jpg",
    alt: "Night city",
    top: 48,
    left: 82,
    rotate: 10,
    width: 220,
    height: 180,
  },
  // Bottom left area
  {
    src: "/desert-sand-dunes-photography.jpg",
    alt: "Sand patterns",
    top: 68,
    left: -3,
    rotate: -4,
    width: 260,
    height: 200,
  },
  {
    src: "/waterfall-nature-photography.jpg",
    alt: "Cascade",
    top: 72,
    left: 18,
    rotate: 7,
    width: 180,
    height: 160,
  },
  {
    src: "/majestic-mountain-vista.png",
    alt: "Peak view",
    top: 78,
    left: 32,
    rotate: -2,
    width: 160,
    height: 140,
  },
  // Bottom center-right area
  {
    src: "/ocean-waves-beach-photography.jpg",
    alt: "Waves",
    top: 75,
    left: 48,
    rotate: 4,
    width: 180,
    height: 150,
  },
  {
    src: "/forest-trees-nature-photography.jpg",
    alt: "Trees",
    top: 72,
    left: 62,
    rotate: -6,
    width: 200,
    height: 170,
  },
  {
    src: "/city-skyline-night-photography.jpg",
    alt: "Skyline",
    top: 70,
    left: 78,
    rotate: 8,
    width: 220,
    height: 180,
  },
  {
    src: "/desert-sand-dunes-photography.jpg",
    alt: "Dunes",
    top: 65,
    left: 92,
    rotate: -10,
    width: 180,
    height: 220,
  },
]

export default function SectionFollowMe() {
  const [images, setImages] = useState(initialImages)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const pendingPosition = useRef({ left: 0, top: 0 })
  const textContainerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    setDraggingIndex(index)
    const rect = (e.target as HTMLElement).closest(".draggable-image")?.getBoundingClientRect()
    if (rect) {
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }
  }

  const updatePosition = useCallback(() => {
    if (draggingIndex === null) return

    setImages((prev) =>
      prev.map((img, i) =>
        i === draggingIndex ? { ...img, left: pendingPosition.current.left, top: pendingPosition.current.top } : img,
      ),
    )
    animationFrameRef.current = null
  }, [draggingIndex])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (draggingIndex === null || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      pendingPosition.current = {
        left: ((e.clientX - containerRect.left - dragOffset.current.x) / containerRect.width) * 100,
        top: ((e.clientY - containerRect.top - dragOffset.current.y) / containerRect.height) * 100,
      }

      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(updatePosition)
      }
    },
    [draggingIndex, updatePosition],
  )

  const handleMouseUp = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    setDraggingIndex(null)
  }, [])

  return (
    <main
      ref={containerRef}
      className="relative h-screen overflow-hidden bg-[#0a0a0a]"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,250,0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,250,0.03) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Scattered draggable images */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`draggable-image absolute select-none ${
            draggingIndex === index ? "z-50 cursor-grabbing" : "cursor-grab hover:z-50"
          }`}
          style={{
            top: `${image.top}%`,
            left: `${image.left}%`,
            transform: `rotate(${image.rotate}deg) scale(${draggingIndex === index ? 1.05 : 1})`,
            width: image.width,
            height: image.height,
            transition:
              draggingIndex === index
                ? "transform 0.1s ease-out, box-shadow 0.2s ease-out"
                : "top 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s ease-out",
            boxShadow:
              draggingIndex === index
                ? "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 0, 0, 0.4)"
                : "0 10px 40px -10px rgba(0, 0, 0, 0.5)",
            willChange: draggingIndex === index ? "top, left, transform" : "auto",
          }}
          onMouseDown={(e) => handleMouseDown(e, index)}
        >
          <div className="relative h-full w-full overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
            <img
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              className="pointer-events-none object-cover transition-transform duration-500 hover:scale-105"
              draggable={false}
            />
          </div>
        </div>
      ))}

      <div
        ref={textContainerRef}
        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
      >
        <div className="text-center">
          <p
            className="relative z-10 text-7xl text-white/90 md:text-[120px]"
            style={{ fontFamily: "var(--font-corinthia), cursive", marginBottom: "-50px" }}
          >
            Connect on
          </p>
          <h1 className="text-7xl tracking-tight text-white md:text-9xl">
            <VariableProximity
              label="Instagram"
              fromFontVariationSettings="'wght' 700"
              toFontVariationSettings="'wght' 900"
              containerRef={textContainerRef}
              radius={150}
              falloff="gaussian"
              className="pointer-events-auto"
              style={{
                fontFamily: '"Roboto Flex", sans-serif',
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            />
          </h1>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-white/60 md:text-base">
            A space for unfinished thoughts and late-night experiments. Catch the behind-the-scenes of my design
            journey.
          </p>
          <div
            className="pointer-events-auto mt-8 mb-8 inline-block rounded-full p-[2px]"
            style={{
              background: "linear-gradient(135deg, #e8e8e8 0%, #6b6b6b 25%, #ffffff 50%, #6b6b6b 75%, #e8e8e8 100%)",
            }}
          >
            <button className="rounded-full bg-[#0a0a0a] px-8 py-3 text-sm font-medium text-white transition-all hover:bg-white hover:text-black">
              Follow me
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
