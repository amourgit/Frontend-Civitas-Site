"use client";

import { useEffect, useRef, useState } from "react";

const slides = [
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-RVGg3hAek9Wb1pROa2ynf6tpQSs6Ou.jpeg",
    alt: "BiltX Quotation Form",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-nDxoDG5KhztpouyyqZIHEHTBHYcC4O.jpeg",
    alt: "BiltX Bill Invoice List",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3-mECoILS7K4NoZLyZsMTP9muuuZkKth.jpeg",
    alt: "BiltX PDF Theme Color",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4-vn2XKbnB50acAvmrThzNhNtj4v7t97.jpeg",
    alt: "BiltX Dashboard",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5-5LfXnRmhU2RszXlR2iZRGwAxb9bwkQ.jpeg",
    alt: "BiltX Bilty LR List",
  },
];

// Scales per position slot
const SCALES  = [0.70, 0.84, 1.00, 0.84, 0.70];
const OPACITY = [0.38, 0.68, 1.00, 0.68, 0.38];
const BLUR    = [1.5,  0.5,  0,    0.5,  1.5 ];
const Z       = [10,   20,   30,   20,   10  ];

// xFactor is computed dynamically in the render loop from phone widths + a fixed gap

function getPositionIndex(slideIndex: number, active: number, total: number) {
  let diff = (slideIndex - active + total) % total;
  if (diff > total / 2) diff -= total;
  return Math.max(-2, Math.min(2, diff));
}

export default function PhoneSlider() {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const total = slides.length;

  // Measure container width
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      setContainerWidth(w);
      setIsMobile(w < 600);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const goTo = (index: number) => {
    setAnimating(true);
    setTimeout(() => {
      setActive((index + total) % total);
      setAnimating(false);
    }, 50);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      goTo(active + 1);
    }, 2800);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, total]);

  // On mobile: center phone takes 72% of container width, leaving room for nav buttons
  const BTN_SIZE = isMobile ? 32 : 40;
  const BTN_PAD  = BTN_SIZE + 8; // space reserved each side for nav buttons

  const phoneWidth = isMobile
    ? Math.min((containerWidth - BTN_PAD * 2) * 0.82, 240)
    : Math.min(containerWidth * 0.20, 210);
  const phoneHeight = phoneWidth * (460 / 220);

  // Overlap: how much each side phone slides behind the one in front
  const OVERLAP = isMobile ? phoneWidth * 0.55 : phoneWidth * 0.32;

  const halfCenter = (phoneWidth * SCALES[2]) / 2;
  const halfInner  = (phoneWidth * SCALES[1]) / 2;
  const halfOuter  = (phoneWidth * SCALES[0]) / 2;
  const xInner = halfCenter + halfInner - OVERLAP;
  const xOuter = xInner + halfInner + halfOuter - OVERLAP;

  const X_OFFSETS = [-xOuter, -xInner, 0, xInner, xOuter];

  // Visibility: on mobile show only center + inner (±1), hide outer (±2)
  const isSlotHidden = (posIdx: number) => isMobile && Math.abs(posIdx) === 2;

  if (containerWidth === 0) {
    return <div ref={containerRef} className="w-full" style={{ height: 480 }} />;
  }

  const NavBtn = ({
    dir,
    onClick,
  }: {
    dir: "prev" | "next";
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous slide" : "Next slide"}
      className="absolute top-1/2 -translate-y-1/2 z-50 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
      style={{
        width: BTN_SIZE,
        height: BTN_SIZE,
        [dir === "prev" ? "left" : "right"]: isMobile ? 4 : 8,
        background: "var(--phone-bg)",
        border: "1.5px solid var(--phone-border)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      }}
    >
      <svg width={isMobile ? 13 : 15} height={isMobile ? 13 : 15} viewBox="0 0 16 16" fill="none">
        {dir === "prev"
          ? <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          : <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        }
      </svg>
    </button>
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none"
      style={{ height: phoneHeight + 80, paddingTop: 32, paddingBottom: 48 }}
    >
      <NavBtn dir="prev" onClick={() => goTo(active - 1)} />
      <NavBtn dir="next" onClick={() => goTo(active + 1)} />

      <div className="absolute inset-0 flex items-center justify-center">
        {slides.map((slide, i) => {
          const posIdx  = getPositionIndex(i, active, total);
          const slot    = posIdx + 2;
          const xPx     = X_OFFSETS[slot];
          const hidden  = isSlotHidden(posIdx);

          return (
            <div
              key={slide.src}
              className="absolute"
              style={{
                transform: `translateX(${xPx}px) scale(${SCALES[slot]})`,
                transformOrigin: "center center",
                zIndex: Z[slot],
                opacity: hidden ? 0 : OPACITY[slot],
                pointerEvents: hidden ? "none" : "auto",
                filter: BLUR[slot] > 0 ? `blur(${BLUR[slot]}px)` : "none",
                transition: animating
                  ? "none"
                  : "transform 0.6s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.6s ease, filter 0.6s ease",
                willChange: "transform, opacity",
              }}
            >
              <Phone
                src={slide.src}
                alt={slide.alt}
                isCenter={posIdx === 0}
                width={phoneWidth}
                height={phoneHeight}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Phone({
  src,
  alt,
  isCenter,
  width,
  height,
}: {
  src: string;
  alt: string;
  isCenter: boolean;
  width: number;
  height: number;
}) {
  return (
    <div
      className="relative rounded-[1rem] overflow-hidden"
      style={{
        width,
        height,
        boxShadow: isCenter
          ? "0 0 0 6px var(--phone-border), 0 28px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.14)"
          : "0 0 0 5px var(--phone-border), 0 8px 24px rgba(0,0,0,0.14)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover object-top"
        crossOrigin="anonymous"
        draggable={false}
      />
    </div>
  );
}
