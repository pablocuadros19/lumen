import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const PROMPTS: Record<string, string> = {
  adaptar: `Sos una docente experta en educación primaria argentina. Adaptá el siguiente recurso pedagógico al grado indicado.

Ajustá:
- Vocabulario y complejidad según la edad
- Extensión de consignas
- Nivel de andamiaje/ayuda
- Ejemplos apropiados para el grado

Devolvé el recurso adaptado completo, listo para usar. Formato Markdown.`,

  evaluacion: `Sos una docente experta en evaluación formativa en educación primaria argentina. Generá una evaluación basada en el contenido del siguiente recurso pedagógico.

Incluí:
- 4-6 consignas variadas (opción múltiple, completar, producción breve)
- Criterios de evaluación claros
- Niveles de desempeño esperados

Formato Markdown, listo para imprimir.`,

  simplificar: `Sos una docente experta en inclusión educativa. Reescribí las consignas del siguiente recurso de forma más simple y clara.

Lineamientos:
- Oraciones cortas y directas
- Vocabulario accesible
- Un paso por consigna
- Agregá ejemplos si ayuda a la comprensión

Devolvé las consignas simplificadas en Markdown.`,

  rubrica: `Sos una experta en evaluación con rúbricas para educación primaria argentina. Generá una rúbrica de evaluación para el siguiente recurso.

Estructura:
- 3-4 criterios de evaluación relevantes
- 3 niveles para cada criterio (En inicio / En proceso / Logrado)
- Descriptores específicos y observables para cada celda

Formato: tabla Markdown lista para copiar.`,

  guia: `Sos una docente coordinadora pedagógica con experiencia en planificación. Generá una guía docente para trabajar con el siguiente recurso en el aula.

Estructura:
- **Objetivos** de aprendizaje (2-3)
- **Preparación** previa (qué necesita la docente antes)
- **Desarrollo** de la clase (paso a paso, con tiempos sugeridos)
- **Cierre** y evaluación informal
- **Variantes** posibles

Formato Markdown claro y práctico.`,

  complementarias: `Sos una docente creativa especializada en Prácticas del Lenguaje. Sugerí 3-4 actividades complementarias para hacer después de trabajar con el siguiente recurso.

Para cada actividad incluí:
- Nombre de la actividad
- Descripción breve (2-3 líneas)
- Materiales necesarios
- Tiempo estimado

Las actividades deben profundizar o extender el aprendizaje del recurso original. Formato Markdown.`,
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { recurso_id, accion, grado_destino } = await request.json()

    if (!recurso_id || !accion || !PROMPTS[accion]) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
    }

    // Obtener recurso
    const { data: recurso } = await supabase
      .from('recursos')
      .select('titulo, resumen, texto_extraido, eje_tematico, grados, tipo_recurso')
      .eq('id', recurso_id)
      .single()

    if (!recurso) return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 })

    // Armar contexto del recurso
    const contexto = [
      `**Título:** ${recurso.titulo}`,
      recurso.resumen ? `**Resumen:** ${recurso.resumen}` : '',
      `**Grados:** ${recurso.grados?.join(', ')}`,
      `**Eje temático:** ${recurso.eje_tematico}`,
      `**Tipo:** ${recurso.tipo_recurso}`,
      recurso.texto_extraido ? `\n**Contenido extraído:**\n${recurso.texto_extraido.slice(0, 3000)}` : '',
    ].filter(Boolean).join('\n')

    // Regla gramatical obligatoria para español rioplatense
    let prompt = 'REGLA OBLIGATORIA: En español, usá "e" en lugar de "y" cuando la palabra siguiente empiece con "i" o "hi" (ej: "creatividad e imaginación", "gramática e historia"). Nunca escribas "y imaginación", "y historia", etc.\n\n' + PROMPTS[accion]

    // Para adaptar, agregar grado destino
    if (accion === 'adaptar' && grado_destino) {
      prompt += `\n\nAdaptá este recurso para **${grado_destino}**.`
    }

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: prompt,
      messages: [{ role: 'user', content: contexto }],
    })

    const respuesta = message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({ respuesta })
  } catch (error) {
    console.error('Error copiloto:', error)
    return NextResponse.json({ error: 'Error procesando la solicitud' }, { status: 500 })
  }
}
