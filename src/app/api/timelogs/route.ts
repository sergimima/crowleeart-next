import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

interface DecodedToken {
  userId: number
  email: string
  role: string
}

// GET /api/timelogs - Get all time logs for authenticated worker
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

    // Query time logs filtered by userId
    const timeLogs = await prisma.timeLog.findMany({
      where: { userId: decoded.userId },
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

// POST /api/timelogs - Create clock in record
export async function POST(req: NextRequest) {
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

    // Check role is worker
    if (decoded.role !== 'worker') {
      return NextResponse.json(
        { error: 'Forbidden - Worker access required' },
        { status: 403 }
      )
    }

    // Get request body
    const { clockInLocation, workerNote } = await req.json()

    // Validate clockInLocation
    if (!clockInLocation) {
      return NextResponse.json(
        { error: 'Clock in location is required' },
        { status: 400 }
      )
    }

    // Validate location JSON structure
    try {
      const location = JSON.parse(clockInLocation)
      if (!location.latitude || !location.longitude || !location.timestamp || !location.accuracy) {
        return NextResponse.json(
          { error: 'Invalid location data structure' },
          { status: 400 }
        )
      }

      // Validate coordinate ranges
      if (location.latitude < -90 || location.latitude > 90) {
        return NextResponse.json(
          { error: 'Invalid latitude' },
          { status: 400 }
        )
      }

      if (location.longitude < -180 || location.longitude > 180) {
        return NextResponse.json(
          { error: 'Invalid longitude' },
          { status: 400 }
        )
      }
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid location JSON format' },
        { status: 400 }
      )
    }

    // Validate workerNote length
    if (workerNote && workerNote.length > 1000) {
      return NextResponse.json(
        { error: 'Worker note must be less than 1000 characters' },
        { status: 400 }
      )
    }

    // Check if there's an active time log (no clock out yet)
    const activeTimeLog = await prisma.timeLog.findFirst({
      where: {
        userId: decoded.userId,
        clockOutTime: null
      }
    })

    if (activeTimeLog) {
      return NextResponse.json(
        { error: 'You are already clocked in. Please clock out first.' },
        { status: 409 }
      )
    }

    // Create new time log
    const timeLog = await prisma.timeLog.create({
      data: {
        userId: decoded.userId,
        clockInTime: new Date(),
        clockInLocation,
        workerNote: workerNote || null,
        status: 'pending'
      }
    })

    return NextResponse.json({
      success: true,
      timeLog
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating time log:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
