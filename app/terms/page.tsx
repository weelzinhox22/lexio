import { Metadata } from 'next'
import { FileText } from 'lucide-react'
import { LegalPageLayout } from '@/components/legal/legal-page-layout'

export const metadata: Metadata = {
    title: 'Termos de Uso | Themixa',
    description: 'Termos de uso e condições gerais de utilização da plataforma Themixa de gestão jurídica.',
}

const tocItems = [
    { id: 'aceitacao', label: '1. Aceitação dos Termos' },
    { id: 'definicoes', label: '2. Definições' },
    { id: 'cadastro', label: '3. Cadastro e Conta' },
    { id: 'uso-plataforma', label: '4. Uso da Plataforma' },
    { id: 'planos-pagamento', label: '5. Planos e Pagamento' },
    { id: 'propriedade-intelectual', label: '6. Propriedade Intelectual' },
    { id: 'responsabilidades', label: '7. Responsabilidades' },
    { id: 'limitacao', label: '8. Limitação de Responsabilidade' },
    { id: 'cancelamento', label: '9. Cancelamento e Rescisão' },
    { id: 'alteracoes', label: '10. Alterações dos Termos' },
    { id: 'disposicoes-gerais', label: '11. Disposições Gerais' },
    { id: 'contato', label: '12. Contato' },
]

