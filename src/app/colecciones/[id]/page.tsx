import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ColeccionDetalle from '@/components/ColeccionDetalle'

export default async function ColeccionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No autenticado</p>
      </div>
    )
  }

  // Obtener colección (owner)
  let { data: coleccion } = await supabase
    .from('colecciones')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  let isOwner = !!coleccion

  // Si no es owner, verificar si es colaborador
  if (!coleccion) {
    try {
      const { data: colab } = await supabase
        .from('coleccion_colaboradores')
        .select('coleccion_id')
        .eq('coleccion_id', id)
        .eq('user_id', user.id)
        .single()

      if (colab) {
        const { data } = await supabase
          .from('colecciones')
          .select('*')
          .eq('id', id)
          .single()
        coleccion = data
        isOwner = false
      }
    } catch {
      // Tabla puede no existir aún
    }
  }

  if (!coleccion) notFound()

  // Obtener recursos
  const { data: items } = await supabase
    .from('coleccion_recursos')
    .select('recurso_id, orden, recursos(*)')
    .eq('coleccion_id', id)
    .order('orden', { ascending: true })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recursos = (items || []).map((item: any) => item.recursos).filter(Boolean)

  // Obtener colaboradores
  let colaboradores: { id: string; nombre: string; email: string }[] = []
  try {
    const { data: colabs } = await supabase
      .from('coleccion_colaboradores')
      .select('user_id')
      .eq('coleccion_id', id)

    if (colabs && colabs.length > 0) {
      const { data: perfiles } = await supabase
        .from('perfiles')
        .select('id, nombre, email')
        .in('id', colabs.map(c => c.user_id))

      colaboradores = (perfiles || []).map(p => ({ id: p.id, nombre: p.nombre || p.email, email: p.email }))
    }
  } catch {
    // Tabla puede no existir aún
  }

  return (
    <div className="min-h-screen bg-lumen-bg bg-grid-pattern flex flex-col">
      <header className="bg-white border-b border-gray-200/60 shadow-sm px-6 py-5 flex items-center gap-3 relative">
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#1A3A5C] via-[#2E6EA6] to-[#8B2252] opacity-50" />
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="LUMEN" width={36} height={36} className="rounded" />
          <span className="text-xl font-bold tracking-tight text-gradient-lumen">LUMEN</span>
        </Link>
        <div className="flex-1" />
        <span className="text-sm text-gray-400 font-medium">{coleccion.nombre}</span>
        {!isOwner && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#2E6EA6]/10 text-[#2E6EA6]">Compartida</span>
        )}
        <div className="w-px h-8 bg-gray-200 shrink-0" />
        <Image src="/newman-logo.png" alt="Newman" width={36} height={36} className="shrink-0 rounded-lg ring-1 ring-gray-100" />
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-5 py-8">
        <Link
          href="/colecciones"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A3A5C] mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Mis colecciones
        </Link>

        <ColeccionDetalle
          coleccion={coleccion}
          recursosIniciales={recursos}
          isOwner={isOwner}
          colaboradoresIniciales={colaboradores}
        />
      </div>
    </div>
  )
}
