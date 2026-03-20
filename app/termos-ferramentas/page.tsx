import Link from "next/link"
import { ArrowLeft, Scale, Shield, AlertTriangle, AlertCircle } from "lucide-react"

export const metadata = {
  title: "Termos de Uso das Ferramentas Beta - Themixa",
  description: "Termos de responsabilidade para uso das ferramentas de cálculo e inteligência.",
}

export default function TermosFerramentasPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 py-6 px-6 sm:px-12 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 h-10 w-10 flex text-white items-center justify-center rounded-xl shadow-lg">
              <Scale size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Themixa</h1>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar ao painel
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 sm:px-12 py-12">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-8 sm:p-12 overflow-hidden relative">
          
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Shield size={200} />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold tracking-wide uppercase mb-6">
              <AlertTriangle size={14} />
              Termos de Responsabilidade
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-8">
              Termos de Uso das Ferramentas Beta e Isenção de Responsabilidade
            </h2>

            <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
              <p className="text-lg leading-relaxed text-slate-700">
                O Themixa disponibiliza diversas ferramentas e simuladores projetados para facilitar cálculos complexos (como Execução Penal, Partilha de Bens, Repetição de Indébito e Danos Morais). No entanto, <strong>é fundamental compreender as limitações dessas ferramentas</strong> antes de sua utilização.
              </p>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertCircle size={20} className="text-blue-600" />
                  1. Natureza Auxiliar e Obrigação de Conferência
                </h3>
                <p>
                  As ferramentas de cálculo são geradas a partir de algoritmos e inteligência artificial que atuam <strong>exclusivamente como base de apoio</strong>. O resultado obtido <strong>NÃO</strong> deve ser considerado como verdade absoluta. O profissional de advocacia, sendo o responsável técnico perante seu cliente e o Poder Judiciário, assume a responsabilidade <strong>integral e exclusiva</strong> pela conferência manual dos parâmetros inseridos, das fórmulas geradas e dos resultados obtidos.
                </p>
              </div>

              <h3>2. Ausência de Garantias</h3>
              <p>
                Os cálculos matemáticos, deduções previdenciárias, juros de mora, remição de pena e regras sucessórias podem passar por atualizações legislativas constantes e variações jurisprudenciais complexas. O Themixa atua arduamente para manter o software atualizado, mas <strong>não oferece garantias expressas ou implícitas de exatidão matemática, predição infalível e aplicabilidade irrestrita</strong> dos resultados para todos os casos práticos concebíveis sem a devida correção pelo advogado responsável.
              </p>

              <h3>3. Ferramentas em Fase de Desenvolvimento (Beta)</h3>
              <p>
                Algumas ou todas as funções analíticas ou geradoras do Themixa operam em fase Beta. Isso significa que elas estão sujeitas a ajustes, instabilidades, mudanças de interface e melhorias contínuas. A inserção dos dados sensíveis do seu cliente ou do processo continua protegida em conformidade com as nossas políticas de Privacidade e a Lei Geral de Proteção de Dados (LGPD).
              </p>

              <h3>4. Consequências Judiciais</h3>
              <p>
                O Themixa, seus criadores, parceiros ou fornecedores de tecnologia <strong>isentam-se expressamente</strong> de qualquer responsabilidade solidária ou subsidiária por danos materiais, morais, lucros cessantes ou qualquer outro prejuízo, direto ou indireto, suportado pelos advogados assinantes, por seus clientes ou por terceiros, em decorrência do peticionamento nos autos ou do aconselhamento legal com base numérica derivada desta plataforma.
              </p>

              <hr className="border-slate-200 my-8" />

              <p className="text-sm text-slate-500">
                Ao digitar "ACEITO" no modal de liberação das Ferramentas, o usuário concorda total e inequivocamente com as condições expostas neste Termo de Responsabilidade.
                <br /><br />
                <strong>Última atualização:</strong> 20 de Março de 2026.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
