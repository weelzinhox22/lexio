"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Video, Clock, ExternalLink } from "lucide-react"
import Link from "next/link"

type Audience = {
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
  processes?: {
    id: string
    title: string
    process_number: string
  } | null
  clients?: {
    id: string
    name: string
  } | null
}

type AudienceListProps = {
  audiences: Audience[]
  showPast?: boolean
}

export function AudienceList({ audiences, showPast = false }: AudienceListProps) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
  }

  const getStatusBadge = (status: string, date: string) => {
    const isPast = new Date(date) < new Date()
    
    if (status === 'completed') {
      return <Badge className="bg-green-600 text-white">Realizada</Badge>
    }
    if (status === 'cancelled') {
      return <Badge className="bg-red-600 text-white">Cancelada</Badge>
    }
    if (status === 'postponed') {
      return <Badge className="bg-yellow-600 text-white">Adiada</Badge>
    }
    if (isPast && status === 'scheduled') {
      return <Badge className="bg-orange-600 text-white">Atrasada</Badge>
    }
    return <Badge className="bg-blue-600 text-white">Agendada</Badge>
  }

  const getDaysUntil = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntil < 0) return `Há ${Math.abs(daysUntil)} dias`
    if (daysUntil === 0) return 'Hoje'
    if (daysUntil === 1) return 'Amanhã'
    return `Em ${daysUntil} dias`
  }

  const generateCalendarLink = (audience: Audience) => {
    const start = new Date(audience.audience_date)
    const end = new Date(start.getTime() + 60 * 60 * 1000) // 1 hora depois
    
    const title = encodeURIComponent(audience.title)
    const details = encodeURIComponent(
      `${audience.description || ''}\n\n` +
      `${audience.processes ? `Processo: ${audience.processes.process_number}\n` : ''}` +
      `${audience.clients ? `Cliente: ${audience.clients.name}\n` : ''}` +
      `${audience.location ? `Local: ${audience.location}\n` : ''}` +
      `${audience.meeting_link ? `Link: ${audience.meeting_link}` : ''}`
    )
    const location = encodeURIComponent(audience.location || '')
    
    const startStr = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const endStr = end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`
  }

  return (
    <div className="space-y-3">
      {audiences.map((audience) => {
        const { date, time } = formatDateTime(audience.audience_date)
        const isPast = new Date(audience.audience_date) < new Date()
        
        return (
          <Link key={audience.id} href={`/dashboard/audiences/${audience.id}`}>
            <div className={`p-4 rounded-lg border transition-all hover:shadow-md ${
              isPast && audience.status === 'scheduled'
                ? 'bg-orange-50 border-orange-200'
                : audience.status === 'completed'
                ? 'bg-green-50 border-green-200'
                : audience.status === 'cancelled'
                ? 'bg-red-50 border-red-200'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{audience.title}</h3>
                    {getStatusBadge(audience.status, audience.audience_date)}
                  </div>
                  
                  {audience.processes && (
                    <p className="text-xs text-slate-600 mb-1">
                      {audience.processes.process_number}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{date} às {time}</span>
                    </div>
                    
                    {audience.location && (
                      <div className="flex items-center gap-1">
                        {audience.location_type === 'virtual' ? (
                          <Video className="h-3 w-3" />
                        ) : (
                          <MapPin className="h-3 w-3" />
                        )}
                        <span className="truncate max-w-[150px]">{audience.location}</span>
                      </div>
                    )}
                    
                    {!isPast && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{getDaysUntil(audience.audience_date)}</span>
                      </div>
                    )}
                  </div>
                  
                  {audience.audience_type && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {audience.audience_type}
                    </Badge>
                  )}
                </div>
                
                {!showPast && audience.status === 'scheduled' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      window.open(generateCalendarLink(audience), '_blank')
                    }}
                    className="shrink-0"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Calendário
                  </Button>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

