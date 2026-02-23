"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Briefcase,
    Users,
    Bell,
    Calendar,
    DollarSign,
    FileText,
    Settings,
    CreditCard,
    BarChart3,
    Search,
    UserCircle,
    FileEdit,
    LayoutDashboard,
} from "lucide-react"

const quickLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "Navegação" },
    { name: "Processos", href: "/dashboard/processes", icon: Briefcase, group: "Navegação" },
    { name: "Clientes", href: "/dashboard/clients", icon: Users, group: "Navegação" },
    { name: "Prazos", href: "/dashboard/deadlines", icon: Bell, group: "Navegação" },
    { name: "Agenda", href: "/dashboard/calendar", icon: Calendar, group: "Navegação" },
    { name: "Documentos", href: "/dashboard/documents", icon: FileText, group: "Navegação" },
    { name: "Templates", href: "/dashboard/templates", icon: FileEdit, group: "Navegação" },
    { name: "Financeiro", href: "/dashboard/financial", icon: DollarSign, group: "Navegação" },
    { name: "Leads", href: "/dashboard/leads", icon: UserCircle, group: "Navegação" },
    { name: "Relatórios", href: "/dashboard/reports", icon: BarChart3, group: "Navegação" },
    { name: "Assinatura", href: "/dashboard/subscription", icon: CreditCard, group: "Navegação" },
    { name: "Configurações", href: "/dashboard/settings", icon: Settings, group: "Navegação" },
    { name: "Novo Processo", href: "/dashboard/processes/new", icon: Briefcase, group: "Ações Rápidas" },
    { name: "Novo Cliente", href: "/dashboard/clients/new", icon: Users, group: "Ações Rápidas" },
    { name: "Novo Prazo", href: "/dashboard/deadlines/new", icon: Bell, group: "Ações Rápidas" },
]

type SearchResult = {
    id: string
    title: string
    subtitle: string
    href: string
    type: "process" | "client" | "deadline"
}

