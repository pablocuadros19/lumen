import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function SolicitudesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">No autenticado</p></div>
  }

  // Verificar admin
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  const esAdmin = perfil?.rol === 'admin'

  // Obtener solicitudes
  const query = supabase
    .from('solicitudes')
    .select('*')
    .order('created_at', { ascending: false })

  // Si no es admin, solo ve las suyas
  if (!esAdmin) {
    query.eq('user_id', user.id)
  }

  const { data: solicitudes } = await query

  return (
    <div className="min-h-screen bg-lumen-bg bg-grid-pattern flex flex-col">
      <header className="bg-white border-b border-gray-200/60 shadow-sm px-6 py-5 flex items-center gap-3 relative">
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#1A3A5C] via-[#2E6EA6] to-[#8B2252] opacity-50" />
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="LUMEN" width={36} height={36} className="rounded" />
          <span className="text-xl font-bold tracking-tight text-gradient-lumen">LUMEN</span>
        </Link>
        <div className="flex-1" />
        <span className="text-sm text-gray-400 font-medium">
          {esAdmin ? 'Solicitudes de material' : 'Mis solicitudes'}
        </span>
        <div className="w-px h-8 bg-gray-200 shrink-0" />
        <Image src="/newman-logo-2.jpg" alt="Newman" width={36} height={36} className="shrink-0 rounded-lg ring-1 ring-gray-100" />
      </header>

      <div className="flex-1 max-w-3xl mx-auto w-full px-5 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A3A5C] mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a la plataforma
        </Link>

        <h1 className="text-2xl font-bold text-[#1A3A5C] mb-6">
          {esAdmin ? 'Solicitudes de material' : 'Mis solicitudes'}
        </h1>

        {!solicitudes || solicitudes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <svg className="w-12 h-12 mx-auto text-[#1A3A5C]/15 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            <p className="text-gray-400">No hay solicitudes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {solicitudes.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm text-[#1A3A5C] font-medium flex-1">{s.descripcion}</p>
                  <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0
                    ${s.estado === 'pendiente' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                    {s.estado}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {esAdmin && s.autor_nombre && (
                    <span className="font-medium text-gray-500">{s.autor_nombre}</span>
                  )}
                  {s.grado && (
                    <span className="px-2 py-0.5 rounded-full bg-[#1A3A5C]/6 text-[#1A3A5C]">{s.grado}</span>
                  )}
                  {s.eje_tematico && (
                    <span className="px-2 py-0.5 rounded-full bg-[#8B2252]/6 text-[#8B2252]">{s.eje_tematico}</span>
                  )}
                  <span>{new Date(s.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
