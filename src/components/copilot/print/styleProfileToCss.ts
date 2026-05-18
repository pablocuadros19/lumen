import type { StyleProfile } from '@/types/copilot'
import type { CSSProperties } from 'react'

// Convierte el StyleProfile que extrajo Claude del original
// a CSS variables que aplicamos al <div> raíz del PDF.
// Si no hay profile (no era multimodal o el modelo no lo extrajo),
// devolvemos defaults LUMEN.
export function styleProfileToCss(profile: StyleProfile | undefined): CSSProperties {
  const primario   = profile?.paleta.primario   ?? '#1A3A5C'
  const secundario = profile?.paleta.secundario ?? '#8B2252'

  const densidadEscala = {
    compacta:  '0.85',
    media:     '1',
    espaciosa: '1.15',
  }[profile?.densidad ?? 'media']

  const fontFamily = {
    serif:       "'Georgia', 'Times New Roman', serif",
    sans:        "system-ui, -apple-system, 'Segoe UI', sans-serif",
    redondeada:  "'Comic Sans MS', 'Andika', 'Trebuchet MS', sans-serif",
    manuscrita:  "'Bradley Hand', 'Comic Sans MS', cursive",
  }[profile?.tipografia_estilo ?? 'sans']

  return {
    // Color principal del header, títulos, bordes destacados
    '--color-primary':   primario,
    // Color secundario para acentos
    '--color-secondary': secundario,
    // Escala de spacing: multiplica padding/margin
    '--density-scale':   densidadEscala,
    // Fuente del documento
    fontFamily,
  } as CSSProperties
}
