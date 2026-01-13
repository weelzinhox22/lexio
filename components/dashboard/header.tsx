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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut, UserIcon, MessageSquare } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { MobileMenu } from "./mobile-menu"
import { FeedbackButton } from "@/components/feedback/feedback-button"

export function DashboardHeader({ user }: { user: User }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const initials = user.email?.substring(0, 2).toUpperCase() || "US"

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3 md:gap-4">
        <MobileMenu />
        <h2 className="text-base md:text-lg font-semibold text-slate-900 hidden sm:block">
          Bem-vindo ao Themixa
        </h2>
      </div>
      
      {/* Barra de Pesquisa Global */}
      <div className="flex-1 max-w-2xl">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <FeedbackButton 
          userId={user.id} 
          variant="outline" 
          label="Feedback"
          className="hidden md:flex"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarFallback className="bg-slate-900 text-white">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-slate-900">Minha Conta</p>
                <p className="text-xs text-slate-600">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
