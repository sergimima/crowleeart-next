import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'
import QRCode from 'qrcode'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// GET - List all QR codes
export async function GET(req: NextRequest) {
  try {
    // Verify admin token
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { role: string }
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const qrCodes = await prisma.qRCode.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(qrCodes)
  } catch (error) {
    console.error('Error fetching QR codes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch QR codes' },
      { status: 500 }
    )
  }
}

// POST - Create new QR code
export async function POST(req: NextRequest) {
  try {
    // Verify admin token
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { role: string }
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { title, description, refCode, baseUrl } = await req.json()

    if (!title || !refCode || !baseUrl) {
      return NextResponse.json(
        { error: 'Title, refCode, and baseUrl are required' },
        { status: 400 }
      )
    }

    // Validate refCode format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(refCode)) {
      return NextResponse.json(
        { error: 'RefCode must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      )
    }

    // Check if refCode already exists
    const existing = await prisma.qRCode.findUnique({
      where: { refCode }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'RefCode already exists' },
        { status: 409 }
      )
    }

    // Build full URL with tracking parameter
    const url = `${baseUrl}?ref=${refCode}`

    // Generate QR code as base64 data URL
    const qrImageData = await QRCode.toDataURL(url, {
      width: 500,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    // Save to database
    const qrCode = await prisma.qRCode.create({
      data: {
        title,
        description: description || null,
        url,
        refCode,
        qrImageData
      }
    })

    return NextResponse.json(qrCode, { status: 201 })
  } catch (error) {
    console.error('Error creating QR code:', error)
    return NextResponse.json(
      { error: 'Failed to create QR code' },
      { status: 500 }
    )
  }
}
