import { createClient } from '@/lib/supabase/server'
import HubView from '@/components/HubView'
import LandingPage from '@/app/landing/page'
import { AREAS } from '@/lib/constants'
import type { Recurso } from '@/types/database'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Si no está logueado, mostrar landing
  if (!user) return <LandingPage />

  // Counts por área (busca en array multi-área)
  const areaCounts: Record<string, number> = {}
  for (const area of AREAS) {
    const { count } = await supabase
      .from('recursos')
      .select('*', { count: 'exact', head: true })
      .overlaps('areas', [area.nombre])
      .in('estado', ['publicado', 'destacado'])
    areaCounts[area.nombre] = count || 0
  }

  // Actividad reciente (feed global de últimos recursos publicados)
  const { data: actividadData } = await supabase
    .from('recursos')
    .select('*')
    .in('estado', ['publicado', 'destacado'])
    .order('created_at', { ascending: false })
    .limit(8)
  const actividad: Recurso[] = actividadData || []

  // Recursos lightweight para búsqueda global
  const { data: todosRecursos } = await supabase
    .from('recursos')
    .select('id, titulo, area, eje_tematico, thumbnail_url')
    .in('estado', ['publicado', 'destacado'])
    .order('created_at', { ascending: false })
    .limit(200)

  // IDs de admins
  const { data: admins } = await supabase
    .from('perfiles')
    .select('id')
    .eq('rol', 'admin')
  const adminIds = (admins || []).map(a => a.id)

  // Efeméride próxima
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

      if (candidatas.length > 0) efemerideProxima = candidatas[0]
    }
  } catch {
    // Tabla puede no existir
  }

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || ''
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ''

  return (
    <HubView
      userName={userName}
      userAvatar={userAvatar}
      areaCounts={areaCounts}
      actividad={actividad}
      todosRecursos={todosRecursos || []}
      efemerideProxima={efemerideProxima}
      adminIds={adminIds}
    />
  )
}
