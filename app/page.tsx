import { Button } from "@/components/ui/button"
import { Scale, Briefcase, Users, Bell, BarChart3, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Lexio</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-slate-700 hover:text-slate-900">
                Entrar
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white">Começar Grátis</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-5xl font-bold leading-tight text-slate-900">
            Gestão Jurídica Completa para Advogados Modernos
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Gerencie processos, clientes, prazos e finanças em uma única plataforma. Aumente sua produtividade e
            organização com automação inteligente.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white h-12 px-8">
                Começar Agora
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="h-12 px-8 border-slate-300 bg-transparent">
                Ver Recursos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Tudo que você precisa em um só lugar</h2>
          <p className="text-lg text-slate-600">Recursos poderosos para otimizar seu escritório jurídico</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Briefcase,
              title: "Gestão de Processos",
              description:
                "Acompanhe todos os seus processos com informações completas, andamentos e atualizações automáticas.",
            },
            {
              icon: Bell,
              title: "Controle de Prazos",
              description:
                "Nunca perca um prazo novamente com alertas automáticos e calendário integrado de audiências.",
            },
            {
              icon: Users,
              title: "CRM de Clientes",
              description: "Gerencie seus clientes, leads e relacionamentos de forma profissional e organizada.",
            },
            {
              icon: BarChart3,
              title: "Relatórios e Análises",
              description: "Visualize métricas importantes e tome decisões baseadas em dados do seu escritório.",
            },
            {
              icon: Shield,
              title: "Segurança Avançada",
              description: "Seus dados protegidos com criptografia e backup automático em nuvem.",
            },
            {
              icon: Zap,
              title: "Automação Inteligente",
              description: "Economize tempo com automações e integrações com tribunais e sistemas judiciais.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="rounded-2xl bg-slate-900 px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Pronto para transformar sua advocacia?</h2>
          <p className="text-xl text-slate-300 mb-8">Comece gratuitamente e veja como podemos ajudar</p>
          <Link href="/auth/sign-up">
            <Button size="lg" variant="secondary" className="h-12 px-8">
              Criar Conta Grátis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
                <Scale className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900">Lexio</span>
            </div>
            <p className="text-sm text-slate-600">© 2026 Lexio. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
