
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function PUT(
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

        // 2. Parse Body & ID
        const userId = parseInt(params.id)
        if (isNaN(userId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
        }

        const body = await req.json()
        const { name, email, role, phone, address } = body

        // 3. Update User
        // Note: We avoid updating password here, that's a separate endpoint
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                email,
                role,
                phone,
                address
            }
        })

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone,
                address: updatedUser.address
            }
        })

    } catch (error) {
        console.error('Update user error:', error)
        return NextResponse.json(
            { error: 'Internal server error or email already exists' },
            { status: 500 }
        )
    }
}
