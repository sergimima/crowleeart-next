import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      // Create temporary user for contact messages
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: '', // No password for contact-only users
          role: 'client'
        }
      })
    }

    // Create message
    await prisma.message.create({
      data: {
        userId: user.id,
        subject,
        content: message,
      }
    })

    return NextResponse.json({ message: 'Contact message sent successfully' })
  } catch (error) {
    console.error('Error processing contact:', error)
    return NextResponse.json(
      { error: 'Error sending message' },
      { status: 500 }
    )
  }
}
