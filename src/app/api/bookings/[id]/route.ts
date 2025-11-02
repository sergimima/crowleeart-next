import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Update booking (cancel, reschedule, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const bookingId = parseInt(id)
    const { status, date } = await req.json()

    // Verify booking exists and belongs to user
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Only allow users to modify their own bookings (or admins can modify any)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (user?.role !== 'admin' && existingBooking.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only modify your own bookings' },
        { status: 403 }
      )
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Prevent cancelling already completed bookings
    if (status === 'cancelled' && existingBooking.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot cancel completed bookings' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    if (status) updateData.status = status
    if (date) {
      const newDate = new Date(date)
      if (isNaN(newDate.getTime()) || newDate <= new Date()) {
        return NextResponse.json(
          { error: 'Please provide a valid future date' },
          { status: 400 }
        )
      }
      updateData.date = newDate
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        service: { select: { title: true, price: true } },
        user: { select: { name: true, email: true } }
      }
    })

    return NextResponse.json({
      message: 'Booking updated successfully',
      booking: updatedBooking
    })
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete booking (hard delete - use with caution)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const bookingId = parseInt(id)

    // Verify booking exists and belongs to user
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Only allow users to delete their own bookings (or admins)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (user?.role !== 'admin' && existingBooking.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own bookings' },
        { status: 403 }
      )
    }

    await prisma.booking.delete({
      where: { id: bookingId }
    })

    return NextResponse.json({
      message: 'Booking deleted successfully'
    })
  } catch (error) {
    console.error('Delete booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
