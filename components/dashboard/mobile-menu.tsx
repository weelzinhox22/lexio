"use client"

import { useState } from "react"
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
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Processos", href: "/dashboard/processes", icon: Briefcase },
  { name: "Clientes", href: "/dashboard/clients", icon: Users },
  { name: "Prazos", href: "/dashboard/deadlines", icon: Bell },
  { name: "Agenda", href: "/dashboard/calendar", icon: Calendar },
  { name: "Documentos", href: "/dashboard/documents", icon: FileText },
  { name: "Modelos", href: "/dashboard/templates", icon: FileStack },
  { name: "Consulta de Leis", href: "/dashboard/laws", icon: BookOpen },
  { name: "Leis Favoritas", href: "/dashboard/laws/favorites", icon: Star },
  { name: "Financeiro", href: "/dashboard/financial", icon: DollarSign },
  { name: "Leads", href: "/dashboard/leads", icon: UserCircle },
  { name: "Relatórios", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Assinatura", href: "/dashboard/subscription", icon: CreditCard },
  { name: "Configurações", href: "/dashboard/settings", icon: Settings },
]

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 lg:hidden overflow-y-auto">
            <div className="flex h-16 items-center justify-between gap-2 px-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
                  <Scale className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900">Themixa</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </>
      )}
    </>
  )
}

