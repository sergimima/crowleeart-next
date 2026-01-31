import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/invitations/validate?token=xxx - Validate invitation token
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Find the invitation
    const invitation = await prisma.invitationToken.findUnique({
      where: { token }
    })

    if (!invitation) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid invitation token'
      }, { status: 404 })
    }

    // Check if already used
    if (invitation.usedAt) {
      return NextResponse.json({
        valid: false,
        error: 'This invitation has already been used'
      }, { status: 400 })
    }

    // Check if expired
    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({
        valid: false,
        error: 'This invitation has expired'
      }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      role: invitation.role
    })
  } catch (error) {
    console.error('Error validating invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
