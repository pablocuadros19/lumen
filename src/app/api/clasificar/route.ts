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

- "resumen": descripción detallada de 3-4 oraciones que responda:
  * ¿Qué contiene concretamente? (ejercicios, explicaciones, consignas, preguntas, etc.)
  * ¿Para qué sirve y en qué momento de la secuencia didáctica se usaría?
  * ¿Qué habilidades o contenidos específicos trabaja?
  * ¿Qué tipo de actividades propone? (completar, unir, escribir, leer, clasificar, etc.)
  El resumen debe ser útil para que una docente decida si le sirve SIN abrir el archivo.

- "ejes_tematicos": array con uno o más de estos valores EXACTOS: ${JSON.stringify(EJES_VALIDOS)}

- "tipo_recurso": uno de estos valores EXACTOS: ${JSON.stringify(TIPOS_VALIDOS)}
  Guía: "Actividad" = consignas para alumnos. "Evaluación" = para calificar. "Rúbrica" = criterios de evaluación. "Planificación" = organización docente. "Teoría / Marco" = consulta docente. "Presentación" = slides para clase.

- "idioma": "es" o "en"

REGLAS:
- NO sugieras grado
- Elegí SOLO valores de las listas dadas
- Basá tu análisis en el CONTENIDO REAL, no inventes
- Si el contenido es escaso, describí lo que ves sin rellenar
- Respondé SOLO con el JSON, sin explicaciones ni markdown`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const archivo = formData.get('archivo') as File | null
    const nombreArchivo = formData.get('nombre') as string || ''

    let textoExtraido = ''
    let esImagen = false

    if (archivo) {
      const buffer = Buffer.from(await archivo.arrayBuffer())
      esImagen = archivo.type.startsWith('image/')

      if (archivo.name.toLowerCase().endsWith('.pdf')) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
          const data = await pdfParse(buffer)
          textoExtraido = data.text.slice(0, 6000)
        } catch {
          textoExtraido = `[No se pudo extraer texto del PDF: ${archivo.name}]`
        }
      } else if (archivo.type.startsWith('text/')) {
        textoExtraido = new TextDecoder().decode(buffer).slice(0, 6000)
      }

      // Si es imagen, usar visión de Haiku
      if (esImagen) {
        const base64 = buffer.toString('base64')
        const mediaType = archivo.type as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'

        const message = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mediaType,
                    data: base64,
                  },
                },
                {
                  type: 'text',
                  text: PROMPT_SISTEMA,
                },
              ],
            },
          ],
        })

        const respuestaTexto = message.content[0].type === 'text' ? message.content[0].text : ''
        return responderConClasificacion(respuestaTexto, nombreArchivo, '')
      }
    }

    // Para archivos de texto/PDF: usar el texto extraído
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
