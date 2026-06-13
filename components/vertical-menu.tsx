"use client"

import { useState } from "react"
import { Home, MessageCircle, User, Settings, Bell } from "lucide-react"

const menuItems = [
  { id: "home", icon: Home, label: "Accueil", href: "https://example.com" },
  { id: "messages", icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/241xxxxxxxx" },
  { id: "profile", icon: User, label: "LinkedIn", href: "https://linkedin.com/company/civitas" },
  { id: "notifications", icon: Bell, label: "Facebook", href: "https://facebook.com/civitas" },
  { id: "settings", icon: Settings, label: "Contact", href: "mailto:contact@civitas.ga" },
]

export default function VerticalMenu() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isMouseOverMenu, setIsMouseOverMenu] = useState(false)

  const getHoveredIndex = () => {
    if (!hoveredItem) return -1
    return menuItems.findIndex((item) => item.id === hoveredItem)
  }

  const itemHeight = 56
  const menuPaddingTop = 12

  const indicatorTopPosition = hoveredItem ? getHoveredIndex() * itemHeight + menuPaddingTop - 12 : 0
  const translateXValue = hoveredItem && isMouseOverMenu ? 8 : 0

  return (
    <div className="fixed bottom-[48px] left-0 h-auto flex items-center justify-start w-auto z-50">
      {/* Menú vertical: estado cerrado/abierto */}
      <div
        className={`
          relative flex flex-col bg-transparent backdrop-blur-sm rounded-2xl p-3 shadow-xl overflow-visible
          transition-all duration-500 ease-out
          ${isMouseOverMenu
            ? "translate-x-[3px] opacity-100"
            : "-translate-x-1/2 opacity-50"}
        `}
        onMouseEnter={() => setIsMouseOverMenu(true)}
        onMouseLeave={() => {
          setIsMouseOverMenu(false)
          setHoveredItem(null)
        }}
      >
        {/* Indicador que se mueve */}
        <div
          className={`
            absolute left-[12px] w-[48px] h-[48px] bg-blue-600 rounded-xl
            transition-all duration-500 ease-out z-20
            ${hoveredItem ? "opacity-100" : "opacity-0"}
          `}
          style={{
            transform: `translateY(${indicatorTopPosition}px) translateX(${translateXValue}px)`,
          }}
        ></div>

        {menuItems.map((item, index) => {
          const IconComponent = item.icon
          const isHovered = hoveredItem === item.id

          return (
            <div key={item.id} className="relative flex items-center mb-2 last:mb-0">
              {/* Lien cliquable */}
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  relative p-3 rounded-xl transition-all duration-500 ease-out z-30
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  transform hover:scale-105
                  ${isHovered ? `text-white bg-transparent` : "text-gray-300 hover:bg-gray-700"}
                  ${isHovered && isMouseOverMenu ? "translate-x-2" : "translate-x-0"}
                `}
              >
                <IconComponent size={24} />
              </a>

              {/* Label qui apparaît au survol */}
              <div
                className={`
                  absolute left-full ml-3 whitespace-nowrap z-30
                  transition-all duration-300 ease-out
                  ${
                    isHovered && isMouseOverMenu
                      ? "opacity-100 translate-x-0 scale-100 pointer-events-auto"
                      : "opacity-0 translate-x-4 scale-95 pointer-events-none"
                  }
                `}
              >
                <div
                  className={`
                    bg-white rounded-lg px-4 py-2 shadow-lg border relative
                    transition-all duration-300 ease-out transform
                    ${isHovered ? "shadow-xl scale-100" : "shadow-md scale-95"}
                  `}
                >
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
                    <div className="w-2 h-2 bg-white border-l border-b border-gray-200 transform rotate-45"></div>
                  </div>

                  <span className="text-gray-800 font-medium text-sm">{item.label}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}