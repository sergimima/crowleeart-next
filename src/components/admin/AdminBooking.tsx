'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Eye, Trash2, Calendar as CalendarIcon, User, Mail, Phone, Clock, CheckCircle2, XCircle, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Booking {
  id: number
  name?: string
  email?: string
  phone?: string
  description?: string
  date: string
  service: string | { title: string }
  user?: {
    name: string
    email: string
  }
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  imageUrl?: string
}

interface AdminBookingProps {
  bookings: Booking[]
  onUpdate: () => void
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500/20 text-blue-400', icon: CheckCircle2 },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400', icon: XCircle },
}

export default function AdminBooking({ bookings: initialBookings, onUpdate }: AdminBookingProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

  useEffect(() => {
    setBookings(initialBookings)
  }, [initialBookings])

  const updateBookingStatus = async (id: number, newStatus: Booking['status']) => {
    try {
      setActionLoading(id)
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update booking status')

      setBookings(prev =>
        prev.map(booking =>
          booking.id === id ? { ...booking, status: newStatus } : booking
        )
      )

      toast.success('Booking status updated!')
      onUpdate()
    } catch (err: any) {
      console.error('Error updating booking status:', err)
      toast.error(err.message || 'Failed to update booking status')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteBooking = async (id: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return

    try {
      setActionLoading(id)
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to delete booking')

      setBookings(prev => prev.filter(booking => booking.id !== id))
      toast.success('Booking deleted successfully!')
      onUpdate()
    } catch (err: any) {
      console.error('Error deleting booking:', err)
      toast.error(err.message || 'Failed to delete booking')
    } finally {
      setActionLoading(null)
    }
  }

  const openViewDialog = (booking: Booking) => {
    setViewingBooking(booking)
    setIsViewOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Bookings</h3>
          <p className="text-sm text-muted-foreground">Manage customer appointments</p>
        </div>
      </div>

      {/* Bookings Table */}
      {bookings.length === 0 ? (
        <Alert>
          <AlertDescription>
            No bookings found.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => {
                const userName = booking.user?.name || booking.name || 'N/A'
                const userEmail = booking.user?.email || booking.email || 'N/A'
                const serviceName = typeof booking.service === 'string'
                  ? booking.service
                  : booking.service?.title || 'N/A'
                const StatusIcon = statusConfig[booking.status]?.icon || Clock

                return (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{userName}</p>
                        <p className="text-sm text-muted-foreground">{userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>{serviceName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(booking.date), 'PP')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={booking.status}
                        onValueChange={(value) => updateBookingStatus(booking.id, value as Booking['status'])}
                        disabled={actionLoading === booking.id}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue>
                            <Badge variant="secondary" className={statusConfig[booking.status]?.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[booking.status]?.label}
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
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openViewDialog(booking)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteBooking(booking.id)}
                          disabled={actionLoading === booking.id}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* View Booking Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>View complete booking information</DialogDescription>
          </DialogHeader>
          {viewingBooking && (
            <div className="space-y-6 py-4">
              {/* Customer Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Customer Information</h4>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <p className="font-medium">{viewingBooking.user?.name || viewingBooking.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="font-medium">{viewingBooking.user?.email || viewingBooking.email || 'N/A'}</p>
                    </div>
                  </div>
                  {viewingBooking.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label className="text-xs text-muted-foreground">Phone</Label>
                        <p className="font-medium">{viewingBooking.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Booking Information</h4>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="text-xs text-muted-foreground">Service</Label>
                      <p className="font-medium">
                        {typeof viewingBooking.service === 'string'
                          ? viewingBooking.service
                          : viewingBooking.service?.title || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="text-xs text-muted-foreground">Date</Label>
                      <p className="font-medium">{format(new Date(viewingBooking.date), 'PPP')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <div className="mt-1">
                        <Badge variant="secondary" className={statusConfig[viewingBooking.status]?.color}>
                          {statusConfig[viewingBooking.status]?.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {viewingBooking.description && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <p className="mt-1 text-sm">{viewingBooking.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reference Image */}
              {viewingBooking.imageUrl && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Reference Image
                  </h4>
                  <div className="relative w-full h-64 border rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={viewingBooking.imageUrl}
                      alt="Booking reference"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <a
                    href={viewingBooking.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                  >
                    <ImageIcon className="h-3 w-3" />
                    View full size
                  </a>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
