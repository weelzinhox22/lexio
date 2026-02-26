'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Send, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import imageCompression from 'browser-image-compression'

interface OnboardingFormProps {
    token: string
}

export function OnboardingForm({ token }: OnboardingFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const compressImage = async (file: File) => {
        if (!file.type.startsWith('image/')) return file;
        const options = {
            maxSizeMB: 1.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true
        };
        try {
            return await imageCompression(file, options);
        } catch (error) {
            console.error('Compression error:', error);
            return file;
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const formData = new FormData(e.currentTarget)

            // Check Files & Compress
            const doc = formData.get('document_front') as File
            if (!doc || doc.size === 0) {
                toast.error('Por favor, anexe uma cópia da sua Identidade (RG ou CNH).')
                setIsLoading(false)
                return
            }

            const compressedDoc = await compressImage(doc);
            formData.set('document_front', compressedDoc, compressedDoc.name);

            const proof = formData.get('proof_of_address') as File
            if (proof && proof.size > 0) {
                const compressedProof = await compressImage(proof);
                formData.set('proof_of_address', compressedProof, compressedProof.name);
            }

            const res = await fetch(`/api/onboarding/${token}`, {
                method: 'POST',
                body: formData // raw form data to upload files
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Erro ao processar o cadastro.')
            }

            toast.success('Cadastro finalizado com sucesso!')
            router.refresh() // Will render the "Completed" page state

        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : 'Um erro ocorreu.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="rg">Registro Geral (RG) <span className="text-red-500">*</span></Label>
                    <Input id="rg" name="rg" placeholder="Numeração do RG" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="profession">Profissão <span className="text-red-500">*</span></Label>
                    <Input id="profession" name="profession" placeholder="Sua profissão atual" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="marital_status">Estado Civil <span className="text-red-500">*</span></Label>
                    <Select name="marital_status" required>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                            <SelectItem value="casado">Casado(a)</SelectItem>
                            <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                            <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                            <SelectItem value="uniao_estavel">União Estável</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cep">CEP <span className="text-red-500">*</span></Label>
                    <Input id="cep" name="cep" placeholder="00000-000" maxLength={9} required />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="neighborhood">Bairro <span className="text-red-500">*</span></Label>
                    <Input id="neighborhood" name="neighborhood" placeholder="Nome do seu bairro" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="city">Cidade <span className="text-red-500">*</span></Label>
                    <Input id="city" name="city" placeholder="Ex: São Paulo" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="state">Estado (UF) <span className="text-red-500">*</span></Label>
                    <Input id="state" name="state" placeholder="Ex: SP" maxLength={2} required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address_number">Número (Residência) <span className="text-red-500">*</span></Label>
                    <Input id="address_number" name="address_number" placeholder="Número" required />
                </div>
            </div>

            <hr className="border-slate-100 my-6" />

            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-800">Documentação Necessária</h3>

                <div className="border border-dashed border-slate-300 bg-slate-50 p-4 rounded-xl relative group hover:border-indigo-400 transition-colors">
                    <input type="file" name="document_front" accept="image/*,.pdf" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" required />
                    <div className="flex flex-col items-center justify-center pointer-events-none text-slate-500 group-hover:text-indigo-600">
                        <UploadCloud className="h-6 w-6 mb-2" />
                        <span className="text-sm font-medium">Anexar RG ou CNH (Frente) <span className="text-red-500">*</span></span>
                        <span className="text-xs text-slate-400 mt-1">Clique ou Arraste o Arquivo Aqui</span>
                    </div>
                </div>

                <div className="border border-dashed border-slate-300 bg-slate-50 p-4 rounded-xl relative group hover:border-indigo-400 transition-colors">
                    <input type="file" name="proof_of_address" accept="image/*,.pdf" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                    <div className="flex flex-col items-center justify-center pointer-events-none text-slate-500 group-hover:text-indigo-600">
                        <UploadCloud className="h-6 w-6 mb-2" />
                        <span className="text-sm font-medium">Comprovante de Endereço (Opcional)</span>
                        <span className="text-xs text-slate-400 mt-1">Conta D&apos;água, Luz ou Telefone em seu nome</span>
                    </div>
                </div>
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-md mt-6" disabled={isLoading}>
                {isLoading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processando seu envio seguro...</>
                ) : (
                    <><Send className="h-4 w-4 mr-2" /> Finalizar Auto-Cadastro Seguro</>
                )}
            </Button>

            <p className="text-center text-[10px] text-slate-400 mt-4 leading-relaxed px-4">
                As informações fornecidas estão protegidas pelo Sigilo Profissional (Art. 36 do CED da OAB) e aderem rigorosamente à Lei Geral de Proteção de Dados (LGPD). Seus documentos viajarão por criptografia offline unicamente para seu advogado.
            </p>
        </form>
    )
}
