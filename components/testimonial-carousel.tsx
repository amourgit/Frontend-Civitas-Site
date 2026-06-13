"use client"

import { useRef } from "react"
import TestimonialCard from "./testimonial-card"

const testimonials = [
  {
    id: 1,
    quote: "Your product is awesome for X, Y, Z reasons. Would highly recommend!",
    subtitle: "Unparalleled in speed and reliability",
    name: "John Smith",
    title: "Co-Founder & CTO",
    company: "Microsoft",
    avatar: "/professional-bearded-man.png",
    logo: "/health-tech-logo.png",
  },
  {
    id: 2,
    quote: "We struggled a lot with X and Y! Not a problem anymore after switching",
    subtitle: "Great customer support",
    name: "Caroline Reaper",
    title: "Co-Founder",
    company: "Google",
    avatar: "/young-tech-founder.png",
    logo: "/placeholder-xsd8p.png",
  },
  {
    id: 3,
    quote: "Finally a great service that don't require constant maintenance",
    subtitle: "Zero Maintenance",
    name: "Jake Kang",
    title: "Co-Founder & CTO",
    company: "Amazon",
    avatar: "/tech-executive-glasses.png",
    logo: "/modern-software-logo.png",
  },
  {
    id: 4,
    quote: "The reliability is unmatched. We've had zero downtime since switching over.",
    subtitle: "Enterprise-grade stability",
    name: "Sarah Johnson",
    title: "CTO",
    company: "Vercel",
    avatar: "/professional-woman-short-hair.png",
    logo: "/enterprise-software-logo.png",
  },
]

export default function TestimonialCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Create a continuous array by duplicating testimonials
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials]

  return (
    <div className="relative w-full h-[400px] overflow-hidden">
      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none z-30" />
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-20" />

      {/* Scrolling container */}
      <div 
        ref={scrollRef}
        className="flex gap-4"
        style={{
          animation: 'scroll 20s linear infinite',
          width: 'fit-content'
        }}
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <div key={`${testimonial.id}-${index}`} style={{ flexShrink: 0 }}>
            <TestimonialCard testimonial={testimonial} />
          </div>
        ))}
      </div>

      {/* Side gradients */}
      <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-black to-transparent pointer-events-none z-20" />
      <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-black to-transparent pointer-events-none z-20" />

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            /* Move by exactly 1/3 of total width (4 cards × 380px + 4 gaps × 16px) */
            transform: translateX(calc(-380px * 4 - 16px * 4));
          }
        }
      `}</style>
    </div>
  )
}
