import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NuevaColeccionButton from '@/components/NuevaColeccionButton'

export default async function ColeccionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No autenticado</p>
      </div>
    )
  }

  const { data: colecciones } = await supabase
    .from('colecciones')
    .select('*, coleccion_recursos(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-lumen-bg bg-grid-pattern flex flex-col">
      <header className="bg-white border-b border-gray-200/60 shadow-sm px-5 py-4 flex items-center gap-3 relative">
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#1A3A5C] via-[#2E6EA6] to-[#8B2252] opacity-20" />
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="LUMEN" width={36} height={36} className="rounded" />
          <span className="text-xl font-bold tracking-tight text-gradient-lumen">LUMEN</span>
        </Link>
        <div className="flex-1" />
        <span className="text-sm text-gray-400 font-medium">Mis colecciones</span>
        <Image src="/newman-logo.png" alt="Newman" width={32} height={32} className="shrink-0" />
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-5 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A3A5C] mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a la biblioteca
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1A3A5C]">Mis colecciones</h1>
          <NuevaColeccionButton />
        </div>

        {!colecciones || colecciones.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <svg className="w-12 h-12 mx-auto text-[#1A3A5C]/15 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
            <p className="text-gray-400 mb-4">Todavía no creaste ninguna colección</p>
            <p className="text-xs text-gray-300">Podés crear carpetas para organizar tus recursos favoritos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {colecciones.map((col) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const countData = (col as any).coleccion_recursos as { count: number }[] | undefined
              const cantidad = countData?.[0]?.count ?? 0

              return (
                <Link
                  key={col.id}
                  href={`/colecciones/${col.id}`}
                  className="group p-5 rounded-2xl bg-white border border-gray-100
                             shadow-sm hover:shadow-card hover:-translate-y-1
                             transition-all duration-200"
                >
                  {/* Icono carpeta con color */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${col.color}15` }}
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: col.color }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                    </svg>
                  </div>

                  <h3 className="font-bold text-[15px] text-[#1A3A5C] group-hover:text-[#8B2252] transition-colors mb-1 truncate">
                    {col.nombre}
                  </h3>

                  {col.descripcion && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">{col.descripcion}</p>
                  )}

                  <span className="text-xs text-gray-300">
                    {cantidad} {cantidad === 1 ? 'recurso' : 'recursos'}
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
