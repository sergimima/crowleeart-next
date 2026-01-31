import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

interface DecodedToken {
  userId: number
  email: string
  role: string
}

// PATCH /api/timelogs/[id] - Clock out (update clockOutTime and location)
export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params

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

    // Parse time log ID
    const timeLogId = parseInt(params.id)
    if (isNaN(timeLogId)) {
      return NextResponse.json(
        { error: 'Invalid time log ID' },
        { status: 400 }
      )
    }

    // Get request body
    const { clockOutLocation, workerNote } = await req.json()

    // Validate clockOutLocation
    if (!clockOutLocation) {
      return NextResponse.json(
        { error: 'Clock out location is required' },
        { status: 400 }
      )
    }

    // Validate location JSON structure
    try {
      const location = JSON.parse(clockOutLocation)
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

    // Verify time log exists and belongs to worker
    const existingTimeLog = await prisma.timeLog.findUnique({
      where: { id: timeLogId }
    })

    if (!existingTimeLog) {
      return NextResponse.json(
        { error: 'Time log not found' },
        { status: 404 }
      )
    }

    if (existingTimeLog.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only clock out your own time logs' },
        { status: 403 }
      )
    }

    // Verify not already clocked out
    if (existingTimeLog.clockOutTime) {
      return NextResponse.json(
        { error: 'This time log is already clocked out' },
        { status: 409 }
      )
    }

    // Update time log with clock out information
    const updatedTimeLog = await prisma.timeLog.update({
      where: { id: timeLogId },
      data: {
        clockOutTime: new Date(),
        clockOutLocation,
        workerNote: workerNote || existingTimeLog.workerNote
      }
    })

    return NextResponse.json({
      success: true,
      timeLog: updatedTimeLog
    })
  } catch (error) {
    console.error('Error updating time log:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
