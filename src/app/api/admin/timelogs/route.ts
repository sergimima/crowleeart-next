import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

interface DecodedToken {
  userId: number
  email: string
  role: string
}

// GET /api/admin/timelogs - Get all time logs from all workers (admin only)
export async function GET(req: NextRequest) {
  try {
    // Extract and verify JWT token
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify token
    let decoded: DecodedToken
    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Check role is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Query all time logs with user details
    const timeLogs = await prisma.timeLog.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { clockInTime: 'desc' }
    })

    return NextResponse.json({ timeLogs })
  } catch (error) {
    console.error('Error fetching time logs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
