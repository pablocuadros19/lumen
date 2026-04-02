import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MOCK_RECURSOS } from '@/lib/mock-data'
import BorrarRecursoButton from '@/components/BorrarRecursoButton'
import FavoritoButton from '@/components/FavoritoButton'
import CompartirButton from '@/components/CompartirButton'
import type { Recurso } from '@/types/database'

// Colores por eje temático
const EJE_COLORS: Record<string, string> = {
  'Plan lector': '#2E6EA6',
  'Gramática': '#8B2252',
  'Ortografía': '#D4A017',
  'Comprensión lectora': '#1A3A5C',
  'Producción escrita': '#6B4C9A',
  'Oralidad': '#2D8659',
  'Vocabulario': '#C75B39',
}

// SVG icons por tipo de recurso
function TipoIcon({ tipo, className = "w-4 h-4" }: { tipo: string; className?: string }) {
  const props = { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5 }
  switch (tipo) {
    case 'Actividad':
      return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
    case 'Evaluación':
      return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg>
    case 'Rúbrica':
      return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M10.875 12c-.621 0-1.125.504-1.125 1.125M12 12c.621 0 1.125.504 1.125 1.125m0 0v1.5c0 .621-.504 1.125-1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v1.5" /></svg>
    case 'Planificación':
      return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
    case 'Presentación':
      return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h16.5M3.75 3v0M20.25 3v11.25A2.25 2.25 0 0 1 18 16.5h-2.25M12 16.5V21m0 0-3-3m3 3 3-3" /></svg>
    case 'Teoría / Marco':
      return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
    default:
      return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
  }
}

