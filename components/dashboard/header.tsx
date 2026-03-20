"use client"

import { Button } from "@/components/ui/button"
import { GlobalSearch } from "@/components/navigation/global-search"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut, Settings, UserIcon, Menu as MenuIcon, PanelLeftOpen, PanelLeftClose, GraduationCap, Link as LinkIcon } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { MobileMenu } from "./mobile-menu"
import { FeedbackButton } from "@/components/feedback/feedback-button"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { useSidebar } from "./sidebar-provider"
import { useEffectiveUser } from "@/lib/contexts/effective-user-context"

interface DashboardHeaderProps {
  user: User
  profileName?: string | null
  avatarUrl?: string | null
  isAdmin?: boolean
}

export function DashboardHeader({ user, profileName, avatarUrl, isAdmin = false }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const { isIntern, ownerName, effectiveUserId } = useEffectiveUser()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const displayName = profileName || user.email?.split("@")[0] || "Usuário"
  const initials = profileName
    ? profileName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : user.email?.substring(0, 2).toUpperCase() || "US"

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-4 md:px-6">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="lg:hidden">
          <MobileMenu isAdmin={isAdmin} />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden lg:flex text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg h-9 w-9 transition-all duration-200"
          title={isCollapsed ? "Expandir" : "Recolher"}
        >
          {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </Button>

        <h2 className="text-base md:text-lg font-semibold text-slate-800 tracking-tight hidden sm:block">
          Bem-vindo ao Themixa
        </h2>

        {/* Intern Badge */}
        {isIntern && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200">
            <GraduationCap className="h-3.5 w-3.5 text-violet-600" />
            <span className="text-[11px] font-semibold text-violet-700">
              Estagiário(a) de {ownerName}
            </span>
          </div>
        )}
      </div>

      {/* Barra de Pesquisa Global */}
      <div className="flex-1 max-w-2xl px-2 md:px-8">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <NotificationBell userId={effectiveUserId || user.id} />
        <FeedbackButton
          userId={user.id}
          variant="outline"
          label="Feedback"
          className="hidden lg:flex border-slate-200/60 shadow-sm"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:ring-4 hover:ring-slate-100 transition-all duration-200">
              <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                <AvatarFallback className="bg-gradient-to-br from-slate-800 to-slate-900 text-white text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 shadow-xl border-slate-200">
            <DropdownMenuLabel className="p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                  <AvatarFallback className="bg-gradient-to-br from-slate-800 to-slate-900 text-white text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate max-w-[160px]">{user.email}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/settings")}
              className="cursor-pointer py-2.5"
            >
              <Settings className="mr-2.5 h-4 w-4 text-slate-500" />
              Minha Conta
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 py-2.5"
            >
              <LogOut className="mr-2.5 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
