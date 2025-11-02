import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { name, password, address, phone } = await req.json()

    const updateData: any = {
      name,
      address,
      phone
    }

    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        )
      }
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        phone: true,
        role: true
      }
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
