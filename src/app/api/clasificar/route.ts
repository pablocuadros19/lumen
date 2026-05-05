import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const EJES_LENGUAJE = [
  'Plan lector', 'Gramática', 'Ortografía', 'Comprensión lectora',
  'Producción escrita', 'Oralidad', 'Vocabulario',
]

const EJES_CIENCIAS = [
  'Seres vivos', 'Cuerpo humano', 'Materiales', 'Fenómenos naturales',
  'La Tierra y el universo', 'Ambiente y cuidado', 'Experimentación',
]

const EJES_MATEMATICA = [
  'Números y operaciones', 'Geometría', 'Medida',
  'Estadística y probabilidad', 'Álgebra y funciones', 'Resolución de problemas',
]

const EJES_SOCIALES = [
  'Sociedades y territorios', 'Sociedades a través del tiempo',
  'Actividades humanas y organización social', 'Ciudadanía y participación',
  'Ambiente y sociedad', 'Memoria e identidad',
]

const AREAS_VALIDAS = ['Prácticas del Lenguaje', 'Ciencias Naturales', 'Matemática', 'Ciencias Sociales']

const TIPOS_VALIDOS = [
  'Actividad', 'Evaluación', 'Rúbrica', 'Planificación',
  'Presentación', 'Teoría / Marco', 'Ideas / Inspiración',
]

const PROMPT_SISTEMA = `Sos un bibliotecario pedagógico experto en educación primaria argentina (1ro a 6to grado) según el Diseño Curricular de la Provincia de Buenos Aires.

Tu tarea es clasificar un recurso pedagógico para la biblioteca escolar LUMEN. El recurso fue subido por una docente y será usado por otras docentes del colegio.

Analizá el contenido y devolvé un JSON con estas claves:

- "area": una de estas EXACTAS: ${JSON.stringify(AREAS_VALIDAS)}
  Prácticas del Lenguaje = lectura, escritura, gramática, oralidad, vocabulario, textos literarios.
  Ciencias Naturales = seres vivos, cuerpo humano, materiales, fenómenos, ambiente, experimentación.
  Matemática = números, operaciones, geometría, medida, estadística, álgebra, problemas matemáticos.
  Ciencias Sociales = historia, geografía, sociedades, ciudadanía, ambiente y sociedad, memoria.

- "titulo": título claro, descriptivo y profesional (máx 80 caracteres).

- "resumen": 1-2 oraciones breves. Máximo 150 caracteres.

- "ejes_tematicos": array con uno o más ejes según el área:
  Si área es "Prácticas del Lenguaje": ${JSON.stringify(EJES_LENGUAJE)}
  Si área es "Ciencias Naturales": ${JSON.stringify(EJES_CIENCIAS)}
  Si área es "Matemática": ${JSON.stringify(EJES_MATEMATICA)}
  Si área es "Ciencias Sociales": ${JSON.stringify(EJES_SOCIALES)}

- "tipo_recurso": uno de estos valores EXACTOS: ${JSON.stringify(TIPOS_VALIDOS)}

- "idioma": "es" o "en"

REGLAS:
- NO sugieras grado
- Elegí SOLO valores de las listas dadas
- Los ejes deben corresponder al área elegida
- Basá tu análisis en el CONTENIDO REAL, no inventes
- Si el contenido es escaso, describí lo que ves sin rellenar
- Si es una imagen o PDF visual, describí lo que ves y clasificalo. NUNCA digas que no podés clasificar.
- Respondé SOLO con el JSON, sin explicaciones ni markdown`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const archivo = formData.get('archivo') as File | null
    const nombreArchivo = formData.get('nombre') as string || ''

    console.log('[clasificar] archivo:', archivo ? { name: archivo.name, type: archivo.type, size: archivo.size } : null, 'nombre:', nombreArchivo)

    let textoExtraido = ''

    if (archivo) {
      const buffer = Buffer.from(await archivo.arrayBuffer())
      const base64 = buffer.toString('base64')
      const esImagen = archivo.type.startsWith('image/')
      const esPDF = archivo.name.toLowerCase().endsWith('.pdf') || archivo.type === 'application/pdf'

      // Imágenes y PDFs: enviar directo a Haiku como contenido visual
      if (esImagen || esPDF) {
        // Mapear mime types soportados por Anthropic
        const TIPOS_IMG_SOPORTADOS = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
        let mediaTypeImg = archivo.type
        if (esImagen && !TIPOS_IMG_SOPORTADOS.includes(archivo.type)) {
          // Inferir desde la extensión
          const ext = archivo.name.toLowerCase().split('.').pop()
          if (ext === 'jpg' || ext === 'jpeg') mediaTypeImg = 'image/jpeg'
          else if (ext === 'png') mediaTypeImg = 'image/png'
          else if (ext === 'gif') mediaTypeImg = 'image/gif'
          else if (ext === 'webp') mediaTypeImg = 'image/webp'
          else {
            console.warn('[clasificar] Imagen con tipo no soportado:', archivo.type, archivo.name)
            mediaTypeImg = 'image/jpeg'
          }
        }

        const contentBlock = esImagen
          ? {
              type: 'image' as const,
              source: {
                type: 'base64' as const,
                media_type: mediaTypeImg as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp',
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

        try {
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
          console.log('[clasificar] respuesta IA (visual):', respuestaTexto.slice(0, 200))
          return responderConClasificacion(respuestaTexto, nombreArchivo, '')
        } catch (err) {
          console.error('[clasificar] Error llamando a Anthropic con archivo visual:', err)
          // Fallback: clasificar solo por nombre
        }
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
    const todosEjes = [...EJES_LENGUAJE, ...EJES_CIENCIAS, ...EJES_MATEMATICA, ...EJES_SOCIALES]
    clasificacion.ejes_tematicos = clasificacion.ejes_tematicos.filter(
      (e: string) => todosEjes.includes(e)
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
