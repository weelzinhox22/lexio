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
  MessageSquare,
  Heart,
  Landmark,
  ShoppingCart,
  Search,
} from "lucide-react"

const navigationGroups = [
  {
    category: "Gestão Diária",
    items: [
      { name: "Painel Principal", href: "/dashboard", icon: LayoutDashboard },
      { name: "Processos", href: "/dashboard/processes", icon: Briefcase },
      { name: "Kanban (Visual)", href: "/dashboard/kanban", icon: KanbanSquare },
      { name: "Prazos", href: "/dashboard/deadlines", icon: Bell },
      { name: "Agenda", href: "/dashboard/calendar", icon: Calendar },
    ],
  },
  {
    category: "Inteligência & IA",
    items: [
      { name: "Análise Jurimétrica", href: "/dashboard/ai-analysis", icon: BrainCircuit },
      { name: "Redator IA", href: "/dashboard/ai-writer", icon: Sparkles },
      { name: "Consulta de Leis", href: "/dashboard/laws", icon: BookOpen },
    ],
  },
  {
    category: "Clientes & Arquivos",
    items: [
      { name: "Clientes", href: "/dashboard/clients", icon: Users },
      { name: "Documentos", href: "/dashboard/documents", icon: FileText },
      { name: "Templates", href: "/dashboard/templates", icon: FileEdit },
      { name: "Leads (CRM)", href: "/dashboard/leads", icon: UserCircle },
    ],
  },
  {
    category: "Ferramentas",
    items: [
      { name: "Execução Penal", href: "/dashboard/criminal/calculator", icon: Scale },
      { name: "Divórcio & Partilha", href: "/dashboard/family/partilha", icon: Heart },
      { name: "Cálculo de Herança", href: "/dashboard/family/heritage", icon: Landmark },
      { name: "Repetição de Indébito", href: "/dashboard/consumer/indebito", icon: ShoppingCart },
      { name: "Simulador Danos Morais", href: "/dashboard/consumer/damages", icon: Scale },
      { name: "Timesheet", href: "/dashboard/timesheet", icon: Clock },
      { name: "Leis Favoritas", href: "/dashboard/laws/favorites", icon: Star },
    ],
  },
  {
    category: "Administrativo",
    items: [
      { name: "Financeiro", href: "/dashboard/financial", icon: DollarSign },
      { name: "Relatórios", href: "/dashboard/reports", icon: BarChart3 },
      { name: "Assinatura", href: "/dashboard/subscription", icon: CreditCard },
      { name: "Configurações", href: "/dashboard/settings", icon: Settings },
    ],
  },
  {
    category: "Acesso Admin",
    items: [
      { name: "Treinamento IA", href: "/dashboard/settings/ai-training", icon: Bot },
      { name: "Painel de Usuários", href: "/dashboard/admin/users", icon: Shield },
      { name: "Sugestões", href: "/dashboard/admin/suggestions", icon: MessageSquare },
      { name: "Avisos (Admin)", href: "/dashboard/admin/notifications", icon: Bot },
      { name: "Teste API DataJud", href: "/dashboard/admin/datajud-test", icon: BarChart3 },
      { name: "Teste Busca OAB", href: "/dashboard/admin/oab-test", icon: Search },
    ],
  },
  {
    category: "Jurídico & Compliance",
    items: [
      { name: "Privacidade", href: "/privacy", icon: Shield },
      { name: "Termos de Uso", href: "/terms", icon: FileText },
      { name: "LGPD", href: "/lgpd", icon: Shield },
      { name: "Cookies", href: "/cookies", icon: Shield },
    ],
  },
]

interface DashboardSidebarProps {
  isAdmin?: boolean;
}

export function DashboardSidebar({ isAdmin = false }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="fixed inset-y-0 z-50 flex w-64 flex-col bg-white border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] hidden lg:flex">
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-100 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 group/logo hover:opacity-80 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 shrink-0 shadow-sm group-hover/logo:scale-105 group-hover/logo:shadow-md transition-all duration-300">
            <Scale className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight truncate">Themixa</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 overflow-y-auto min-w-0 pb-16 custom-scrollbar">
        {navigationGroups.map((group, groupIdx) => {
          // Hide admin group if not admin
          if (group.category === "Acesso Admin" && !isAdmin) return null;

          return (
            <div key={group.category} className={groupIdx > 0 ? "mt-6" : ""}>
              <h3 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {group.category}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 min-w-0",
                        isActive
                          ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
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
  )
}
