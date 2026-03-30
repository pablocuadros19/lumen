// Valores posibles para cada árbol de tags

export const GRADOS = ['1ro', '2do', '3ro', '4to', '5to', '6to'] as const

export const EJES_TEMATICOS = [
  'Plan lector',
  'Gramática',
  'Ortografía',
  'Comprensión lectora',
  'Producción escrita',
  'Oralidad',
  'Vocabulario',
] as const

export const TIPOS_RECURSO = [
  'Actividad',
  'Evaluación',
  'Rúbrica',
  'Planificación',
  'Presentación',
  'Teoría / Marco',
  'Ideas / Inspiración',
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
