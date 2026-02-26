import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ShieldCheck, UserCircle, CheckCircle } from 'lucide-react'
import { OnboardingForm } from './onboarding-form'

// ByPass RLS to gather onboarding data securely
function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

export default async function OnboardingPage({
    params,
}: {
    params: Promise<{ token: string }>
}) {
    const { token } = await params
    const supabase = getAdminClient()

    const { data: link, error } = await supabase
        .from('onboarding_links')
        .select('*, clients(name)')
        .eq('token', token)
        .single()

    if (error || !link) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-red-100 shadow-sm">
                    <CardHeader className="text-center">
                        <UserCircle className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                        <CardTitle className="text-slate-800">Link Inválido ou Expirado</CardTitle>
                        <CardDescription>Este link de auto-cadastro não existe ou foi removido. Solicite um novo link ao seu advogado.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    // @ts-ignore
    const clientName = link.clients?.name || 'Cliente'

    if (link.status === 'completed') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-green-100 bg-green-50/50 shadow-sm">
                    <CardHeader className="text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                        <CardTitle className="text-green-800">Cadastro Concluído</CardTitle>
                        <CardDescription className="text-green-700/80">Seus dados já foram preenchidos e enviados ao seu advogado com sucesso.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-8">
            <Card className="max-w-lg w-full border-slate-200 shadow-md bg-white">
                <CardHeader className="bg-indigo-600 rounded-t-lg text-white text-center pb-8 pt-8 relative">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-60">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Ambiente Seguro</span>
                    </div>
                    <UserCircle className="h-16 w-16 text-indigo-200 mx-auto mt-2" />
                    <CardTitle className="text-2xl font-bold mt-4">Bem-vindo(a), {clientName.split(' ')[0]}!</CardTitle>
                    <CardDescription className="text-indigo-100 mt-2 px-6">
                        Para agilizar seu processo com seu advogado, preencha os dados abaixo e envie os documentos solicitados.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <OnboardingForm token={token} />
                </CardContent>
            </Card>
        </div>
    )
}
