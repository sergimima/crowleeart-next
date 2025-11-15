import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST - Track QR code scan
export async function POST(req: NextRequest) {
  try {
    const { refCode } = await req.json()

    if (!refCode) {
      return NextResponse.json(
        { error: 'refCode is required' },
        { status: 400 }
      )
    }

    // Increment scan count
    const qrCode = await prisma.qRCode.update({
      where: { refCode },
      data: {
        scanCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ success: true, scanCount: qrCode.scanCount })
  } catch (error) {
    console.error('Error tracking QR code:', error)
    // Don't fail the request if tracking fails
    return NextResponse.json({ success: false }, { status: 200 })
  }
}
