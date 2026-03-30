// Tipos de la base de datos LUMEN

export type Grado = '1ro' | '2do' | '3ro' | '4to' | '5to' | '6to'

export type EjeTematico =
  | 'Plan lector'
  | 'Gramática'
  | 'Ortografía'
  | 'Comprensión lectora'
  | 'Producción escrita'
  | 'Oralidad'
  | 'Vocabulario'

export type TipoRecurso =
  | 'Actividad'
  | 'Evaluación'
  | 'Rúbrica'
  | 'Planificación'
  | 'Presentación'
  | 'Teoría / Marco'
  | 'Ideas / Inspiración'

export type Formato =
  | 'Documento'
  | 'Presentación slides'
  | 'Video'
  | 'Imagen / Lámina'
  | 'Juego / Interactivo'
  | 'Audio'
  | 'Link externo'

export type EstadoRecurso = 'borrador' | 'publicado' | 'destacado' | 'archivado'

export interface Recurso {
  id: string
  titulo: string
  resumen: string | null
  grados: Grado[]
  area: string
  eje_tematico: EjeTematico
  tipo_recurso: TipoRecurso
  formato: Formato
  editable: boolean
  estado: EstadoRecurso
  idioma: 'es' | 'en'
  archivo_drive_id: string | null
  archivo_url: string | null
  thumbnail_url: string | null
  link_editable: string | null
  texto_extraido: string | null
  subido_por: string
  autor_nombre: string | null
  descargas: number
  created_at: string
  updated_at: string
}

export interface Perfil {
  id: string
  email: string
  nombre: string
  rol: 'admin' | 'docente'
  grados_asignados: Grado[]
  avatar_url: string | null
  created_at: string
}

export interface Favorito {
  id: string
  user_id: string
  recurso_id: string
  created_at: string
}
