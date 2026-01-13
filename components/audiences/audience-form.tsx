"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

type Process = {
  id: string
  title: string
  process_number: string
}

type Client = {
  id: string
  name: string
}

type AudienceFormProps = {
  userId: string
  processes: Process[]
  clients: Client[]
  audience?: {
    id: string
    title: string
    description?: string
    audience_date: string
    audience_type?: string
    location?: string
    location_type?: string
    meeting_link?: string
    status: string
    notes?: string
    process_id?: string
    client_id?: string
  }
}

export function AudienceForm({ userId, processes, clients, audience }: AudienceFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [locationType, setLocationType] = useState<string>(audience?.location_type || "presencial")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setFeedback(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const audienceData = {
        user_id: userId,
        title: formData.get("title") as string,
        description: formData.get("description") as string || null,
        audience_date: formData.get("audience_date") as string,
        audience_type: formData.get("audience_type") as string || null,
        location: formData.get("location") as string || null,
        location_type: formData.get("location_type") as string || "presencial",
        meeting_link: formData.get("meeting_link") as string || null,
        status: "scheduled",
        notes: formData.get("notes") as string || null,
        process_id: formData.get("process_id") as string || null,
        client_id: formData.get("client_id") as string || null,
      }

      if (audience) {
        const { error } = await supabase
          .from("audiences")
          .update(audienceData)
          .eq("id", audience.id)
          .eq("user_id", userId)

        if (error) throw error
        setFeedback({ type: "success", message: "Audiência atualizada com sucesso!" })
      } else {
        const { error } = await supabase.from("audiences").insert(audienceData)

        if (error) throw error
        setFeedback({ type: "success", message: "Audiência cadastrada com sucesso! Você receberá lembretes automáticos." })
      }

      setTimeout(() => {
        router.push("/dashboard/audiences")
        router.refresh()
      }, 1500)
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao salvar audiência",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {feedback && (
        <Alert variant={feedback.type === "error" ? "destructive" : "default"} className={feedback.type === "success" ? "border-green-200 bg-green-50" : ""}>
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription className={feedback.type === "success" ? "text-green-900" : ""}>
            {feedback.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Título da Audiência *</Label>
          <Input
            id="title"
            name="title"
            placeholder="Ex: Audiência de Instrução - Processo 1234567-89.2023.8.26.0100"
            defaultValue={audience?.title}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="audience_date">Data e Hora *</Label>
          <Input
            id="audience_date"
            name="audience_date"
            type="datetime-local"
            defaultValue={audience?.audience_date ? new Date(audience.audience_date).toISOString().slice(0, 16) : undefined}
            required
          />
          <p className="text-xs text-slate-500">
            Você receberá lembretes automáticos 7 dias antes, 1 dia antes e no dia da audiência.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="audience_type">Tipo de Audiência</Label>
          <Select name="audience_type" defaultValue={audience?.audience_type || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instrucao">Instrução</SelectItem>
              <SelectItem value="conciliacao">Conciliação</SelectItem>
              <SelectItem value="julgamento">Julgamento</SelectItem>
              <SelectItem value="preliminar">Preliminar</SelectItem>
              <SelectItem value="justificacao">Justificação</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="process_id">Processo (Opcional)</Label>
          <Select name="process_id" defaultValue={audience?.process_id || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o processo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum</SelectItem>
              {processes.map((process) => (
                <SelectItem key={process.id} value={process.id}>
                  {process.process_number} - {process.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_id">Cliente (Opcional)</Label>
          <Select name="client_id" defaultValue={audience?.client_id || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location_type">Tipo de Local</Label>
          <Select
            name="location_type"
            value={locationType}
            onValueChange={setLocationType}
            defaultValue={audience?.location_type || "presencial"}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="presencial">Presencial</SelectItem>
              <SelectItem value="virtual">Virtual</SelectItem>
              <SelectItem value="hibrido">Híbrido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">
            {locationType === "virtual" ? "Plataforma / Link" : "Local *"}
          </Label>
          <Input
            id="location"
            name="location"
            placeholder={locationType === "virtual" ? "Ex: Google Meet, Zoom, Teams" : "Ex: Fórum Central - Sala 205"}
            defaultValue={audience?.location}
            required={locationType !== "virtual"}
          />
        </div>

        {locationType === "virtual" && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="meeting_link">Link da Reunião</Label>
            <Input
              id="meeting_link"
              name="meeting_link"
              type="url"
              placeholder="https://meet.google.com/xxx-yyyy-zzz"
              defaultValue={audience?.meeting_link}
            />
          </div>
        )}

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Informações adicionais sobre a audiência..."
            rows={3}
            defaultValue={audience?.description || ""}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Anotações pessoais sobre a audiência..."
            rows={2}
            defaultValue={audience?.notes || ""}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800 text-white">
          {isLoading ? "Salvando..." : audience ? "Atualizar Audiência" : "Cadastrar Audiência"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}


