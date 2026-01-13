import { LandingHeader } from '@/components/landing/header'
import { WelcomeModal } from '@/components/landing/welcome-modal'
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { PricingTeaserSection } from '@/components/landing/pricing-teaser-section'
import { CTAFinalSection } from '@/components/landing/cta-final-section'
import { FeatureShowcase } from '@/components/landing/feature-showcase'
import { FAQSection } from '@/components/landing/faq-section'
import { Footer } from '@/components/landing/footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Themixa - Gestão Jurídica Inteligente | Nunca Mais Perda um Prazo',
  description: 'Sistema completo para gestão de escritórios jurídicos. Controle de prazos, processos, clientes e finanças. Alertas automáticos por e-mail. Comece grátis.',
  keywords: 'gestão jurídica, controle de prazos, software advocacia, escritório jurídico, alertas processuais',
  openGraph: {
    title: 'Themixa - Gestão Jurídica Inteligente',
    description: 'Nunca mais perca um prazo. Sistema completo para gestão de escritórios jurídicos.',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      <WelcomeModal />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingTeaserSection />
        <FeatureShowcase />
        <FAQSection />
        <CTAFinalSection />
      </main>
      <Footer />
    </div>
  )
}
