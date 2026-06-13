"use client"

import { useState, useEffect, useRef } from "react"

import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import { steps } from "./data"

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-advance steps
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length)
      }, 5000) // Change step every 5 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPaused])

  // Pause animation on hover or focus
  const pauseAnimation = () => setIsPaused(true)
  const resumeAnimation = () => setIsPaused(false)

  // Handle manual step change
  const goToStep = (index: number) => {
    setActiveStep(index)
    pauseAnimation()
  }

  // Navigation controls
  const goToPrevStep = () => {
    setActiveStep((prev) => (prev - 1 + steps.length) % steps.length)
    pauseAnimation()
  }

  const goToNextStep = () => {
    setActiveStep((prev) => (prev + 1) % steps.length)
    pauseAnimation()
  }

  return (
    <section
      className="flex justify-center items-center py-20 bg-background w-full bg-transparent backdrop-blur-sm"
      aria-labelledby="how-it-works-title"
      onMouseEnter={pauseAnimation}
      onMouseLeave={resumeAnimation}
      onFocus={pauseAnimation}
      onBlur={resumeAnimation}
    >
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 id="how-it-works-title" className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Comment nous accompagnons votre transformation ?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Notre approche structurée permet d'identifier les meilleures opportunités d'intégration de l'intelligence artificielle, de déployer des solutions adaptées et d'assurer leur succès sur le long terme.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_2fr] gap-8 items-center">
          <nav className="relative flex flex-col gap-8 mx-auto lg:mx-0 max-w-xs" aria-label="Process steps">
            <div
              className="absolute left-6 top-6 w-0.5 bg-muted"
              style={{
                height: "calc(100% - 12px)",
                top: "6px",
              }}
              aria-hidden="true"
            />

            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={cn(
                  "relative flex items-start gap-4 text-left transition-all duration-300 group",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md p-2",
                  activeStep === index ? "opacity-100" : "opacity-60 hover:opacity-80",
                )}
                aria-current={activeStep === index ? "step" : undefined}
              >
                <div
                  className={cn(
                    "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2",
                    "transition-colors duration-300",
                    activeStep === index
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted bg-background group-hover:border-primary/70",
                  )}
                  aria-hidden="true"
                >
                  <span className="text-lg font-medium">{step.id}</span>
                </div>

                <div className="pt-1.5">
                  <h3
                    className={cn(
                      "text-lg font-semibold transition-colors duration-300",
                      activeStep === index ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{step.subtitle}</p>
                </div>
              </button>
            ))}
          </nav>

          <div className="relative overflow-hidden rounded-xl border bg-background p-6 shadow-sm min-h-[500px]">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "grid md:grid-cols-2 gap-8 transition-all duration-500 absolute inset-0 p-8",
                  activeStep === index
                    ? "translate-x-0 opacity-100"
                    : activeStep > index
                      ? "-translate-x-full opacity-0"
                      : "translate-x-full opacity-0",
                )}
                aria-hidden={activeStep !== index}
                id={`step-content-${step.id}`}
              >
                <div className="flex flex-col justify-center">
                  <h4 className="text-2xl font-semibold mb-4">{step.title}</h4>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{step.subtitle}</p>
                  <ul className="space-y-3">
                    {step.description.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5 flex-shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </span>
                        <span className="text-base">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-center h-full">
                  <img
                    src={step.image || "/placeholder.svg"}
                    alt={step.imageAlt}
                    width={500}
                    height={600}
                    className="rounded-lg object-cover h-[80%] w-auto"
                  />
                </div>
              </div>
            ))}

            <div className="absolute bottom-6 right-6 flex gap-3">
              <button
                onClick={goToPrevStep}
                className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors shadow-sm"
                aria-label="Previous step"
              >
                <ChevronUp className="h-5 w-5" />
              </button>
              <button
                onClick={goToNextStep}
                className="p-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors shadow-sm"
                aria-label="Next step"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-6 lg:hidden">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => goToStep(index)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-colors",
                activeStep === index ? "bg-primary" : "bg-muted hover:bg-primary/50",
              )}
              aria-label={`Go to step ${index + 1}`}
              aria-current={activeStep === index ? "step" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
