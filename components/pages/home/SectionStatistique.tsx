"use client"

import { useState, useEffect } from "react"
import { Share2, Zap, Star, Sparkles, Award, Moon, Trophy, Cloud, CloudRain, CloudSun, CloudSunRain, MapPin, Sun } from "lucide-react"
import { Card, CardTitle } from "@/components/ui/card";

export default function SectionStatistique() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const promptProPercentage = 95

  const stats = [
    { value: 290, label: "PROMPTS" },
    { value: 21, label: "PROJECTS" },
    { value: 60, label: "DAYS ACTIVE" },
  ]

  const achievements = [
    { name: "Prompt Pro", icon: Zap },
    { name: "Dedicated", icon: Star },
    { name: "Tinkerer", icon: Sparkles },
    { name: "Creator", icon: Award },
    { name: "Night Owl", icon: Moon },
    { name: "Veteran", icon: Trophy },
  ]

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "My v0 Vibecheck 2025",
        text: "Check out my v0 year in review! 290 prompts, 21 projects, and 6 achievements unlocked.",
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  return (
    <div className="w-full  min-h-screen p-8">
        {/* Deep Ocean Glow */}

        <div className="grid w-full max-w-xl grid-cols-2 gap-4 mx-auto">
          {/* <Card className="mb-4 col-span-2 p-px text-center z-10 relative rounded-lg transistion overflow-hidden focus:outline-none">
            <span className="absolute inset-[-1000%] animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_45deg_at_50%_50%,#f64c18_0%,#ee9539_50%,#f64c18_100%)]"></span>
            <div
              className="flex flex-col z-10 justify-center relative rounded-lg w-full p-4 undefined"
              style={{
                background:
                  "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.05) 0%, transparent 40%), linear-gradient(120deg, #0f0e17 0%, #1a1b26 80%)",
              }}
            >
              <CardTitle className="text-gradient text-2xl">
                Border Cards with Animated Gradient
              </CardTitle>
            </div>
          </Card> */}
          {/* Hourly Forecast Card */}
          <Card className="col-span-2 p-px relative inline-flex shadow-lg transistion overflow-hidden focus:outline-none">
            <span className="absolute inset-[-1000%] animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_45deg_at_50%_50%,#080b11_0%,#1B1B26_80%,#0968e5_100%)]"></span>
            <div
              className="flex flex-col z-10 p-8 justify-center rounded-xl h-full w-full backdrop-blur-3xl undefined"
              style={{
                background:
                  "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.05) 0%, transparent 40%), linear-gradient(120deg, #0f0e17 0%, #1a1b26 100%)",
              }}
            >
              <div className="relative z-20 flex justify-between text-white text-sm font-medium">
                <div className=" flex flex-col items-center gap-2 ">
                  <span>16:00</span>
                  <Cloud className="h-6 w-6 fill-white" />
                  <span>+18°</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span>17:00</span>
                  <Cloud className="h-6 w-6 fill-white" />
                  <span>+18°</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span>18:00</span>
                  <CloudRain className="h-6 w-6" />
                  <span>+16°</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span>19:00</span>
                  <CloudRain className="h-6 w-6" />
                  <span>+14°</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span>20:00</span>
                  <CloudSun className="h-6 w-6 fill-white" />
                  <span>+15°</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span>21:00</span>
                  <CloudSunRain className="h-6 w-6" />
                  <span>+14°</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Current Weather Card */}
          <Card className="z-10 rounded-xl p-0.5 relative inline-flex shadow-lg transistion overflow-hidden focus:outline-none">
            <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_45deg_at_50%_50%,#080b11_0%,#172033_80%,#fff_100%)]"></span>
            <div className=" z-30 flex flex-col bg-linear-to-r from-[#050507] via-[#1B1B26] to-[#0d0e14] rounded-xl items-center justify-center h-full w-full undefined text-white">
              <div className="text-6xl font-semibold">+18°C</div>
              <div className="text-lg">Cloudy +18°/+5°</div>
            </div>
          </Card>

          {/* Time and Location Card */}
          <Card className="relative inline-flex z-10 rounded-2xl p-0.5 transistion overflow-hidden focus:outline-none outline-2 outline-[#21222C]">
            <span className="absolute -inset-full animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_120deg_at_50%_50%,#080b11_0%,#172033_70%,#e86705_90%)]"></span>
            <div className="relative p-3 flex flex-col bg-linear-to-r from-[#1A1B26] via-[#1B1B26] to-[#21222C] items-center justify-center rounded-2xl h-full w-full text-white">
              <div className="text-5xl font-semibold">17:32</div>
              <div className="text-lg">Sun, November 19</div>
              <button className="mt-4 inline-flex items-center gap-1 rounded-full bg-black/10 backdrop-blur-xl px-2 py-1 text-sm font-medium">
                <MapPin className="h-4 w-4" />
                Tbilisi
              </button>
            </div>
          </Card>

          {/* Daily Forecast Card */}
          <Card className="relative col-span-2 rounded-2xl p-0.5 transistion overflow-hidden focus:outline-none outline-2 outline-[#21222C]">
            <span className="absolute -inset-full animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_120deg_at_50%_50%,#adfda2_0%,#11d3f3_50%,#2278fb_100%)]"></span>
            <div
              className="relative z-30 flex flex-col justify-center p-5 gap-4 rounded-2xl h-full w-full text-white"
              style={{
                background:
                  "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.05) 0%, transparent 40%), linear-gradient(120deg, #0f0e17 0%, #1a1b26 100%)",
              }}
            >
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Sun className="h-6 w-6 fill-white" />
                  <span>Tue, 7 Sep</span>
                </div>
                <span className="text-lg">+18°/+4°</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="h-6 w-6 fill-white" />
                  <span>Wed, 8 Sep</span>
                </div>
                <span className="text-lg">+20°/+6°</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CloudRain className="h-6 w-6" />
                  <span>Thu, 9 Sep</span>
                </div>
                <span className="text-lg">+17°/+3°</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="h-6 w-6 fill-white" />
                  <span>Fri, 10 Sep</span>
                </div>
                <span className="text-lg">+22°/+10°</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CloudRain className="h-6 w-6" />
                  <span>Sat, 11 Sep</span>
                </div>
                <span className="text-lg">+16°/+5°</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
  )
}

function CountUpNumber({ target, delay = 0 }: { target: number; delay?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const duration = 1500
      const steps = 40
      const increment = target / steps
      const stepDuration = duration / steps

      let currentStep = 0
      const timer = setInterval(() => {
        currentStep++
        if (currentStep <= steps) {
          setCount(Math.floor(increment * currentStep))
        } else {
          setCount(target)
          clearInterval(timer)
        }
      }, stepDuration)

      return () => clearInterval(timer)
    }, delay)

    return () => clearTimeout(timeout)
  }, [target, delay])

  return <>{count}</>
}
