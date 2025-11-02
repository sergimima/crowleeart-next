import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function GET(req: NextRequest) {
  try {
    // Obtener token de la cookie
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { isAuthenticated: false },
        { status: 401 }
      )
    }

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      }
    })
  } catch (error) {
    return NextResponse.json(
      { isAuthenticated: false },
      { status: 401 }
    )
  }
}
