"use client"

import type React from "react"

import { useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

export const DirectionAwareHover = ({
  imageUrl,
  children,
  childrenClassName,
  imageClassName,
  className,
}: {
  imageUrl: string
  children: React.ReactNode | string
  childrenClassName?: string
  imageClassName?: string
  className?: string
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const [direction, setDirection] = useState<"top" | "bottom" | "left" | "right" | string>("left")

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return

    const direction = getDirection(event, ref.current)
    console.log("direction", direction)
    switch (direction) {
      case 0:
        setDirection("top")
        break
      case 1:
        setDirection("right")
        break
      case 2:
        setDirection("bottom")
        break
      case 3:
        setDirection("left")
        break
      default:
        setDirection("left")
        break
    }
  }

  const getDirection = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>, obj: HTMLElement) => {
    const { width: w, height: h, left, top } = obj.getBoundingClientRect()
    const x = ev.clientX - left - w / 2
    const y = ev.clientY - top - h / 2
    const d = Math.round(Math.atan2(y, x) / 1.57079633 + 5) % 4
    return d
  }

  return (
    <motion.div
      onMouseEnter={handleMouseEnter}
      ref={ref}
      className={cn("w-full h-full bg-transparent rounded-lg overflow-hidden group/card relative", className)}
    >
      <AnimatePresence mode="popLayout">
        <motion.div className="relative h-full w-full" initial="initial" whileHover={direction} exit="exit">
          <motion.div
            className="absolute inset-0 w-full h-full bg-gradient-to-b from-black/70 to-black/30 z-10"
            variants={overlayVariants}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
          />
          <motion.div
            variants={variants}
            className="h-full w-full relative bg-gray-50 dark:bg-black"
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
          >
            <img
              alt="image"
              className={cn("h-full w-full object-cover scale-[1.15]", imageClassName)}
              width="1000"
              height="1000"
              src={imageUrl || "/placeholder.svg"}
            />
          </motion.div>
          <motion.div
            variants={textVariants}
            transition={{
              duration: 0.5,
              ease: "easeOut",
            }}
            className={cn("text-white absolute bottom-4 left-4 z-40 drop-shadow-lg", childrenClassName)}
          >
            {children}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

const variants = {
  initial: {
    x: 0,
  },

  exit: {
    x: 0,
    y: 0,
  },
  top: {
    y: 20,
  },
  bottom: {
    y: -20,
  },
  left: {
    x: 20,
  },
  right: {
    x: -20,
  },
}

const textVariants = {
  initial: {
    y: 0,
    x: 0,
    opacity: 0,
  },
  exit: {
    y: 0,
    x: 0,
    opacity: 0,
  },
  top: {
    y: -20,
    opacity: 1,
  },
  bottom: {
    y: 2,
    opacity: 1,
  },
  left: {
    x: -2,
    opacity: 1,
  },
  right: {
    x: 20,
    opacity: 1,
  },
}

const overlayVariants = {
  initial: {
    opacity: 0,
  },
  exit: {
    opacity: 0,
  },
  top: {
    opacity: 1,
  },
  bottom: {
    opacity: 1,
  },
  left: {
    opacity: 1,
  },
  right: {
    opacity: 1,
  },
}
