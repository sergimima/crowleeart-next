import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyAuth } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Obtener todas las categorías únicas
export async function GET(request: Request) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.isAuthenticated || authResult.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener todas las categorías únicas de los items de la galería
    const items = await prisma.galleryItem.findMany({
      where: {
        category: {
          not: null
        }
      },
      select: {
        category: true
      },
      distinct: ['category']
    })

    const categories = items.map(item => item.category).filter(Boolean)

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
