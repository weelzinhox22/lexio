'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Scale, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Funcionalidades', href: '#features' },
    { name: 'Preços', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm'
          : 'bg-transparent',
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 group/logo hover:opacity-80 transition-opacity">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 group-hover/logo:scale-110 transition-transform duration-300">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">Themixa</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-700 transition-all hover:text-slate-900 hover:scale-105 relative group"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-900 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all">
              Entrar
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button className="bg-slate-900 hover:bg-slate-800 hover:scale-105 hover:shadow-lg transition-all duration-300 text-white">
              Começar grátis
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="container mx-auto flex flex-col gap-4 px-6 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
              >
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4">
              <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Entrar
                </Button>
              </Link>
              <Link href="/auth/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                  Começar grátis
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

