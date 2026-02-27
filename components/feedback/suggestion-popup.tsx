"use client"

import { useEffect, useState } from "react"
import { SuggestionDialog } from "./suggestion-dialog"
import { Sparkles, X, MessageSquare, Plus, Zap, ArrowRight, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

export function SuggestionPopup({ userId }: { userId: string }) {
  const [showPopup, setShowPopup] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const lastShown = localStorage.getItem(`suggestion-popup-shown-${userId}`)
    const today = new Date().toDateString()

    if (lastShown !== today) {
      const timer = setTimeout(() => {
        setShowPopup(true)
        localStorage.setItem(`suggestion-popup-shown-${userId}`, today)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [userId])

  if (isDismissed && !showModal) return null

  return (
    <>
      {/* Floating Capsule - Advanced Minimalism */}
      <div
        className={cn(
          "fixed bottom-12 right-12 z-[100] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          showPopup ? "translate-y-0 opacity-100 scale-100" : "translate-y-24 opacity-0 scale-90 pointer-events-none"
        )}
      >
        <div className="relative group">
          {/* Main Container - Sharp & Sophisticated Monochrome */}
          <div className="flex items-center gap-0 bg-[#0c0c0c] border border-white/5 shadow-[0_40px_80px_-16px_rgba(0,0,0,0.8)] p-1 rounded-full overflow-hidden transition-all duration-700 hover:scale-[1.05] hover:ring-1 hover:ring-white/20 active:scale-95 group/main">

            {/* The Prime Interaction Orb */}
            <button
              onClick={() => setShowModal(true)}
              className="relative flex items-center justify-center h-14 w-14 lg:w-44 bg-white text-black rounded-full shadow-2xl overflow-hidden transition-all duration-700 group/btn"
            >
              {/* Internal Glow Effect on Hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700Blur" />

              <div className="flex items-center gap-3 relative z-10 px-4">
                <Lightbulb className="h-6 w-6 text-black group-hover:rotate-12 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] whitespace-nowrap hidden lg:block">
                  Legal Lab
                </span>
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-100 hidden lg:block" />
              </div>
            </button>

            {/* Smart Expanded Text Context */}
            <div className="max-w-0 group-hover/main:max-w-xs transition-all duration-1000 overflow-hidden flex items-center">
              <div className="flex flex-col px-8 min-w-[200px]">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1 opacity-70">Lab Insight</span>
                <p className="text-[12px] font-bold text-white/50 leading-tight whitespace-nowrap">
                  Alguma funcionalidade nova?
                </p>
              </div>
            </div>

            {/* Hidden Close Button (Reveals on main hover) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDismissed(true);
              }}
              className="absolute top-1/2 -left-10 -translate-y-1/2 h-8 w-8 bg-black border border-white/10 rounded-full flex items-center justify-center text-white/30 hover:text-white transition-all opacity-0 group-hover/main:opacity-100 shadow-lg group-hover/main:left-[-40px]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Ambient Glow Aura */}
          <div className="absolute -inset-10 bg-indigo-500/10 blur-[80px] -z-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        </div>
      </div>

      <SuggestionDialog
        userId={userId}
        category="platform_popup_minimal_black_v6"
        open={showModal}
        onOpenChange={setShowModal}
        title="O Que Falta no seu Workflow?"
        description="Valorizamos sua experiência jurídica. Conte-nos qual tese ou ferramenta transformaria seu dia a dia e vamos construir juntos."
      />
    </>
  )
}
