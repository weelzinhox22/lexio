"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Gift, Users, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function ReferralSection({ userId }: { userId: string }) {
  const [referralCode, setReferralCode] = useState<string>("")
  const [referralLink, setReferralLink] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState<{
    total: number
    confirmed: number
    pending: number
  }>({ total: 0, confirmed: 0, pending: 0 })

  useEffect(() => {
    const loadReferralData = async () => {
      const supabase = createClient()
      
      // Buscar código de referral do usuário
      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", userId)
        .single()

      if (profile?.referral_code) {
        const code = profile.referral_code
        setReferralCode(code)
        const appUrl = window.location.origin
        setReferralLink(`${appUrl}/auth/sign-up?ref=${code}`)
      }

      // Buscar estatísticas
      const { data: referrals } = await supabase
        .from("referrals")
        .select("status")
        .eq("referrer_id", userId)

      if (referrals) {
        setStats({
          total: referrals.length,
          confirmed: referrals.filter(r => r.status === 'confirmed').length,
          pending: referrals.filter(r => r.status === 'pending').length,
        })
      }
    }

    if (userId) {
      loadReferralData()
    }
  }, [userId])

  const handleCopy = async () => {
    if (referralLink) {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!referralCode) {
    return null
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <Gift className="h-5 w-5 text-blue-600" />
            Indique e Ganhe
          </CardTitle>
          <Badge className="bg-blue-600 text-white">+7 dias Pro por indicação</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-slate-700 mb-3">
            Compartilhe seu link de indicação e ganhe <strong>7 dias de Pro grátis</strong> para cada amigo que se cadastrar.
          </p>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 p-3 bg-white rounded-lg border border-slate-200 font-mono text-sm break-all">
              {referralLink}
            </div>
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs">Total</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                <Check className="h-4 w-4" />
                <span className="text-xs">Confirmadas</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Pendentes</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-900">
              <strong>Como funciona:</strong> Seu amigo se cadastra usando seu link. Quando ele criar o primeiro prazo, você recebe 7 dias de Pro grátis automaticamente.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

