'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    const onScroll = () => {
      window.requestAnimationFrame(handleScroll)
    }

    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { name: 'Funcionalidades', href: '#features' },
    { name: 'Como funciona', href: '#how-it-works' },
    { name: 'Depoimentos', href: '#testimonials' },
    { name: 'Preços', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ease-out w-full',
        isScrolled ? 'pt-4 px-4 sm:px-6 lg:px-8' : 'pt-6 px-6 lg:px-10'
      )}
    >
      <div
        className={cn(
          'relative flex items-center justify-between w-full transition-all duration-500 ease-out',
          isScrolled
            ? 'max-w-6xl h-16 rounded-full border border-white/50 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-6'
            : 'max-w-7xl h-16 bg-transparent px-2'
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group/logo hover:opacity-80 transition-opacity">
          <img
            src="/logo.png"
            alt="Themixa Logo"
            className="h-10 md:h-14 w-auto drop-shadow-sm group-hover/logo:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 relative">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all rounded-full px-6">
              Entrar
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button className="rounded-full bg-slate-900 px-6 text-sm font-semibold hover:bg-slate-800 hover:scale-105 hover:shadow-lg transition-all duration-300 text-white">
              Começar grátis
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 hover:text-slate-900 md:hidden transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Mobile Nav Dropdown */}
        <div
          className={cn(
            "absolute left-0 right-0 top-full mt-4 rounded-2xl border border-slate-200/50 bg-white/95 backdrop-blur-2xl p-6 shadow-2xl md:hidden transition-all duration-300 origin-top",
            isMobileMenuOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
          )}
        >
          <div className="flex flex-col gap-6">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
              <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-full h-12 text-base font-semibold border-slate-300 text-slate-700">
                  Entrar na conta
                </Button>
              </Link>
              <Link href="/auth/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full rounded-full h-12 bg-slate-900 hover:bg-slate-800 text-white text-base font-semibold">
                  Começar grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

