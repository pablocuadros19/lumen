import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PrintView from '@/components/copilot/PrintView'
import type { CopilotFunctionKey } from '@/components/copilot/CopilotPanel'

interface PageProps {
  params:       Promise<{ recursoId: string }>
  searchParams: Promise<{ gen?: string }>
}

// Mapea el `function` de prompt_templates a la key del frontend
const FUNCTION_TO_KEY: Record<string, CopilotFunctionKey> = {
  adapt_resource:              'adapt',
  create_similar_activity:     'similar',
  create_evaluation:           'evaluate',
  create_implementation_guide: 'guide',
}

export default async function PrintPage({ params, searchParams }: PageProps) {
  const { recursoId } = await params
  const { gen } = await searchParams

  if (!gen) redirect(`/copilot/${recursoId}`)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // RLS asegura que solo el dueño accede a su generación
  const { data: generation } = await supabase
    .from('ai_generations')
    .select('id, function, output_json, source_resource_id, created_at')
    .eq('id', gen)
    .single()

  if (!generation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <p className="text-gray-500 text-sm">Generación no encontrada.</p>
      </div>
    )
  }

  // Reconstruir el data con meta para los viewers
  const data = {
    ...(generation.output_json as Record<string, unknown>),
    meta: {
      generation_id:      generation.id,
      generated_at:       generation.created_at,
      source_resource_id: generation.source_resource_id,
    },
  }

  const funcionKey = FUNCTION_TO_KEY[generation.function]

  // Datos del recurso fuente para el header del PDF
  const { data: recurso } = await supabase
    .from('recursos')
    .select('titulo')
    .eq('id', recursoId)
    .single()

  return (
    <PrintView
      funcion={funcionKey}
      data={data}
      recursoTitulo={recurso?.titulo ?? ''}
      generatedAt={generation.created_at}
    />
  )
}
