import { Metadata } from 'next'
import { Cookie } from 'lucide-react'
import { LegalPageLayout } from '@/components/legal/legal-page-layout'

export const metadata: Metadata = {
    title: 'Política de Cookies | Themixa',
    description: 'Entenda como o Themixa utiliza cookies e tecnologias similares para melhorar sua experiência na plataforma.',
}

const tocItems = [
    { id: 'o-que-sao', label: '1. O que são Cookies' },
    { id: 'como-usamos', label: '2. Como Usamos Cookies' },
    { id: 'tipos', label: '3. Tipos de Cookies' },
    { id: 'cookies-utilizados', label: '4. Cookies que Utilizamos' },
    { id: 'terceiros', label: '5. Cookies de Terceiros' },
    { id: 'gerenciar', label: '6. Como Gerenciar Cookies' },
    { id: 'impacto', label: '7. Impacto da Desativação' },
    { id: 'local-storage', label: '8. Local Storage' },
    { id: 'atualizacoes', label: '9. Atualizações' },
    { id: 'contato', label: '10. Contato' },
]

export default function CookiesPage() {
    return (
        <LegalPageLayout
            title="Política de Cookies"
            subtitle="Entenda como utilizamos cookies e tecnologias similares para melhorar sua experiência na plataforma."
            lastUpdated="25 de fevereiro de 2026"
            icon={<Cookie className="h-7 w-7" />}
            tocItems={tocItems}
        >
            <section id="o-que-sao" className="legal-section mb-12">
                <h2>1. O que são Cookies</h2>
                <p>
                    Cookies são pequenos arquivos de texto armazenados no seu navegador ou dispositivo quando
                    você visita um site. Eles são amplamente utilizados para fazer os sites funcionarem de forma
                    mais eficiente, bem como para fornecer informações aos proprietários do site.
                </p>
                <p>
                    Tecnologias similares, como Local Storage e Session Storage, também podem ser utilizadas
                    com finalidades semelhantes e estão abrangidas por esta política.
                </p>
            </section>

            <section id="como-usamos" className="legal-section mb-12">
                <h2>2. Como Usamos Cookies</h2>
                <p>O Themixa utiliza cookies e tecnologias similares para:</p>
                <ul>
                    <li><strong>Autenticação:</strong> manter sua sessão ativa enquanto você navega pela plataforma;</li>
                    <li><strong>Segurança:</strong> prevenir acessos não autorizados e proteger contra fraudes;</li>
                    <li><strong>Preferências:</strong> lembrar suas configurações e preferências de uso;</li>
                    <li><strong>Analytics:</strong> compreender como os usuários interagem com a plataforma para melhorias;</li>
                    <li><strong>Funcionalidade:</strong> garantir o funcionamento correto de funcionalidades essenciais.</li>
                </ul>
            </section>

            <section id="tipos" className="legal-section mb-12">
                <h2>3. Tipos de Cookies</h2>

                <div className="grid gap-4 md:grid-cols-2 my-6 not-prose">
                    <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-3 h-3 rounded-full bg-green-500" />
                            <p className="text-slate-900 font-semibold text-sm">Cookies Essenciais</p>
                        </div>
                        <p className="text-slate-600 text-sm">
                            Necessários para o funcionamento básico do site. Não podem ser desativados sem prejuízo à funcionalidade.
                        </p>
                    </div>
                    <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-3 h-3 rounded-full bg-blue-500" />
                            <p className="text-slate-900 font-semibold text-sm">Cookies de Performance</p>
                        </div>
                        <p className="text-slate-600 text-sm">
                            Coletam informações sobre como os visitantes usam o site, para nos ajudar a melhorar a experiência.
                        </p>
                    </div>
                    <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-3 h-3 rounded-full bg-amber-500" />
                            <p className="text-slate-900 font-semibold text-sm">Cookies de Funcionalidade</p>
                        </div>
                        <p className="text-slate-600 text-sm">
                            Permitem que o site lembre suas escolhas (como idioma, tema e região) para oferecer recursos personalizados.
                        </p>
                    </div>
                    <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-3 h-3 rounded-full bg-slate-400" />
                            <p className="text-slate-900 font-semibold text-sm">Cookies de Sessão</p>
                        </div>
                        <p className="text-slate-600 text-sm">
                            Temporários — são apagados quando você fecha o navegador. Usados para manter estado de autenticação.
                        </p>
                    </div>
                </div>
            </section>

            <section id="cookies-utilizados" className="legal-section mb-12">
                <h2>4. Cookies que Utilizamos</h2>
                <p>Abaixo, detalhamos os cookies específicos utilizados pela plataforma Themixa:</p>

                <div className="overflow-x-auto my-6 not-prose">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="text-left p-3 font-semibold text-slate-900 border-b border-slate-200">Cookie</th>
                                <th className="text-left p-3 font-semibold text-slate-900 border-b border-slate-200">Tipo</th>
                                <th className="text-left p-3 font-semibold text-slate-900 border-b border-slate-200">Finalidade</th>
                                <th className="text-left p-3 font-semibold text-slate-900 border-b border-slate-200">Duração</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            <tr className="hover:bg-slate-50">
                                <td className="p-3 text-slate-900 font-mono text-xs">sb-*-auth-token</td>
                                <td className="p-3"><span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Essencial</span></td>
                                <td className="p-3 text-slate-600">Autenticação do Supabase — mantém a sessão do usuário</td>
                                <td className="p-3 text-slate-500">1 hora (renova automaticamente)</td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="p-3 text-slate-900 font-mono text-xs">sb-*-auth-token-code-verifier</td>
                                <td className="p-3"><span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Essencial</span></td>
                                <td className="p-3 text-slate-600">Verificação PKCE do fluxo de autenticação</td>
                                <td className="p-3 text-slate-500">Sessão</td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="p-3 text-slate-900 font-mono text-xs">__vercel_analytics</td>
                                <td className="p-3"><span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">Performance</span></td>
                                <td className="p-3 text-slate-600">Vercel Analytics — métricas de performance (anonimizado)</td>
                                <td className="p-3 text-slate-500">Sessão</td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="p-3 text-slate-900 font-mono text-xs">theme</td>
                                <td className="p-3"><span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">Funcionalidade</span></td>
                                <td className="p-3 text-slate-600">Preferência de tema (claro/escuro)</td>
                                <td className="p-3 text-slate-500">1 ano</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section id="terceiros" className="legal-section mb-12">
                <h2>5. Cookies de Terceiros</h2>
                <p>Alguns serviços terceiros integrados ao Themixa podem definir seus próprios cookies:</p>

                <div className="space-y-4 my-6 not-prose">
                    <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white">
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <span className="text-slate-600 font-bold text-sm">S</span>
                        </div>
                        <div>
                            <p className="text-slate-900 font-semibold text-sm">Supabase</p>
                            <p className="text-slate-600 text-sm">Cookies de autenticação e gerenciamento de sessão.</p>
                            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline">
                                Política de Privacidade do Supabase →
                            </a>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white">
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <span className="text-slate-600 font-bold text-sm">V</span>
                        </div>
                        <div>
                            <p className="text-slate-900 font-semibold text-sm">Vercel Analytics</p>
                            <p className="text-slate-600 text-sm">Métricas de performance e velocidade de carregamento. Dados são anonimizados e não identificam usuários individuais.</p>
                            <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline">
                                Política de Privacidade da Vercel →
                            </a>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white">
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <span className="text-slate-600 font-bold text-sm">St</span>
                        </div>
                        <div>
                            <p className="text-slate-900 font-semibold text-sm">Stripe</p>
                            <p className="text-slate-600 text-sm">Cookies de segurança utilizados durante o processo de checkout e pagamento.</p>
                            <a href="https://stripe.com/br/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline">
                                Política de Privacidade do Stripe →
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section id="gerenciar" className="legal-section mb-12">
                <h2>6. Como Gerenciar Cookies</h2>
                <p>
                    Você pode gerenciar ou desativar cookies por meio das configurações do seu navegador.
                    Cada navegador possui procedimentos próprios:
                </p>

                <div className="space-y-3 my-6 not-prose">
                    {[
                        { browser: 'Google Chrome', url: 'https://support.google.com/chrome/answer/95647' },
                        { browser: 'Mozilla Firefox', url: 'https://support.mozilla.org/pt-BR/kb/protecao-aprimorada-contra-rastreamento-firefox-desktop' },
                        { browser: 'Microsoft Edge', url: 'https://support.microsoft.com/pt-br/microsoft-edge/excluir-cookies-no-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09' },
                        { browser: 'Safari', url: 'https://support.apple.com/pt-br/guide/safari/sfri11471/mac' },
                        { browser: 'Opera', url: 'https://help.opera.com/en/latest/web-preferences/#cookies' },
                    ].map((item) => (
                        <a
                            key={item.browser}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm hover:translate-x-1 transition-all group"
                        >
                            <span className="text-slate-900 font-medium text-sm">{item.browser}</span>
                            <span className="text-slate-400 text-sm group-hover:text-blue-600 transition-colors">
                                Ver instruções →
                            </span>
                        </a>
                    ))}
                </div>
            </section>

            <section id="impacto" className="legal-section mb-12">
                <h2>7. Impacto da Desativação de Cookies</h2>
                <p>
                    A desativação de cookies pode impactar o funcionamento da plataforma Themixa:
                </p>
                <div className="bg-amber-50 rounded-xl p-6 border border-amber-200 not-prose my-4">
                    <p className="text-amber-900 font-semibold mb-3">⚠️ Atenção</p>
                    <ul className="space-y-2 text-amber-800 text-sm">
                        <li>• <strong>Cookies essenciais desativados:</strong> Você não conseguirá fazer login ou acessar o dashboard;</li>
                        <li>• <strong>Cookies de performance desativados:</strong> Não poderemos melhorar a plataforma com base no uso;</li>
                        <li>• <strong>Cookies de funcionalidade desativados:</strong> Suas preferências (como tema) não serão salvas.</li>
                    </ul>
                </div>
                <p>
                    Recomendamos manter os cookies essenciais ativados para garantir o funcionamento adequado
                    de todas as funcionalidades da plataforma.
                </p>
            </section>

            <section id="local-storage" className="legal-section mb-12">
                <h2>8. Local Storage e Session Storage</h2>
                <p>
                    Além de cookies, utilizamos tecnologias de armazenamento local do navegador (Local Storage e
                    Session Storage) para:
                </p>
                <ul>
                    <li>Armazenar preferências de interface do usuário;</li>
                    <li>Manter estado de componentes da aplicação;</li>
                    <li>Armazenar dados temporários para melhorar a performance;</li>
                    <li>Rastrear códigos de referência para o programa de indicações.</li>
                </ul>
                <p>
                    Estes dados são armazenados exclusivamente no seu dispositivo e podem ser limpos
                    através das configurações do navegador.
                </p>
            </section>

            <section id="atualizacoes" className="legal-section mb-12">
                <h2>9. Atualizações desta Política</h2>
                <p>
                    Esta Política de Cookies pode ser atualizada periodicamente para refletir mudanças
                    nos cookies utilizados ou em resposta a alterações legislativas. A data da última
                    atualização é indicada no topo desta página.
                </p>
                <p>
                    Recomendamos que você consulte esta página regularmente para se manter informado
                    sobre como utilizamos cookies.
                </p>
            </section>

            <section id="contato" className="legal-section mb-12">
                <h2>10. Contato</h2>
                <p>Se você tiver dúvidas sobre o uso de cookies no Themixa, entre em contato:</p>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 not-prose">
                    <div className="space-y-3">
                        <p className="text-slate-900 font-semibold">Themixa Tecnologia Ltda.</p>
                        <p className="text-slate-600 text-sm">📧 E-mail: <a href="mailto:privacidade@themixa.com.br" className="text-blue-600 hover:underline">privacidade@themixa.com.br</a></p>
                        <p className="text-slate-600 text-sm">📱 Telefone: <a href="tel:+5511955821293" className="text-blue-600 hover:underline">11 95582-1293</a></p>
                        <p className="text-slate-600 text-sm">📍 Salvador, Bahia — Brasil</p>
                    </div>
                </div>
            </section>
        </LegalPageLayout>
    )
}
