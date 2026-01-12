import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProcessesSearchByNumber } from '@/components/processes/processes-search-by-number'

export default async function ProcessesSearchPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Pesquisar (DataJud)</h1>
        <p className="text-slate-600 mt-1">
          Pesquise processos públicos por número (CNJ) usando a API do CNJ.
        </p>
      </div>

      <ProcessesSearchByNumber />
    </div>
  )
}


