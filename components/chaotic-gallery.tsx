"use client"

import { motion } from "framer-motion"


const items = [
  {
    id: 1,
    span: "col-span-12 md:col-span-6 lg:col-span-4",
    height: "h-[400px]",
    src: "/innovations/innovation5.jpeg",
    title: "Morning Mist",
  },
  {
    id: 2,
    span: "col-span-12 md:col-span-6 lg:col-span-8",
    height: "h-[400px]",
    src: "/innovations/innovation1.jpg",
    title: "High Altitude",
  },
  {
    id: 3,
    span: "col-span-12 md:col-span-4 lg:col-span-3",
    height: "h-[600px]",
    src: "/innovations/innovation7.jpeg",
    title: "Mirror",
  },
  {
    id: 4,
    span: "col-span-12 md:col-span-8 lg:col-span-6",
    height: "h-[600px]",
    src: "/images/moi8.png",
    title: "Stone Skin",
  },
  {
    id: 5,
    span: "col-span-12 md:col-span-12 lg:col-span-3",
    height: "h-[300px] lg:h-[600px]",
    src: "/innovations/innovation11.jpeg",
    title: "Details",
  },
  {
    id: 6,
    span: "col-span-12 md:col-span-6 lg:col-span-5",
    height: "h-[500px]",
    src: "/innovations/innovation9.jpeg",
    title: "Turbulence",
  },
  {
    id: 7,
    span: "col-span-12 md:col-span-6 lg:col-span-7",
    height: "h-[500px]",
    src: "/innovations/innovation8.jpeg",
    title: "Golden Hour",
  },
  {
    id: 8,
    span: "col-span-12 md:col-span-12 lg:col-span-12",
    height: "h-[700px]",
    src: "/innovations/innovation3.jpeg",
    title: "Cosmos",
  },
]

export function ChaoticGallery() {
  return (
    <section className="w-full px-4 md:px-12 py-24">
      <div className="grid grid-cols-12 gap-0 border-t border-l border-border">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            className={`${item.span} relative group border-r border-b border-border overflow-hidden bg-secondary/10 transition-colors hover:bg-secondary/30`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
          >
            <div className="w-full h-full p-4 md:p-8 flex flex-col">
              {/* Image Container */}
              <div className={`relative w-full ${item.height} overflow-hidden mb-4`}>
                <img
                  src={item.src || "/placeholder.svg"}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-105 grayscale hover:grayscale-0"
                />
                {/* Overlay Lines */}
                <div className="absolute inset-0 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>

              {/* Content */}
              <div className="mt-auto flex justify-between items-end">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                    0{item.id}
                  </span>
                  <h3 className="font-serif text-2xl md:text-3xl italic">{item.title}</h3>
                </div>
                <div className="w-8 h-[1px] bg-primary/50 group-hover:w-16 transition-all duration-300"></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* "Chaotic" decorative lines */}
      <div className="relative w-full h-24 mt-12 overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border"></div>
        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-border rotate-12 origin-top"></div>
        <div className="absolute top-0 right-1/3 w-[1px] h-full bg-border -rotate-6 origin-bottom"></div>
      </div>
    </section>
  )
}
