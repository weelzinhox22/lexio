'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner' // Assuming sonner is used for toasts, or we can just proceed without toast

interface ToolsConsentModalProps {
  isOpen: boolean
  userId: string
  onAccept: () => void
}

export function ToolsConsentModal({ isOpen, userId, onAccept }: ToolsConsentModalProps) {
  const [isChecked, setIsChecked] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const isButtonEnabled = isChecked && typedText.trim().toLowerCase() === 'aceito'

  const handleConfirm = async () => {
    if (!isButtonEnabled) return

    setIsLoading(true)
    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          tools_accepted: true,
          tools_accepted_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('Error accepting tools terms:', error)
        // If profile doesn't exist, we might need an upsert, but usually profile is created on signup.
      }
      
      onAccept()
      router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-amber-50 px-6 py-5 border-b border-amber-100 flex items-start gap-4">
              <div className="bg-amber-100 p-2.5 rounded-xl text-amber-700 shrink-0">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Aviso de Versão Beta e Isenção de Responsabilidade</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  Bem-vindo às Ferramentas de Cálculo do Themixa. Antes de continuar, você precisa ler e aceitar nossos termos.
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                <p className="font-semibold text-slate-900 flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-amber-500" />
                  Conferência Manual Obrigatória
                </p>
                Informamos que os cálculos (Execução Penal, Partilha, Indébito, etc.) são automatizados e servem <strong>exclusivamente como base de apoio</strong>. O advogado deve realizar a conferência manual obrigatória, não considerando o resultado como verdade absoluta. O Themixa isenta-se da responsabilidade por eventuais divergências judiciais ou equívocos nas petições geradas.
              </div>

              {/* Interactions */}
              <div className="space-y-5">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="pt-0.5">
                    <Checkbox 
                      id="terms-checkbox" 
                      checked={isChecked} 
                      onCheckedChange={(checked) => setIsChecked(checked as boolean)}
                      className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                    />
                  </div>
                  <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors select-none leading-relaxed">
                    Compreendo que o sistema está em desenvolvimento (Beta) e <strong>assumo a responsabilidade técnica</strong> pela conferência dos dados e cálculos antes de incluí-los em peças e autos.
                  </span>
                </label>

                <div className="pt-2">
                  <label htmlFor="accept-input" className="block text-sm font-medium text-slate-700 mb-2">
                    Para habilitar as ferramentas, digite <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">ACEITO</span> abaixo:
                  </label>
                  <Input
                    id="accept-input"
                    value={typedText}
                    onChange={(e) => setTypedText(e.target.value)}
                    placeholder="Digite ACEITO"
                    className="font-medium tracking-widest transition-all focus-visible:ring-slate-900"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
              <Link 
                href="/termos-ferramentas" 
                target="_blank"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline underline-offset-4"
              >
                Leia os Termos de Uso das Ferramentas na íntegra
              </Link>
              
              <Button
                onClick={handleConfirm}
                disabled={!isButtonEnabled || isLoading}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white min-w-[120px] transition-all"
              >
                {isLoading ? "Salvando..." : (
                  <span className="flex items-center gap-2">
                    Confirmar <ArrowRight size={16} />
                  </span>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
