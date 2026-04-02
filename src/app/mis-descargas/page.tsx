import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function MisDescargasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No autenticado</p>
      </div>
    )
  }

  // Obtener historial con datos del recurso
  const { data: historial } = await supabase
    .from('historial_descargas')
    .select('created_at, recurso_id, recursos(id, titulo, formato, eje_tematico, autor_nombre, thumbnail_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-lumen-bg bg-grid-pattern flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/60 shadow-sm px-6 py-5 flex items-center gap-3 relative">
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#1A3A5C] via-[#2E6EA6] to-[#8B2252] opacity-50" />
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="LUMEN" width={36} height={36} className="rounded" />
          <span className="text-xl font-bold tracking-tight text-gradient-lumen">LUMEN</span>
        </Link>
        <div className="flex-1" />
        <span className="text-sm text-gray-400 font-medium">Mis descargas</span>
        <div className="w-px h-8 bg-gray-200 shrink-0" />
        <Image src="/newman-logo.png" alt="Newman" width={36} height={36} className="shrink-0 rounded-lg ring-1 ring-gray-100" />
      </header>

      <div className="flex-1 max-w-3xl mx-auto w-full px-5 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A3A5C] mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a la biblioteca
        </Link>

        <h1 className="text-2xl font-bold text-[#1A3A5C] mb-6">Mis descargas</h1>

        {!historial || historial.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <svg className="w-12 h-12 mx-auto text-[#1A3A5C]/15 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <p className="text-gray-400">Todavía no descargaste ningún recurso</p>
          </div>
        ) : (
          <div className="space-y-2">
            {historial.map((item, i) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const recurso = (item as any).recursos as { id: string; titulo: string; formato: string; eje_tematico: string; autor_nombre: string | null; thumbnail_url: string | null } | null
              if (!recurso) return null

              return (
                <Link
                  key={`${item.recurso_id}-${i}`}
                  href={`/recurso/${recurso.id}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100
                             shadow-sm hover:shadow-card hover:-translate-y-0.5
                             transition-all duration-200"
                >
                  {/* Thumbnail mini */}
                  <div className="w-12 h-12 rounded-xl bg-[#1A3A5C]/5 flex items-center justify-center shrink-0 overflow-hidden">
                    {recurso.thumbnail_url ? (
                      <img src={recurso.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-5 h-5 text-[#1A3A5C]/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A3A5C] truncate">{recurso.titulo}</p>
                    <p className="text-xs text-gray-400">
                      {recurso.eje_tematico} · {recurso.autor_nombre || 'Anónimo'}
                    </p>
                  </div>

                  <span className="text-xs text-gray-300 shrink-0">
                    {new Date(item.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
