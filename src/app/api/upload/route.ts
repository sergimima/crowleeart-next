import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { validateImageFile, generateSafeFilename } from '@/lib/security'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type via magic numbers
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const isValidImage = await validateImageFile(buffer)
    if (!isValidImage) {
      return NextResponse.json(
        { error: 'Invalid file content. Only real images are allowed.' },
        { status: 400 }
      )
    }

    // Validate strict size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Generate SAFE filename using UUID
    const filename = generateSafeFilename(file.name)

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'bookings')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Save file
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Return public URL
    const url = `/uploads/bookings/${filename}`

    return NextResponse.json({
      message: 'File uploaded successfully',
      url
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    )
  }
}
