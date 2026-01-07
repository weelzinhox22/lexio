"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Eye, Edit, Trash2, FileText } from "lucide-react"
import Link from "next/link"
import type { Document } from "@/lib/types/database"

type DocumentWithRelations = Document & {
  clients?: {
    id: string
    name: string
  } | null
  processes?: {
    id: string
    title: string
    process_number: string
  } | null
}

export function DocumentList({ documents }: { documents: DocumentWithRelations[] }) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-slate-600">Nenhum documento cadastrado ainda.</p>
        <Link href="/dashboard/documents/new">
          <Button className="mt-4 bg-slate-900 hover:bg-slate-800 text-white">Adicionar primeiro documento</Button>
        </Link>
      </div>
    )
  }

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "N/A"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      contrato: "bg-blue-100 text-blue-700",
      peticao: "bg-purple-100 text-purple-700",
      certidao: "bg-green-100 text-green-700",
      procuracao: "bg-amber-100 text-amber-700",
      sentenca: "bg-red-100 text-red-700",
    }
    return colors[category || ""] || "bg-slate-100 text-slate-700"
  }

  return (
    <div className="divide-y divide-slate-200">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
          <div className="flex flex-1 items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <FileText className="h-5 w-5 text-slate-600" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">{doc.title}</h3>
                {doc.category && <Badge className={getCategoryColor(doc.category)}>{doc.category}</Badge>}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span>{doc.file_name}</span>
                <span>•</span>
                <span>{formatSize(doc.file_size)}</span>
                {doc.processes && (
                  <>
                    <span>•</span>
                    <span>Processo: {doc.processes.process_number}</span>
                  </>
                )}
                {doc.clients && (
                  <>
                    <span>•</span>
                    <span>Cliente: {doc.clients.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700">
              <Download className="h-4 w-4" />
            </Button>
            <Link href={`/dashboard/documents/${doc.id}`}>
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/dashboard/documents/${doc.id}/edit`}>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
