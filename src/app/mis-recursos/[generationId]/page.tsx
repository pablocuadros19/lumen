import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { rehidratarData, functionToKey, funcionLabel, tituloDe } from '@/lib/copilot/generation-helpers'
import GeneracionGuardadaView from '@/components/mis-recursos/GeneracionGuardadaView'
import type { CopilotFunction } from '@/types/copilot'

interface PageProps {
  params: Promise<{ generationId: string }>
}

export default async function GeneracionGuardadaPage({ params }: PageProps) {
  const { generationId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // RLS asegura que solo el dueño accede
  const { data: gen } = await supabase
    .from('ai_generations')
    .select('id, function, slug, output_json, source_resource_id, created_at, model, tokens_input, tokens_output, duration_ms')
    .eq('id', generationId)
    .single()

  if (!gen) {
    return (
      <div className="min-h-screen bg-lumen-bg flex items-center justify-center">
        <div className="text-center bg-white border border-gray-200 rounded-3xl p-12 shadow-card">
          <h2 className="text-lg font-bold text-[#1A3A5C] mb-2">Generación no encontrada</h2>
          <Link href="/mis-recursos" className="text-sm text-[#8B2252] hover:underline">
            Volver a mi biblioteca
          </Link>
        </div>
      </div>
    )
  }

  // Traer el título del recurso fuente
  let recursoTitulo: string | null = null
  if (gen.source_resource_id) {
    const { data: r } = await supabase
      .from('recursos')
      .select('titulo')
      .eq('id', gen.source_resource_id)
      .single()
    recursoTitulo = r?.titulo ?? null
  }

  const data = rehidratarData(gen as Parameters<typeof rehidratarData>[0])
  const funcionKey = functionToKey(gen.function as CopilotFunction)

  return (
    <div className="min-h-screen bg-lumen-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#8B2252]">Inicio</Link>
          <span>›</span>
          <Link href="/mis-recursos" className="hover:text-[#8B2252]">Mi biblioteca</Link>
          <span>›</span>
          <span className="text-[#1A3A5C] font-medium truncate max-w-[200px]">{tituloDe(gen as Parameters<typeof tituloDe>[0])}</span>
        </div>

        {/* Header con info de la generación */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-card p-5 mb-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-[#8B2252] uppercase tracking-wider mb-1">
                {funcionLabel(gen.function as CopilotFunction)}
              </div>
              {recursoTitulo && (
                <p className="text-xs text-gray-500">
                  a partir de:{' '}
                  <Link href={`/recurso/${gen.source_resource_id}`} className="text-[#1A3A5C] hover:text-[#8B2252] font-medium">
                    {recursoTitulo}
                  </Link>
                </p>
              )}
              <p className="text-[11px] text-gray-400 mt-1">
                Generado el {new Date(gen.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                {' · '}
                {gen.model}
                {gen.duration_ms ? ` · ${(gen.duration_ms / 1000).toFixed(1)}s` : ''}
              </p>
            </div>
            {gen.source_resource_id && (
              <a
                href={`/copilot/${gen.source_resource_id}/print?gen=${gen.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8B2252] text-white text-sm font-semibold hover:bg-[#8B2252]/90 cursor-pointer"
              >
                Imprimir / PDF
              </a>
            )}
          </div>
        </div>

        {/* Render del output con los viewers normales */}
        <GeneracionGuardadaView funcion={funcionKey} data={data} />
      </div>
    </div>
  )
}
