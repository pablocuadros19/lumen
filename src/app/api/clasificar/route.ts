import { NextRequest, NextResponse } from 'next/server'
import { clasificarArchivo } from '@/lib/clasificar'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const archivo = formData.get('archivo') as File | null
    const nombreArchivo = (formData.get('nombre') as string) || ''

    if (!archivo) {
      return NextResponse.json({
        titulo: nombreArchivo.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        resumen: '',
        ejes_tematicos: [],
        tipo_recurso: 'Actividad',
        idioma: 'es',
      })
    }

    const buffer = Buffer.from(await archivo.arrayBuffer())
    const clasificacion = await clasificarArchivo(buffer, archivo.name || nombreArchivo, archivo.type)
    return NextResponse.json(clasificacion)
  } catch (error) {
    console.error('[clasificar] Error:', error)
    return NextResponse.json({ error: 'Error al clasificar el recurso' }, { status: 500 })
  }
}
