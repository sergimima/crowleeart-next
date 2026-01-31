'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Clock, Eye, Trash2, MapPin, CheckCircle2, XCircle, ExternalLink, LogOut, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { parseLocation, calculateDuration, formatCoordinates, getGoogleMapsLink } from '@/lib/geolocation'
import type { TimeLogWithUser } from '@/types/timeLog'

interface AdminTimeLogsProps {
  timeLogs: TimeLogWithUser[]
  onUpdate: () => void
}

export default function AdminTimeLogs({ timeLogs: initialTimeLogs, onUpdate }: AdminTimeLogsProps) {
  const [timeLogs, setTimeLogs] = useState<TimeLogWithUser[]>(initialTimeLogs)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [viewingTimeLog, setViewingTimeLog] = useState<TimeLogWithUser | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [editingStatus, setEditingStatus] = useState<string>('')
  const [editingNote, setEditingNote] = useState<string>('')
  const [editingClockIn, setEditingClockIn] = useState<string>('')
  const [editingClockOut, setEditingClockOut] = useState<string>('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // Sync with props
  useEffect(() => {
    setTimeLogs(initialTimeLogs)
  }, [initialTimeLogs])

  // Update time log (status, admin note, and optionally times)
  const updateTimeLog = async (
    id: number,
    status: string,
    adminNote: string,
    clockInTime?: string,
    clockOutTime?: string | null
  ) => {
    try {
      setActionLoading(id)
      const body: Record<string, unknown> = { status, adminNote }
      if (clockInTime) body.clockInTime = clockInTime
      if (clockOutTime !== undefined) body.clockOutTime = clockOutTime

      const response = await fetch(`/api/admin/timelogs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update time log')
      }

      const data = await response.json()

      // Update local state
      setTimeLogs(prev => prev.map(log => log.id === id ? data.timeLog : log))

      toast.success('Time log updated successfully')
      onUpdate()
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update time log')
    } finally {
      setActionLoading(null)
    }
  }

  // Delete time log
  const deleteTimeLog = async (id: number) => {
    try {
      setActionLoading(id)
      const response = await fetch(`/api/admin/timelogs/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete time log')
      }

      // Remove from local state
      setTimeLogs(prev => prev.filter(log => log.id !== id))

      toast.success('Time log deleted successfully')
      setDeleteId(null)
      onUpdate()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete time log')
    } finally {
      setActionLoading(null)
    }
  }

  // Format datetime for input field (local timezone)
  const formatForInput = (date: Date | string) => {
    const d = new Date(date)
    const offset = d.getTimezoneOffset()
    const local = new Date(d.getTime() - offset * 60 * 1000)
    return local.toISOString().slice(0, 16)
  }

  // Open view dialog
  const openViewDialog = (timeLog: TimeLogWithUser) => {
    setViewingTimeLog(timeLog)
    setEditingStatus(timeLog.status)
    setEditingNote(timeLog.adminNote || '')
    setEditingClockIn(formatForInput(timeLog.clockInTime))
    setEditingClockOut(timeLog.clockOutTime ? formatForInput(timeLog.clockOutTime) : '')
    setIsViewOpen(true)
  }

  // Manual clock out for in-progress sessions
  const manualClockOut = async (id: number) => {
    const now = new Date().toISOString()
    await updateTimeLog(id, 'pending', '', undefined, now)
  }

  // Save changes from dialog
  const handleSaveFromDialog = async () => {
    if (!viewingTimeLog) return

    // Convert local datetime back to ISO
    const clockIn = editingClockIn ? new Date(editingClockIn).toISOString() : undefined
    const clockOut = editingClockOut ? new Date(editingClockOut).toISOString() : null

    await updateTimeLog(
      viewingTimeLog.id,
      editingStatus,
      editingNote,
      clockIn,
      clockOut
    )
    setIsViewOpen(false)
  }

  // Status config
  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400', icon: Clock },
    approved: { label: 'Approved', color: 'bg-green-500/20 text-green-600 dark:text-green-400', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-600 dark:text-red-400', icon: XCircle }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Logs Management
          </CardTitle>
          <CardDescription>
            View and manage worker time tracking records ({timeLogs.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timeLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-semibold">No time logs found</p>
              <p className="text-sm">Time logs will appear here when workers clock in</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Worker Note</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeLogs.map((log) => {
                    const clockInLoc = parseLocation(log.clockInLocation)
                    const clockOutLoc = log.clockOutLocation ? parseLocation(log.clockOutLocation) : null
                    const StatusIcon = statusConfig[log.status as keyof typeof statusConfig]?.icon || Clock

                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{log.user.name}</p>
                            <p className="text-xs text-muted-foreground">{log.user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{format(new Date(log.clockInTime), 'PP')}</p>
                            <p className="text-xs">{format(new Date(log.clockInTime), 'p')}</p>
                            {clockInLoc && (
                              <a
                                href={getGoogleMapsLink(clockInLoc)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                              >
                                <MapPin className="h-3 w-3" />
                                {formatCoordinates(clockInLoc)}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.clockOutTime ? (
                            <div>
                              <p className="font-medium">{format(new Date(log.clockOutTime), 'PP')}</p>
                              <p className="text-xs">{format(new Date(log.clockOutTime), 'p')}</p>
                              {clockOutLoc && (
                                <a
                                  href={getGoogleMapsLink(clockOutLoc)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                >
                                  <MapPin className="h-3 w-3" />
                                  {formatCoordinates(clockOutLoc)}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline" className="bg-green-500/20 text-green-600">In Progress</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {log.clockOutTime ? (
                            <span className="font-mono text-sm">{calculateDuration(log.clockInTime, log.clockOutTime)}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate text-sm">{log.workerNote || '—'}</p>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={log.status}
                            onValueChange={(value) => updateTimeLog(log.id, value, log.adminNote || '')}
                            disabled={actionLoading === log.id}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue>
                                <Badge className={statusConfig[log.status as keyof typeof statusConfig]?.color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusConfig[log.status as keyof typeof statusConfig]?.label}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusConfig).map(([key, value]) => {
                                const Icon = value.icon
                                return (
                                  <SelectItem key={key} value={key}>
                                    <div className="flex items-center gap-2">
                                      <Icon className="h-4 w-4" />
                                      {value.label}
                                    </div>
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* Quick clock out button for in-progress sessions */}
                            {!log.clockOutTime && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => manualClockOut(log.id)}
                                disabled={actionLoading === log.id}
                                title="Clock out now"
                              >
                                <LogOut className="h-4 w-4 text-orange-600" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openViewDialog(log)}
                              disabled={actionLoading === log.id}
                              title="View / Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setDeleteId(log.id)}
                              disabled={actionLoading === log.id}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
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

      {/* View/Edit Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Time Log Details</DialogTitle>
            <DialogDescription>View and manage time log information</DialogDescription>
          </DialogHeader>

          {viewingTimeLog && (
            <div className="space-y-6 py-4">
              {/* Worker Information */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase">Worker Information</h4>
                <div className="grid gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <p className="font-medium">{viewingTimeLog.user.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="font-medium">{viewingTimeLog.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Time Information - Editable */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase">Time Information</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-clock-in">Clock In</Label>
                    <Input
                      id="edit-clock-in"
                      type="datetime-local"
                      value={editingClockIn}
                      onChange={(e) => setEditingClockIn(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-clock-out">Clock Out</Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-clock-out"
                        type="datetime-local"
                        value={editingClockOut}
                        onChange={(e) => setEditingClockOut(e.target.value)}
                        placeholder="Not clocked out"
                      />
                      {!editingClockOut && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingClockOut(formatForInput(new Date()))}
                          title="Set to now"
                        >
                          Now
                        </Button>
                      )}
                      {editingClockOut && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingClockOut('')}
                          title="Clear clock out"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    {!editingClockOut && (
                      <p className="text-xs text-orange-600">Session in progress - no clock out</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Duration</Label>
                    <p className="font-medium font-mono mt-2">
                      {editingClockIn && editingClockOut
                        ? calculateDuration(new Date(editingClockIn), new Date(editingClockOut))
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase">Location Information</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Clock In Location</Label>
                    {parseLocation(viewingTimeLog.clockInLocation) ? (
                      <a
                        href={getGoogleMapsLink(parseLocation(viewingTimeLog.clockInLocation)!)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                      >
                        <MapPin className="h-4 w-4" />
                        {formatCoordinates(parseLocation(viewingTimeLog.clockInLocation)!)}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <p className="text-muted-foreground">—</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Clock Out Location</Label>
                    {viewingTimeLog.clockOutLocation && parseLocation(viewingTimeLog.clockOutLocation) ? (
                      <a
                        href={getGoogleMapsLink(parseLocation(viewingTimeLog.clockOutLocation)!)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                      >
                        <MapPin className="h-4 w-4" />
                        {formatCoordinates(parseLocation(viewingTimeLog.clockOutLocation)!)}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <p className="text-muted-foreground">—</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Worker Note */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Worker Note</Label>
                <p className="text-sm p-3 bg-muted rounded-md">
                  {viewingTimeLog.workerNote || 'No notes provided'}
                </p>
              </div>

              {/* Admin Section */}
              <div className="space-y-3 pt-3 border-t">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase">Admin Section</h4>

                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={editingStatus} onValueChange={setEditingStatus}>
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, value]) => {
                        const Icon = value.icon
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {value.label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-note">Admin Note</Label>
                  <Textarea
                    id="edit-note"
                    value={editingNote}
                    onChange={(e) => setEditingNote(e.target.value)}
                    placeholder="Add administrative notes..."
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground">{editingNote.length}/1000 characters</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFromDialog} disabled={actionLoading === viewingTimeLog?.id}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Time Log?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the time log record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteTimeLog(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
