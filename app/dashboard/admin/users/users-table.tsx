"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { grantLifetimeAccess, extendTrial } from "./actions"

export function UsersTable({ users }: { users: any[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null)

    async function handleLifetime(userId: string) {
        if (!confirm("Tem certeza que deseja conceder acesso vitalício para este usuário?")) return
        setLoadingId(userId)
        await grantLifetimeAccess(userId)
        setLoadingId(null)
    }

    async function handleExtend(userId: string) {
        if (!confirm("Deseja conceder mais 30 dias de acesso gratuito para este usuário?")) return
        setLoadingId(userId)
        await extendTrial(userId)
        setLoadingId(null)
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                            <th className="p-4 font-semibold whitespace-nowrap">Nome</th>
                            <th className="p-4 font-semibold whitespace-nowrap">Email</th>
                            <th className="p-4 font-semibold whitespace-nowrap">Plano</th>
                            <th className="p-4 font-semibold whitespace-nowrap">Vencimento</th>
                            <th className="p-4 font-semibold text-right whitespace-nowrap">Ações Rápidas</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 font-medium text-slate-900 truncate max-w-[150px]">{u.full_name || 'Sem nome'}</td>
                                <td className="p-4 text-slate-600 truncate max-w-[200px]">{u.email}</td>
                                <td className="p-4">
                                    <div className="flex gap-2 items-center">
                                        <Badge variant={u.subscription?.status === 'trial' ? 'outline' : 'default'} className="bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
                                            {u.subscription?.plan || 'Nenhum'}
                                        </Badge>
                                        <Badge variant="outline" className="whitespace-nowrap bg-slate-100 text-slate-600 border-slate-200">
                                            {u.subscription?.status === 'active' ? 'Ativo' : u.subscription?.status === 'trial' ? 'Trial' : u.subscription?.status || '-'}
                                        </Badge>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-600">
                                    {u.subscription?.current_period_end ?
                                        new Date(u.subscription.current_period_end).toLocaleDateString('pt-BR') :
                                        'N/A'
                                    }
                                </td>
                                <td className="p-4 text-right space-x-2 whitespace-nowrap flex justify-end">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={loadingId === u.id}
                                        onClick={() => handleExtend(u.id)}
                                        className="border-green-300 text-green-700 hover:bg-green-50 shadow-sm rounded-full font-semibold"
                                    >
                                        +30 Dias
                                    </Button>
                                    <Button
                                        size="sm"
                                        disabled={loadingId === u.id}
                                        onClick={() => handleLifetime(u.id)}
                                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-sm rounded-full font-semibold"
                                    >
                                        Vitalício
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
