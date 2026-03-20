"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"
import { toast } from "sonner"

export function DeleteEntryAction({ entryId, description }: { entryId: string, description: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    async function handleDelete() {
        setLoading(true)

        try {
            const { error } = await supabase.from('time_entries').delete().eq('id', entryId)

            if (error) throw error

            toast.success("Registro excluído com sucesso")
            setOpen(false)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Erro ao excluir o registro")
            setLoading(false)
        }
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                title="Excluir"
                onClick={() => setOpen(true)}
                className="shrink-0 rounded-full shadow-sm border-red-100 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 font-semibold transition-colors px-3 h-9"
            >
                <Trash2 className="h-4 w-4 shrink-0" />
            </Button>

            <DeleteConfirmDialog
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={handleDelete}
                title="Excluir Registro"
                itemName={description}
                itemType="registro"
                isLoading={loading}
            />
        </>
    )
}
