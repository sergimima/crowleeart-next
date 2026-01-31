import type { TimeLog as PrismaTimeLog, User } from '@prisma/client'

export type TimeLogStatus = 'pending' | 'approved' | 'rejected'

export interface TimeLog extends PrismaTimeLog {}

export interface TimeLogWithUser extends TimeLog {
  user: {
    name: string
    email: string
  }
}

export interface LocationData {
  latitude: number
  longitude: number
  timestamp: string
  accuracy: number
}
