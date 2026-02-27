"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bug, Lightbulb, HelpCircle } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type FeedbackFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  prefillType?: 'bug' | 'suggestion' | 'question'
  prefillPage?: string
}

export function FeedbackForm({ open, onOpenChange, userId, prefillType, prefillPage }: FeedbackFormProps) {
  const [type, setType] = useState<'bug' | 'suggestion' | 'question'>(prefillType || 'suggestion')
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!message.trim()) return

    setSubmitting(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("feedback").insert({
        user_id: userId,
        type,
        message: message.trim(),
        page_url: prefillPage || (typeof window !== 'undefined' ? window.location.href : null),
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
      })

      if (error) throw error

      onOpenChange(false)
      setMessage("")
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar feedback:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {prefillType === 'bug' ? 'Reportar Problema' : 'Enviar Feedback'}
          </DialogTitle>
          <DialogDescription>
            {prefillType === 'bug' 
              ? 'Descreva o problema que você encontrou. Isso nos ajuda a melhorar o sistema.'
              : 'Compartilhe sua opinião, sugestão ou dúvida. Seu feedback é muito importante!'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-type">Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4" /> Bug / Problema
                  </div>
                </SelectItem>
                <SelectItem value="suggestion">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" /> Sugestão
                  </div>
                </SelectItem>
                <SelectItem value="question">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" /> Dúvida
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-message">Mensagem *</Label>
            <Textarea
              id="feedback-message"
              placeholder="Descreva seu feedback, problema ou dúvida..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {submitting ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



