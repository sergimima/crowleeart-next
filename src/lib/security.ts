import { randomUUID } from 'crypto'
import path from 'path'

/**
 * Validates that a buffer contains a valid image signature (magic numbers)
 */
export async function validateImageFile(buffer: Buffer): Promise<boolean> {
    const magicNumbers = {
        jpeg: [0xFF, 0xD8, 0xFF],
        png: [0x89, 0x50, 0x4E, 0x47],
        gif: [0x47, 0x49, 0x46],
        webp: [0x52, 0x49, 0x46, 0x46]
    }

    for (const [type, signature] of Object.entries(magicNumbers)) {
        if (signature.every((byte, i) => buffer[i] === byte)) {
            return true
        }
    }
    return false
}

/**
 * Generates a safe filename using UUID to prevent path traversal
 */
export function generateSafeFilename(originalName: string): string {
    const ext = path.extname(originalName).toLowerCase()
    // Ensure extension is safe (alphanumeric only)
    const safeExt = ext.replace(/[^a-z0-9.]/g, '') || '.bin'
    return `${randomUUID()}${safeExt}`
}
