import { createClient } from "@/lib/supabase/server"
import { KanbanBoard } from "@/components/dashboard/kanban-board"
import { CustomKanbanBoard } from "@/components/dashboard/custom-kanban-board"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, UserCircle, Briefcase, Filter, Trello, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBoard } from "./custom-actions"

export default async function KanbanPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch Leads
    const { data: leads } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .order("kanban_order", { ascending: true })

    // Fetch Processes
    const { data: processes } = await supabase
        .from("processes")
        .select("*, clients(name)")
        .eq("user_id", user.id)
        .order("kanban_order", { ascending: true })

    // Fetch Custom Boards
    const { data: boards } = await supabase
        .from("kanban_boards")
        .select("*, kanban_columns(*, kanban_cards(*))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })

    // Prepare Leads Columns
    const leadsColumns = [
        { id: "new", title: "Novos", items: [] as any[] },
        { id: "contacted", title: "Contatados", items: [] as any[] },
        { id: "qualified", title: "Qualificados", items: [] as any[] },
        { id: "converted", title: "Convertidos", items: [] as any[] },
        { id: "lost", title: "Perdidos", items: [] as any[] },
    ]

    leads?.forEach((lead) => {
        const col = leadsColumns.find((c) => c.id === lead.status)
        if (col) {
            col.items.push({
                id: lead.id,
                title: lead.name,
                subtitle: lead.interest || lead.notes,
                status: lead.status,
                kanban_order: lead.kanban_order || 0,
                metadata: {
                    date: new Date(lead.created_at).toLocaleDateString('pt-BR'),
                    priority: lead.score > 70 ? 'High' : lead.score > 40 ? 'Medium' : 'Low'
                }
            })
        }
    })

    // Prepare Processes Columns
    const processesColumns = [
        { id: "active", title: "Em Andamento", items: [] as any[] },
        { id: "won", title: "Finalizados (Ganho)", items: [] as any[] },
        { id: "lost", title: "Finalizados (Perda)", items: [] as any[] },
        { id: "archived", title: "Arquivados", items: [] as any[] },
    ]

    processes?.forEach((proc) => {
        const col = processesColumns.find((c) => c.id === proc.status)
        if (col) {
            col.items.push({
                id: proc.id,
                title: proc.title,
                subtitle: `Proc: ${proc.process_number}`,
                status: proc.status,
                kanban_order: proc.kanban_order || 0,
                metadata: {
                    client_name: (proc.clients as any)?.name,
                    value: proc.value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proc.value) : undefined,
                    priority: proc.priority
                }
            })
        }
    })

    const hasCustomBoards = boards && boards.length > 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <LayoutDashboard className="h-8 w-8 text-indigo-600" />
                        Fluxo de Trabalho
                    </h1>
                    <p className="text-slate-600 mt-1">Gerencie sua esteira de vendas, processos e tarefas personalizadas.</p>
                </div>
                <div className="flex items-center gap-2">
                    <form action={async () => {
                        "use server"
                        await createBoard("Meu Novo Quadro")
                    }}>
                        <Button size="sm" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold">
                            <Plus className="h-4 w-4 mr-2" /> Novo Quadro
                        </Button>
                    </form>
                </div>
            </div>

            <Tabs defaultValue="leads" className="w-full">
                <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    <TabsList className="bg-slate-100 p-1 rounded-full h-12 inline-flex shrink-0">
                        <TabsTrigger value="leads" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2 transition-all">
                            <UserCircle className="h-4 w-4" />
                            Vendas (Leads)
                        </TabsTrigger>
                        <TabsTrigger value="processes" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2 transition-all">
                            <Briefcase className="h-4 w-4" />
                            Processos
                        </TabsTrigger>
                        {boards?.map(board => (
                            <TabsTrigger key={board.id} value={board.id} className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2 transition-all border-l border-slate-200">
                                <Trello className="h-4 w-4" style={{ color: board.color }} />
                                {board.title}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <TabsContent value="leads" className="mt-0 focus-visible:ring-0">
                    <KanbanBoard initialColumns={leadsColumns} type="leads" />
                </TabsContent>

                <TabsContent value="processes" className="mt-0 focus-visible:ring-0">
                    <KanbanBoard initialColumns={processesColumns} type="processes" />
                </TabsContent>

                {boards?.map(board => (
                    <TabsContent key={board.id} value={board.id} className="mt-0 focus-visible:ring-0">
                        <CustomKanbanBoard
                            boardId={board.id}
                            initialColumns={board.kanban_columns?.sort((a: any, b: any) => a.order_index - b.order_index).map((col: any) => ({
                                id: col.id,
                                title: col.title,
                                order_index: col.order_index,
                                cards: col.kanban_cards?.sort((a: any, b: any) => a.order_index - b.order_index) || []
                            })) || []}
                        />
                    </TabsContent>
                ))}

                {!hasCustomBoards && (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-500">
                        <Trello className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-semibold text-slate-700">Crie quadros personalizados estilo Trello</h3>
                        <p className="text-sm max-w-sm mx-auto mt-2">Além dos CRM de leads e processos, você pode criar quadros para gerenciar tarefas administrativas do escritório.</p>
                    </div>
                )}
            </Tabs>
        </div>
    )
}
