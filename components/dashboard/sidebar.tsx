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
  FileEdit,
  Clock,
  Bot,
  BookOpen,
  Star,
  Shield,
  KanbanSquare,
  Sparkles,
  BrainCircuit,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Processos", href: "/dashboard/processes", icon: Briefcase },
  { name: "Kanban (Visual)", href: "/dashboard/kanban", icon: KanbanSquare },
  { name: "Clientes", href: "/dashboard/clients", icon: Users },
  { name: "Prazos", href: "/dashboard/deadlines", icon: Bell },
  { name: "Agenda", href: "/dashboard/calendar", icon: Calendar },
  { name: "Documentos", href: "/dashboard/documents", icon: FileText },
  { name: "Templates", href: "/dashboard/templates", icon: FileEdit },
  { name: "Redator IA", href: "/dashboard/ai-writer", icon: Sparkles },
  { name: "Análise Jurimétrica", href: "/dashboard/ai-analysis", icon: BrainCircuit },
  { name: "Timesheet", href: "/dashboard/timesheet", icon: Clock },
  { name: "Consulta de Leis", href: "/dashboard/laws", icon: BookOpen },
  { name: "Leis Favoritas", href: "/dashboard/laws/favorites", icon: Star },
  { name: "Financeiro", href: "/dashboard/financial", icon: DollarSign },
  { name: "Leads", href: "/dashboard/leads", icon: UserCircle },
  { name: "Relatórios", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Assinatura", href: "/dashboard/subscription", icon: CreditCard },
  { name: "Configurações", href: "/dashboard/settings", icon: Settings },
  { name: "Treinamento IA", href: "/dashboard/settings/ai-training", icon: Bot },
  { name: "Painel Admin", href: "/dashboard/admin/users", icon: Shield },
  { name: "Avisos (Admin)", href: "/dashboard/admin/notifications", icon: Bot },
]

interface DashboardSidebarProps {
  isAdmin?: boolean;
}

export function DashboardSidebar({ isAdmin = false }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="fixed inset-y-0 z-50 flex w-64 flex-col bg-white border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] hidden lg:flex">
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-100 shrink-0">
        <Link href="/" className="flex items-center gap-2 group/logo hover:opacity-80 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 shrink-0 shadow-sm group-hover/logo:scale-105 group-hover/logo:shadow-md transition-all duration-300">
            <Scale className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight truncate">Themixa</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto min-w-0 font-medium">
        {navigation.map((item) => {
          if ((item.name === "Treinamento IA" || item.name === "Painel Admin" || item.name === "Avisos (Admin)") && !isAdmin) return null;

          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 min-w-0",
                isActive
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
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
  )
}
