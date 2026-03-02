"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Scale,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useSidebar } from "./sidebar-provider"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { navigationGroups } from "./nav-config"
import { useInternPermissions, HREF_TO_PERMISSION } from "@/lib/hooks/use-intern-permissions"

interface DashboardSidebarProps {
  isAdmin?: boolean
}

export function DashboardSidebar({ isAdmin = false }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const { permissions, isIntern } = useInternPermissions()

  // Filter nav items based on intern permissions
  const canAccess = (href: string): boolean => {
    // Non-interns have full access
    if (!isIntern || !permissions) return true
    // Interns never see admin section or interns management
    if (href.startsWith('/dashboard/admin') || href.startsWith('/dashboard/settings/ai-training')) return false
    if (href === '/dashboard/interns') return false
    // Check the permission map
    const permKey = HREF_TO_PERMISSION[href]
    if (!permKey) return true // If no mapping, allow by default
    return permissions[permKey] === true
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out hidden lg:flex",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 shrink-0 overflow-hidden">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 group/logo hover:opacity-80 transition-all duration-300",
            isCollapsed && "mx-auto"
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 shrink-0 shadow-sm group-hover/logo:scale-105 group-hover/logo:shadow-md transition-all duration-300">
            <Scale className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold text-slate-900 tracking-tight truncate animate-in fade-in slide-in-from-left-2 duration-300">
              Themixa
            </span>
          )}
        </Link>
      </div>

      {/* Nav Content */}
      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 px-3 py-4 overflow-y-auto min-w-0 pb-16 custom-scrollbar overflow-x-hidden">
          {navigationGroups.map((group, groupIdx) => {
            if (group.category === "Acesso Admin" && !isAdmin) return null

            // Filter items based on intern permissions
            const visibleItems = group.items.filter(item => canAccess(item.href))
            if (visibleItems.length === 0) return null

            return (
              <div key={group.category} className={groupIdx > 0 ? "mt-6" : ""}>
                {!isCollapsed ? (
                  <h3 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 animate-in fade-in duration-300">
                    {group.category}
                  </h3>
                ) : (
                  <div className="h-px bg-slate-100 my-4 mx-2" />
                )}
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive =
                      pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))

                    const NavItem = (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "group flex items-center transition-all duration-200 min-w-0 relative",
                          isActive
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                            : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm border border-transparent hover:border-slate-200",
                          isCollapsed
                            ? "h-11 w-11 mx-auto justify-center rounded-xl"
                            : "rounded-xl px-3 py-2.5 gap-3"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "shrink-0 transition-transform duration-200",
                            isCollapsed ? "h-5 w-5" : "h-4 w-4",
                            isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900",
                            !isActive && "group-hover:scale-110"
                          )}
                        />
                        {!isCollapsed && (
                          <span className="text-sm font-medium truncate animate-in fade-in duration-300">
                            {item.name}
                          </span>
                        )}
                        {isActive && !isCollapsed && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-sm" />}
                      </Link>
                    )

                    if (isCollapsed) {
                      return (
                        <Tooltip key={item.name}>
                          <TooltipTrigger asChild>{NavItem}</TooltipTrigger>
                          <TooltipContent
                            side="right"
                            sideOffset={12}
                            className="bg-slate-900 text-white border-none shadow-2xl font-semibold px-3 py-1.5 rounded-lg text-xs animate-in zoom-in-95 duration-200"
                          >
                            {item.name}
                          </TooltipContent>
                        </Tooltip>
                      )
                    }

                    return NavItem
                  })}
                </div>
              </div>
            )
          })}
        </nav>
      </TooltipProvider>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={cn(
            "w-full flex items-center text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all duration-300 shadow-none",
            isCollapsed ? "justify-center px-0" : "justify-between px-3"
          )}
        >
          {!isCollapsed && <span className="text-xs font-semibold uppercase tracking-wider">Recolher</span>}
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

