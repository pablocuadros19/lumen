import Link from 'next/link'

interface Accion {
  key:   'adapt' | 'similar' | 'evaluate' | 'guide'
  label: string
  desc:  string
  icon:  React.ReactNode
}

const ACCIONES: Accion[] = [
  {
    key:   'adapt',
    label: 'Adaptar recurso',
    desc:  'Grado, accesibilidad, modalidad o tiempo',
    icon:  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" /></svg>,
  },
  {
    key:   'similar',
    label: 'Crear actividad similar',
    desc:  'Hermanas inspiradas en esta',
    icon:  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
  },
  {
    key:   'evaluate',
    label: 'Material de evaluación',
    desc:  'Rúbrica, prueba, cotejo, autoeval',
    icon:  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg>,
  },
  {
    key:   'guide',
    label: 'Guía para implementar',
    desc:  'Cómo llevarlo al aula mañana',
    icon:  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>,
  },
]

export default function CopilotoSection({ recursoId }: { recursoId: string }) {
  return (
    <div className="rounded-2xl border border-[#8B2252]/12 bg-gradient-to-br from-[#8B2252]/3 to-white
                    border-l-4 border-l-[#8B2252] p-5 shadow-sm">
      <h3 className="text-sm font-bold text-[#8B2252] mb-1 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
        Copiloto Pedagógico
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Trabajá con IA sobre este recurso. Elegí qué necesitás:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ACCIONES.map(a => (
          <Link
            key={a.key}
            href={`/copilot/${recursoId}?function=${a.key}`}
            className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left
                       bg-white border border-gray-200 shadow-sm
                       hover:border-[#8B2252] hover:bg-[#8B2252]/5 hover:shadow-card
                       transition-all duration-200 cursor-pointer"
          >
            <span className="text-[#8B2252]/60 mt-0.5">{a.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[#1A3A5C]">{a.label}</div>
              <div className="text-[11px] text-gray-500 leading-snug mt-0.5">{a.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
