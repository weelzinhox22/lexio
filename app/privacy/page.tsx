import { Metadata } from 'next'
import { Shield } from 'lucide-react'
import { LegalPageLayout } from '@/components/legal/legal-page-layout'

export const metadata: Metadata = {
    title: 'Política de Privacidade | Themixa',
    description: 'Saiba como o Themixa coleta, utiliza, armazena e protege seus dados pessoais em conformidade com a LGPD.',
}

const tocItems = [
    { id: 'introducao', label: '1. Introdução' },
    { id: 'dados-coletados', label: '2. Dados Coletados' },
    { id: 'finalidade', label: '3. Finalidade do Tratamento' },
    { id: 'base-legal', label: '4. Base Legal' },
    { id: 'compartilhamento', label: '5. Compartilhamento de Dados' },
    { id: 'armazenamento', label: '6. Armazenamento e Segurança' },
    { id: 'direitos', label: '7. Seus Direitos' },
    { id: 'cookies', label: '8. Cookies' },
    { id: 'retencao', label: '9. Retenção de Dados' },
    { id: 'menores', label: '10. Menores de Idade' },
    { id: 'alteracoes', label: '11. Alterações nesta Política' },
    { id: 'contato', label: '12. Contato e DPO' },
]

export default function PrivacyPage() {
    return (
        <LegalPageLayout
            title="Política de Privacidade"
            subtitle="Transparência é essencial. Saiba como tratamos suas informações pessoais com responsabilidade e segurança."
            lastUpdated="25 de fevereiro de 2026"
            icon={<Shield className="h-7 w-7" />}
            tocItems={tocItems}
        >
            <section id="introducao" className="legal-section mb-12">
                <h2>1. Introdução</h2>
                <p>
                    A <strong>Themixa Tecnologia Ltda.</strong> (&quot;Themixa&quot;, &quot;nós&quot;) valoriza a privacidade dos seus
                    usuários e está comprometida com a proteção dos dados pessoais em conformidade com a
                    Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — &quot;LGPD&quot;) e demais
                    legislações aplicáveis.
                </p>
                <p>
                    Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos,
                    compartilhamos e protegemos suas informações pessoais ao utilizar a plataforma
                    Themixa (&quot;Plataforma&quot;).
                </p>
            </section>

            <section id="dados-coletados" className="legal-section mb-12">
                <h2>2. Dados Coletados</h2>
                <h3>2.1 Dados fornecidos pelo Usuário</h3>
                <ul>
                    <li><strong>Dados de pagamento:</strong> registros de assinaturas e histórico financeiro via Stripe;</li>
                    <li><strong>Dados de clientes:</strong> informações de clientes cadastrados pelo Usuário na plataforma (nome, CPF/CNPJ, endereço, contatos);</li>
                    <li><strong>Dados processuais:</strong> números de processos, datas de prazos, informações de audiências;</li>
                    <li><strong>Dados financeiros:</strong> registros de transações financeiras do escritório (honorários, custas);</li>
                    <li><strong>Documentos:</strong> arquivos enviados pelo Usuário à Plataforma;</li>
                    <li><strong>Dados de IA:</strong> prompts, teses sugeridas e interações com os assistentes virtuais.</li>
                </ul>

                <h3>2.2 Dados coletados automaticamente</h3>
                <ul>
                    <li><strong>Dados de navegação:</strong> endereço IP, tipo de navegador, sistema operacional, páginas acessadas, tempo de sessão;</li>
                    <li><strong>Dados de dispositivo:</strong> identificador único do dispositivo, resolução de tela;</li>
                    <li><strong>Cookies e tecnologias similares:</strong> conforme detalhado em nossa <a href="/cookies">Política de Cookies</a>;</li>
                    <li><strong>Dados de performance:</strong> métricas de uso da Plataforma via Vercel Analytics (dados anonimizados).</li>
                </ul>

                <h3>2.3 Dados de pagamento</h3>
                <p>
                    Os dados de pagamento (número do cartão, CVV, data de validade) são processados <strong>exclusivamente
                        pelo Stripe</strong>, nosso processador de pagamentos certificado PCI-DSS. O Themixa <strong>não armazena</strong> dados
                    completos de cartão de crédito em seus servidores.
                </p>
            </section>

            <section id="finalidade" className="legal-section mb-12">
                <h2>3. Finalidade do Tratamento</h2>
                <p>Os dados pessoais são tratados para as seguintes finalidades:</p>
                <ul>
                    <li><strong>Prestação do serviço:</strong> fornecimento, manutenção e melhoria das funcionalidades da Plataforma;</li>
                    <li><strong>Comunicação:</strong> envio de notificações, alertas de prazos, e-mails transacionais e informativos;</li>
                    <li><strong>Segurança:</strong> proteção contra fraudes, acessos não autorizados e atividades maliciosas;</li>
                    <li><strong>Pagamentos:</strong> processamento de assinaturas, cobranças e emissão de recibos;</li>
                    <li><strong>Cumprimento legal:</strong> atendimento a obrigações legais e regulatórias;</li>
                    <li><strong>Melhoria contínua:</strong> análise de uso e comportamento para aprimorar a experiência do Usuário;</li>
                    <li><strong>Suporte:</strong> atendimento a solicitações, dúvidas e reclamações do Usuário.</li>
                </ul>
            </section>

            <section id="base-legal" className="legal-section mb-12">
                <h2>4. Base Legal para o Tratamento</h2>
                <p>O tratamento de dados pessoais pelo Themixa é fundamentado nas seguintes bases legais previstas na LGPD:</p>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 not-prose space-y-4">
                    <div className="flex gap-3">
                        <span className="text-blue-600 font-bold text-sm shrink-0 mt-0.5">Art. 7º, I</span>
                        <p className="text-slate-600 text-sm"><strong className="text-slate-900">Consentimento</strong> — Quando necessário, solicitamos seu consentimento expresso.</p>
                    </div>
                    <div className="flex gap-3">
                        <span className="text-blue-600 font-bold text-sm shrink-0 mt-0.5">Art. 7º, V</span>
                        <p className="text-slate-600 text-sm"><strong className="text-slate-900">Execução de contrato</strong> — Para a prestação dos serviços contratados.</p>
                    </div>
                    <div className="flex gap-3">
                        <span className="text-blue-600 font-bold text-sm shrink-0 mt-0.5">Art. 7º, II</span>
                        <p className="text-slate-600 text-sm"><strong className="text-slate-900">Obrigação legal</strong> — Para cumprimento de determinações legais e regulatórias.</p>
                    </div>
                    <div className="flex gap-3">
                        <span className="text-blue-600 font-bold text-sm shrink-0 mt-0.5">Art. 7º, IX</span>
                        <p className="text-slate-600 text-sm"><strong className="text-slate-900">Legítimo interesse</strong> — Para melhorias na plataforma e comunicações relevantes.</p>
                    </div>
                </div>
            </section>

            <section id="compartilhamento" className="legal-section mb-12">
                <h2>5. Compartilhamento de Dados</h2>
                <p>O Themixa pode compartilhar dados pessoais com:</p>
                <ul>
                    <li><strong>Supabase:</strong> infraestrutura de banco de dados e autenticação (servidores da AWS);</li>
                    <li><strong>Stripe:</strong> processamento de pagamentos (certificado PCI-DSS);</li>
                    <li><strong>Vercel:</strong> hospedagem da aplicação e analytics;</li>
                    <li><strong>Brevo (Sendinblue):</strong> envio de e-mails transacionais e alertas;</li>
                    <li><strong>Autoridades públicas:</strong> quando exigido por lei, decisão judicial ou determinação regulatória.</li>
                </ul>
                <p>
                    <strong>Não vendemos, alugamos ou comercializamos seus dados pessoais com terceiros para fins de marketing.</strong>
                </p>
            </section>

            <section id="armazenamento" className="legal-section mb-12">
                <h2>6. Armazenamento e Segurança</h2>
                <h3>6.1 Onde seus dados são armazenados</h3>
                <p>
                    Os dados são armazenados em servidores seguros do <strong>Supabase</strong> (infraestrutura AWS),
                    com replicação e backup automático. Os servidores podem estar localizados fora do Brasil,
                    em conformidade com os arts. 33 a 36 da LGPD.
                </p>
                <h3>6.2 Medidas de segurança</h3>
                <p>Adotamos as seguintes medidas técnicas e organizacionais:</p>
                <ul>
                    <li>Criptografia de dados em trânsito (TLS/SSL) e em repouso;</li>
                    <li>Row Level Security (RLS) — cada usuário acessa exclusivamente seus próprios dados;</li>
                    <li>Autenticação segura com tokens JWT;</li>
                    <li>Senhas armazenadas com hash bcrypt (nunca em texto plano);</li>
                    <li>Backups automáticos diários;</li>
                    <li>Monitoramento contínuo de acessos e atividades suspeitas;</li>
                    <li>Revisão periódica de políticas de segurança;</li>
                    <li><strong>Anonimização de IA:</strong> Seus dados privados não são utilizados para treinamento público de modelos de terceiros sem autorização expressa.</li>
                </ul>
            </section>

            <section id="portal-cliente" className="legal-section mb-12">
                <h2>6.3 Portal do Cliente e Onboarding</h2>
                <p>
                    O Themixa oferece uma funcionalidade de **Portal do Cliente**, onde o Usuário (Advogado) pode convidar seus próprios clientes para fornecer dados iniciais.
                </p>
                <ul>
                    <li>O Advogado é o **Controlador** dos dados de seus clientes.</li>
                    <li>O Themixa atua como **Operador** técnico ao processar esses dados.</li>
                    <li>Dados coletados via formulários de onboarding são criptografados e acessíveis apenas pelo Advogado responsável.</li>
                </ul>
            </section>

            <section id="direitos" className="legal-section mb-12">
                <h2>7. Seus Direitos (LGPD)</h2>
                <p>
                    Nos termos da LGPD (arts. 17 a 22), você possui os seguintes direitos em relação aos seus dados pessoais:
                </p>
                <ul>
                    <li>✅ <strong>Confirmação</strong> da existência de tratamento de dados;</li>
                    <li>✅ <strong>Acesso</strong> aos dados pessoais tratados;</li>
                    <li>✅ <strong>Correção</strong> de dados incompletos, inexatos ou desatualizados;</li>
                    <li>✅ <strong>Anonimização, bloqueio ou eliminação</strong> de dados desnecessários ou tratados em desconformidade;</li>
                    <li>✅ <strong>Portabilidade</strong> dos dados a outro fornecedor (quando aplicável);</li>
                    <li>✅ <strong>Eliminação</strong> dos dados tratados com consentimento;</li>
                    <li>✅ <strong>Informação</strong> sobre compartilhamento com terceiros;</li>
                    <li>✅ <strong>Revogação</strong> do consentimento, quando aplicável;</li>
                    <li>✅ <strong>Oposição</strong> ao tratamento realizado com base em legítimo interesse.</li>
                </ul>
                <p>
                    Para exercer seus direitos, envie um e-mail para <a href="mailto:privacidade@themixa.com.br">privacidade@themixa.com.br</a>.
                    Responderemos em até 15 (quinze) dias úteis.
                </p>
            </section>

            <section id="cookies" className="legal-section mb-12">
                <h2>8. Cookies</h2>
                <p>
                    Utilizamos cookies e tecnologias similares para melhorar a experiência do usuário,
                    manter sessões de autenticação e coletar dados de analytics. Para mais informações,
                    consulte nossa <a href="/cookies">Política de Cookies</a>.
                </p>
            </section>

            <section id="retencao" className="legal-section mb-12">
                <h2>9. Retenção de Dados</h2>
                <p>Os dados pessoais serão mantidos:</p>
                <ul>
                    <li><strong>Durante a vigência da conta:</strong> enquanto o Usuário mantiver uma conta ativa;</li>
                    <li><strong>Após cancelamento:</strong> por até 90 (noventa) dias para possibilitar reativação;</li>
                    <li><strong>Obrigações legais:</strong> pelo prazo exigido por lei (ex.: dados fiscais por 5 anos);</li>
                    <li><strong>Exercício de direitos:</strong> pelo prazo necessário para defesa em processos judiciais.</li>
                </ul>
                <p>
                    Após os prazos acima, os dados serão anonimizados ou eliminados de forma segura.
                </p>
            </section>

            <section id="menores" className="legal-section mb-12">
                <h2>10. Menores de Idade</h2>
                <p>
                    A Plataforma não é destinada a menores de 18 (dezoito) anos. Não coletamos intencionalmente
                    dados pessoais de menores. Se tomarmos conhecimento de que coletamos dados de um menor,
                    tomaremos medidas para eliminar tais dados imediatamente.
                </p>
            </section>

            <section id="alteracoes" className="legal-section mb-12">
                <h2>11. Alterações nesta Política</h2>
                <p>
                    Esta Política de Privacidade pode ser atualizada periodicamente. Alterações significativas
                    serão comunicadas por e-mail ou notificação na Plataforma com antecedência mínima de
                    15 (quinze) dias. A data da última atualização consta no topo desta página.
                </p>
            </section>

            <section id="contato" className="legal-section mb-12">
                <h2>12. Contato e Encarregado (DPO)</h2>
                <p>Para questões relacionadas à privacidade e proteção de dados:</p>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 not-prose">
                    <div className="space-y-3">
                        <p className="text-slate-900 font-semibold">Encarregado de Proteção de Dados (DPO)</p>
                        <p className="text-slate-600 text-sm">📧 E-mail: <a href="mailto:privacidade@themixa.com.br" className="text-blue-600 hover:underline">privacidade@themixa.com.br</a></p>
                        <p className="text-slate-600 text-sm">📧 Geral: <a href="mailto:contato@themixa.com.br" className="text-blue-600 hover:underline">contato@themixa.com.br</a></p>
                        <p className="text-slate-600 text-sm">📱 Telefone: <a href="tel:+5511955821293" className="text-blue-600 hover:underline">11 95582-1293</a></p>
                        <p className="text-slate-600 text-sm">📍 Salvador, Bahia — Brasil</p>
                    </div>
                </div>
            </section>
        </LegalPageLayout>
    )
}
