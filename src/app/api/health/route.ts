import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  let dbStatus = 'not_tested'
  let dbError = null

  try {
    // Test database connection (optional - won't fail if DB not configured)
    await prisma.$connect()
    dbStatus = 'connected'
  } catch (error) {
    dbStatus = 'disconnected'
    dbError = error instanceof Error ? error.message : 'Unknown error'
  }

  return NextResponse.json({
    status: 'ok',
    message: 'Next.js API is running',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    dbError: dbError,
    nextjs: '15.5.6',
    turbopack: true,
  })
}
