import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Shield, FileText, Lock } from 'lucide-react'

export default function LegalPage({ params }: { params: { type: string } }) {
    const { type } = params

    const content: Record<string, { title: string, icon: any, body: string }> = {
        privacy: {
            title: 'Política de Privacidade',
            icon: <Lock className="h-8 w-8 text-indigo-600" />,
            body: `Entendemos que seus dados jurídicos e pessoais são sensíveis. Esta política descreve como tratamos essas informações no Portal do Cliente.

1. Coleta de Dados: Coletamos apenas os dados necessários para a identificação do seu processo e comunicação direta entre você e seu advogado.
2. Uso das Informações: Seus dados são usados exclusivamente para fornecer o status dos seus processos e permitir o upload de documentos de onboarding.
3. Compartilhamento: Não compartilhamos seus dados com terceiros, exceto quando exigido por lei ou ordem judicial.
4. Segurança: Utilizamos criptografia de ponta e armazenamento seguro via Supabase (Infraestrutura de classe mundial) para garantir que ninguém além de você e seu advogado tenha acesso.`
        },
        terms: {
            title: 'Termos de Uso',
            icon: <FileText className="h-8 w-8 text-indigo-600" />,
            body: `Ao acessar o Portal do Cliente, você concorda com as seguintes condições:

1. Acesso Pessoal: O código de acesso e senha são de uso pessoal e intransferível. Você é responsável por manter o sigilo dessas credenciais.
2. Finalidade: Este portal é apenas para consulta e envio de documentos. As informações aqui contidas têm caráter informativo e não substituem o aconselhamento jurídico formal prestado pelo seu advogado.
3. Precisão: Embora nos esforcemos para manter os dados atualizados, os prazos e andamentos oficiais devem ser confirmados nos sites dos respectivos tribunais.
4. Uso Indevido: Qualquer tentativa de acesso não autorizado ou uso indevido da plataforma resultará no bloqueio imediato do acesso.`
        },
        lgpd: {
            title: 'Conformidade LGPD',
            icon: <Shield className="h-8 w-8 text-indigo-600" />,
            body: `Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018):

1. Seus Direitos: Você tem o direito de solicitar a confirmação da existência de tratamento, o acesso aos dados, a correção de dados incompletos ou inexatos e a anonimização ou exclusão de dados desnecessários.
2. Base Legal: O tratamento de seus dados neste portal baseia-se na execução de contrato (prestação de serviços jurídicos) e no cumprimento de obrigações legais.
3. Armazenamento: Seus dados são mantidos pelo tempo necessário para a prestação dos serviços jurídicos ou conforme exigido pelos prazos prescricionais legais.
4. Contato: Para exercer seus direitos LGPD, entre em contato diretamente com o encarregado de dados do escritório através dos canais de contato listados no seu dashboard.`
        }
    }

    const doc = content[type] || content['privacy']

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-3xl mx-auto space-y-6">
                <Button asChild variant="ghost" className="text-slate-500 hover:text-indigo-600">
                    <Link href="/portal/dashboard">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar para o Dashboard
                    </Link>
                </Button>

                <Card className="border-none shadow-sm">
                    <CardHeader className="text-center pb-8 border-b border-slate-100">
                        <div className="mx-auto bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            {doc.icon}
                        </div>
                        <CardTitle className="text-3xl font-bold text-slate-800">{doc.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="prose prose-slate max-w-none">
                            {doc.body.split('\n').map((para, i) => (
                                <p key={i} className="text-slate-600 mb-4 whitespace-pre-wrap leading-relaxed">
                                    {para}
                                </p>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-slate-400">
                    Última atualização: {new Date().toLocaleDateString('pt-BR')}
                </p>
            </div>
        </div>
    )
}