export function GlobalSearch() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Abrir com Cmd+K / Ctrl+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName))) {
                e.preventDefault()
                setOpen((prev) => !prev)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    // Busca no Supabase
    const search = useCallback(
        async (searchQuery: string) => {
            if (!searchQuery || searchQuery.length < 2) {
                setResults([])
                return
            }

            setLoading(true)
            const supabase = createClient()

            try {
                const searchTerm = `%${searchQuery}%`

                const [processes, clients, deadlines] = await Promise.all([
                    supabase
                        .from("processes")
                        .select("id, title, process_number, status")
                        .or(`title.ilike.${searchTerm},process_number.ilike.${searchTerm}`)
                        .limit(5),
                    supabase
                        .from("clients")
                        .select("id, name, email, phone")
                        .or(`name.ilike.${searchTerm},email.ilike.${searchTerm}`)
                        .limit(5),
                    supabase
                        .from("deadlines")
                        .select("id, title, deadline_date, status")
                        .ilike("title", searchTerm)
                        .limit(5),
                ])

                const mapped: SearchResult[] = []

                processes.data?.forEach((p) => {
                    mapped.push({
                        id: p.id,
                        title: p.title,
                        subtitle: `${p.process_number} · ${p.status === "active" ? "Ativo" : p.status}`,
                        href: `/dashboard/processes/${p.id}`,
                        type: "process",
                    })
                })

                clients.data?.forEach((c) => {
                    mapped.push({
                        id: c.id,
                        title: c.name,
                        subtitle: c.email || c.phone || "Cliente",
                        href: `/dashboard/clients/${c.id}`,
                        type: "client",
                    })
                })

                deadlines.data?.forEach((d) => {
                    const date = new Date(d.deadline_date).toLocaleDateString("pt-BR")
                    mapped.push({
                        id: d.id,
                        title: d.title,
                        subtitle: `${date} · ${d.status === "pending" ? "Pendente" : d.status}`,
                        href: `/dashboard/deadlines/${d.id}`,
                        type: "deadline",
                    })
                })

                setResults(mapped)
            } catch (error) {
                console.error("[GlobalSearch] error:", error)
            } finally {
                setLoading(false)
            }
        },
        []
    )

    // Debounce da busca
    useEffect(() => {
        const timer = setTimeout(() => {
            search(query)
        }, 300)
        return () => clearTimeout(timer)
    }, [query, search])

    const handleSelect = (href: string) => {
        setOpen(false)
        setQuery("")
        setResults([])
        router.push(href)
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "process":
                return <Briefcase className="h-4 w-4 text-blue-600 shrink-0" />
            case "client":
                return <Users className="h-4 w-4 text-green-600 shrink-0" />
            case "deadline":
                return <Bell className="h-4 w-4 text-orange-600 shrink-0" />
            default:
                return <Search className="h-4 w-4 text-slate-400 shrink-0" />
        }
    }

    return (
        <>
            {/* Botão de busca para mobile e desktop */}
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 w-full max-w-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
                <Search className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left truncate">Buscar processos, clientes, prazos...</span>
                <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                    ⌘K
                </kbd>
            </button>

            {/* Command Dialog */}
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Buscar processos, clientes, prazos..."
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    <CommandEmpty>
                        {loading ? "Buscando..." : "Nenhum resultado encontrado."}
                    </CommandEmpty>

                    {/* Resultados da busca */}
                    {results.length > 0 && (
                        <>
                            {results.filter((r) => r.type === "process").length > 0 && (
                                <CommandGroup heading="Processos">
                                    {results
                                        .filter((r) => r.type === "process")
                                        .map((result) => (
                                            <CommandItem
                                                key={result.id}
                                                value={`${result.title} ${result.subtitle}`}
                                                onSelect={() => handleSelect(result.href)}
                                            >
                                                {getIcon(result.type)}
                                                <div className="ml-2 min-w-0 flex-1">
                                                    <p className="text-sm font-medium truncate">{result.title}</p>
                                                    <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                                                </div>
                                            </CommandItem>
                                        ))}
                                </CommandGroup>
                            )}

                            {results.filter((r) => r.type === "client").length > 0 && (
                                <CommandGroup heading="Clientes">
                                    {results
                                        .filter((r) => r.type === "client")
                                        .map((result) => (
                                            <CommandItem
                                                key={result.id}
                                                value={`${result.title} ${result.subtitle}`}
                                                onSelect={() => handleSelect(result.href)}
                                            >
                                                {getIcon(result.type)}
                                                <div className="ml-2 min-w-0 flex-1">
                                                    <p className="text-sm font-medium truncate">{result.title}</p>
                                                    <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                                                </div>
                                            </CommandItem>
                                        ))}
                                </CommandGroup>
                            )}

                            {results.filter((r) => r.type === "deadline").length > 0 && (
                                <CommandGroup heading="Prazos">
                                    {results
                                        .filter((r) => r.type === "deadline")
                                        .map((result) => (
                                            <CommandItem
                                                key={result.id}
                                                value={`${result.title} ${result.subtitle}`}
                                                onSelect={() => handleSelect(result.href)}
                                            >
                                                {getIcon(result.type)}
                                                <div className="ml-2 min-w-0 flex-1">
                                                    <p className="text-sm font-medium truncate">{result.title}</p>
                                                    <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                                                </div>
                                            </CommandItem>
                                        ))}
                                </CommandGroup>
                            )}

                            <CommandSeparator />
                        </>
                    )}

                    {/* Links rápidos (quando não tem busca) */}
                    {!query && (
                        <>
                            <CommandGroup heading="Ações Rápidas">
                                {quickLinks
                                    .filter((l) => l.group === "Ações Rápidas")
                                    .map((link) => (
                                        <CommandItem
                                            key={link.href}
                                            value={link.name}
                                            onSelect={() => handleSelect(link.href)}
                                        >
                                            <link.icon className="mr-2 h-4 w-4 text-slate-500" />
                                            <span>{link.name}</span>
                                        </CommandItem>
                                    ))}
                            </CommandGroup>
                            <CommandSeparator />
                            <CommandGroup heading="Navegação">
                                {quickLinks
                                    .filter((l) => l.group === "Navegação")
                                    .map((link) => (
                                        <CommandItem
                                            key={link.href}
                                            value={link.name}
                                            onSelect={() => handleSelect(link.href)}
                                        >
                                            <link.icon className="mr-2 h-4 w-4 text-slate-500" />
                                            <span>{link.name}</span>
                                        </CommandItem>
                                    ))}
                            </CommandGroup>
                        </>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    )
}
