"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

export function Title() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [0, 200])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden px-4 md:px-12 pt-24 pb-12">
      {/* Background Parallax Element */}
      <div className="z-10 w-full max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-center">
        <motion.div
          className="col-span-1 md:col-span-8 md:col-start-2"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
        <h1 className="font-serif text-[12vw] md:text-[10vw] leading-[0.85] tracking-tighter text-black dark:text-white">
            INNOVER <br />
            <span className="italic font-light ml-[10vw] md:ml-[15vw]">POUR L'AFRIQUE</span>
          </h1>
        </motion.div>

        <motion.div
          className="col-span-1 md:col-span-3 md:col-start-9 mt-8 md:mt-0 flex flex-col gap-6"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
        >
          <p className="text-sm md:text-base font-light text-gray-700 dark:text-gray-300 max-w-xs leading-relaxed">
            L'Intelligence Artificielle est le plus grand levier de développement économique et social du continent africain. Avec CIVITAS, chaque organisation peut en tirer pleinement parti.
          </p>
          <div className="h-[1px] w-24 bg-gray-400 dark:bg-gray-600"></div>
          <p className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400">Fondée au Gabon — Libreville 2021</p>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
      >
        <span className="text-[10px] uppercase tracking-widest text-gray-600 dark:text-gray-400">Scroll</span>
        <div className="w-[1px] h-12 bg-gray-400 dark:bg-gray-600"></div>
      </motion.div>
    </section>
  )
}
