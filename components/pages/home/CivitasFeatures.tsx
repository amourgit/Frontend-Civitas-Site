// ============================================================
// components/pages/home/CivitasFeatures.tsx
// Section Features — Bento Grid Glass · Animations · CIVITAS AI
// ============================================================

import React, { useRef } from "react"
import { PixelIcon } from "@/components/pixel-icon"
import { RevealText } from "@/components/reveal-text"
import { StackingAgentCards } from "@/components/stacking-agent-cards"
import { useInView } from "framer-motion"

// ─── Pill tag ─────────────────────────────────────────────────────────────────
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] tracking-widest font-sans text-black/40 bg-black/[0.04]">
      {children}
    </span>
  )
}

// ─── Section Features ─────────────────────────────────────────
export default function CivitasFeatures() {
  const titleRef = useRef(null);
  const inView   = useInView(titleRef, { once: true, margin: "-60px" });

  return (
      <section id="services" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <div>
              <PixelIcon type="agents" size={40} />
              <div className="mt-4"><Tag>NOS DOMAINES D'INTERVENTION</Tag></div>
              <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
                {"Des solutions IA\nadaptées à l'Afrique."}
              </RevealText>
            </div>
            <p className="text-sm text-black/45 leading-relaxed max-w-xs">
              De l'Intelligence Artificielle à la formation numérique, CIVITAS accompagne chaque organisation dans sa transformation digitale avec des solutions concrètes et mesurables.
            </p>
          </div>

          <StackingAgentCards />
        </div>
      </section>
  );
}
