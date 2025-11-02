import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Update booking status (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    // Verify user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const bookingId = parseInt(params.id)
    const { status } = await req.json()

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Verify booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
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

// Delete booking (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    // Verify user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const bookingId = parseInt(params.id)

    // Verify booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
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
