"use client"

import { cn } from "@/lib/utils"
import { Step } from "./types"

interface StepNavigationProps {
  steps: Step[]
  activeStep: number
  goToStep: (index: number) => void
}

export function StepNavigation({ steps, activeStep, goToStep }: StepNavigationProps) {
  return (
    <nav className="relative flex flex-col gap-8 mx-auto lg:mx-0 max-w-xs" aria-label="Process steps">
      <div 
        className="absolute left-6 top-6 w-0.5 bg-muted" 
        style={{ height: 'calc(100% - 12px)', top: '6px' }} 
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
            <h3 className={cn(
              "text-lg font-semibold transition-colors duration-300",
              activeStep === index ? "text-foreground" : "text-muted-foreground",
            )}>
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{step.subtitle}</p>
          </div>
        </button>
      ))}
    </nav>
  )
}
