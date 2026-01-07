import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { DocumentList } from "@/components/documents/document-list"
import { DocumentStats } from "@/components/documents/document-stats"

export default async function DocumentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: documents } = await supabase
    .from("documents")
    .select(
      `
      *,
      clients (
        id,
        name
      ),
      processes (
        id,
        title,
        process_number
      )
    `,
    )
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  // Calculate stats
  const totalDocs = documents?.length || 0
  const totalSize = documents?.reduce((acc, doc) => acc + (doc.file_size || 0), 0) || 0
  const categories = [...new Set(documents?.map((d) => d.category).filter(Boolean))].length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Documentos</h1>
          <p className="text-slate-600 mt-1">Gerencie todos os seus documentos jurídicos</p>
        </div>
        <Link href="/dashboard/documents/new">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Novo Documento
          </Button>
        </Link>
      </div>

      <DocumentStats totalDocs={totalDocs} totalSize={totalSize} categories={categories} />

      <Card className="border-slate-200">
        <DocumentList documents={documents || []} />
      </Card>
    </div>
  )
}
