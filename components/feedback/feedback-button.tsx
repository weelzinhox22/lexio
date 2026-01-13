"use client"

import { Button } from "@/components/ui/button"
import { MessageSquare, Bug } from "lucide-react"
import { useState } from "react"
import { FeedbackForm } from "./feedback-form"

type FeedbackButtonProps = {
  userId: string
  variant?: 'default' | 'bug' | 'outline'
  label?: string
  className?: string
}

export function FeedbackButton({ userId, variant = 'default', label, className }: FeedbackButtonProps) {
  const [open, setOpen] = useState(false)
  const type = variant === 'bug' ? 'bug' : 'suggestion'

  return (
    <>
      <Button
        variant={variant === 'outline' ? 'outline' : 'default'}
        size="sm"
        onClick={() => setOpen(true)}
        className={className}
      >
        {variant === 'bug' ? (
          <Bug className="h-4 w-4 mr-2" />
        ) : (
          <MessageSquare className="h-4 w-4 mr-2" />
        )}
        {label || (variant === 'bug' ? 'Reportar problema' : 'Enviar feedback')}
      </Button>
      <FeedbackForm
        open={open}
        onOpenChange={setOpen}
        userId={userId}
        prefillType={type}
      />
    </>
  )
}

