"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button - será adicionado no header */}
      <div className="hidden lg:flex fixed inset-y-0 z-50 w-64 flex-col bg-white border-r border-slate-200">
        <div className="flex h-16 items-center gap-2 px-4 md:px-6 border-b border-slate-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 shrink-0">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg md:text-xl font-bold text-slate-900 truncate">Themixa</span>
        </div>
        <nav className="flex-1 space-y-1 px-2 md:px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2 md:gap-3 rounded-lg px-2 md:px-3 py-2 text-xs md:text-sm font-medium transition-colors",
                isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <item.icon className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
        </nav>
      </div>
    </>
  )
}
