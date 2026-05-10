// Valores posibles para cada árbol de tags

export const GRADOS = ['1ro', '2do', '3ro', '4to', '5to', '6to'] as const

// === Áreas curriculares ===
export interface AreaConfig {
  slug: string
  nombre: string
  color: string
  description: string
  proximamente?: boolean
}

export const AREAS: AreaConfig[] = [
  { slug: 'practicas-del-lenguaje', nombre: 'Prácticas del Lenguaje', color: '#8B2252', description: 'Lectura, escritura, oralidad y gramática' },
  { slug: 'ciencias-naturales', nombre: 'Ciencias Naturales', color: '#2E7D4F', description: 'Seres vivos, materiales, fenómenos y ambiente' },
  { slug: 'matematica', nombre: 'Matemática', color: '#2E6EA6', description: 'Números, operaciones, geometría y medida' },
  { slug: 'ciencias-sociales', nombre: 'Ciencias Sociales', color: '#C4972A', description: 'Historia, geografía, sociedad y ciudadanía' },
]

// Ejes temáticos por área
export const EJES_POR_AREA: Record<string, readonly string[]> = {
  'Prácticas del Lenguaje': [
    'Plan lector',
    'Gramática',
    'Ortografía',
    'Comprensión lectora',
    'Producción escrita',
    'Oralidad',
    'Vocabulario',
  ],
  'Ciencias Naturales': [
    'Seres vivos',
    'Cuerpo humano',
    'Materiales',
    'Fenómenos naturales',
    'La Tierra y el universo',
    'Ambiente y cuidado',
    'Experimentación',
  ],
  'Matemática': [
    'Números y operaciones',
    'Geometría',
    'Medida',
    'Estadística y probabilidad',
    'Álgebra y funciones',
    'Resolución de problemas',
  ],
  'Ciencias Sociales': [
    'Sociedades y territorios',
    'Sociedades a través del tiempo',
    'Actividades humanas y organización social',
    'Ciudadanía y participación',
    'Ambiente y sociedad',
    'Memoria e identidad',
  ],
}

// Backward compat — alias del área original
export const EJES_TEMATICOS = EJES_POR_AREA['Prácticas del Lenguaje']!

// Helpers
export function getEjesForArea(area: string): readonly string[] {
  return EJES_POR_AREA[area] || EJES_TEMATICOS
}

export function getAreaBySlug(slug: string): AreaConfig | undefined {
  return AREAS.find(a => a.slug === slug)
}

export function getSlugForArea(nombre: string): string {
  return AREAS.find(a => a.nombre === nombre)?.slug || 'practicas-del-lenguaje'
}

export function getColorForArea(nombre: string): string {
  return AREAS.find(a => a.nombre === nombre)?.color || '#1A3A5C'
}

export const TIPOS_RECURSO = [
  'Actividad',
  'Evaluación',
  'Rúbrica',
  'Planificación',
  'Presentación',
  'Teoría / Marco',
  'Ideas / Inspiración',
  'Juego',
  'Material audiovisual',
  'Proyecto',
] as const

export const FORMATOS = [
  'Documento',
  'Presentación slides',
  'Video',
  'Imagen / Lámina',
  'Juego / Interactivo',
  'Audio',
  'Link externo',
] as const

// Colores LUMEN
export const COLORS = {
  blue: '#1A3A5C',
  red: '#8B2252',
  lightBlue: '#2E6EA6',
  dark: '#1a1a2e',
  gray: '#555555',
  lightGray: '#f0f2f5',
  bgSection: '#EBF0F7',
  green: '#00A651',
} as const
