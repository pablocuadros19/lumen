import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ModoClase from '@/components/ModoClase'
import type { Recurso } from '@/types/database'

export default async function ClasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data } = await supabase
    .from('recursos')
    .select('*')
    .eq('id', id)
    .single()

  const recurso: Recurso | null = data || null

  if (!recurso) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#1A3A5C] mb-2">Recurso no encontrado</h2>
          <Link href="/" className="text-sm text-[#8B2252] hover:underline">Volver a la plataforma</Link>
        </div>
      </div>
    )
  }

  const { data: { user } } = await supabase.auth.getUser()
  const esAutor = user && recurso.subido_por === user.id
  let esAdmin = false
  if (user) {
    const { data: perfilUser } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
    esAdmin = perfilUser?.rol === 'admin'
  }

  if (recurso.estado === 'revision' && !esAutor && !esAdmin) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#1A3A5C] mb-2">Recurso en revisión</h2>
          <p className="text-sm text-gray-400 mb-4">Este recurso no está disponible en este momento.</p>
          <Link href="/" className="text-sm text-[#8B2252] hover:underline">Volver a la plataforma</Link>
        </div>
      </div>
    )
  }

  return <ModoClase recurso={recurso} />
}
