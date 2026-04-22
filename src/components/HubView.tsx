'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import UserMenu from '@/components/UserMenu'
import WelcomeOverlay from '@/components/WelcomeOverlay'
import EfemeridesBanner from '@/components/EfemeridesBanner'
import { AREAS, getColorForArea } from '@/lib/constants'
import type { Recurso } from '@/types/database'

// Normalizar texto: quitar tildes e ignorar mayúsculas
function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

// Iconos por área (usados en el botón grande)
function AreaIcon({ slug, className, style }: { slug: string; className?: string; style?: React.CSSProperties }) {
  if (slug === 'practicas-del-lenguaje') {
    return (
      <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    )
  }
  if (slug === 'matematica') {
    return (
      <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z" />
      </svg>
    )
  }
  if (slug === 'ciencias-sociales') {
    return (
      <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    )
  }
  // Ciencias Naturales (default)
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3A2.25 2.25 0 0 1 21 17.25c0 1.243-1.007 2.25-2.25 2.25H5.25A2.25 2.25 0 0 1 3 17.25c0-.795.418-1.522 1.097-1.943L19.8 15.3z" />
    </svg>
  )
}

// Decoración SVG de fondo por área
function AreaDecoration({ slug, color }: { slug: string; color: string }) {
  if (slug === 'practicas-del-lenguaje') {
    return (
      <svg className="absolute inset-0 w-full h-full group-hover:scale-110 transition-transform duration-500" viewBox="0 0 400 220" fill="none" preserveAspectRatio="xMidYMid slice">
        {/* Letras dispersas */}
        <text x="30" y="55" fontSize="64" fontWeight="900" fill={color} opacity="0.1" transform="rotate(-12 30 55)">A</text>
        <text x="320" y="45" fontSize="48" fontWeight="900" fill={color} opacity="0.08" transform="rotate(15 320 45)">B</text>
        <text x="180" y="40" fontSize="36" fontWeight="700" fill={color} opacity="0.07" transform="rotate(-5 180 40)">C</text>
        <text x="280" y="170" fontSize="52" fontWeight="900" fill={color} opacity="0.09" transform="rotate(8 280 170)">?</text>
        <text x="70" y="180" fontSize="40" fontWeight="900" fill={color} opacity="0.07" transform="rotate(-10 70 180)">¡</text>
        <text x="350" y="110" fontSize="28" fontWeight="700" fill={color} opacity="0.06" transform="rotate(20 350 110)">abc</text>
        {/* Libro abierto */}
        <g transform="translate(130, 90) rotate(-8)" opacity="0.1" stroke={color} strokeWidth="2" fill="none">
          <path d="M0 40 Q25 30 50 40 L50 0 Q25 10 0 0 Z" />
          <path d="M50 0 Q75 10 100 0 L100 40 Q75 30 50 40 Z" />
          <line x1="15" y1="12" x2="40" y2="8" strokeWidth="1" />
          <line x1="15" y1="20" x2="40" y2="16" strokeWidth="1" />
          <line x1="15" y1="28" x2="35" y2="24" strokeWidth="1" />
          <line x1="60" y1="8" x2="85" y2="12" strokeWidth="1" />
          <line x1="60" y1="16" x2="85" y2="20" strokeWidth="1" />
        </g>
        {/* Lápiz */}
        <g transform="translate(300, 60) rotate(35)" opacity="0.09" stroke={color} strokeWidth="1.5" fill="none">
          <rect x="0" y="0" width="8" height="50" rx="1" />
          <polygon points="0,50 8,50 4,62" fill={color} opacity="0.5" />
        </g>
        {/* Líneas de texto */}
        <g opacity="0.06" stroke={color} strokeWidth="1.5">
          <line x1="20" y1="120" x2="80" y2="118" />
          <line x1="20" y1="128" x2="65" y2="126" />
          <line x1="20" y1="136" x2="75" y2="134" />
        </g>
      </svg>
    )
  }
  if (slug === 'matematica') {
    return (
      <svg className="absolute inset-0 w-full h-full group-hover:scale-110 transition-transform duration-500" viewBox="0 0 400 220" fill="none" preserveAspectRatio="xMidYMid slice">
        {/* Números dispersos */}
        <text x="40" y="50" fontSize="58" fontWeight="900" fill={color} opacity="0.1" transform="rotate(-10 40 50)">7</text>
        <text x="300" y="55" fontSize="44" fontWeight="900" fill={color} opacity="0.08" transform="rotate(12 300 55)">3</text>
        <text x="190" y="35" fontSize="36" fontWeight="700" fill={color} opacity="0.07" transform="rotate(-5 190 35)">π</text>
        <text x="100" y="170" fontSize="48" fontWeight="900" fill={color} opacity="0.08" transform="rotate(8 100 170)">+</text>
        <text x="340" y="160" fontSize="40" fontWeight="900" fill={color} opacity="0.07" transform="rotate(-15 340 160)">=</text>
        <text x="250" y="40" fontSize="32" fontWeight="700" fill={color} opacity="0.06" transform="rotate(18 250 40)">%</text>
        {/* Cuadrícula */}
        <g opacity="0.06" stroke={color} strokeWidth="1">
          <line x1="140" y1="70" x2="140" y2="150" />
          <line x1="170" y1="70" x2="170" y2="150" />
          <line x1="200" y1="70" x2="200" y2="150" />
          <line x1="120" y1="90" x2="220" y2="90" />
          <line x1="120" y1="110" x2="220" y2="110" />
          <line x1="120" y1="130" x2="220" y2="130" />
        </g>
        {/* Triángulo */}
        <g transform="translate(300, 90) rotate(5)" opacity="0.09" stroke={color} strokeWidth="2" fill="none">
          <polygon points="0,40 20,-5 40,40" />
          <line x1="10" y1="17" x2="30" y2="17" strokeWidth="1" strokeDasharray="3 2" />
        </g>
        {/* Fracción */}
        <g transform="translate(60, 100)" opacity="0.07">
          <text fontSize="20" fontWeight="700" fill={color} x="0" y="0">2</text>
          <line x1="-2" y1="6" x2="18" y2="6" stroke={color} strokeWidth="2" />
          <text fontSize="20" fontWeight="700" fill={color} x="2" y="24">5</text>
        </g>
      </svg>
    )
  }
  if (slug === 'ciencias-sociales') {
    return (
      <svg className="absolute inset-0 w-full h-full group-hover:scale-110 transition-transform duration-500" viewBox="0 0 400 220" fill="none" preserveAspectRatio="xMidYMid slice">
        {/* Globo terráqueo */}
        <g transform="translate(70, 55)" opacity="0.1" stroke={color} strokeWidth="1.5" fill="none">
          <circle cx="35" cy="35" r="35" />
          <ellipse cx="35" cy="35" rx="15" ry="35" />
          <path d="M5 25 Q35 20 65 25" />
          <path d="M5 45 Q35 50 65 45" />
        </g>
        {/* Brújula / rosa de vientos */}
        <g transform="translate(310, 40)" opacity="0.09" stroke={color} strokeWidth="1.5" fill="none">
          <circle cx="20" cy="20" r="20" />
          <polygon points="20,2 23,17 20,12 17,17" fill={color} opacity="0.3" />
          <polygon points="20,38 17,23 20,28 23,23" fill={color} opacity="0.15" />
          <line x1="2" y1="20" x2="38" y2="20" strokeWidth="0.8" />
        </g>
        {/* Pergamino / documento histórico */}
        <g transform="translate(180, 25) rotate(-8)" opacity="0.08" stroke={color} strokeWidth="1.5" fill="none">
          <path d="M0 5 Q0 0 5 0 L40 0 Q45 0 45 5 L45 55 Q45 60 40 60 L5 60 Q0 60 0 55Z" />
          <line x1="8" y1="12" x2="37" y2="12" strokeWidth="1" />
          <line x1="8" y1="22" x2="37" y2="22" strokeWidth="1" />
          <line x1="8" y1="32" x2="30" y2="32" strokeWidth="1" />
          <line x1="8" y1="42" x2="34" y2="42" strokeWidth="1" />
        </g>
        {/* Personas / comunidad */}
        <g transform="translate(260, 140)" opacity="0.08" stroke={color} strokeWidth="1.5" fill="none">
          <circle cx="15" cy="8" r="7" />
          <path d="M0 30 Q0 18 15 18 Q30 18 30 30" />
          <circle cx="42" cy="8" r="7" />
          <path d="M27 30 Q27 18 42 18 Q57 18 57 30" />
        </g>
        {/* Monumento / columna */}
        <g transform="translate(80, 140)" opacity="0.07" stroke={color} strokeWidth="1.5" fill="none">
          <rect x="5" y="10" width="20" height="45" />
          <rect x="0" y="0" width="30" height="12" rx="2" />
          <rect x="0" y="53" width="30" height="7" rx="1" />
        </g>
      </svg>
    )
  }
  // Ciencias Naturales
  return (
    <svg className="absolute inset-0 w-full h-full group-hover:scale-110 transition-transform duration-500" viewBox="0 0 400 220" fill="none" preserveAspectRatio="xMidYMid slice">
      {/* Átomo */}
      <g transform="translate(60, 50)" opacity="0.1" stroke={color} strokeWidth="1.5">
        <ellipse cx="0" cy="0" rx="45" ry="18" transform="rotate(0)" />
        <ellipse cx="0" cy="0" rx="45" ry="18" transform="rotate(60)" />
        <ellipse cx="0" cy="0" rx="45" ry="18" transform="rotate(-60)" />
        <circle cx="0" cy="0" r="5" fill={color} opacity="0.3" />
      </g>
      {/* Matraz / tubo de ensayo */}
      <g transform="translate(310, 40) rotate(10)" opacity="0.1" stroke={color} strokeWidth="2" fill="none">
        <rect x="8" y="0" width="16" height="35" rx="2" />
        <path d="M8 35 Q0 50 4 65 Q12 80 20 80 Q28 80 28 65 Q32 50 24 35" />
        <path d="M4 65 Q16 55 28 65" strokeWidth="1" opacity="0.5" />
        <circle cx="12" cy="58" r="2" fill={color} opacity="0.3" />
        <circle cx="20" cy="62" r="1.5" fill={color} opacity="0.3" />
      </g>
      {/* Hoja */}
      <g transform="translate(200, 30) rotate(15)" opacity="0.09">
        <path d="M0 30 Q15 -5 40 0 Q45 15 30 35 Q15 50 0 30Z" fill={color} opacity="0.15" />
        <path d="M0 30 Q20 15 35 5" stroke={color} strokeWidth="1" fill="none" opacity="0.3" />
        <path d="M10 28 Q18 18 28 12" stroke={color} strokeWidth="0.8" fill="none" opacity="0.2" />
      </g>
      {/* Lupa */}
      <g transform="translate(140, 140)" opacity="0.09" stroke={color} strokeWidth="2" fill="none">
        <circle cx="18" cy="18" r="18" />
        <line x1="30" y1="30" x2="48" y2="48" strokeWidth="3" strokeLinecap="round" />
      </g>
      {/* Molécula */}
      <g transform="translate(280, 155)" opacity="0.08" stroke={color} strokeWidth="1.5">
        <circle cx="0" cy="0" r="6" fill={color} opacity="0.2" />
        <circle cx="25" cy="-15" r="4" fill={color} opacity="0.2" />
        <circle cx="30" cy="15" r="5" fill={color} opacity="0.2" />
        <line x1="5" y1="-3" x2="21" y2="-13" />
        <line x1="5" y1="3" x2="26" y2="12" />
      </g>
      {/* ADN helix hints */}
      <g transform="translate(370, 80)" opacity="0.06" stroke={color} strokeWidth="1.5">
        <path d="M0 0 Q8 10 0 20 Q-8 30 0 40 Q8 50 0 60" />
        <path d="M12 0 Q4 10 12 20 Q20 30 12 40 Q4 50 12 60" />
        <line x1="2" y1="10" x2="10" y2="10" strokeWidth="1" />
        <line x1="1" y1="30" x2="11" y2="30" strokeWidth="1" />
        <line x1="2" y1="50" x2="10" y2="50" strokeWidth="1" />
      </g>
    </svg>
  )
}