export default function TermsPage() {
    return (
        <LegalPageLayout
            title="Termos de Uso"
            subtitle="Leia atentamente os termos e condições que regem a utilização da plataforma Themixa."
            lastUpdated="25 de fevereiro de 2026"
            icon={<FileText className="h-7 w-7" />}
            tocItems={tocItems}
        >
            <section id="aceitacao" className="legal-section mb-12">
                <h2>1. Aceitação dos Termos</h2>
                <p>
                    Ao acessar ou utilizar a plataforma <strong>Themixa</strong> (&quot;Plataforma&quot;), operada por Themixa Tecnologia Ltda.
                    (&quot;Themixa&quot;, &quot;nós&quot;, &quot;nosso&quot;), você (&quot;Usuário&quot;, &quot;você&quot;) declara que leu, compreendeu e concorda
                    com estes Termos de Uso (&quot;Termos&quot;).
                </p>
                <p>
                    Caso não concorde com qualquer disposição destes Termos, você não deverá utilizar a Plataforma.
                    O uso continuado após alterações nos Termos constitui aceitação das modificações.
                </p>
            </section>

            <section id="definicoes" className="legal-section mb-12">
                <h2>2. Definições</h2>
                <p>Para os fins destes Termos, consideram-se:</p>
                <ul>
                    <li><strong>Plataforma:</strong> o sistema web Themixa, acessível via navegador de internet, incluindo todas as suas funcionalidades, APIs e integrações.</li>
                    <li><strong>Usuário:</strong> qualquer pessoa física ou jurídica que se cadastre e utilize a Plataforma.</li>
                    <li><strong>Conta:</strong> o perfil individual criado pelo Usuário para acessar a Plataforma.</li>
                    <li><strong>Conteúdo do Usuário:</strong> dados, documentos, informações e arquivos inseridos pelo Usuário na Plataforma.</li>
                    <li><strong>Dados Pessoais:</strong> informações relacionadas a uma pessoa natural identificada ou identificável, nos termos da LGPD (Lei nº 13.709/2018).</li>
                    <li><strong>Assinatura:</strong> plano contratado pelo Usuário para acesso às funcionalidades da Plataforma.</li>
                </ul>
            </section>

            <section id="cadastro" className="legal-section mb-12">
                <h2>3. Cadastro e Conta</h2>
                <h3>3.1 Requisitos</h3>
                <p>
                    Para utilizar a Plataforma, o Usuário deve ser maior de 18 (dezoito) anos ou ter capacidade jurídica plena.
                    O cadastro requer fornecimento de informações verídicas, atualizadas e completas.
                </p>
                <h3>3.2 Responsabilidade pela Conta</h3>
                <p>
                    O Usuário é o único responsável por manter a confidencialidade de suas credenciais de acesso (e-mail e senha).
                    Qualquer atividade realizada por meio de sua conta será de sua inteira responsabilidade.
                </p>
                <h3>3.3 Segurança</h3>
                <p>
                    O Usuário deve notificar o Themixa imediatamente caso suspeite de qualquer uso não autorizado de sua conta
                    ou de qualquer outra violação de segurança. O Themixa não será responsável por perdas decorrentes do uso
                    não autorizado de sua conta.
                </p>
            </section>

            <section id="uso-plataforma" className="legal-section mb-12">
                <h2>4. Uso da Plataforma</h2>
                <h3>4.1 Finalidade</h3>
                <p>
                    A Plataforma é destinada exclusivamente à gestão de atividades jurídicas, incluindo, mas não se limitando a:
                    controle de processos, gestão de prazos, gestão de clientes, documentos e finanças.
                </p>
                <h3>4.2 Uso Permitido</h3>
                <p>O Usuário se compromete a utilizar a Plataforma de acordo com a legislação vigente, estes Termos e a moral e bons costumes. É vedado:</p>
                <ul>
                    <li>Utilizar a Plataforma para fins ilícitos ou em desacordo com estes Termos;</li>
                    <li>Reproduzir, copiar, modificar, distribuir, transmitir ou comercializar qualquer parte da Plataforma;</li>
                    <li>Realizar engenharia reversa, descompilação ou desmontagem de qualquer componente da Plataforma;</li>
                    <li>Interferir ou interromper a integridade ou o desempenho da Plataforma;</li>
                    <li>Tentar obter acesso não autorizado à Plataforma, seus servidores ou sistemas;</li>
                    <li>Utilizar bots, scrapers ou qualquer ferramenta automatizada para acessar a Plataforma;</li>
                    <li>Compartilhar suas credenciais de acesso com terceiros.</li>
                </ul>
                <h3>4.3 Caráter Auxiliar</h3>
                <p>
                    <strong>A Plataforma é uma ferramenta auxiliar de gestão e NÃO substitui a análise jurídica profissional.</strong>
                    Alertas de prazos, notificações e demais funcionalidades são meramente informativas e não dispensam a conferência
                    direta nos autos processuais e nos sistemas oficiais do Poder Judiciário.
                </p>
                <h3>4.4 Inteligência Artificial</h3>
                <p>
                    A Plataforma utiliza modelos de IA para geração de teses, minutas e análise de dados. O Usuário reconhece que:
                </p>
                <ul>
                    <li>A IA pode gerar resultados imprecisos ou incompletos ("alucinações");</li>
                    <li>O Usuário é o único responsável pela revisão final de qualquer texto gerado pela IA;</li>
                    <li>Não deve haver confiança cega nos cálculos ou teses sugeridas sem conferência legal prévia.</li>
                </ul>
            </section>

            <section id="planos-pagamento" className="legal-section mb-12">
                <h2>5. Planos e Pagamento</h2>
                <h3>5.1 Período de Teste</h3>
                <p>
                    O Themixa oferece um período de teste gratuito de 7 (sete) dias para novos Usuários.
                    Após o término do período de teste, o Usuário deverá contratar um plano para continuar
                    utilizando a Plataforma.
                </p>
                <h3>5.2 Planos Disponíveis</h3>
                <p>
                    Os planos disponíveis, seus preços e funcionalidades estão descritos na página de assinatura da Plataforma.
                    O Themixa reserva-se o direito de alterar os preços mediante aviso prévio de 30 (trinta) dias.
                </p>
                <h3>5.3 Forma de Pagamento</h3>
                <p>
                    Os pagamentos são processados por meio do Stripe, plataforma terceirizada de pagamentos.
                    O Themixa não armazena dados de cartão de crédito. As cobranças são realizadas automaticamente
                    no ciclo de faturamento contratado (mensal ou anual).
                </p>
                <h3>5.4 Reembolso</h3>
                <p>
                    Em caso de cancelamento nos primeiros 7 (sete) dias após a contratação de um plano pago,
                    o Usuário terá direito ao reembolso integral. Após esse prazo, não haverá reembolso proporcional,
                    mas o acesso será mantido até o final do período pago.
                </p>
            </section>

            <section id="propriedade-intelectual" className="legal-section mb-12">
                <h2>6. Propriedade Intelectual</h2>
                <h3>6.1 Titularidade</h3>
                <p>
                    Todos os direitos de propriedade intelectual sobre a Plataforma, incluindo código-fonte, design,
                    logotipos, marcas, nomes comerciais e todos os conteúdos produzidos pelo Themixa são de titularidade
                    exclusiva do Themixa e protegidos pela legislação aplicável.
                </p>
                <h3>6.2 Licença de Uso</h3>
                <p>
                    O Themixa concede ao Usuário uma licença limitada, não exclusiva, intransferível e revogável para
                    utilizar a Plataforma de acordo com estes Termos, pelo período de vigência da assinatura.
                </p>
                <h3>6.3 Conteúdo do Usuário</h3>
                <p>
                    O Usuário mantém a titularidade sobre todo o Conteúdo do Usuário inserido na Plataforma.
                    Ao inserir conteúdo, o Usuário concede ao Themixa uma licença limitada para processar,
                    armazenar e exibir tais conteúdos exclusivamente para a prestação dos serviços.
                </p>
                <h3>6.4 Templates Compartilhados</h3>
                <p>
                    Ao optar por "Salvar como Template Coletivo", o Usuário concede ao Themixa e aos demais usuários uma licença irrevogável, mundial e gratuita para utilizar as estruturas e minutas (mantendo a anonimização de dados reais) visando o benefício da comunidade jurídica da plataforma.
                </p>
            </section>

            <section id="responsabilidades" className="legal-section mb-12">
                <h2>7. Responsabilidades</h2>
                <h3>7.1 Do Themixa</h3>
                <p>O Themixa se compromete a:</p>
                <ul>
                    <li>Manter a Plataforma disponível de forma contínua, salvo manutenções programadas ou eventos de força maior;</li>
                    <li>Proteger os dados do Usuário conforme a legislação vigente, incluindo a LGPD;</li>
                    <li>Corrigir defeitos e falhas na Plataforma em prazo razoável;</li>
                    <li>Enviar notificações e alertas conforme as configurações do Usuário.</li>
                </ul>
                <h3>7.2 Do Usuário</h3>
                <p>O Usuário é responsável por:</p>
                <ul>
                    <li>Fornecer informações verídicas e atualizadas no cadastro;</li>
                    <li>Manter a segurança de suas credenciais de acesso;</li>
                    <li>Verificar a veracidade dos alertas e prazos diretamente nos autos;</li>
                    <li>Cumprir a legislação vigente e os termos deste contrato;</li>
                    <li>Realizar backup de seus dados quando julgar necessário.</li>
                </ul>
            </section>

            <section id="limitacao" className="legal-section mb-12">
                <h2>8. Limitação de Responsabilidade</h2>
                <p>
                    Na máxima extensão permitida pela legislação aplicável, o Themixa <strong>não será responsável</strong> por:
                </p>
                <ul>
                    <li>Danos indiretos, incidentais, especiais, consequenciais ou punitivos;</li>
                    <li>Perda de processos, prazos, dados ou oportunidades decorrentes do uso ou impossibilidade de uso da Plataforma;</li>
                    <li>Falhas em integrações com serviços terceiros (Stripe, APIs do Judiciário, etc.);</li>
                    <li>Indisponibilidade temporária causada por manutenção, falhas de internet ou eventos de força maior;</li>
                    <li>Ações ou omissões do Usuário relativas à conferência de prazos e informações processuais.</li>
                </ul>
                <p>
                    <strong>A responsabilidade total do Themixa, por qualquer causa, estará limitada ao valor total
                        pago pelo Usuário nos 12 (doze) meses anteriores ao evento que deu origem à reclamação.</strong>
                </p>
            </section>

            <section id="cancelamento" className="legal-section mb-12">
                <h2>9. Cancelamento e Rescisão</h2>
                <h3>9.1 Pelo Usuário</h3>
                <p>
                    O Usuário pode cancelar sua assinatura a qualquer momento, sem multas ou taxas de cancelamento.
                    O acesso será mantido até o final do período já pago. Os dados do Usuário permanecerão armazenados
                    por até 90 (noventa) dias após o cancelamento, período no qual poderá solicitar a exportação.
                </p>
                <h3>9.2 Pelo Themixa</h3>
                <p>
                    O Themixa pode suspender ou encerrar a conta do Usuário em caso de violação destes Termos,
                    uso indevido da Plataforma, atividades fraudulentas ou por determinação judicial, mediante notificação prévia
                    quando possível.
                </p>
                <h3>9.3 Efeitos da Rescisão</h3>
                <p>
                    Após a rescisão, o Usuário perderá o acesso à Plataforma. Os dados poderão ser deletados após
                    o período de retenção previsto nestes Termos e na Política de Privacidade.
                </p>
            </section>

            <section id="alteracoes" className="legal-section mb-12">
                <h2>10. Alterações dos Termos</h2>
                <p>
                    O Themixa reserva-se o direito de alterar estes Termos a qualquer momento. As alterações entrarão
                    em vigor após publicação na Plataforma. O Usuário será notificado sobre alterações materiais por
                    e-mail ou notificação na Plataforma com pelo menos 15 (quinze) dias de antecedência.
                </p>
                <p>
                    O uso continuado da Plataforma após a notificação constitui aceitação dos novos termos.
                </p>
            </section>

            <section id="disposicoes-gerais" className="legal-section mb-12">
                <h2>11. Disposições Gerais</h2>
                <h3>11.1 Independência das Cláusulas</h3>
                <p>
                    Se qualquer disposição destes Termos for considerada inválida ou inexequível, as demais cláusulas
                    permanecerão em pleno vigor e efeito.
                </p>
                <h3>11.2 Renúncia</h3>
                <p>
                    A tolerância com eventual descumprimento de qualquer disposição destes Termos não implica renúncia
                    ao direito de exigir o cumprimento da obrigação.
                </p>
                <h3>11.3 Foro</h3>
                <p>
                    Fica eleito o foro da Comarca de Salvador, Estado da Bahia, para dirimir quaisquer questões
                    oriundas destes Termos, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
                </p>
            </section>

            <section id="contato" className="legal-section mb-12">
                <h2>12. Contato</h2>
                <p>Para questões relacionadas a estes Termos de Uso, entre em contato:</p>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 not-prose">
                    <div className="space-y-3">
                        <p className="text-slate-900 font-semibold">Themixa Tecnologia Ltda.</p>
                        <p className="text-slate-600 text-sm">📧 E-mail: <a href="mailto:contato@themixa.com.br" className="text-blue-600 hover:underline">contato@themixa.com.br</a></p>
                        <p className="text-slate-600 text-sm">📱 Telefone: <a href="tel:+5511955821293" className="text-blue-600 hover:underline">11 95582-1293</a></p>
                        <p className="text-slate-600 text-sm">📍 Salvador, Bahia — Brasil</p>
                    </div>
                </div>
            </section>
        </LegalPageLayout>
    )
}
