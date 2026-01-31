import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

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

    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const [services, bookings, messages, reviews, feedbacks, surveys, users, galleryItems, qrCodes, timeLogs, invitations] = await Promise.all([
      prisma.service.findMany(),
      prisma.booking.findMany({
        include: {
          user: { select: { name: true, email: true } },
          service: { select: { title: true } }
        }
      }),
      prisma.message.findMany({
        include: {
          user: { select: { name: true, email: true } }
        }
      }),
      prisma.review.findMany({
        include: {
          user: { select: { name: true, email: true } }
        }
      }),
      prisma.feedback.findMany({
        include: {
          user: { select: { name: true, email: true } }
        }
      }),
      prisma.surveyResponse.findMany({
        include: {
          user: { select: { name: true, email: true } }
        }
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      }),
      prisma.galleryItem.findMany(),
      prisma.qRCode.findMany(),
      prisma.timeLog.findMany({
        include: {
          user: { select: { name: true, email: true } }
        },
        orderBy: { clockInTime: 'desc' }
      }),
      prisma.invitationToken.findMany({
        orderBy: { createdAt: 'desc' }
      })
    ])

    return NextResponse.json({
      services,
      bookings,
      messages,
      reviews,
      feedbacks,
      surveys,
      users,
      galleryItems,
      qrCodes,
      timeLogs,
      invitations
    })
  } catch (error) {
    console.error('Admin data fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
