import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png|3d|3d/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
