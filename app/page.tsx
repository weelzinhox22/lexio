import { LandingHeader } from '@/components/landing/header'
import { WelcomeModal } from '@/components/landing/welcome-modal'
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { FeatureShowcase } from '@/components/landing/feature-showcase'
import { FAQSection } from '@/components/landing/faq-section'
import { Footer } from '@/components/landing/footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      <WelcomeModal />
      <main>
        <HeroSection />
        <FeaturesSection />
        <FeatureShowcase />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}
