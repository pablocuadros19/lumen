import { createClient } from '@/lib/supabase/server'
import { MOCK_RECURSOS } from '@/lib/mock-data'
import BibliotecaView from '@/components/BibliotecaView'
import type { Recurso } from '@/types/database'

export default async function HomePage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('recursos')
    .select('*')
    .in('estado', ['publicado', 'destacado'])
    .order('created_at', { ascending: false })

  // Si hay recursos reales, usarlos. Si no, fallback a mock.
  const recursos: Recurso[] = data && data.length > 0 ? data : MOCK_RECURSOS

  // Contar recursos nuevos desde la última visita
  let cantidadNuevos = 0
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('last_seen_at')
      .eq('id', user.id)
      .single()

    if (perfil?.last_seen_at) {
      cantidadNuevos = recursos.filter(
        r => new Date(r.created_at) > new Date(perfil.last_seen_at)
      ).length
    }

    // Actualizar last_seen_at
    await supabase
      .from('perfiles')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', user.id)
  }

  // Obtener IDs de admins para badge en cards
  const { data: admins } = await supabase
    .from('perfiles')
    .select('id')
    .eq('rol', 'admin')

  const adminIds = (admins || []).map(a => a.id)

  return <BibliotecaView recursos={recursos} cantidadNuevos={cantidadNuevos} adminIds={adminIds} />
}
