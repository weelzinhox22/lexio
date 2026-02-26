"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { X, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Scale,
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  FileText,
  DollarSign,
  Bell,
  BarChart3,
  Settings,
  UserCircle,
  CreditCard,
  BookOpen,
  FileStack,
  Star,
  Clock,
  Bot,
  Shield,
  KanbanSquare,
  Sparkles,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Processos", href: "/dashboard/processes", icon: Briefcase },
  { name: "Kanban (Visual)", href: "/dashboard/kanban", icon: KanbanSquare },
  { name: "Clientes", href: "/dashboard/clients", icon: Users },
  { name: "Prazos", href: "/dashboard/deadlines", icon: Bell },
  { name: "Agenda", href: "/dashboard/calendar", icon: Calendar },
  { name: "Documentos", href: "/dashboard/documents", icon: FileText },
  { name: "Modelos", href: "/dashboard/templates", icon: FileStack },
  { name: "Redator IA", href: "/dashboard/ai-writer", icon: Sparkles },
  { name: "Consulta de Leis", href: "/dashboard/laws", icon: BookOpen },
  { name: "Leis Favoritas", href: "/dashboard/laws/favorites", icon: Star },
  { name: "Timesheet", href: "/dashboard/timesheet", icon: Clock },
  { name: "Financeiro", href: "/dashboard/financial", icon: DollarSign },
  { name: "Leads", href: "/dashboard/leads", icon: UserCircle },
  { name: "Relatórios", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Assinatura", href: "/dashboard/subscription", icon: CreditCard },
  { name: "Configurações", href: "/dashboard/settings", icon: Settings },
  { name: "Treinamento IA", href: "/dashboard/settings/ai-training", icon: Bot },
  { name: "Painel Admin", href: "/dashboard/admin/users", icon: Shield },
  { name: "Avisos (Admin)", href: "/dashboard/admin/notifications", icon: Bot },
]

interface MobileMenuProps {
  isAdmin?: boolean
}

export function MobileMenu({ isAdmin = false }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const pathname = usePathname()

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

      {isOpen && (
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
              "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/60 shadow-2xl lg:hidden flex flex-col transform transition-transform duration-300 ease-in-out",
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

            <div className="flex-1 overflow-y-auto w-full">
              <nav className="space-y-1.5 px-4 py-6 font-medium">
                {navigation.map((item, index) => {
                  if ((item.name === "Treinamento IA" || item.name === "Painel Admin" || item.name === "Avisos (Admin)") && !isAdmin) return null;

                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={handleClose}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-200 min-w-0",
                        "transform hover:translate-x-1",
                        isActive
                          ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                      style={{
                        animationDelay: `${index * 30}ms`,
                        animation: !isClosing ? 'slideInLeft 0.3s ease-out forwards' : 'none',
                      }}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 shrink-0 transition-transform duration-200",
                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700",
                        !isActive && "group-hover:scale-110"
                      )} />
                      <span className="truncate">{item.name}</span>
                      {isActive && (
                        <div className="ml-auto w-1 h-4 bg-white/20 rounded-full" />
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </>
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

