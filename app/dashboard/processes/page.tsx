import { Metadata } from 'next'
import { ProcessSearch } from '@/components/processes/processes-search'

export const metadata: Metadata = {
  title: 'Busca de Processos | Dashboard',
  description: 'Busque e acompanhe processos judiciais em tempo real',
}

export default function ProcessesPage() {
  return (
    <div className="w-full h-full bg-background">
      <ProcessSearch />
    </div>
  )
}
