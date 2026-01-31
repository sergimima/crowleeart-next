'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Clock, LogIn, LogOut, MapPin, RefreshCw, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getCurrentPosition, formatLocation, calculateDuration } from '@/lib/geolocation'
import type { TimeLog } from '@/types/timeLog'

export default function WorkerDashboard() {
  const router = useRouter()
  const [activeTimeLog, setActiveTimeLog] = useState<TimeLog | null>(null)
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [note, setNote] = useState('')
  const [locationError, setLocationError] = useState<string | null>(null)
  const [elapsedTime, setElapsedTime] = useState('')

  // Fetch active time log
  const fetchActiveTimeLog = async () => {
    try {
      const response = await fetch('/api/timelogs/active', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setActiveTimeLog(data.activeTimeLog)
      } else if (response.status === 401 || response.status === 403) {
        toast.error('Session expired. Please log in again.')
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching active time log:', error)
    }
  }

  // Fetch time logs history
  const fetchTimeLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/timelogs', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setTimeLogs(data.timeLogs || [])
      } else if (response.status === 401 || response.status === 403) {
        toast.error('Session expired. Please log in again.')
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching time logs:', error)
      toast.error('Failed to load time logs')
    } finally {
      setLoading(false)
    }
  }

  // Clock In handler
  const handleClockIn = async () => {
    setActionLoading(true)
    setLocationError(null)

    try {
      // Get current position
      const result = await getCurrentPosition()

      if (!result.success) {
        setLocationError(result.error || 'Failed to get location')
        toast.error(result.error || 'Failed to get location')
        setActionLoading(false)
        return
      }

      // Format location
      const locationString = formatLocation(result.location!)

      // POST clock in
      const response = await fetch('/api/timelogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clockInLocation: locationString,
          workerNote: note || undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        setActiveTimeLog(data.timeLog)
        setNote('')
        toast.success('Clocked in successfully!')
        await fetchTimeLogs()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to clock in')
      }
    } catch (error) {
      console.error('Clock in error:', error)
      toast.error('Network error. Please check your connection.')
    } finally {
      setActionLoading(false)
    }
  }

  // Clock Out handler
  const handleClockOut = async () => {
    if (!activeTimeLog) {
      toast.error('No active session found')
      return
    }

    setActionLoading(true)
    setLocationError(null)

    try {
      // Get current position
      const result = await getCurrentPosition()

      if (!result.success) {
        setLocationError(result.error || 'Failed to get location')
        toast.error(result.error || 'Failed to get location')
        setActionLoading(false)
        return
      }

      // Format location
      const locationString = formatLocation(result.location!)

      // PATCH clock out
      const response = await fetch(`/api/timelogs/${activeTimeLog.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clockOutLocation: locationString,
          workerNote: note || undefined
        })
      })

      if (response.ok) {
        setActiveTimeLog(null)
        setNote('')
        toast.success('Clocked out successfully!')
        await fetchTimeLogs()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to clock out')
      }
    } catch (error) {
      console.error('Clock out error:', error)
      toast.error('Network error. Please check your connection.')
    } finally {
      setActionLoading(false)
    }
  }

  // Update elapsed time every minute
  useEffect(() => {
    if (!activeTimeLog) {
      setElapsedTime('')
      return
    }

    const updateElapsedTime = () => {
      const start = new Date(activeTimeLog.clockInTime)
      const now = new Date()
      const diffMs = now.getTime() - start.getTime()
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      setElapsedTime(`${hours}h ${minutes}m`)
    }

    updateElapsedTime()
    const interval = setInterval(updateElapsedTime, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [activeTimeLog])

  // Initial fetch
  useEffect(() => {
    fetchActiveTimeLog()
    fetchTimeLogs()
  }, [])

  // Refresh handler
  const handleRefresh = async () => {
    await fetchActiveTimeLog()
    await fetchTimeLogs()
    toast.success('Data refreshed')
  }

  // Status badge config
  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400', icon: Clock },
    approved: { label: 'Approved', color: 'bg-green-500/20 text-green-600 dark:text-green-400', icon: Clock },
    rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-600 dark:text-red-400', icon: Clock }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Worker Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your work hours and time tracking</p>
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={actionLoading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Status Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              {activeTimeLog ? (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full font-semibold text-lg">
                    <LogIn className="h-5 w-5" />
                    Clocked In
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Since {format(new Date(activeTimeLog.clockInTime), 'PPp')}
                  </p>
                  {elapsedTime && (
                    <p className="text-2xl font-bold">{elapsedTime}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500/20 text-gray-600 dark:text-gray-400 rounded-full font-semibold text-lg">
                    <LogOut className="h-5 w-5" />
                    Not Clocked In
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ready to start your shift
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Clock In/Out Button */}
        <Card>
          <CardHeader>
            <CardTitle>Time Tracking</CardTitle>
            <CardDescription>Clock in when you start work and clock out when you finish</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Notes field */}
            <div className="space-y-2">
              <Label htmlFor="note">
                <FileText className="h-4 w-4 inline mr-1" />
                Notes (optional)
              </Label>
              <Textarea
                id="note"
                placeholder="Add any notes about your shift (e.g., 'Finished early due to weather')"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={1000}
                disabled={actionLoading}
              />
              <p className="text-xs text-muted-foreground">{note.length}/1000 characters</p>
            </div>

            {/* Location error */}
            {locationError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-600 dark:text-red-400">
                <MapPin className="h-4 w-4 inline mr-1" />
                {locationError}
              </div>
            )}

            {/* Action button */}
            {activeTimeLog ? (
              <Button
                size="lg"
                className="w-full h-24 text-xl font-bold bg-red-600 hover:bg-red-700"
                onClick={handleClockOut}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="h-6 w-6 mr-2 animate-spin" />
                    Getting location...
                  </>
                ) : (
                  <>
                    <LogOut className="h-6 w-6 mr-2" />
                    Clock Out
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full h-24 text-xl font-bold bg-green-600 hover:bg-green-700"
                onClick={handleClockIn}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="h-6 w-6 mr-2 animate-spin" />
                    Getting location...
                  </>
                ) : (
                  <>
                    <LogIn className="h-6 w-6 mr-2" />
                    Clock In
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Time Log History</CardTitle>
            <CardDescription>View your past clock in/out records</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : timeLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No time logs yet</p>
                <p className="text-sm">Clock in to start tracking your time</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>My Note</TableHead>
                      <TableHead>Admin Note</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeLogs.map((log) => {
                      const StatusIcon = statusConfig[log.status as keyof typeof statusConfig]?.icon || Clock
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">
                            {format(new Date(log.clockInTime), 'PP')}
                          </TableCell>
                          <TableCell>
                            {format(new Date(log.clockInTime), 'p')}
                          </TableCell>
                          <TableCell>
                            {log.clockOutTime ? format(new Date(log.clockOutTime), 'p') : (
                              <Badge variant="outline" className="bg-green-500/20 text-green-600">In Progress</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {log.clockOutTime ? calculateDuration(log.clockInTime, log.clockOutTime) : '—'}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {log.workerNote || '—'}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {log.adminNote || '—'}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusConfig[log.status as keyof typeof statusConfig]?.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[log.status as keyof typeof statusConfig]?.label || log.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
