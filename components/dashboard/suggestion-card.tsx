"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, ArrowRight } from "lucide-react"
import { SuggestionDialog } from "@/components/feedback/suggestion-dialog"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function SuggestionCard() {
    const supabase = createClient()
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null))
    }, [])

    return (
        <Card className="rounded-2xl border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm border overflow-hidden relative group">
            <CardContent className="p-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
                        <MessageSquare className="h-7 w-7 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">O que falta no Themixa?</h3>
                        <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
                            Sua experiência molda o futuro da plataforma. Sugira novas automações, teses ou melhorias e ajude-nos a construir o melhor ecossistema jurídico do Brasil.
                        </p>
                    </div>
                </div>

                <SuggestionDialog
                    userId={userId || ""}
                    category="dashboard_card"
                    trigger={
                        <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 shadow-md hover:shadow-lg transition-all group/btn">
                            Sugerir Melhoria
                            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                    }
                />
            </CardContent>
        </Card>
    )
}
