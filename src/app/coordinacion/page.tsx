import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GRADOS, EJES_TEMATICOS } from '@/lib/constants'
import PendientesRevision from '@/components/PendientesRevision'
import GestionUsuarios from '@/components/GestionUsuarios'

const MESES = ['', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export default async function CoordinacionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Verificar admin
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol, nombre')
    .eq('id', user.id)
    .single()

  if (!['admin', 'directivo'].includes(perfil?.rol ?? '')) redirect('/')

  // Recursos publicados
  const { data: recursos } = await supabase
    .from('recursos')
    .select('grados, eje_tematico, tipo_recurso, created_at')
    .in('estado', ['publicado', 'destacado'])

  // Construir mapa de cobertura grado × eje
  const cobertura: Record<string, Record<string, number>> = {}
  for (const grado of GRADOS) {
    cobertura[grado] = {}
    for (const eje of EJES_TEMATICOS) {
      cobertura[grado][eje] = 0
    }
  }

  let totalRecursos = 0
  for (const r of recursos || []) {
    totalRecursos++
    for (const grado of r.grados || []) {
      if (cobertura[grado] && r.eje_tematico) {
        cobertura[grado][r.eje_tematico] = (cobertura[grado][r.eje_tematico] || 0) + 1
      }
    }
  }

  // Total celdas y cobertura
  const totalCeldas = GRADOS.length * EJES_TEMATICOS.length
  let celdasCubiertas = 0
  for (const grado of GRADOS) {
    for (const eje of EJES_TEMATICOS) {
      if (cobertura[grado][eje] > 0) celdasCubiertas++
    }
  }
  const porcentajeCobertura = Math.round((celdasCubiertas / totalCeldas) * 100)

  // Docentes activos (vistos en últimos 30 días)
  const hace30Dias = new Date()
  hace30Dias.setDate(hace30Dias.getDate() - 30)
  const { count: docentesActivos } = await supabase
    .from('perfiles')
    .select('*', { count: 'exact', head: true })
    .gte('last_seen_at', hace30Dias.toISOString())

  // Solicitudes pendientes
  const { count: solicitudesPendientes } = await supabase
    .from('solicitudes')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'pendiente')

  // Efemérides próximas (intentar, puede no existir la tabla aún)
  let proximasEfemerides: { nombre: string; dia: number; mes: number; cantidadRecursos: number; diasRestantes: number }[] = []
  try {
    const { data: efemerides } = await supabase.from('efemerides').select('*')
    const { data: efeCounts } = await supabase.from('recurso_efemerides').select('efemeride_id')

    const efeCountMap: Record<string, number> = {}
    for (const ec of efeCounts || []) {
      efeCountMap[ec.efemeride_id] = (efeCountMap[ec.efemeride_id] || 0) + 1
    }

    const hoy = new Date()
    proximasEfemerides = (efemerides || [])
      .map(e => {
        const fecha = new Date(hoy.getFullYear(), e.mes - 1, e.dia)
        if (fecha < hoy) fecha.setFullYear(hoy.getFullYear() + 1)
        const dias = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
        return { nombre: e.nombre, dia: e.dia, mes: e.mes, cantidadRecursos: efeCountMap[e.id] || 0, diasRestantes: dias }
      })
      .sort((a, b) => a.diasRestantes - b.diasRestantes)
      .slice(0, 6)
  } catch {
    // Tabla puede no existir aún
  }

  // Recursos pendientes de revisión
  const { data: pendientes } = await supabase
    .from('recursos')
    .select('id, titulo, autor_nombre, area, eje_tematico, grados, created_at')
    .eq('estado', 'publicado')
    .eq('revisado', false)
    .order('created_at', { ascending: false })

  // Recursos recientes (últimos 5)
  const { data: recientes } = await supabase
    .from('recursos')
    .select('id, titulo, autor_nombre, created_at, eje_tematico, grados')
    .in('estado', ['publicado', 'destacado'])
    .order('created_at', { ascending: false })
    .limit(5)

  // Lista de usuarios (solo para directivo)
  let todosUsuarios: { id: string; email: string; nombre: string | null; rol: string; created_at: string }[] = []
  if (perfil?.rol === 'directivo') {
    const { data: users } = await supabase
      .from('perfiles')
      .select('id, email, nombre, rol, created_at')
      .order('created_at', { ascending: true })
    todosUsuarios = users || []
  }

  // Color según cantidad
  const colorCelda = (n: number) => {
    if (n === 0) return 'bg-red-50 text-red-600 border-red-200'
    if (n <= 2) return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
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
        <span className="text-sm text-gray-400 font-medium">Panel de coordinación</span>
        <div className="w-px h-8 bg-gray-200 shrink-0" />
        <Image src="/newman-logo-2.jpg" alt="Newman" width={36} height={36} className="shrink-0 rounded-lg ring-1 ring-gray-100" />
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-5 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A3A5C] mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Volver a la plataforma
        </Link>

        <h1 className="text-2xl font-bold text-[#1A3A5C] mb-1">Panel de Coordinación</h1>
        <p className="text-sm text-gray-400 mb-8">Vista general del banco de recursos — Prácticas del Lenguaje</p>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Recursos</p>
            <p className="text-3xl font-bold text-[#1A3A5C]">{totalRecursos}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Cobertura</p>
            <p className="text-3xl font-bold text-[#1A3A5C]">{porcentajeCobertura}<span className="text-lg">%</span></p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Docentes activos</p>
            <p className="text-3xl font-bold text-[#1A3A5C]">{docentesActivos || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Solicitudes</p>
            <p className="text-3xl font-bold text-[#1A3A5C]">{solicitudesPendientes || 0}</p>
            {(solicitudesPendientes || 0) > 0 && (
              <Link href="/solicitudes" className="text-xs text-[#8B2252] font-medium hover:underline">Ver pendientes</Link>
            )}
          </div>
        </div>

        {/* Pendientes de revisión */}
        <PendientesRevision recursos={pendientes || []} />

        {/* Semáforo de cobertura */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-[#1A3A5C]">Semáforo de cobertura</h2>
              <p className="text-xs text-gray-400 mt-0.5">Cantidad de recursos por grado y eje temático</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-200" /> Sin material</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-200" /> 1-2 recursos</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" /> 3+ recursos</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 w-48">
                    Eje temático
                  </th>
                  {GRADOS.map(g => (
                    <th key={g} className="text-center text-xs font-semibold text-[#1A3A5C] px-3 py-2 w-20">
                      {g}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EJES_TEMATICOS.map(eje => (
                  <tr key={eje} className="border-t border-gray-50">
                    <td className="text-sm font-medium text-[#1A3A5C] px-3 py-2.5">{eje}</td>
                    {GRADOS.map(grado => {
                      const n = cobertura[grado][eje]
                      return (
                        <td key={grado} className="text-center px-3 py-2.5">
                          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold border ${colorCelda(n)}`}>
                            {n}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Efemérides próximas */}
          {proximasEfemerides.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-[#1A3A5C] mb-4">Efemérides próximas</h2>
              <div className="space-y-3">
                {proximasEfemerides.map(e => (
                  <div key={e.nombre} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-gray-100 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[8px] font-bold text-[#8B2252] uppercase leading-none">{MESES[e.mes]}</span>
                      <span className="text-base font-bold text-[#1A3A5C] leading-none">{e.dia}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A3A5C] truncate">{e.nombre}</p>
                      <p className="text-xs text-gray-400">
                        {e.diasRestantes === 0 ? 'Hoy' : e.diasRestantes === 1 ? 'Mañana' : `En ${e.diasRestantes} días`}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      e.cantidadRecursos > 0
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-red-50 text-red-500'
                    }`}>
                      {e.cantidadRecursos > 0 ? `${e.cantidadRecursos} recurso${e.cantidadRecursos > 1 ? 's' : ''}` : 'Sin material'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recursos recientes */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#1A3A5C] mb-4">Últimos recursos subidos</h2>
            {(recientes || []).length === 0 ? (
              <p className="text-sm text-gray-400 py-4">No hay recursos aún</p>
            ) : (
              <div className="space-y-3">
                {(recientes || []).map(r => (
                  <Link
                    key={r.id}
                    href={`/recurso/${r.id}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A3A5C] truncate">{r.titulo}</p>
                      <p className="text-xs text-gray-400">
                        {r.autor_nombre} · {r.eje_tematico} · {(r.grados || []).join(', ')}
                      </p>
                    </div>
                    <span className="text-xs text-gray-300 shrink-0">
                      {new Date(r.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Gestión de usuarios — solo directivo */}
        {perfil?.rol === 'directivo' && todosUsuarios.length > 0 && (
          <div className="mt-6">
            <GestionUsuarios usuarios={todosUsuarios} userId={user.id} />
          </div>
        )}
      </div>
    </div>
  )
}
