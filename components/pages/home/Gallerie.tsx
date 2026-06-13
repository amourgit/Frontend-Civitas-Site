import { Title } from "@/components/title-gallery"
import { ChaoticGallery } from "@/components/chaotic-gallery"

export default function Gallerie() {
  return (
    <main className="min-h-screen bg-background text-black selection:bg-primary selection:text-primary-foreground">
      <Title />
      <ChaoticGallery />
    </main>
  )
}