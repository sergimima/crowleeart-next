
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

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

        const { newPassword } = await req.json()

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            )
        }

        // 3. Hash Password & Update
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Password updated successfully'
        })

    } catch (error) {
        console.error('Reset password error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
