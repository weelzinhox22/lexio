"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger
const TooltipContent = TooltipPrimitive.Content

interface ContextualTooltipProps {
  content: string
  children?: React.ReactNode
  className?: string
}

function ContextualTooltip({ content, children, className }: ContextualTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <button
              type="button"
              className={cn(
                "inline-flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 transition-colors",
                className
              )}
              aria-label="Mais informações"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="z-50 max-w-xs rounded-lg bg-slate-900 px-3 py-2 text-sm text-white shadow-md"
        >
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, ContextualTooltip }



