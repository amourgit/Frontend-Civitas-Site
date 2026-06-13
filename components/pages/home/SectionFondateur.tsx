import { ArtDecoSunburst } from "@/components/art-deco-sunburst"
import { ArtDecoDivider } from "@/components/art-deco-divider"
import { ServiceCard } from "@/components/service-card"
import { CTAForm } from "@/components/cta-form"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-24 overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full max-w-6xl mx-auto">
          {/* Photo */}
          <div className="relative order-1 lg:order-none">
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:max-w-none">
              {/* Decorative frame */}
              <div className="absolute -inset-3 border border-primary/30 rounded-2xl" />
              <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src="/images/moi6.png"
                  alt="Samuel NZILA, Fondateur de CIVITAS"
                  className="w-full h-full object-cover"
                />
                {/* Subtle gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
              </div>
              {/* Accent corner element */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-primary rounded-br-2xl -z-10" />
            </div>
          </div>

          {/* Text content */}
          <div className="text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-primary" />
                <div className="w-2.5 h-2.5 rotate-45 border border-primary" />
                <div className="w-12 h-px bg-primary" />
              </div>
            </div>

            <p className="text-primary tracking-[0.3em] uppercase text-sm mb-4">
              Février 2021
            </p>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-tight">
              <span className="text-gold-gradient">Samuel</span> NZILA
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-4">
              Jeune professionnel gabonais passionné par les technologies de l'information, l'innovation numérique, l'éducation et l'entrepreneuriat.
            </p>

            <p className="text-lg md:text-xl text-foreground font-medium leading-relaxed mb-10">
              Fondateur de <span className="text-gold-gradient font-semibold">CIVITAS</span>, la Start-up d'intégration de Solutions d'Intelligence Artificielle.
            </p>

            <div className="flex justify-center lg:justify-start">
              <div className="flex flex-col items-center lg:items-start gap-2">
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-primary to-primary" />
                <div className="w-2 h-2 rotate-45 bg-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
            <path
              d="M12 5v14M5 12l7 7 7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <ArtDecoDivider variant="stepped" />

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-primary tracking-[0.2em] uppercase text-sm mb-4">Notre Philosophie</p>
              <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-6 leading-tight text-balance">
                Où la Vision Rencontre l'Opportunité
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-muted-foreground leading-relaxed text-lg">
                Chez CIVITAS, nous croyons que chaque vision mérite d'être concrétisée et que chaque opportunité mérite d'être exploitée.
                Notre ambition est de devenir un partenaire stratégique de référence dans l'accompagnement des entreprises,
                des institutions et des entrepreneurs dans leur transformation numérique, leur croissance et leur innovation.
              </p>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Chez CIVITAS, nous croyons que l'Intelligence Artificielle n'est pas seulement une technologie,
                mais un levier de transformation capable de redéfinir la manière dont les entreprises travaillent, innovent et créent de la valeur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-6 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary tracking-[0.2em] uppercase text-sm mb-4">Nos Offres</p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground text-balance">Nos Trois Principes Fondamentaux</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard
              title="L'Innovation Utile"
              description="Chez CIVITAS, nous croyons que la technologie doit répondre à des besoins concrets. L'Intelligence Artificielle, l'automatisation ou toute autre innovation n'ont de valeur que lorsqu'elles résolvent un problème réel, améliorent la productivité ou créent de nouvelles opportunités."
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              }
            />
            <ServiceCard
              title="L'Excellence par l'Automatisation"
              description="Le temps est l'une des ressources les plus précieuses d'une organisation. Nous aidons nos clients à éliminer les tâches répétitives et à optimiser leurs processus grâce à l'automatisation intelligente."
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 6v6l4 2" />
                </svg>
              }
            />
            <ServiceCard
              title="La Croissance par l'Intelligence"
              description="Nous considérons l'Intelligence Artificielle comme un outil d'accompagnement et de développement. Son rôle est d'aider les entreprises à mieux comprendre leurs données, à prendre de meilleures décisions et à anticiper les opportunités de demain."
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
                  <path d="M5 17h14M6 9l2-4h8l2 4M4 14h16v3H4z" />
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <ArtDecoDivider variant="fan" />

          <div className="relative text-center py-12">
            {/* Quote decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-primary/20 font-serif text-9xl leading-none">
              &ldquo;
            </div>

            <blockquote className="relative z-10">
              <p className="font-serif text-2xl md:text-3xl text-foreground leading-relaxed italic mb-8">
                « Chaque grande réussite commence par une vision et le courage de passer à l'action. Chez CIVITAS,
                nous croyons que l'Intelligence Artificielle et l'automatisation ne remplacent pas l'humain :
                elles amplifient son potentiel. Osez innover, osez évoluer, et transformez vos idées en opportunités.
                L'avenir se construit aujourd'hui. »
              </p>
              <footer className="text-muted-foreground">
                <span className="text-primary">—</span> NZILA NGALA Amour Samuel,{" "}
                <span className="text-primary">Fondateur & CEO, CIVITAS</span>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>
    </main>
  )
}