interface EfemerideProxima {
  id: string
  nombre: string
  mes: number
  dia: number
  cantidadRecursos: number
  diasRestantes: number
}

interface Props {
  userName: string
  userAvatar: string
  areaCounts: Record<string, number>
  actividad: Recurso[]
  todosRecursos: Pick<Recurso, 'id' | 'titulo' | 'area' | 'eje_tematico' | 'thumbnail_url'>[]
  efemerideProxima?: EfemerideProxima | null
  adminIds: string[]
}

function tiempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'recién'
  if (min < 60) return `hace ${min} min`
  const hs = Math.floor(min / 60)
  if (hs < 24) return `hace ${hs}h`
  const dias = Math.floor(hs / 24)
  if (dias < 7) return `hace ${dias}d`
  const semanas = Math.floor(dias / 7)
  if (semanas < 4) return `hace ${semanas}sem`
  const meses = Math.floor(dias / 30)
  return `hace ${meses} meses`
}

const PLACEHOLDERS = [
  '¿Qué recurso estás buscando?',
  'Buscar actividades, evaluaciones, planificaciones...',
  '¿Qué vas a enseñar hoy?',
  'Buscá por tema, eje o tipo de recurso...',
  '¿Necesitás algo para la clase de mañana?',
  'Explorá la plataforma pedagógica...',
  '¿Comprensión lectora? ¿Gramática? ¿Ciencias?',
  'Todo lo que necesitás para el aula...',
]

