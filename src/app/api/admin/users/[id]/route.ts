
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function DELETE(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;

    try {
        // 1. Verify Admin Auth
        const token = req.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        try {
            const { payload } = await jwtVerify(token, JWT_SECRET)
            if (payload.role !== 'admin') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }
        } catch {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        // 2. Parse ID
        const userId = parseInt(params.id)
        if (isNaN(userId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
        }

        // 3. Delete User
        await prisma.user.delete({
            where: { id: userId }
        })

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully'
        })

    } catch (error) {
        console.error('Delete user error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
