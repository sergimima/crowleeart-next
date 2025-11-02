import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT - Update service
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for admin role
    const { id } = await params

    const body = await req.json()
    const { title, description, price, marketPrice } = body

    const service = await prisma.service.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        price: parseFloat(price),
        marketPrice: parseFloat(marketPrice),
      },
    })

    return NextResponse.json(service)
  } catch (error: any) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Failed to update service', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete service
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check for admin role
    const { id } = await params

    await prisma.service.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Failed to delete service', details: error.message },
      { status: 500 }
    )
  }
}
