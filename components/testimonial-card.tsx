interface TestimonialCardProps {
  testimonial: {
    id: number
    quote: string
    subtitle: string
    name: string
    title: string
    company: string
    avatar: string
    logo: string
  }
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden flex-shrink-0 
        border border-white/10
        bg-neutral-950 text-white
        shadow-[0_12px_40px_rgba(0,0,0,.45)]
        transition-all duration-300 ease-in-out
        group cursor-pointer font-sans
        hover:border-white/20
      `}
      style={{
        width: "380px",
        height: "320px",
        background: `
          radial-gradient(130% 90% at 20% 0%,
            rgba(255,255,255,.08) 0%,
            rgba(255,255,255,.03) 30%,
            transparent 60%),
          linear-gradient(180deg,
            rgba(255,255,255,.02), rgba(0,0,0,.10))
        `,
        boxShadow: `
          inset 0 0 0 1px rgba(255,255,255,.04),
          0 12px 40px rgba(0,0,0,.45)
        `,
      }}
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-10 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle green/teal gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 via-teal-500/0 to-transparent group-hover:from-emerald-400/5 group-hover:via-teal-500/3 group-hover:to-transparent transition-all duration-500" />

      <div className="relative z-10 h-full flex flex-col justify-between p-6">
        <div>
          <blockquote className="text-white text-2xl font-medium leading-relaxed mb-3">
            "{testimonial.quote}"
          </blockquote>
          <p className="text-gray-400 text-sm font-medium">{testimonial.subtitle}</p>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <div className="relative flex items-center">
            <img
              src={testimonial.logo || "/placeholder.svg"}
              alt={`${testimonial.company} logo`}
              className="w-9 h-9 rounded-full bg-gray-800 p-2"
            />
            <img
              src={testimonial.avatar || "/placeholder.svg"}
              alt={testimonial.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-gray-700 -ml-2"
            />
          </div>
          <div>
            <div className="text-white font-semibold text-sm">{testimonial.name}</div>
            <div className="text-blue-400 text-xs">
              {testimonial.title} - {testimonial.company}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
