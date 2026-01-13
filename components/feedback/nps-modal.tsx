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
import { Star } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type NPSModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export function NPSModal({ open, onOpenChange, userId }: NPSModalProps) {
  const [score, setScore] = useState<number | null>(null)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (score === null) return

    setSubmitting(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("nps_responses").insert({
        user_id: userId,
        score,
        comment: comment.trim() || null,
      })

      if (error) throw error

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar NPS:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Como está sua experiência?</DialogTitle>
          <DialogDescription className="text-base">
            De 0 a 10, o quanto você recomendaria o Themixa para um colega advogado?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Escala de 0 a 10 */}
          <div className="flex items-center justify-between gap-1">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                onClick={() => setScore(num)}
                className={`flex-1 h-10 rounded-md border-2 transition-all ${
                  score === num
                    ? "bg-blue-600 border-blue-600 text-white font-bold"
                    : "border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          {score !== null && (
            <div className="text-center text-sm text-slate-600">
              {score <= 6 && "Obrigado pelo feedback. O que podemos melhorar?"}
              {score >= 7 && score <= 8 && "Ótimo! O que mais você gostaria de ver?"}
              {score >= 9 && "Excelente! Compartilhe sua experiência (opcional):"}
            </div>
          )}

          {/* Comentário opcional */}
          {score !== null && (
            <Textarea
              placeholder="Seu comentário (opcional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="resize-none"
            />
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Pular
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={score === null || submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {submitting ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