export default function HubView({ userName, userAvatar, areaCounts, actividad, todosRecursos, efemerideProxima }: Props) {
  const router = useRouter()
  const [busqueda, setBusqueda] = useState('')
  const [placeholder] = useState(() => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)])

  // Búsqueda global
  const resultadosBusqueda = useMemo(() => {
    if (!busqueda.trim()) return []
    const q = normalizar(busqueda)
    return todosRecursos
      .filter(r => normalizar(r.titulo).includes(q) || normalizar(r.eje_tematico).includes(q))
      .slice(0, 12)
  }, [busqueda, todosRecursos])

  const buscando = busqueda.trim().length > 0

  return (
    <div className="min-h-screen bg-lumen-bg bg-grid-pattern flex flex-col">
      {/* Header minimal */}
      <header className="bg-white border-b border-gray-200/60 shadow-sm px-6 py-4 flex items-center gap-3 relative">
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#1A3A5C] via-[#2E6EA6] to-[#8B2252] opacity-50" />
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="LUMEN" width={36} height={36} className="rounded" />
          <span className="text-xl font-bold tracking-tight text-gradient-lumen">LUMEN</span>
        </Link>
        <div className="flex-1" />
        <Link
          href="/subir"
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl
                     bg-gradient-to-r from-[#8B2252] to-[#6d1b41] text-white
                     text-sm font-semibold shadow-button
                     hover:shadow-lg hover:shadow-[#8B2252]/30 hover:-translate-y-0.5
                     active:scale-[0.97] transition-all duration-200 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Cargar recurso
        </Link>
        <UserMenu />
        <div className="w-px h-8 bg-gray-200 shrink-0" />
        <Image src="/newman-logo-2.jpg" alt="Newman" width={36} height={36} className="shrink-0 rounded-lg ring-1 ring-gray-100" />
      </header>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col items-center px-5 py-10 sm:py-16">
        {/* Logo grande */}
        <Image
          src="/logo.png"
          alt="LUMEN"
          width={120}
          height={120}
          className="mb-3 drop-shadow-sm"
          priority
        />
        <p className="text-sm text-gray-400 font-medium tracking-wide mb-8">Plataforma Pedagógica Inteligente</p>

        {/* Buscador grande estilo ChatGPT */}
        <div className="w-full max-w-2xl mb-10 relative">
          <div className="relative">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={placeholder}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-14 pr-6 py-5 text-lg rounded-2xl bg-white text-[#1A3A5C]
                         border border-gray-200 placeholder-gray-300
                         shadow-card focus:shadow-card-hover
                         focus:outline-none focus:border-[#2E6EA6]
                         transition-all duration-300"
            />
          </div>

          {/* Resultados de búsqueda */}
          {buscando && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-elevated border border-gray-100 overflow-hidden z-40 animate-card-in">
              {resultadosBusqueda.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-gray-400">
                  No encontramos recursos con "{busqueda}"
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {resultadosBusqueda.map((r) => {
                    const areaColor = getColorForArea(r.area)
                    return (
                      <button
                        key={r.id}
                        onClick={() => router.push(`/recurso/${r.id}`)}
                        className="w-full px-5 py-3 flex items-center gap-3 text-left
                                   transition-colors cursor-pointer border-l-4"
                        style={{
                          borderLeftColor: areaColor,
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${areaColor}0a`}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {r.thumbnail_url ? (
                          <img src={r.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${areaColor}10` }}
                          >
                            <AreaIcon slug={AREAS.find(a => a.nombre === r.area)?.slug || ''} className="w-4 h-4" style={{ color: areaColor }} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1A3A5C] truncate">{r.titulo}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="inline-block w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: areaColor }}
                            />
                            <p className="text-xs text-gray-400 truncate">{r.area} · {r.eje_tematico}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contenido debajo del buscador (oculto cuando busca) */}
        {!buscando && (
          <>
            {/* Botones de áreas — cards visuales con ilustración de fondo */}
            <div className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {AREAS.map((area) => {
                const count = areaCounts[area.nombre] || 0
                const contenido = (
                  <>
                    {/* Fondo base del color del área */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${area.color}50 0%, ${area.color}35 50%, ${area.color}60 100%)`,
                      }}
                    />

                    {/* Decoración SVG ilustrativa */}
                    <AreaDecoration slug={area.slug} color={area.color} />

                    {/* Gradiente inferior más intenso para legibilidad del texto */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(to top, ${area.color}f0 0%, ${area.color}cc 35%, ${area.color}70 65%, transparent 100%)`,
                      }}
                    />

                    {/* Ribbon "Pronto" */}
                    {area.proximamente && (
                      <div className="absolute top-4 -right-8 z-10 rotate-45
                                      bg-white/90 text-[10px] font-bold uppercase tracking-widest
                                      text-gray-600 px-10 py-1 shadow-sm">
                        Pronto
                      </div>
                    )}

                    {/* Contenido */}
                    <div className="relative h-full flex flex-col justify-end p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center
                                        ${!area.proximamente ? 'group-hover:scale-110' : ''} transition-transform duration-300`}>
                          <AreaIcon slug={area.slug} className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white leading-tight drop-shadow-sm">
                            {area.nombre}
                          </h3>
                          <p className="text-white/70 text-xs mt-0.5">{area.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        {area.proximamente ? (
                          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                            Próximamente
                          </span>
                        ) : (
                          <>
                            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                              {count} {count === 1 ? 'recurso' : 'recursos'}
                            </span>
                            <div className="flex items-center gap-1 text-white/60 group-hover:text-white group-hover:translate-x-1
                                            transition-all duration-300">
                              <span className="text-xs font-medium">Explorar</span>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )

                if (area.proximamente) {
                  return (
                    <div
                      key={area.slug}
                      className="group rounded-3xl overflow-hidden opacity-75"
                      style={{ boxShadow: `0 4px 12px rgba(0,0,0,0.08), 0 4px 0 ${area.color}` }}
                    >
                      <div className="relative block h-48">
                        {contenido}
                      </div>
                    </div>
                  )
                }

                return (
                  <div
                    key={area.slug}
                    className="group rounded-3xl overflow-hidden
                               hover:-translate-y-3 transition-all duration-300 ease-[var(--ease-spring)]"
                    style={{ boxShadow: `0 4px 12px rgba(0,0,0,0.1), 0 4px 0 ${area.color}` }}
                  >
                    <Link
                      href={`/area/${area.slug}`}
                      className="relative block h-48 cursor-pointer"
                    >
                      {contenido}
                    </Link>
                  </div>
                )
              })}
            </div>

            {/* Efeméride */}
            {efemerideProxima && (
              <div className="w-full max-w-3xl mb-10 animate-card-in">
                <EfemeridesBanner efemeride={efemerideProxima} />
              </div>
            )}

            {/* Actividad reciente */}
            {actividad.length > 0 && (
              <div className="w-full max-w-3xl">
                <h2 className="text-sm font-bold text-[#1A3A5C] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E6EA6]" />
                  Actividad reciente
                </h2>
                <div className="space-y-2">
                  {actividad.map((r) => {
                    const areaColor = getColorForArea(r.area)
                    return (
                      <Link
                        key={r.id}
                        href={`/recurso/${r.id}`}
                        className="group flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm
                                   hover:shadow-card hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div
                          className="w-12 h-12 rounded-xl shrink-0 overflow-hidden flex items-center justify-center"
                          style={{ backgroundColor: `${areaColor}10` }}
                        >
                          {r.thumbnail_url ? (
                            <img src={r.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <AreaIcon slug={AREAS.find(a => a.nombre === r.area)?.slug || ''} className="w-5 h-5" style={{ color: areaColor }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#1A3A5C] truncate">
                            <span className="font-semibold">{r.autor_nombre || 'Anónimo'}</span>
                            <span className="text-gray-500"> subió </span>
                            <span className="font-semibold group-hover:text-[#8B2252] transition-colors">«{r.titulo}»</span>
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-gray-400">{tiempoRelativo(r.created_at)}</span>
                            <span className="text-[11px] text-gray-300">·</span>
                            <span className="text-[11px] font-medium" style={{ color: areaColor }}>{r.area}</span>
                            <span className="text-[11px] text-gray-300">·</span>
                            <span className="text-[11px] text-gray-500 truncate">{r.eje_tematico}</span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Welcome overlay */}
      {userName && <WelcomeOverlay nombre={userName} avatar={userAvatar} />}
    </div>
  )
}