// SVG icons para acciones del copiloto
const COPILOTO_ACCIONES = [
  { label: 'Adaptar a otro grado', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" /></svg> },
  { label: 'Crear evaluación', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg> },
  { label: 'Simplificar consignas', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg> },
  { label: 'Generar rúbrica', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375" /></svg> },
  { label: 'Guía docente', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg> },
  { label: 'Actividades complementarias', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> },
]

export default async function RecursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let recurso: Recurso | null = null
  const supabase = await createClient()
  const { data } = await supabase
    .from('recursos')
    .select('*')
    .eq('id', id)
    .single()

  if (data) {
    recurso = data
  } else {
    recurso = MOCK_RECURSOS.find((r) => r.id === id) || null
  }

  if (!recurso) {
    return (
      <div className="min-h-screen bg-lumen-bg flex items-center justify-center">
        <div className="text-center bg-gradient-to-br from-[#1A3A5C]/5 via-transparent to-[#8B2252]/5 rounded-3xl p-16">
          <svg className="w-16 h-16 mx-auto text-[#1A3A5C]/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <h2 className="text-xl font-bold text-[#1A3A5C] mb-2">Recurso no encontrado</h2>
          <Link href="/" className="text-sm text-[#8B2252] hover:underline">
            Volver a la biblioteca
          </Link>
        </div>
      </div>
    )
  }

  // Obtener usuario actual para mostrar botón borrar
  const { data: { user } } = await supabase.auth.getUser()
  const esAutor = user && recurso.subido_por === user.id

  // Obtener recursos relacionados (mismo eje, grados similares)
  const { data: relacionados } = await supabase
    .from('recursos')
    .select('id, titulo, formato, eje_tematico, grados, thumbnail_url, autor_nombre, tipo_recurso')
    .eq('eje_tematico', recurso.eje_tematico)
    .neq('id', recurso.id)
    .in('estado', ['publicado', 'destacado'])
    .overlaps('grados', recurso.grados)
    .order('descargas', { ascending: false })
    .limit(4)

  const ejeColor = EJE_COLORS[recurso.eje_tematico] || '#1A3A5C'

  return (
    <div className="min-h-screen bg-lumen-bg bg-grid-pattern flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/60 shadow-sm px-5 py-4 flex items-center gap-3 relative">
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#1A3A5C] via-[#2E6EA6] to-[#8B2252] opacity-20" />
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="LUMEN" width={36} height={36} className="rounded" />
          <span className="text-xl font-bold tracking-tight text-gradient-lumen">LUMEN</span>
        </Link>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-5 py-8">
        {/* Volver */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A3A5C] mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a la biblioteca
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              {recurso.estado === 'destacado' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                               bg-gradient-to-r from-[#8B2252]/10 to-[#8B2252]/5 text-[#8B2252] border border-[#8B2252]/12 mb-3">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>
                  Destacado
                </span>
              )}
              <div className="flex items-start gap-3 mb-3">
                <h1 className="text-3xl font-bold tracking-tight text-[#1A3A5C] flex-1">{recurso.titulo}</h1>
                <FavoritoButton recursoId={recurso.id} size="md" />
              </div>
              <div className="w-16 h-0.5 bg-gradient-to-r from-[#8B2252] to-transparent rounded-full mb-4" />

              <div className="flex flex-wrap gap-2 mb-4">
                {recurso.grados.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1A3A5C]/8 text-[#1A3A5C] border border-[#1A3A5C]/10"
                  >
                    {g}
                  </span>
                ))}
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold border"
                  style={{ backgroundColor: `${ejeColor}0D`, color: ejeColor, borderColor: `${ejeColor}1A` }}
                >
                  {recurso.eje_tematico}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#2E6EA6]/8 text-[#2E6EA6] border border-[#2E6EA6]/10 flex items-center gap-1.5">
                  <TipoIcon tipo={recurso.tipo_recurso} className="w-3.5 h-3.5" />
                  {recurso.tipo_recurso}
                </span>
              </div>
            </div>

            {/* Preview: imagen real si es imagen, thumbnail de link, PDF embebido, o placeholder */}
            {recurso.archivo_url && recurso.formato === 'Imagen / Lámina' ? (
              <div className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden bg-white">
                <img
                  src={recurso.archivo_url}
                  alt={recurso.titulo}
                  className="w-full max-h-[600px] object-contain bg-[#f8f9fc]"
                />
              </div>
            ) : recurso.archivo_url && recurso.formato === 'Documento' && recurso.archivo_url.endsWith('.pdf') ? (
              <div className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden bg-white">
                <iframe
                  src={recurso.archivo_url}
                  className="w-full h-[600px]"
                  title={recurso.titulo}
                />
              </div>
            ) : recurso.thumbnail_url && recurso.formato === 'Link externo' ? (
              <div className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden bg-white">
                <img
                  src={recurso.thumbnail_url}
                  alt={recurso.titulo}
                  className="w-full max-h-[500px] object-contain bg-[#f8f9fc]"
                />
              </div>
            ) : (
              <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-[#1A3A5C]/4 via-[#2E6EA6]/2 to-[#8B2252]/4
                              shadow-sm p-10 flex flex-col items-center justify-center min-h-[300px]">
                <TipoIcon tipo={recurso.tipo_recurso} className="w-16 h-16 text-[#1A3A5C]/20 mb-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1A3A5C]/30 mb-2">{recurso.formato}</span>
                {!recurso.archivo_url && (
                  <p className="text-xs text-gray-300">Preview no disponible</p>
                )}
                {recurso.archivo_url && (
                  <a
                    href={recurso.archivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 px-4 py-2 rounded-xl text-sm text-[#2E6EA6] font-medium
                               bg-white/80 border border-[#2E6EA6]/15 shadow-sm
                               hover:shadow-card hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Ver archivo completo
                  </a>
                )}
              </div>
            )}

            {recurso.resumen && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-[#1A3A5C] mb-2">Resumen</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{recurso.resumen}</p>
              </div>
            )}

            {/* Copiloto pedagógico */}
            <div className="rounded-2xl border border-[#8B2252]/12 bg-gradient-to-br from-[#8B2252]/3 to-white
                            border-l-4 border-l-[#8B2252] p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#8B2252] mb-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                Copiloto Pedagógico
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Usá IA para trabajar con este recurso. Elegí una acción:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {COPILOTO_ACCIONES.map((accion) => (
                  <button
                    key={accion.label}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left
                               bg-white border border-gray-200 text-[#1A3A5C] shadow-sm
                               hover:border-[#8B2252] hover:bg-[#8B2252]/5 hover:shadow-card
                               hover:scale-[1.02] active:scale-[0.98]
                               transition-all duration-200 cursor-pointer"
                  >
                    <span className="text-[#8B2252]/60">{accion.icon}</span>
                    <span className="text-xs font-medium">{accion.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recursos relacionados */}
            {relacionados && relacionados.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-[#1A3A5C] mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E6EA6]" />
                  Recursos relacionados
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {relacionados.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/recurso/${rel.id}`}
                      className="p-3 rounded-2xl bg-white border border-gray-100 shadow-sm
                                 hover:shadow-card hover:-translate-y-0.5
                                 transition-all duration-200"
                    >
                      {/* Mini thumbnail */}
                      <div className="h-20 rounded-xl bg-[#1A3A5C]/4 mb-2 overflow-hidden flex items-center justify-center">
                        {rel.thumbnail_url ? (
                          <img src={rel.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <TipoIcon tipo={rel.tipo_recurso} className="w-6 h-6 text-[#1A3A5C]/20" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[#1A3A5C] line-clamp-2">{rel.titulo}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{rel.autor_nombre || 'Anónimo'}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-gray-100 bg-white shadow-card p-5 space-y-3">
              {recurso.archivo_url && (
                <a
                  href={`/api/recurso/${recurso.id}/descargar`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-3.5 rounded-2xl
                             bg-gradient-to-r from-[#1A3A5C] to-[#2E6EA6] text-white text-sm font-semibold
                             shadow-md hover:shadow-lg hover:-translate-y-0.5
                             transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Descargar
                </a>
              )}

              {recurso.link_editable && (
                <a
                  href={recurso.link_editable}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-[#8B2252] text-[#8B2252]
                             text-sm font-semibold shadow-sm hover:shadow-card hover:-translate-y-0.5
                             transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  Abrir editable
                </a>
              )}

              {!recurso.archivo_url && !recurso.link_editable && (
                <p className="text-sm text-gray-400 text-center py-2">Sin archivo disponible</p>
              )}

              <CompartirButton recursoId={recurso.id} titulo={recurso.titulo} />
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white shadow-card p-5">
              <h3 className="text-[11px] font-bold text-[#1A3A5C] uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2E6EA6]" />
                Información
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Formato', value: recurso.formato },
                  { label: 'Editable', value: recurso.editable ? 'Sí' : 'No', color: recurso.editable ? 'text-green-600' : 'text-gray-400' },
                  { label: 'Idioma', value: recurso.idioma === 'es' ? 'Español' : 'English' },
                  { label: 'Descargas', value: String(recurso.descargas) },
                  { label: 'Subido por', value: recurso.autor_nombre || 'Anónimo' },
                  { label: 'Fecha', value: new Date(recurso.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }) },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-gray-500">{item.label}</span>
                    <span className={`font-medium ${item.color || 'text-[#1A3A5C]'}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white shadow-card p-5">
              <h3 className="text-[11px] font-bold text-[#1A3A5C] uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B2252]" />
                Estado
              </h3>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                ${recurso.estado === 'publicado' ? 'bg-green-50 text-green-700 border border-green-200' : ''}
                ${recurso.estado === 'destacado' ? 'bg-[#8B2252]/8 text-[#8B2252] border border-[#8B2252]/15' : ''}
                ${recurso.estado === 'borrador' ? 'bg-gray-100 text-gray-500 border border-gray-200' : ''}
                ${recurso.estado === 'archivado' ? 'bg-gray-100 text-gray-400 border border-gray-200' : ''}
              `}>
                <span className={`w-2 h-2 rounded-full
                  ${recurso.estado === 'publicado' ? 'bg-green-500' : ''}
                  ${recurso.estado === 'destacado' ? 'bg-[#8B2252]' : ''}
                  ${recurso.estado === 'borrador' ? 'bg-gray-400' : ''}
                  ${recurso.estado === 'archivado' ? 'bg-gray-300' : ''}
                `} />
                {recurso.estado.charAt(0).toUpperCase() + recurso.estado.slice(1)}
              </span>
            </div>

            {esAutor && (
              <div className="rounded-3xl border border-gray-100 bg-white shadow-card p-4">
                <BorrarRecursoButton recursoId={recurso.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
