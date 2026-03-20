import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { IndebitoCalculator } from "@/components/consumer/indebito-calculator"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ToolsConsentWrapper } from "@/components/tools/tools-consent-wrapper"

export default async function IndebitoPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    return (
        <DashboardLayout userId={user.id} userEmail={user.email || ""}>
            <ToolsConsentWrapper>
                <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <IndebitoCalculator />
                </div>
            </ToolsConsentWrapper>
        </DashboardLayout>
    )
}
