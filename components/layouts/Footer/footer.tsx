import { Background } from "@/components/background2";

import { Newsletter } from "@/components/newsletter";

export default function FooterSection({ className }: { className?: string }) {
  return (
    <div className={`min-h-[100vh] w-full ${className}`}>
      <div className="relative h-full w-full">
        <Background src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/alt-g7Cv2QzqL3k6ey3igjNYkM32d8Fld7.mp4" placeholder="/alt-placeholder.png" />
        <Newsletter />
        
      </div>
    </div>
  );
}
