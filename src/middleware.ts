import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas protegidas
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/profile')

  if (isProtectedRoute) {
    // Obtener token de la cookie HTTP-only
    const token = request.cookies.get('token')?.value

    if (!token) {
      // No hay token, redirigir a login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      // Verificar token con jose (compatible con Edge Runtime)
      const { payload } = await jwtVerify(token, JWT_SECRET)

      // Verificar rol para rutas de admin
      if (pathname.startsWith('/dashboard/admin') && payload.role !== 'admin') {
        // No es admin, redirigir a home
        const homeUrl = new URL('/', request.url)
        return NextResponse.redirect(homeUrl)
      }

      // Verificar rol para rutas de worker
      if (pathname.startsWith('/dashboard/worker') && payload.role !== 'worker') {
        // No es worker, redirigir a home
        const homeUrl = new URL('/', request.url)
        return NextResponse.redirect(homeUrl)
      }

      // Token válido, continuar
      return NextResponse.next()
    } catch {
      // Token inválido, redirigir a login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Ruta pública, continuar
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
  ],
}
