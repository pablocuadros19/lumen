'use client'

interface Props {
  onSubmit: () => void
  cargando: boolean
}

export default function GuideForm({ onSubmit, cargando }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-[#1A3A5C] mb-1">Guía para llevarlo al aula</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Generamos una ficha práctica con materiales, ambientación, cómo presentarlo, posibles dificultades, cierre, y qué hacer si te sobra o te falta tiempo.
        </p>
      </div>

      <button
        onClick={onSubmit}
        disabled={cargando}
        className="w-full px-4 py-3 rounded-xl bg-[#8B2252] text-white text-sm font-semibold
                   hover:bg-[#8B2252]/90 transition-colors cursor-pointer disabled:opacity-40"
      >
        {cargando ? 'Generando...' : 'Generar guía'}
      </button>
    </div>
  )
}
