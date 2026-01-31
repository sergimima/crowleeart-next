import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

interface DecodedToken {
  userId: number
  email: string
  role: string
}

const VALID_ROLES = ['client', 'worker']

// GET /api/admin/invitations - Get all invitation tokens
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let decoded: DecodedToken
    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const invitations = await prisma.invitationToken.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ invitations })
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/invitations - Create new invitation token
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let decoded: DecodedToken
    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { role, expiresInHours = 48 } = await req.json()

    // Validate role
    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate expiration
    if (expiresInHours < 1 || expiresInHours > 168) { // 1 hour to 7 days
      return NextResponse.json(
        { error: 'Expiration must be between 1 and 168 hours (7 days)' },
        { status: 400 }
      )
    }

    // Generate secure random token
    const inviteToken = crypto.randomBytes(32).toString('hex')

    // Calculate expiration
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)

    // Create invitation
    const invitation = await prisma.invitationToken.create({
      data: {
        token: inviteToken,
        role,
        expiresAt
      }
    })

    // Build the invitation URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const inviteUrl = `${baseUrl}/register?invite=${inviteToken}`

    return NextResponse.json({
      success: true,
      invitation,
      inviteUrl
    })
  } catch (error) {
    console.error('Error creating invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
