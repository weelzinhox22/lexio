import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, HardDrive, FolderOpen } from "lucide-react"

export function DocumentStats({
  totalDocs,
  totalSize,
  categories,
}: {
  totalDocs: number
  totalSize: number
  categories: number
}) {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const stats = [
    {
      name: "Total de Documentos",
      value: totalDocs,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Espaço Utilizado",
      value: formatSize(totalSize),
      icon: HardDrive,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      name: "Categorias",
      value: categories,
      icon: FolderOpen,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ]

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.name} className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">{stat.name}</CardTitle>
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
