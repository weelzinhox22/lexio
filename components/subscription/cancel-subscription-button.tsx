"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export function CancelSubscriptionButton() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleCancel = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/subscription/cancel', {
                method: 'POST',
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao cancelar a assinatura')
            }

            toast.success("Assinatura cancelada com sucesso. Você terá acesso até o fim do período.")
            setOpen(false)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold px-4 h-9 rounded-full ml-auto text-sm shrink-0">
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancelar Assinatura
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl overflow-hidden p-0 gap-0 border-slate-200/60 shadow-xl">
                <DialogHeader className="p-6 pb-4 bg-slate-50/50 border-b border-slate-100/60">
                    <DialogTitle className="text-xl text-slate-900 font-bold mb-1">Cancelar Assinatura</DialogTitle>
                    <DialogDescription className="text-slate-600">
                        Você tem certeza? Após cancelar, você continuará tendo acesso completo a todos os recursos do seu plano até o vencimento da fatura atual. Nenhuma cobrança futura será realizada.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="p-6 pt-4 gap-2 sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                        className="rounded-full font-semibold text-slate-600 border-slate-200 shadow-sm px-6"
                    >
                        Manter Assinatura
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleCancel}
                        disabled={loading}
                        className="rounded-full shadow-sm font-semibold px-6 hover:translate-y-0 transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                        Confirmar Cancelamento
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
