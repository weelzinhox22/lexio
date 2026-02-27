"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Scale, Plus, Trash2, Info, Copy, FileText, Landmark } from "lucide-react"
import { toast } from "sonner"

interface Asset {
  id: string
  description: string
  value: number
  isSubrogated: boolean
  subrogationDetails: string
  ownership: "common" | "spouse_a" | "spouse_b"
}

export function PartilhaSimulator() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [marriageRegime, setMarriageRegime] = useState("comunhao_parcial")
  
  // Form State
  const [newAsset, setNewAsset] = useState({
    description: "",
    value: "",
    isSubrogated: false,
    subrogationDetails: "",
    ownership: "common" as Asset["ownership"]
  })

  const formatCurrency = (value: string) => {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, "")
    if (!digits) return ""
    
    // Converte para centavos
    const cents = parseInt(digits) / 100
    
    // Formata como BRL
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents)
  }

  const parseCurrency = (value: string) => {
    // Remove tudo que não é dígito e converte para float
    const digits = value.replace(/\D/g, "")
    if (!digits) return 0
    return parseInt(digits) / 100
  }

  const addAsset = () => {
    const numericValue = parseCurrency(newAsset.value)
    
    if (!newAsset.description || numericValue <= 0) {
      toast.error("Preencha a descrição e um valor válido para o bem")
      return
    }

    const asset: Asset = {
      id: Math.random().toString(36).substr(2, 9),
      description: newAsset.description,
      value: numericValue,
      isSubrogated: newAsset.isSubrogated,
      subrogationDetails: newAsset.subrogationDetails,
      ownership: newAsset.isSubrogated ? "spouse_a" : newAsset.ownership
    }

    setAssets([...assets, asset])
    setNewAsset({
      description: "",
      value: "",
      isSubrogated: false,
      subrogationDetails: "",
      ownership: "common"
    })
    toast.success("Bem adicionado à lista")
  }

  const removeAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id))
  }

  const totals = useMemo(() => {
    let common = 0
    let privateA = 0
    let privateB = 0

    assets.forEach(asset => {
      if (asset.ownership === "common") {
        common += asset.value
      } else if (asset.ownership === "spouse_a") {
        privateA += asset.value
      } else {
        privateB += asset.value
      }
    })

    return {
      common,
      privateA,
      privateB,
      total: common + privateA + privateB,
      shareA: (common / 2) + privateA,
      shareB: (common / 2) + privateB
    }
  }, [assets])

  const subrogatedAssets = assets.filter(a => a.isSubrogated)

  const thesisText = useMemo(() => {
    if (subrogatedAssets.length === 0) return ""

    const assetsList = subrogatedAssets.map(a => `${a.description} (${a.subrogationDetails})`).join(", ")
    
    return `Quanto aos bens ${assetsList}, impera o reconhecimento da incomunicabilidade. Conforme o Art. 1.659, inciso II, do Código Penal, excluem-se da comunhão os bens adquiridos com valores exclusivamente pertencentes a um dos cônjuges em sub-rogação dos bens particulares. No caso em tela, restou demonstrado que tais ativos originaram-se de recursos pré-matrimoniais ou da alienação de patrimônio particular anterior ao enlace, não integrando, portanto, a massa comum partilhável entre os ex-consortes.`
  }, [subrogatedAssets])

  const copyThesis = () => {
    navigator.clipboard.writeText(thesisText)
    toast.success("Tese de Sub-rogação copiada!")
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Simulador de Partilha</h1>
          <p className="text-slate-500">Arquiteto de divisão de bens e rastreador de sub-rogação.</p>
        </div>
        <div className="flex gap-2">
          <Select value={marriageRegime} onValueChange={setMarriageRegime}>
            <SelectTrigger className="w-[200px] bg-white border-slate-200">
              <SelectValue placeholder="Regime de Bens" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comunhao_parcial">Comunhão Parcial</SelectItem>
              <SelectItem value="comunhao_universal">Comunhão Universal</SelectItem>
              <SelectItem value="separacao_total">Separação Total</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Adicionar Bens */}
        <Card className="lg:col-span-1 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Novo Ativo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="asset-desc">Descrição do Bem</Label>
              <Input 
                id="asset-desc" 
                placeholder="Ex: Apartamento em Salvador" 
                value={newAsset.description}
                onChange={e => setNewAsset({...newAsset, description: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="asset-value">Valor Estimado</Label>
              <div className="relative">
                <Input 
                  id="asset-value" 
                  placeholder="R$ 0,00" 
                  value={newAsset.value}
                  onChange={e => {
                    const formatted = formatCurrency(e.target.value)
                    setNewAsset({...newAsset, value: formatted})
                  }}
                  className="pl-3 font-medium text-slate-900 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <Checkbox 
                id="subrogated" 
                checked={newAsset.isSubrogated}
                onCheckedChange={(checked) => setNewAsset({...newAsset, isSubrogated: checked === true})}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="subrogated"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Este bem é fruto de sub-rogação?
                </label>
                <p className="text-[10px] text-slate-500 italic">
                  Comprou usando dinheiro de um bem que já tinha antes?
                </p>
              </div>
            </div>

            {newAsset.isSubrogated && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="sub-details">Origem do Recurso / Prova</Label>
                <Input 
                  id="sub-details" 
                  placeholder="Ex: Vendido apto antes de casar" 
                  value={newAsset.subrogationDetails}
                  onChange={e => setNewAsset({...newAsset, subrogationDetails: e.target.value})}
                />
              </div>
            )}

            {!newAsset.isSubrogated && (
              <div className="space-y-2">
                <Label>Propriedade</Label>
                <Select value={newAsset.ownership} onValueChange={(val: any) => setNewAsset({...newAsset, ownership: val})}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Comum (50/50)</SelectItem>
                    <SelectItem value="spouse_a">Particular Cliente</SelectItem>
                    <SelectItem value="spouse_b">Particular Cônjuge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button className="w-full bg-slate-900 hover:bg-slate-800" onClick={addAsset}>
              Adicionar ao Inventário
            </Button>
          </CardContent>
        </Card>

        {/* Lista de Bens e Resultados */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Landmark className="h-5 w-5 text-slate-600" />
                Massa Patrimonial
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bem</TableHead>
                    <TableHead>Classificação</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-slate-400">
                        Nenhum bem adicionado. Comece pelo formulário ao lado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    assets.map((asset) => (
                      <TableRow key={asset.id} className="group">
                        <TableCell>
                          <div className="font-medium text-slate-900">{asset.description}</div>
                          {asset.isSubrogated && (
                            <div className="text-[10px] text-blue-600 flex items-center gap-1 mt-0.5">
                              <Info className="h-3 w-3" /> Sub-rogação: {asset.subrogationDetails}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {asset.ownership === "common" ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Meação (Comum)</Badge>
                          ) : asset.ownership === "spouse_a" ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Particular (Cliente)</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">Particular (Cônjuge)</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {asset.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeAsset(asset.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Resumo Financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-blue-600 text-white border-0 shadow-lg shadow-blue-200">
              <CardContent className="p-6 space-y-2">
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Cota do Cliente</p>
                <p className="text-3xl font-bold">R$ {totals.shareA.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <div className="pt-2 flex justify-between text-[11px] text-blue-100 border-t border-white/10">
                  <span>Particulares: R$ {totals.privateA.toLocaleString("pt-BR")}</span>
                  <span>Meação: R$ {(totals.common/2).toLocaleString("pt-BR")}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 text-white border-0 shadow-lg shadow-slate-200">
              <CardContent className="p-6 space-y-2">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Cota do Cônjuge</p>
                <p className="text-3xl font-bold">R$ {totals.shareB.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <div className="pt-2 flex justify-between text-[11px] text-slate-400 border-t border-white/10">
                  <span>Particulares: R$ {totals.privateB.toLocaleString("pt-BR")}</span>
                  <span>Meação: R$ {(totals.common/2).toLocaleString("pt-BR")}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tese Jurídica Gerada */}
          {thesisText && (
            <Card className="border-blue-200 bg-blue-50/30 overflow-hidden">
              <div className="bg-blue-600 px-4 py-2 flex items-center justify-between">
                <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Scale className="h-3.5 w-3.5" /> Tese de Sub-rogação Detectada
                </span>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-blue-700" onClick={copyThesis}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
              <CardContent className="p-4 space-y-4">
                <p className="text-sm text-slate-700 italic leading-relaxed">
                  "{thesisText}"
                </p>
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" className="bg-white text-blue-700 border-blue-200 gap-2" onClick={copyThesis}>
                    <Copy className="h-3.5 w-3.5" />
                    Copiar para Petição
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-900">Nota de Inteligência:</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Este simulador aplica as regras do **Código Civil (Art. 1.658 ao 1.666)** para o regime de Comunhão Parcial. Bens sub-rogados são excluídos da partilha comum conforme o **Art. 1.659, II**. Certifique-se de anexar provas documentais (extratos bancários, escrituras de venda e compra concomitantes) para sustentar a tese gerada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
