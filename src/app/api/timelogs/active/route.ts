import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

interface DecodedToken {
  userId: number
  email: string
  role: string
}

// GET /api/timelogs/active - Get current active time log (clocked in but not clocked out)
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

    // Query for active time log (clockOutTime is null)
    const activeTimeLog = await prisma.timeLog.findFirst({
      where: {
        userId: decoded.userId,
        clockOutTime: null
      },
      orderBy: { clockInTime: 'desc' }
    })

    return NextResponse.json({
      activeTimeLog: activeTimeLog || null
    })
  } catch (error) {
    console.error('Error fetching active time log:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
