import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

interface DecodedToken {
  userId: number
  email: string
  role: string
}

interface AuthResult {
  isAuthenticated: boolean
  user?: DecodedToken
  error?: string
}

export async function verifyAuth(request: Request): Promise<AuthResult> {
  try {
    // Extract token from cookies
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) {
      return { isAuthenticated: false, error: 'No token provided' }
    }

    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...v] = c.split('=')
        return [key, v.join('=')]
      })
    )

    const token = cookies.token
    if (!token) {
      return { isAuthenticated: false, error: 'No token provided' }
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken

    return {
      isAuthenticated: true,
      user: decoded
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return { isAuthenticated: false, error: 'Invalid token' }
  }
}
