import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CopilotPanel from '@/components/copilot/CopilotPanel'

interface PageProps {
  params:       Promise<{ recursoId: string }>
  searchParams: Promise<{ function?: string }>
}

export default async function CopilotPage({ params, searchParams }: PageProps) {
  const { recursoId } = await params
  const { function: initialFunction } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: recurso } = await supabase
    .from('recursos')
    .select('id, titulo, resumen, eje_tematico, grados, tipo_recurso, area, areas')
    .eq('id', recursoId)
    .single()

  if (!recurso) {
    return (
      <div className="min-h-screen bg-lumen-bg flex items-center justify-center">
        <div className="text-center bg-white border border-gray-200 rounded-3xl p-12 shadow-card">
          <h2 className="text-lg font-bold text-[#1A3A5C] mb-2">Recurso no encontrado</h2>
          <Link href="/" className="text-sm text-[#8B2252] hover:underline">Volver al inicio</Link>
        </div>
      </div>
    )
  }

  const areasMostrar =
    Array.isArray(recurso.areas) && recurso.areas.length
      ? recurso.areas.join(' · ')
      : recurso.area ?? ''

  return (
    <div className="min-h-screen bg-lumen-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#8B2252]">Inicio</Link>
          <span>›</span>
          <Link href={`/recurso/${recurso.id}`} className="hover:text-[#8B2252]">{recurso.titulo}</Link>
          <span>›</span>
          <span className="text-[#1A3A5C] font-medium">Copiloto</span>
        </div>

        {/* Header del recurso */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-card p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B2252]/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#8B2252]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-[#8B2252] uppercase tracking-wider mb-1">Copiloto Pedagógico</div>
              <h1 className="text-xl font-bold text-[#1A3A5C] leading-tight">{recurso.titulo}</h1>
              <p className="text-xs text-gray-500 mt-1">
                {[areasMostrar, recurso.eje_tematico, (recurso.grados ?? []).join(', ')].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
        </div>

        {/* Panel del copiloto */}
        <CopilotPanel
          recursoId={recurso.id}
          initialFunction={initialFunction as 'adapt' | 'similar' | 'evaluate' | 'guide' | undefined}
        />
      </div>
    </div>
  )
}
