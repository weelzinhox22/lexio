import { Loader2 } from 'lucide-react'

export default function DashboardSubrouteLoading() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-7 w-48 bg-slate-200 rounded-lg animate-pulse" />
                    <div className="h-4 w-72 bg-slate-100 rounded-md animate-pulse" />
                </div>
                <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
            </div>

            {/* Content skeleton cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
                    >
                        <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                        <div className="h-8 w-16 bg-slate-200 rounded-lg animate-pulse" />
                        <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                    </div>
                ))}
            </div>

            {/* Table/list skeleton */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                    <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
                    <span className="text-sm text-slate-500">Carregando...</span>
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="px-5 py-4 border-b border-slate-100 last:border-0 flex items-center gap-4"
                    >
                        <div className="h-10 w-10 rounded-lg bg-slate-100 animate-pulse shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
                            <div className="h-3 w-32 bg-slate-50 rounded animate-pulse" />
                        </div>
                        <div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" />
                    </div>
                ))}
            </div>
        </div>
    )
}
