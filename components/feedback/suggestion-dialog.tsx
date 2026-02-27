"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface SuggestionDialogProps {
    userId: string
    category?: string
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    title?: string
    description?: string
}

export function SuggestionDialog({ 
    userId, 
    category = "general", 
    trigger, 
    open, 
    onOpenChange,
    title = "Sugerir melhoria ou nova tese",
    description = "Sua opinião é fundamental. Conte-nos o que podemos melhorar ou qual tese você gostaria de ver automatizada."
}: SuggestionDialogProps) {
    const supabase = createClient()
    const [suggestion, setSuggestion] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [internalOpen, setInternalOpen] = useState(false)

    const isOpen = open !== undefined ? open : internalOpen
    const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen

    const handleSendSuggestion = async () => {
        if (!suggestion.trim()) {
            toast.error("Por favor, descreva sua sugestão.")
            return
        }

        setIsSending(true)
        try {
            const { error } = await supabase.from('user_suggestions').insert({
                user_id: userId,
                category: category,
                content: suggestion
            })

            if (error) throw error

            toast.success("Obrigado! Sua sugestão foi recebida pela nossa equipe.")
            setSuggestion("")
            setIsOpen(false)
        } catch (error) {
            console.error(error)
            toast.error("Erro ao enviar sugestão")
        } finally {
            setIsSending(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                    <Textarea
                        placeholder="Escreva aqui sua sugestão..."
                        value={suggestion}
                        onChange={(e) => setSuggestion(e.target.value)}
                        className="min-h-[120px] focus-visible:ring-blue-500"
                    />
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleSendSuggestion}
                        disabled={isSending}
                        className="gap-2 bg-slate-900 hover:bg-slate-800"
                    >
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Enviar Sugestão
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
