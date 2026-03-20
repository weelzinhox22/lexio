import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LegalWriterInterface } from "@/components/ai/legal-writer-interface"
import { getAiHistory } from "./actions"

export default async function AIWriterPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/auth/login")

    // Fetch relevant context for the AI
    const { data: clients } = await supabase.from("clients").select("id, name").eq("user_id", user.id)
    const { data: processes } = await supabase.from("processes").select("id, title, process_number").eq("user_id", user.id)
    const history = await getAiHistory()

    return (
        <div className="space-y-6">
            <LegalWriterInterface
                clients={clients || []}
                processes={processes || []}
                initialHistory={history || []}
            />
        </div>
    )
}
