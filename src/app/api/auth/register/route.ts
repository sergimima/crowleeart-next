import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, address, inviteToken } = await req.json()

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'Name, email, password, and phone are required' },
        { status: 400 }
      )
    }

    // Validación de contraseña: mínimo 8 caracteres, una mayúscula y un número
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter' },
        { status: 400 }
      )
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one number' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Determine role based on invite token
    let userRole = 'client' // Default role

    if (inviteToken) {
      // Validate invitation token
      const invitation = await prisma.invitationToken.findUnique({
        where: { token: inviteToken }
      })

      if (!invitation) {
        return NextResponse.json(
          { error: 'Invalid invitation token' },
          { status: 400 }
        )
      }

      if (invitation.usedAt) {
        return NextResponse.json(
          { error: 'This invitation has already been used' },
          { status: 400 }
        )
      }

      if (new Date() > invitation.expiresAt) {
        return NextResponse.json(
          { error: 'This invitation has expired' },
          { status: 400 }
        )
      }

      userRole = invitation.role
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        address: address || null,
        role: userRole
      }
    })

    // Mark invitation as used if one was provided
    if (inviteToken) {
      await prisma.invitationToken.update({
        where: { token: inviteToken },
        data: {
          usedAt: new Date(),
          usedBy: user.id
        }
      })
    }

    // Crear token JWT para auto-login
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Crear respuesta con cookie
    const response = NextResponse.json({
      message: 'User registered successfully',
      success: true,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, { status: 201 })

    // Establecer cookie HTTP-only
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
