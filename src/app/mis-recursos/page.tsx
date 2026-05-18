import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MisRecursosList from '@/components/mis-recursos/MisRecursosList'
import { tituloDe, funcionLabel } from '@/lib/copilot/generation-helpers'
import type { CopilotFunction } from '@/types/copilot'

interface Generation {
  id:                 string
  function:           CopilotFunction
  slug:               string
  output_json:        Record<string, unknown> | null
  source_resource_id: string | null
  created_at:         string
}

export default async function MisRecursosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: generations } = await supabase
    .from('ai_generations')
    .select('id, function, slug, output_json, source_resource_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(200)

  const gens = (generations ?? []) as Generation[]

  // Traer en bulk los títulos de los recursos fuente
  const resourceIds = Array.from(new Set(gens.map(g => g.source_resource_id).filter(Boolean) as string[]))
  let recursoTitulos: Record<string, string> = {}
  if (resourceIds.length > 0) {
    const { data: recursos } = await supabase
      .from('recursos')
      .select('id, titulo')
      .in('id', resourceIds)
    recursoTitulos = Object.fromEntries((recursos ?? []).map(r => [r.id, r.titulo]))
  }

  // Pre-procesamos para que el componente cliente reciba lo mínimo
  const items = gens.map(g => ({
    id:           g.id,
    titulo:       tituloDe(g),
    funcion:      funcionLabel(g.function),
    function:     g.function,
    recursoId:    g.source_resource_id,
    recursoTitulo: g.source_resource_id ? recursoTitulos[g.source_resource_id] ?? null : null,
    createdAt:    g.created_at,
  }))

  return (
    <div className="min-h-screen bg-lumen-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#8B2252]">Inicio</Link>
          <span>›</span>
          <span className="text-[#1A3A5C] font-medium">Mi biblioteca</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1A3A5C]">Mi biblioteca</h1>
          <p className="text-sm text-gray-500 mt-1">
            Lo que generaste con el copiloto pedagógico. Tuyo, accesible desde acá cuando lo necesites.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-card">
            <svg className="w-12 h-12 mx-auto text-[#8B2252]/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <h2 className="text-lg font-semibold text-[#1A3A5C] mb-1">Tu biblioteca está vacía</h2>
            <p className="text-sm text-gray-500 mb-6">
              Cuando uses el copiloto en cualquier recurso, lo que generes aparece acá.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B2252] text-white text-sm font-semibold hover:bg-[#8B2252]/90 transition-colors"
            >
              Ir a la biblioteca de recursos
            </Link>
          </div>
        ) : (
          <MisRecursosList items={items} />
        )}
      </div>
    </div>
  )
}
