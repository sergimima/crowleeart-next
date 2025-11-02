import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Create new service
export async function POST(req: NextRequest) {
  try {
    // TODO: Add authentication check for admin role

    const body = await req.json()
    const { title, description, price, marketPrice } = body

    if (!title || !description || price === undefined || marketPrice === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const service = await prisma.service.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        marketPrice: parseFloat(marketPrice),
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error: any) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Failed to create service', details: error.message },
      { status: 500 }
    )
  }
}
