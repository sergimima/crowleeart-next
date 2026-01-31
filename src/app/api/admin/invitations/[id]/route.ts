import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

interface DecodedToken {
  userId: number
  email: string
  role: string
}

// DELETE /api/admin/invitations/[id] - Delete/revoke invitation token
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params

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

    const invitationId = parseInt(params.id)
    if (isNaN(invitationId)) {
      return NextResponse.json({ error: 'Invalid invitation ID' }, { status: 400 })
    }

    // Check if invitation exists
    const existing = await prisma.invitationToken.findUnique({
      where: { id: invitationId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Delete invitation
    await prisma.invitationToken.delete({
      where: { id: invitationId }
    })

    return NextResponse.json({
      success: true,
      message: 'Invitation deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
