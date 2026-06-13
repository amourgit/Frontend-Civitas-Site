"use client"

import Image from "next/image"
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Step } from "./types"

interface StepContentProps {
  steps: Step[]
  activeStep: number
  goToPrevStep: () => void
  goToNextStep: () => void
}

export function StepContent({ steps, activeStep, goToPrevStep, goToNextStep }: StepContentProps) {
  return (
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
            <Image
              src={step.image || "/placeholder.svg"}
              alt={step.imageAlt}
              width={500}
              height={600}
              className="rounded-lg object-cover h-[80%] w-auto"
              priority={index === 0}
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
  )
}
