import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

interface DecodedToken {
  userId: number
  email: string
  role: string
}

const VALID_STATUSES = ['pending', 'approved', 'rejected']

// PUT /api/admin/timelogs/[id] - Update time log status and admin note
export async function PUT(
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

    // Check role is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
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
    const { status, adminNote, clockInTime, clockOutTime } = await req.json()

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate adminNote length
    if (adminNote && adminNote.length > 1000) {
      return NextResponse.json(
        { error: 'Admin note must be less than 1000 characters' },
        { status: 400 }
      )
    }

    // Validate clockInTime if provided
    if (clockInTime) {
      const parsedClockIn = new Date(clockInTime)
      if (isNaN(parsedClockIn.getTime())) {
        return NextResponse.json(
          { error: 'Invalid clock in time format' },
          { status: 400 }
        )
      }
    }

    // Validate clockOutTime if provided
    if (clockOutTime) {
      const parsedClockOut = new Date(clockOutTime)
      if (isNaN(parsedClockOut.getTime())) {
        return NextResponse.json(
          { error: 'Invalid clock out time format' },
          { status: 400 }
        )
      }
    }

    // Verify time log exists
    const existingTimeLog = await prisma.timeLog.findUnique({
      where: { id: timeLogId }
    })

    if (!existingTimeLog) {
      return NextResponse.json(
        { error: 'Time log not found' },
        { status: 404 }
      )
    }

    // Validate clock out is after clock in
    const finalClockIn = clockInTime ? new Date(clockInTime) : existingTimeLog.clockInTime
    const finalClockOut = clockOutTime ? new Date(clockOutTime) : existingTimeLog.clockOutTime

    if (finalClockOut && finalClockIn && finalClockOut < finalClockIn) {
      return NextResponse.json(
        { error: 'Clock out time must be after clock in time' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: {
      status?: string
      adminNote?: string
      clockInTime?: Date
      clockOutTime?: Date | null
    } = {}

    if (status) updateData.status = status
    if (adminNote !== undefined) updateData.adminNote = adminNote
    if (clockInTime) updateData.clockInTime = new Date(clockInTime)
    if (clockOutTime !== undefined) {
      updateData.clockOutTime = clockOutTime ? new Date(clockOutTime) : null
    }

    // Update time log
    const updatedTimeLog = await prisma.timeLog.update({
      where: { id: timeLogId },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Time log updated successfully',
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

// DELETE /api/admin/timelogs/[id] - Delete time log
export async function DELETE(
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

    // Check role is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
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

    // Verify time log exists
    const existingTimeLog = await prisma.timeLog.findUnique({
      where: { id: timeLogId }
    })

    if (!existingTimeLog) {
      return NextResponse.json(
        { error: 'Time log not found' },
        { status: 404 }
      )
    }

    // Delete time log
    await prisma.timeLog.delete({
      where: { id: timeLogId }
    })

    return NextResponse.json({
      success: true,
      message: 'Time log deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting time log:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
