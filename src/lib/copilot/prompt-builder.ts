import { LUMEN_IDENTITY, PEDAGOGY_STUB } from './identity'
import type { PromptTemplate } from '@/types/copilot'

interface ResourceContext {
  titulo:         string
  resumen?:       string
  grados?:        string[]
  eje_tematico?:  string
  tipo_recurso?:  string
  texto_extraido?: string
  grado_destino?: string
}

// Ensambla las 5 capas del prompt maestro para una llamada al modelo.
// Capa 1: identidad (hardcoded)
// Capa 2: marco pedagógico (DB, editable por Cyntia)
// Capa 3: contexto del recurso (dinámico)
// Capa 4: tarea específica (DB, editable por función)
// Capa 5: formato de salida (según Fase — v1 usa Markdown libre)
export function buildSystemPrompt(
  template: PromptTemplate,
  resource: ResourceContext,
): string {
  const SEPARATOR = '\n\n---\n\n'

  const capa2 = template.layer_pedagogy?.trim()
    ? template.layer_pedagogy
    : PEDAGOGY_STUB

  const capa3 = buildResourceContext(resource)

  const capa4 = template.layer_task

  const capa5 = buildFormatLayer(template.output_schema_slug)

  return [LUMEN_IDENTITY, capa2, capa3, capa4, capa5].join(SEPARATOR)
}

function buildResourceContext(resource: ResourceContext): string {
  const lines = ['RECURSO A TRABAJAR:']

  lines.push(`Título: ${resource.titulo}`)

  if (resource.grados?.length) {
    lines.push(`Grado(s): ${resource.grados.join(', ')}`)
  }
  if (resource.eje_tematico) {
    lines.push(`Eje temático: ${resource.eje_tematico}`)
  }
  if (resource.tipo_recurso) {
    lines.push(`Tipo: ${resource.tipo_recurso}`)
  }
  if (resource.resumen) {
    lines.push(`Resumen: ${resource.resumen}`)
  }
  if (resource.grado_destino) {
    lines.push(`Grado destino solicitado: ${resource.grado_destino}`)
  }
  if (resource.texto_extraido) {
    // Limitamos el texto extraído para no exceder el contexto
    const extracto = resource.texto_extraido.slice(0, 3000)
    const truncado = resource.texto_extraido.length > 3000 ? '\n[...texto truncado...]' : ''
    lines.push(`\nContenido del recurso:\n${extracto}${truncado}`)
  }

  return lines.join('\n')
}

function buildFormatLayer(outputSchemaSlug: string): string {
  if (outputSchemaSlug === 'texto_libre') {
    return 'FORMATO DE SALIDA: Respondé en Markdown claro, bien estructurado y listo para usar. Sin introducciones innecesarias — arrancá directamente con el contenido pedido.'
  }
  // En Fase 2 acá va la definición del tool use para JSON estructurado
  return 'FORMATO DE SALIDA: Respondé en Markdown claro y bien estructurado.'
}
