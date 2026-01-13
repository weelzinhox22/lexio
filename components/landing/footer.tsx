'use client'

import Link from 'next/link'
import { Scale, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'

const footerLinks = {
  produto: [
    { name: 'Funcionalidades', href: '#features' },
    { name: 'Preços', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Depoimentos', href: '#testimonials' },
  ],
  empresa: [
    { name: 'Sobre Nós', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Carreiras', href: '/careers' },
    { name: 'Contato', href: '/contact' },
  ],
  recursos: [
    { name: 'Documentação', href: '/docs' },
    { name: 'API', href: '/api' },
    { name: 'Integrações', href: '/integrations' },
    { name: 'Suporte', href: '/support' },
  ],
  legal: [
    { name: 'Termos de Uso', href: '/terms' },
    { name: 'Política de Privacidade', href: '/privacy' },
    { name: 'LGPD', href: '/lgpd' },
    { name: 'Cookies', href: '/cookies' },
  ],
}

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
]

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2 group/logo hover:opacity-80 transition-opacity">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 group-hover/logo:scale-110 transition-transform duration-300">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Themixa</span>
            </Link>
            <p className="mb-4 text-sm leading-relaxed text-slate-600">
              A solução completa para gestão jurídica moderna. Gerencie processos, clientes,
              prazos e finanças em uma única plataforma.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:scale-110 hover:shadow-md"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 font-semibold text-slate-900">Produto</h3>
            <ul className="space-y-2">
              {footerLinks.produto.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition-all hover:text-slate-900 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-900">Empresa</h3>
            <ul className="space-y-2">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition-all hover:text-slate-900 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-900">Recursos</h3>
            <ul className="space-y-2">
              {footerLinks.recursos.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition-all hover:text-slate-900 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-900">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition-all hover:text-slate-900 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 border-t border-slate-200 pt-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:gap-6">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:contato@themixa.com.br" className="hover:text-slate-900">
                  contato@themixa.com.br
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+5571991373142" className="hover:text-slate-900">
                  71 99137-3142
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Salvador, Bahia - Brasil</span>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Themixa. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

