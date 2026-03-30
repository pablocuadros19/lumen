import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Ejes y tipos válidos para que Haiku solo elija de estos
const EJES_VALIDOS = [
  'Plan lector', 'Gramática', 'Ortografía', 'Comprensión lectora',
  'Producción escrita', 'Oralidad', 'Vocabulario',
]

const TIPOS_VALIDOS = [
  'Actividad', 'Evaluación', 'Rúbrica', 'Planificación',
  'Presentación', 'Teoría / Marco', 'Ideas / Inspiración',
]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const archivo = formData.get('archivo') as File | null
    const nombreArchivo = formData.get('nombre') as string || ''

    let textoExtraido = ''

    // Extraer texto del archivo
    if (archivo) {
      const buffer = Buffer.from(await archivo.arrayBuffer())

      if (archivo.name.toLowerCase().endsWith('.pdf')) {
        try {
          // pdf-parse necesita import dinámico en Next.js
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
          const data = await pdfParse(buffer)
          textoExtraido = data.text.slice(0, 4000) // Limitar para no gastar tokens
        } catch {
          textoExtraido = `[No se pudo extraer texto del PDF: ${archivo.name}]`
        }
      } else if (archivo.type.startsWith('text/')) {
        textoExtraido = new TextDecoder().decode(buffer).slice(0, 4000)
      } else {
        textoExtraido = `[Archivo no textual: ${archivo.name}, tipo: ${archivo.type}]`
      }
    }

    // Si no hay texto útil, usar solo el nombre del archivo
    const contexto = textoExtraido.length > 50
      ? textoExtraido
      : `Nombre del archivo: ${nombreArchivo}`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Sos un clasificador de recursos pedagógicos para una biblioteca escolar de nivel primario (1ro a 6to grado), área Prácticas del Lenguaje.

Analizá el siguiente contenido y devolvé un JSON con estas claves:
- "titulo": título claro y descriptivo del recurso (máx 60 caracteres)
- "resumen": resumen en 1-2 oraciones de qué es y para qué sirve
- "ejes_tematicos": array con uno o más de estos valores EXACTOS: ${JSON.stringify(EJES_VALIDOS)}
- "tipo_recurso": uno de estos valores EXACTOS: ${JSON.stringify(TIPOS_VALIDOS)}
- "idioma": "es" o "en"

IMPORTANTE:
- NO sugieras grado, eso lo elige la docente
- Elegí SOLO valores de las listas dadas
- Si no tenés certeza de un eje, no lo incluyas
- Si no podés determinar algo, dejá el campo vacío o con valor por defecto
- Respondé SOLO con el JSON, sin explicaciones ni markdown

CONTENIDO DEL RECURSO:
${contexto}`,
        },
      ],
    })

    // Extraer el texto de la respuesta
    const respuestaTexto = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parsear JSON de la respuesta
    let clasificacion
    try {
      // Limpiar posibles backticks o texto extra
      const jsonLimpio = respuestaTexto.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
      clasificacion = JSON.parse(jsonLimpio)
    } catch {
      // Si falla el parse, devolver valores por defecto
      clasificacion = {
        titulo: nombreArchivo.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        resumen: '',
        ejes_tematicos: [],
        tipo_recurso: 'Actividad',
        idioma: 'es',
      }
    }

    // Validar que los ejes sean de la lista válida
    if (clasificacion.ejes_tematicos) {
      clasificacion.ejes_tematicos = clasificacion.ejes_tematicos.filter(
        (e: string) => EJES_VALIDOS.includes(e)
      )
    }

    // Validar tipo
    if (!TIPOS_VALIDOS.includes(clasificacion.tipo_recurso)) {
      clasificacion.tipo_recurso = 'Actividad'
    }

    return NextResponse.json({
      ...clasificacion,
      texto_extraido: textoExtraido.slice(0, 2000),
    })
  } catch (error) {
    console.error('Error clasificando:', error)
    return NextResponse.json(
      { error: 'Error al clasificar el recurso' },
      { status: 500 }
    )
  }
}
