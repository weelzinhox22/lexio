import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { LogOut, FileText, CheckCircle, Scale, ShieldCheck, Mail, Phone, CalendarDays, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

function getStatusBadge(status: string) {
    if (status === 'active') return <Badge className="bg-emerald-100 text-emerald-800">Em Andamento</Badge>
    if (status === 'archived') return <Badge className="bg-slate-100 text-slate-800">Arquivado</Badge>
    return <Badge>{status}</Badge>
}

export default async function PortalDashboardPage() {
    const cookieStore = await cookies()
    const clientId = cookieStore.get('portal_client_id')?.value

    if (!clientId) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-red-600 font-bold">Sessão não encontrada</h1>
                <p className="text-slate-600">Seu navegador não enviou a chave de acesso. Verifique se os cookies estão habilitados.</p>
                <a href="/portal" className="text-indigo-600 underline mt-4 block">Voltar para Login</a>
            </div>
        )
    }

    const supabase = getAdminClient()

    // Buscar Informações do Cliente do Portal
    const { data: client, error: cError } = await supabase
        .from('clients')
        .select('name, email, phone, cpf_cnpj, user_id, document_rg, profession, marital_status, address_cep, address_city, address_state, address_neighborhood, address_number')
        .eq('id', clientId)
        .single()

    if (cError || !client) {
        console.error('Portal access error details:', cError)
        return (
            <div className="p-8 text-center">
                <h1 className="text-red-600 font-bold">Erro de Acesso ao Portal</h1>
                <p className="text-slate-600">Ocorreu um problema ao carregar seus dados. Por favor, tente novamente.</p>
                <div className="bg-slate-100 p-4 mt-4 rounded text-left text-xs font-mono overflow-auto max-w-lg mx-auto">
                    {JSON.stringify(cError, null, 2)}
                </div>
                <a href="/portal" className="text-indigo-600 underline mt-4 block">Voltar para Login</a>
            </div>
        )
    }

    // Buscar todos os processos ligados a este cliente unicamente
    const { data: processes } = await supabase
        .from('processes')
        .select('*, client_timeline:process_timeline(*)')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

    // Buscar os dados do advogado (profiles)
    const { data: lawyer } = await supabase
        .from('profiles')
        .select('full_name, phone') // Adicionado phone para o link de contato
        .eq('id', client.user_id)
        .single()

    // @ts-ignore
    const clientAny = client as any
    const lawyerName = lawyer?.full_name || 'Seu Advogado'

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Minimal Header */}
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Scale className="h-6 w-6 text-indigo-600" />
                        <span className="font-bold text-slate-800 text-sm sm:text-lg">Acesso ao Cliente</span>
                    </div>
                    <form action={async () => {
                        'use server'
                        const cookiesList = await cookies()
                        cookiesList.delete('portal_client_id')
                        redirect('/portal')
                    }}>
                        <button type="submit" className="text-slate-500 hover:text-red-500 font-medium text-xs flex items-center gap-1.5 transition-colors">
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Sair com Segurança</span>
                        </button>
                    </form>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">

                {/* Greeting Banner */}
                <Card className="border-none shadow-sm bg-indigo-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <CardContent className="p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between relative z-10">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">Olá, {clientAny.name.split(' ')[0]}</h1>
                            <p className="text-indigo-100 mt-2 max-w-xl text-sm md:text-base leading-relaxed">
                                Acompanhe os andamentos do seu processo em tempo real. Esta interface privada foi gerada pela <strong className="text-white">Themixa</strong>, atualizada por <strong className="text-white">{lawyerName}</strong> e está protegida com criptografia.
                            </p>
                        </div>
                        <div className="bg-indigo-800/50 p-4 rounded-xl shrink-0 flex items-center gap-3 w-full sm:w-auto">
                            <ShieldCheck className="h-8 w-8 text-indigo-300" />
                            <div className="text-sm">
                                <div className="text-indigo-200 uppercase font-bold text-[10px] tracking-wider">Acesso Protegido</div>
                                <div className="font-medium truncate max-w-[120px]" title={clientAny.cpf_cnpj}>{clientAny.cpf_cnpj}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Lista de Processos */}
                    <div className="col-span-1 lg:col-span-2 space-y-4">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            Meus Processos Ativos
                        </h2>

                        {!processes || processes.length === 0 ? (
                            <Card className="border-dashed shadow-none p-12 flex flex-col items-center justify-center text-center">
                                <FileText className="h-12 w-12 text-slate-300 mb-3" />
                                <h3 className="font-semibold text-slate-700">Nenhum processo encontrado</h3>
                                <p className="text-sm text-slate-500 mt-1">Seu advogado ainda não vinculou nenhum caso judicial à sua ficha.</p>
                            </Card>
                        ) : (
                            processes.map((proc: any) => (
                                <Card key={proc.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-0">
                                        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between md:items-start">
                                            <div className="space-y-1">
                                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none rounded">
                                                    {proc.process_type ? proc.process_type.toUpperCase() : 'JUDICIAL'}
                                                </Badge>
                                                <h3 className="font-bold text-slate-800 text-lg leading-tight mt-1">{proc.title}</h3>
                                                <p className="text-sm text-slate-600 font-mono mt-0.5">{proc.process_number || 'Aguardando Numeração CNJ'}</p>
                                            </div>
                                            <div className="shrink-0 flex items-center md:items-end flex-col gap-2">
                                                {getStatusBadge(proc.status)}
                                            </div>
                                        </div>
                                        {proc.client_summary && (
                                            <div className="px-5 py-3 bg-amber-50 border-y border-amber-100 italic text-sm text-amber-900 leading-relaxed group">
                                                <span className="font-bold text-[10px] uppercase tracking-wider block mb-1 opacity-60">Status do Caso</span>
                                                "{proc.client_summary}"
                                            </div>
                                        )}
                                        <div className="p-4 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex items-start gap-2 text-sm text-slate-600">
                                                <Scale className="h-4 w-4 text-slate-400 mt-0.5" />
                                                <div>
                                                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Tribunal / Vara</span>
                                                    {proc.court} <br /> {proc.vara}
                                                </div>
                                            </div>
                                            {proc.status_ganho && proc.status_ganho !== 'em_andamento' && (
                                                <div className="flex items-start gap-2 text-sm text-slate-600">
                                                    <CheckCircle className={`h-4 w-4 mt-0.5 ${proc.status_ganho === 'ganho' ? 'text-green-500' : 'text-red-500'}`} />
                                                    <div>
                                                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Fase Conclusiva</span>
                                                        <span className="font-bold">{proc.status_ganho === 'ganho' ? 'Deferido' : 'Indeferido'}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Linha do Tempo do Processo */}
                                        {proc.client_timeline && proc.client_timeline.length > 0 && (
                                            <div className="p-5 border-t border-slate-100 bg-white">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Evolução do Caso</h4>
                                                <div className="relative border-l-2 border-indigo-100 ml-2 space-y-6 pb-2">
                                                    {proc.client_timeline.sort((a: any, b: any) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()).map((event: any) => (
                                                        <div key={event.id} className="relative pl-6">
                                                            <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-white border-2 border-indigo-500 shadow-sm" />
                                                            <div>
                                                                <span className="text-[10px] font-bold text-indigo-400">
                                                                    {new Date(event.event_date).toLocaleDateString('pt-BR')}
                                                                </span>
                                                                <h5 className="font-bold text-slate-800 text-sm mt-0.5">{event.title}</h5>
                                                                {event.description && (
                                                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                                        {event.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Contato Advogado Sidebar */}
                    <div className="col-span-1 space-y-4">
                        <Card className="border-indigo-100 bg-indigo-50/50 shadow-sm sticky top-6">
                            <CardHeader className="pb-3 border-b border-indigo-100 bg-white">
                                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wide">Representante Legal</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <p className="text-sm text-slate-600">
                                    Dúvidas sobre os andamentos ao lado? Entre em contato e forneça a numeração da pasta.
                                </p>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                        <div className="bg-indigo-100 p-2 rounded-md">
                                            <User className="h-4 w-4 text-indigo-600" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-xs text-slate-400 uppercase tracking-widest">Advogado(a)</span>
                                            <span className="font-bold text-slate-800">{lawyerName}</span>
                                        </div>
                                    </div>
                                    <a
                                        href={lawyer?.phone ? `https://wa.me/55${lawyer.phone.replace(/\D/g, '')}` : '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200 hover:border-indigo-400 transition-colors shadow-sm group"
                                    >
                                        <div className="bg-emerald-100 p-2 rounded-md group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                            <Phone className="h-4 w-4 text-emerald-600 group-hover:text-white" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium">WhatsApp do Escritório</span>
                                            {lawyer?.phone && <span className="text-[10px] text-slate-400">{lawyer.phone}</span>}
                                        </div>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>


                    </div>
                </div>

            </main>

            {/* Footer with legal links */}
            <footer className="max-w-6xl mx-auto px-4 py-12 border-t border-slate-200 mt-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-slate-400">
                        © {new Date().getFullYear()} Themixa. Todos os direitos reservados.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/portal/legal/privacy" className="text-xs text-slate-400 hover:text-indigo-600 underline underline-offset-4">Política de Privacidade</Link>
                        <Link href="/portal/legal/terms" className="text-xs text-slate-400 hover:text-indigo-600 underline underline-offset-4">Termos de Uso</Link>
                        <Link href="/portal/legal/lgpd" className="text-xs text-slate-400 hover:text-indigo-600 underline underline-offset-4">Direitos LGPD</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
