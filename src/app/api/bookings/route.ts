import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'
import { TERMS_VERSION } from '@/lib/terms'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function GET(req: NextRequest) {
  try {
    // Obtener token de la cookie
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

    const bookings = await prisma.booking.findMany({
      where: { userId: decoded.userId },
      include: {
        service: { select: { title: true } }
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Fetch bookings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { serviceId, date, description, phone, imageUrl, termsAccepted, termsVersion, earlyStartRequested } = await req.json()

    // Get authenticated user from token
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
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

    if (!serviceId || !date || !description || !phone) {
      return NextResponse.json(
        { error: 'All fields are required: serviceId, date, description, phone' },
        { status: 400 }
      )
    }

    if (termsAccepted !== true || termsVersion !== TERMS_VERSION) {
      return NextResponse.json(
        { error: 'Please read and accept the current Terms & Conditions.' },
        { status: 400 }
      )
    }

    if (earlyStartRequested !== undefined && typeof earlyStartRequested !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid early-start request.' },
        { status: 400 }
      )
    }

    const bookingDate = new Date(date)
    if (isNaN(bookingDate.getTime()) || bookingDate <= new Date()) {
      return NextResponse.json(
        { error: 'Please provide a valid future date' },
        { status: 400 }
      )
    }

    const serviceExists = await prisma.service.findUnique({
      where: { id: Number(serviceId) }
    })

    if (!serviceExists) {
      return NextResponse.json(
        { error: 'Selected service not found' },
        { status: 404 }
      )
    }

    const booking = await prisma.booking.create({
      data: {
        userId: decoded.userId,
        serviceId: Number(serviceId),
        date: bookingDate,
        description,
        phone,
        imageUrl: imageUrl || null,
        termsVersion,
        termsAcceptedAt: new Date(),
        earlyStartRequested: earlyStartRequested === true,
        status: 'pending',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        service: true,
      }
    })

    return NextResponse.json({
      message: 'Booking request received. Confirmation requires agreed availability and receipt of the £80 booking payment.',
      booking
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Error creating booking' },
      { status: 500 }
    )
  }
}
