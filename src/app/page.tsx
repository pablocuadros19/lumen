import { createClient } from '@/lib/supabase/server'
import { MOCK_RECURSOS } from '@/lib/mock-data'
import BibliotecaView from '@/components/BibliotecaView'
import type { Recurso } from '@/types/database'

export default async function HomePage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('recursos')
    .select('*')
    .in('estado', ['publicado', 'destacado'])
    .order('created_at', { ascending: false })

  // Si hay recursos reales, usarlos. Si no, fallback a mock.
  const recursos: Recurso[] = data && data.length > 0 ? data : MOCK_RECURSOS

  return <BibliotecaView recursos={recursos} />
}
