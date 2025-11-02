import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
      },
      orderBy: { id: 'asc' },
    })

    return NextResponse.json({
      message: 'Services retrieved successfully',
      services,
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Error fetching services' },
      { status: 500 }
    )
  }
}
