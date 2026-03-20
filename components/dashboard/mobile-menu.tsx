"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { X, Menu, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { navigationGroups } from "./nav-config"

interface MobileMenuProps {
  isAdmin?: boolean
}

export function MobileMenu({ isAdmin = false }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevenir scroll do body quando menu está aberto
  useEffect(() => {
    if (isOpen && !isClosing) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, isClosing])

  const handleOpen = () => {
    setIsClosing(false)
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 300) // Aguarda animação terminar
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpen}
        className="lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {isOpen && mounted && createPortal(
        <>
          {/* Backdrop com fade */}
          <div
            className={cn(
              "fixed inset-0 bg-black/50 z-50 lg:hidden transition-opacity duration-300",
              isClosing ? "opacity-0" : "opacity-100"
            )}
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Menu lateral com slide */}
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-[100] w-72 bg-white border-r border-slate-200/60 shadow-2xl lg:hidden flex flex-col transform transition-transform duration-300 ease-in-out",
              isClosing ? "-translate-x-full" : "translate-x-0"
            )}
          >
            <div className="flex h-16 items-center justify-between gap-2 px-6 border-b border-slate-100 bg-white shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 shrink-0 shadow-sm">
                  <Scale className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">Themixa</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="hover:bg-slate-100 rounded-full h-8 w-8"
                aria-label="Fechar menu"
              >
                <X className="h-4 w-4 text-slate-500" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto w-full pb-8">
              <nav className="space-y-4 px-4 py-6 font-medium">
                {navigationGroups.map((group, groupIdx) => {
                  if (group.category === "Acesso Admin" && !isAdmin) return null;

                  return (
                    <div key={group.category}>
                      <h3 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {group.category}
                      </h3>
                      <div className="space-y-1">
                        {group.items.map((item, index) => {
                          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))

                          // Animation base delay scaling with group and item index
                          const animationDelay = (groupIdx * 100) + (index * 30)

                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={handleClose}
                              className={cn(
                                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 min-w-0",
                                "transform hover:translate-x-1",
                                isActive
                                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              )}
                              style={{
                                animationDelay: `${animationDelay}ms`,
                                animation: !isClosing ? 'slideInLeft 0.3s ease-out forwards' : 'none',
                                opacity: !isClosing ? 0 : 1, // Start invisible before animation
                              }}
                            >
                              <item.icon className={cn(
                                "h-4 w-4 shrink-0 transition-transform duration-200",
                                isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700",
                                !isActive && "group-hover:scale-110"
                              )} />
                              <span className="truncate">{item.name}</span>
                              {isActive && (
                                <div className="ml-auto w-1 h-3 bg-white/20 rounded-full" />
                              )}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </nav>
            </div>
          </div>
        </>,
        document.body
      )}

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  )
}

