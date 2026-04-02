import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const EJES_VALIDOS = [
  'Plan lector', 'Gramática', 'Ortografía', 'Comprensión lectora',
  'Producción escrita', 'Oralidad', 'Vocabulario',
]

const TIPOS_VALIDOS = [
  'Actividad', 'Evaluación', 'Rúbrica', 'Planificación',
  'Presentación', 'Teoría / Marco', 'Ideas / Inspiración',
]

const PROMPT_SISTEMA = `Sos un bibliotecario pedagógico experto en educación primaria argentina (1ro a 6to grado), especializado en el área de Prácticas del Lenguaje según el Diseño Curricular de la Provincia de Buenos Aires.

Tu tarea es clasificar un recurso pedagógico para la biblioteca escolar LUMEN. El recurso fue subido por una docente y será usado por otras docentes del colegio.

Analizá el contenido y devolvé un JSON con estas claves:

- "titulo": título claro, descriptivo y profesional (máx 80 caracteres). Debe reflejar el contenido real y el tema específico, no ser genérico.

- "resumen": 1-2 oraciones breves. Qué contiene y para qué sirve. Máximo 150 caracteres. Sé conciso y directo.

- "ejes_tematicos": array con uno o más de estos valores EXACTOS: ${JSON.stringify(EJES_VALIDOS)}

- "tipo_recurso": uno de estos valores EXACTOS: ${JSON.stringify(TIPOS_VALIDOS)}
  Guía: "Actividad" = consignas para alumnos. "Evaluación" = para calificar. "Rúbrica" = criterios de evaluación. "Planificación" = organización docente. "Teoría / Marco" = consulta docente. "Presentación" = slides para clase.

- "idioma": "es" o "en"

REGLAS:
- NO sugieras grado
- Elegí SOLO valores de las listas dadas
- Basá tu análisis en el CONTENIDO REAL, no inventes
- Si el contenido es escaso, describí lo que ves sin rellenar
- Si es una imagen o PDF visual, describí lo que ves y clasificalo. NUNCA digas que no podés clasificar.
- Respondé SOLO con el JSON, sin explicaciones ni markdown`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const archivo = formData.get('archivo') as File | null
    const nombreArchivo = formData.get('nombre') as string || ''

    let textoExtraido = ''

    if (archivo) {
      const buffer = Buffer.from(await archivo.arrayBuffer())
      const base64 = buffer.toString('base64')
      const esImagen = archivo.type.startsWith('image/')
      const esPDF = archivo.name.toLowerCase().endsWith('.pdf')

      // Imágenes y PDFs: enviar directo a Haiku como contenido visual
      if (esImagen || esPDF) {
        const contentBlock = esImagen
          ? {
              type: 'image' as const,
              source: {
                type: 'base64' as const,
                media_type: archivo.type as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp',
                data: base64,
              },
            }
          : {
              type: 'document' as const,
              source: {
                type: 'base64' as const,
                media_type: 'application/pdf' as const,
                data: base64,
              },
            }

        const message = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: [
                contentBlock,
                {
                  type: 'text',
                  text: `Clasificá este recurso pedagógico. Describí lo que ves.\n\n${PROMPT_SISTEMA}`,
                },
              ],
            },
          ],
        })

        const respuestaTexto = message.content[0].type === 'text' ? message.content[0].text : ''
        return responderConClasificacion(respuestaTexto, nombreArchivo, '')
      }

      // Archivos de texto plano
      if (archivo.type.startsWith('text/')) {
        textoExtraido = new TextDecoder().decode(buffer).slice(0, 6000)
      }
    }

    // Para archivos de texto: usar el texto extraído
    const contexto = textoExtraido.length > 50
      ? textoExtraido
      : `Nombre del archivo: ${nombreArchivo}`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `${PROMPT_SISTEMA}\n\nCONTENIDO DEL RECURSO:\n${contexto}`,
        },
      ],
    })

    const respuestaTexto = message.content[0].type === 'text' ? message.content[0].text : ''
    return responderConClasificacion(respuestaTexto, nombreArchivo, textoExtraido)
  } catch (error) {
    console.error('Error clasificando:', error)
    return NextResponse.json(
      { error: 'Error al clasificar el recurso' },
      { status: 500 }
    )
  }
}

function responderConClasificacion(respuestaTexto: string, nombreArchivo: string, textoExtraido: string) {
  let clasificacion
  try {
    const jsonLimpio = respuestaTexto.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    clasificacion = JSON.parse(jsonLimpio)
  } catch {
    clasificacion = {
      titulo: nombreArchivo.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      resumen: '',
      ejes_tematicos: [],
      tipo_recurso: 'Actividad',
      idioma: 'es',
    }
  }

  if (clasificacion.ejes_tematicos) {
    clasificacion.ejes_tematicos = clasificacion.ejes_tematicos.filter(
      (e: string) => EJES_VALIDOS.includes(e)
    )
  }

  if (!TIPOS_VALIDOS.includes(clasificacion.tipo_recurso)) {
    clasificacion.tipo_recurso = 'Actividad'
  }

  return NextResponse.json({
    ...clasificacion,
    texto_extraido: textoExtraido.slice(0, 2000),
  })
}
