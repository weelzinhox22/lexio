import { Metadata } from 'next'
import { Lock } from 'lucide-react'
import { LegalPageLayout } from '@/components/legal/legal-page-layout'

export const metadata: Metadata = {
    title: 'Conformidade LGPD | Themixa',
    description: 'Saiba como o Themixa garante conformidade com a Lei Geral de Proteção de Dados (LGPD) e protege seus dados pessoais.',
}

const tocItems = [
    { id: 'compromisso', label: '1. Nosso Compromisso' },
    { id: 'o-que-e-lgpd', label: '2. O que é a LGPD' },
    { id: 'como-cumprimos', label: '3. Como Cumprimos a LGPD' },
    { id: 'seus-direitos', label: '4. Seus Direitos' },
    { id: 'como-exercer', label: '5. Como Exercer seus Direitos' },
    { id: 'bases-legais', label: '6. Bases Legais Utilizadas' },
    { id: 'seguranca', label: '7. Segurança dos Dados' },
    { id: 'incidentes', label: '8. Incidentes de Segurança' },
    { id: 'transferencia', label: '9. Transferência Internacional' },
    { id: 'encarregado', label: '10. Encarregado (DPO)' },
    { id: 'anpd', label: '11. Autoridade Nacional' },
]

export default function LGPDPage() {
    return (
        <LegalPageLayout
            title="Conformidade LGPD"
            subtitle="Nosso compromisso com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)."
            lastUpdated="25 de fevereiro de 2026"
            icon={<Lock className="h-7 w-7" />}
            tocItems={tocItems}
        >
            <section id="compromisso" className="legal-section mb-12">
                <h2>1. Nosso Compromisso</h2>
                <p>
                    O <strong>Themixa</strong> está comprometido com a conformidade integral à Lei Geral de Proteção
                    de Dados Pessoais (LGPD — Lei nº 13.709/2018). Como uma plataforma de gestão jurídica que trata
                    dados sensíveis de escritórios de advocacia e seus clientes, entendemos a importância da proteção
                    de dados pessoais e a tratamos como prioridade absoluta.
                </p>
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 not-prose my-6">
                    <p className="text-blue-900 font-semibold mb-2">🔒 Compromisso Themixa</p>
                    <p className="text-blue-800 text-sm leading-relaxed">
                        Tratamos seus dados pessoais com transparência, segurança e respeito aos seus direitos.
                        Nosso objetivo é garantir que você tenha total controle sobre suas informações.
                    </p>
                </div>
            </section>

            <section id="o-que-e-lgpd" className="legal-section mb-12">
                <h2>2. O que é a LGPD</h2>
                <p>
                    A Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), conhecida como LGPD, é a
                    legislação brasileira que regulamenta o tratamento de dados pessoais por pessoas físicas e
                    jurídicas, de direito público ou privado, com o objetivo de proteger os direitos fundamentais
                    de liberdade e de privacidade.
                </p>
                <p>A LGPD estabelece:</p>
                <ul>
                    <li>Regras claras sobre coleta, armazenamento, tratamento e compartilhamento de dados pessoais;</li>
                    <li>Direitos dos titulares dos dados;</li>
                    <li>Obrigações para controladores e operadores de dados;</li>
                    <li>Necessidade de base legal para todo tratamento de dados;</li>
                    <li>Criação da Autoridade Nacional de Proteção de Dados (ANPD).</li>
                </ul>
            </section>

            <section id="como-cumprimos" className="legal-section mb-12">
                <h2>3. Como o Themixa Cumpre a LGPD</h2>
                <h3>3.1 Papéis no Tratamento de Dados</h3>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 not-prose space-y-4 my-4">
                    <div className="flex gap-4 items-start">
                        <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full shrink-0">Controlador</span>
                        <div>
                            <p className="text-slate-900 font-medium text-sm">Themixa Tecnologia Ltda.</p>
                            <p className="text-slate-600 text-sm">Define as finalidades e meios do tratamento dos dados pessoais dos usuários da plataforma.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shrink-0">Operador</span>
                        <div>
                            <p className="text-slate-900 font-medium text-sm">Supabase, Stripe, Vercel, Brevo</p>
                            <p className="text-slate-600 text-sm">Processam dados pessoais em nome do Themixa, mediante contratos que garantem a conformidade com a LGPD.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shrink-0">Titular</span>
                        <div>
                            <p className="text-slate-900 font-medium text-sm">Você (Usuário)</p>
                            <p className="text-slate-600 text-sm">Pessoa natural a quem se referem os dados pessoais.</p>
                        </div>
                    </div>
                </div>

                <h3>3.2 Princípios que Seguimos</h3>
                <p>Todo tratamento de dados no Themixa segue os princípios da LGPD (art. 6º):</p>
                <ul>
                    <li><strong>Finalidade:</strong> Tratamos dados para propósitos legítimos, específicos e informados;</li>
                    <li><strong>Adequação:</strong> O tratamento é compatível com as finalidades informadas;</li>
                    <li><strong>Necessidade:</strong> Coletamos apenas os dados estritamente necessários;</li>
                    <li><strong>Livre acesso:</strong> Garantimos consulta fácil e gratuita sobre seus dados;</li>
                    <li><strong>Qualidade:</strong> Mantemos os dados exatos, claros e atualizados;</li>
                    <li><strong>Transparência:</strong> Informamos claramente sobre o tratamento realizado;</li>
                    <li><strong>Segurança:</strong> Protegemos os dados com medidas técnicas e administrativas;</li>
                    <li><strong>Prevenção:</strong> Adotamos medidas para prevenir danos;</li>
                    <li><strong>Não discriminação:</strong> Não realizamos tratamento com fins ilícitos ou abusivos;</li>
                    <li><strong>Responsabilização:</strong> Demonstramos a adoção de medidas de conformidade.</li>
                </ul>
            </section>

            <section id="seus-direitos" className="legal-section mb-12">
                <h2>4. Seus Direitos como Titular de Dados</h2>
                <p>Conforme os artigos 17 a 22 da LGPD, você tem direito a:</p>

                <div className="grid gap-3 my-6 not-prose">
                    {[
                        { right: 'Confirmação', desc: 'Saber se tratamos seus dados pessoais', article: 'Art. 18, I' },
                        { right: 'Acesso', desc: 'Obter cópia dos seus dados pessoais tratados', article: 'Art. 18, II' },
                        { right: 'Correção', desc: 'Corrigir dados incompletos, inexatos ou desatualizados', article: 'Art. 18, III' },
                        { right: 'Anonimização', desc: 'Anonimizar, bloquear ou eliminar dados excessivos', article: 'Art. 18, IV' },
                        { right: 'Portabilidade', desc: 'Transferir seus dados para outro fornecedor', article: 'Art. 18, V' },
                        { right: 'Eliminação', desc: 'Solicitar exclusão dos dados tratados com consentimento', article: 'Art. 18, VI' },
                        { right: 'Informação', desc: 'Saber com quem compartilhamos seus dados', article: 'Art. 18, VII' },
                        { right: 'Revogação', desc: 'Revogar consentimento dado anteriormente', article: 'Art. 18, IX' },
                    ].map((item) => (
                        <div key={item.right} className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all">
                            <div className="shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <span className="text-green-600 text-lg">✓</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-slate-900 font-semibold text-sm">{item.right}</p>
                                <p className="text-slate-600 text-sm">{item.desc}</p>
                            </div>
                            <span className="text-xs text-slate-400 shrink-0">{item.article}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section id="como-exercer" className="legal-section mb-12">
                <h2>5. Como Exercer seus Direitos</h2>
                <p>Você pode exercer seus direitos de três formas:</p>

                <div className="grid gap-4 md:grid-cols-3 my-6 not-prose">
                    <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 text-center">
                        <div className="text-3xl mb-3">📧</div>
                        <p className="text-slate-900 font-semibold text-sm mb-1">E-mail</p>
                        <a href="mailto:privacidade@themixa.com.br" className="text-blue-600 text-sm hover:underline">privacidade@themixa.com.br</a>
                    </div>
                    <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 text-center">
                        <div className="text-3xl mb-3">⚙️</div>
                        <p className="text-slate-900 font-semibold text-sm mb-1">Configurações</p>
                        <p className="text-slate-600 text-sm">Painel de configurações da sua conta</p>
                    </div>
                    <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 text-center">
                        <div className="text-3xl mb-3">📱</div>
                        <p className="text-slate-900 font-semibold text-sm mb-1">WhatsApp</p>
                        <a href="tel:+5511955821293" className="text-blue-600 text-sm hover:underline">11 95582-1293</a>
                    </div>
                </div>

                <p>
                    Suas solicitações serão atendidas em até <strong>15 (quinze) dias úteis</strong>, conforme
                    previsto no art. 18, §3º da LGPD. Poderemos solicitar a verificação de identidade para
                    garantir a segurança da solicitação.
                </p>
            </section>

            <section id="bases-legais" className="legal-section mb-12">
                <h2>6. Bases Legais Utilizadas</h2>
                <p>O Themixa utiliza as seguintes bases legais para o tratamento de dados pessoais:</p>
                <div className="overflow-x-auto my-6 not-prose">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="text-left p-3 font-semibold text-slate-900 border-b border-slate-200">Atividade</th>
                                <th className="text-left p-3 font-semibold text-slate-900 border-b border-slate-200">Base Legal (LGPD)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            <tr className="hover:bg-slate-50">
                                <td className="p-3 text-slate-600">Criação e gestão da conta</td>
                                <td className="p-3 text-slate-600">Execução de contrato (Art. 7º, V)</td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="p-3 text-slate-600">Envio de alertas de prazos</td>
                                <td className="p-3 text-slate-600">Execução de contrato (Art. 7º, V)</td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="p-3 text-slate-600">Processamento de pagamentos</td>
                                <td className="p-3 text-slate-600">Execução de contrato (Art. 7º, V)</td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="p-3 text-slate-600">Analytics e métricas de uso</td>
                                <td className="p-3 text-slate-600">Legítimo interesse (Art. 7º, IX)</td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="p-3 text-slate-600">Envio de newsletters</td>
                                <td className="p-3 text-slate-600">Consentimento (Art. 7º, I)</td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="p-3 text-slate-600">Retenção de dados fiscais</td>
                                <td className="p-3 text-slate-600">Obrigação legal (Art. 7º, II)</td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="p-3 text-slate-600">Prevenção a fraudes</td>
                                <td className="p-3 text-slate-600">Legítimo interesse (Art. 7º, IX)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section id="seguranca" className="legal-section mb-12">
                <h2>7. Segurança dos Dados</h2>
                <p>Medidas técnicas e organizacionais implementadas no Themixa:</p>

                <div className="grid gap-3 md:grid-cols-2 my-6 not-prose">
                    {[
                        { icon: '🔐', title: 'Criptografia', desc: 'TLS/SSL em trânsito e AES-256 em repouso' },
                        { icon: '🛡️', title: 'Row Level Security', desc: 'Isolamento total de dados entre usuários' },
                        { icon: '🔑', title: 'Autenticação JWT', desc: 'Tokens seguros com expiração automática' },
                        { icon: '💾', title: 'Backups diários', desc: 'Redundância com replicação geográfica' },
                        { icon: '🔒', title: 'Senhas com bcrypt', desc: 'Hash criptográfico irreversível' },
                        { icon: '📊', title: 'Monitoramento 24/7', desc: 'Detecção de acessos suspeitos' },
                    ].map((item) => (
                        <div key={item.title} className="flex gap-3 p-4 rounded-xl border border-slate-200 bg-white">
                            <span className="text-2xl shrink-0">{item.icon}</span>
                            <div>
                                <p className="text-slate-900 font-semibold text-sm">{item.title}</p>
                                <p className="text-slate-500 text-sm">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section id="incidentes" className="legal-section mb-12">
                <h2>8. Incidentes de Segurança</h2>
                <p>
                    Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos titulares,
                    o Themixa se compromete a:
                </p>
                <ul>
                    <li>Comunicar à <strong>ANPD</strong> e aos titulares afetados em prazo razoável (art. 48 da LGPD);</li>
                    <li>Descrever a natureza dos dados pessoais afetados;</li>
                    <li>Informar as medidas técnicas e de segurança adotadas;</li>
                    <li>Indicar os riscos relacionados ao incidente;</li>
                    <li>Informar as medidas adotadas para reverter ou mitigar os efeitos do incidente.</li>
                </ul>
            </section>

            <section id="transferencia" className="legal-section mb-12">
                <h2>9. Transferência Internacional de Dados</h2>
                <p>
                    Alguns dos nossos operadores (Supabase, Stripe, Vercel) possuem servidores fora do Brasil.
                    A transferência internacional de dados é realizada em conformidade com os arts. 33 a 36 da LGPD,
                    com base em:
                </p>
                <ul>
                    <li>Cláusulas contratuais que garantem nível adequado de proteção;</li>
                    <li>Cumprimento de normas do país de destino equivalentes à LGPD;</li>
                    <li>Certificações e programas de proteção de dados dos operadores (ex.: SOC 2, PCI-DSS).</li>
                </ul>
            </section>

            <section id="encarregado" className="legal-section mb-12">
                <h2>10. Encarregado de Proteção de Dados (DPO)</h2>
                <p>
                    O Themixa designou um Encarregado de Proteção de Dados (DPO), conforme exigido pelo art. 41
                    da LGPD, responsável por:
                </p>
                <ul>
                    <li>Aceitar reclamações e comunicações dos titulares;</li>
                    <li>Receber comunicações da ANPD;</li>
                    <li>Orientar funcionários e contratados sobre práticas de proteção de dados;</li>
                    <li>Executar as demais atribuições determinadas pelo controlador.</li>
                </ul>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 not-prose mt-4">
                    <div className="space-y-2">
                        <p className="text-slate-900 font-semibold">Encarregado (DPO)</p>
                        <p className="text-slate-600 text-sm">📧 <a href="mailto:privacidade@themixa.com.br" className="text-blue-600 hover:underline">privacidade@themixa.com.br</a></p>
                        <p className="text-slate-600 text-sm">📍 Salvador, Bahia — Brasil</p>
                    </div>
                </div>
            </section>

            <section id="anpd" className="legal-section mb-12">
                <h2>11. Autoridade Nacional de Proteção de Dados (ANPD)</h2>
                <p>
                    A ANPD é o órgão responsável por zelar, implementar e fiscalizar o cumprimento da LGPD.
                    Se você acredita que o tratamento dos seus dados pessoais viola a legislação,
                    pode entrar em contato diretamente com a ANPD:
                </p>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 not-prose">
                    <div className="space-y-2">
                        <p className="text-slate-900 font-semibold">Autoridade Nacional de Proteção de Dados</p>
                        <p className="text-slate-600 text-sm">🌐 Site: <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.gov.br/anpd</a></p>
                        <p className="text-slate-600 text-sm">📧 E-mail: <a href="mailto:encarregado@anpd.gov.br" className="text-blue-600 hover:underline">encarregado@anpd.gov.br</a></p>
                    </div>
                </div>
            </section>
        </LegalPageLayout>
    )
}
