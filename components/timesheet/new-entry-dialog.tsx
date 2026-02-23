"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Plus, Clock } from "lucide-react"
import { toast } from "sonner"

export function NewEntryDialog({ children, processes, clients }: { children: React.ReactNode, processes: any[], clients: any[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const [formData, setFormData] = useState({
        description: "",
        date: new Date().toISOString().split('T')[0],
        durationHours: "0",
        durationMinutes: "30",
        billable: true,
        hourlyRate: "150.00",
        processId: "none",
        clientId: "none"
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Não autenticado")

            const durationTotal = (parseInt(formData.durationHours || "0") * 60) + parseInt(formData.durationMinutes || "0")
            if (durationTotal <= 0) {
                toast.error("A duração deve ser maior que zero")
                setLoading(false)
                return
            }

            const hourlyRateNum = parseFloat(formData.hourlyRate.replace(',', '.'))
            const amount = formData.billable ? (durationTotal / 60) * hourlyRateNum : 0

            const { error } = await supabase.from('time_entries').insert({
                user_id: user.id,
                description: formData.description,
                date: formData.date,
                duration_minutes: durationTotal,
                billable: formData.billable,
                hourly_rate: hourlyRateNum,
                amount: amount,
                process_id: formData.processId !== "none" ? formData.processId : null,
                client_id: formData.clientId !== "none" ? formData.clientId : null,
            })

            if (error) throw error

            toast.success("Registro adicionado com sucesso!")
            setOpen(false)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Erro ao salvar registro")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Novo Registro Manual</DialogTitle>
                        <DialogDescription>
                            Adicione horas de trabalho a um processo ou cliente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição da Atividade</Label>
                            <Textarea
                                id="description"
                                required
                                placeholder="Ex: Análise de documentos e elaboração de petição inicial"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Data</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Duração</Label>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            type="number"
                                            min="0"
                                            value={formData.durationHours}
                                            onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
                                            className="pr-6"
                                        />
                                        <span className="absolute right-2 top-2 text-sm text-slate-500">h</span>
                                    </div>
                                    <div className="relative flex-1">
                                        <Input
                                            type="number"
                                            min="0"
                                            max="59"
                                            value={formData.durationMinutes}
                                            onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                                            className="pr-6"
                                        />
                                        <span className="absolute right-2 top-2 text-sm text-slate-500">m</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Vincular a (Opcional)</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <Select value={formData.processId} onValueChange={(v) => setFormData({ ...formData, processId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Processo" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Nenhum processo</SelectItem>
                                        {processes.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={formData.clientId} onValueChange={(v) => setFormData({ ...formData, clientId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Cliente" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Nenhum cliente</SelectItem>
                                        {clients.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="billable" className="flex flex-col gap-1 cursor-pointer">
                                    <span>Horas Faturáveis</span>
                                    <span className="text-xs text-slate-500 font-normal">Cobrar o cliente por estas horas trabalhadas</span>
                                </Label>
                                <Switch
                                    id="billable"
                                    checked={formData.billable}
                                    onCheckedChange={(c) => setFormData({ ...formData, billable: c })}
                                />
                            </div>

                            {formData.billable && (
                                <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                                    <Label>Valor Hora (R$)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        className="w-32"
                                        value={formData.hourlyRate}
                                        onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Clock className="h-4 w-4 mr-2" />}
                            {loading ? "Salvando..." : "Salvar Registro"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
