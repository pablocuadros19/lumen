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

  // Efeméride próxima (next 14 días)
  let efemerideProxima: { id: string; nombre: string; mes: number; dia: number; cantidadRecursos: number; diasRestantes: number } | null = null
  try {
    const { data: efemerides } = await supabase.from('efemerides').select('*')
    const { data: efeCounts } = await supabase.from('recurso_efemerides').select('efemeride_id')

    if (efemerides) {
      const efeCountMap: Record<string, number> = {}
      for (const ec of efeCounts || []) {
        efeCountMap[ec.efemeride_id] = (efeCountMap[ec.efemeride_id] || 0) + 1
      }

      const hoy = new Date()
      const candidatas = efemerides
        .map(e => {
          const fecha = new Date(hoy.getFullYear(), e.mes - 1, e.dia)
          if (fecha < hoy) fecha.setFullYear(hoy.getFullYear() + 1)
          const dias = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
          return { id: e.id, nombre: e.nombre, mes: e.mes, dia: e.dia, cantidadRecursos: efeCountMap[e.id] || 0, diasRestantes: dias }
        })
        .filter(e => e.diasRestantes >= 0 && e.diasRestantes <= 14)
        .sort((a, b) => a.diasRestantes - b.diasRestantes)

      if (candidatas.length > 0) {
        efemerideProxima = candidatas[0]
      }
    }
  } catch {
    // Tabla puede no existir aún
  }

  // Datos del usuario para welcome
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || ''
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ''

  return <BibliotecaView recursos={recursos} cantidadNuevos={cantidadNuevos} adminIds={adminIds} efemerideProxima={efemerideProxima} userName={userName} userAvatar={userAvatar} />
}
