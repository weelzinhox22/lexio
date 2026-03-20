import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Plus, Clock, Play, FileText, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NewEntryDialog } from "@/components/timesheet/new-entry-dialog"
import { DeleteEntryAction } from "@/components/timesheet/delete-entry-action"
import { TimesheetTimer } from "@/components/timesheet/timesheet-timer"

export const dynamic = "force-dynamic"

export default async function TimesheetPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/auth/login")

    // Check if the table time_entries exists by attempting a basic query
    const { error: tableError } = await supabase.from('time_entries').select('id').limit(1)

    if (tableError && tableError.code === '42P01') {
        // 42P01: relation does not exist
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Timesheet / Controle de Horas</h1>
                    <p className="text-slate-600 mt-1">Gerencie suas horas trabalhadas e faturáveis.</p>
                </div>

                <div className="rounded-md bg-amber-50 p-6 border border-amber-200">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Clock className="h-6 w-6 text-amber-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-medium text-amber-800">Módulo em preparação...</h3>
                            <div className="mt-2 text-sm text-amber-700">
                                <p>
                                    A tabela <b>time_entries</b> ainda não existe no seu banco de dados.
                                    Por favor, execute o script SQL <code className="bg-amber-100 px-1 py-0.5 rounded">036_create_time_entries.sql</code> no SQL Editor do Supabase para ativar este módulo.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const { data: entries } = await supabase
        .from('time_entries')
        .select(`
      *,
      processes (title, process_number),
      clients (name)
    `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

    const { data: processesData } = await supabase.from('processes').select('id, title').eq('user_id', user.id).order('title')
    const { data: clientsData } = await supabase.from('clients').select('id, name').eq('user_id', user.id).order('name')

    const totalMinutes = (entries || []).reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0)
    const totalAmount = (entries || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0)

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="h-6 w-6 text-blue-600" />
                        Controle de Horas
                    </h1>
                    <p className="text-slate-600 mt-1">Registre e acompanhe suas horas de trabalho</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <TimesheetTimer processes={processesData || []} clients={clientsData || []} />
                    <NewEntryDialog processes={processesData || []} clients={clientsData || []}>
                        <Button className="w-full sm:w-auto hover:bg-slate-800 transition-colors">
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Registro
                        </Button>
                    </NewEntryDialog>
                </div>
            </div>

            {/* Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Horas Totais</p>
                        <p className="text-2xl font-bold text-slate-900">
                            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
                        </p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Valor Faturável</p>
                        <p className="text-2xl font-bold text-slate-900">
                            R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Registros</p>
                        <p className="text-2xl font-bold text-slate-900">
                            {entries?.length || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Lista */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {entries && entries.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {entries.map((entry) => (
                            <div key={entry.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-900">{entry.description}</span>
                                        {entry.billable && (
                                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium text-[10px] tracking-wide uppercase">
                                                Faturável
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(entry.date).toLocaleDateString('pt-BR')}
                                        </span>
                                        {(entry.processes || entry.clients) && (
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="h-3 w-3" />
                                                {entry.processes?.title || entry.clients?.name}
                                            </span>
                                        )}
                                        {entry.status === 'billed' && (
                                            <span className="flex items-center gap-1 text-amber-600">
                                                <CheckCircle2 className="h-3 w-3" /> Faturado
                                            </span>
                                        )}
                                        {entry.status === 'paid' && (
                                            <span className="flex items-center gap-1 text-green-600">
                                                <CheckCircle2 className="h-3 w-3" /> Pago
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 text-right shrink-0">
                                    <div>
                                        <p className="text-lg font-semibold text-slate-900 font-mono tracking-tight">
                                            {Math.floor(entry.duration_minutes / 60)}:{String(entry.duration_minutes % 60).padStart(2, '0')}
                                        </p>
                                    </div>
                                    {entry.billable && entry.amount > 0 && (
                                        <div className="w-24">
                                            <p className="text-sm font-medium text-slate-700">
                                                R$ {Number(entry.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    )}
                                    <DeleteEntryAction entryId={entry.id} description={entry.description} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 px-4">
                        <Clock className="mx-auto h-12 w-12 text-slate-300" />
                        <h3 className="mt-4 text-base font-medium text-slate-900">Nenhum registro encontrado</h3>
                        <p className="mt-1 text-sm text-slate-500">Comece a registrar seu tempo para faturar seus honorários ou cobrar consultas.</p>
                        <div className="mt-6 flex justify-center gap-3">
                            <NewEntryDialog processes={processesData || []} clients={clientsData || []}>
                                <Button>Novo Registro Manual</Button>
                            </NewEntryDialog>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function DollarSign(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="12" x2="12" y1="2" y2="22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    )
}

function Briefcase(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    )
}
