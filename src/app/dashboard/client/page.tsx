'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, RefreshCw, LayoutGrid, List, Trash2, Ban, CalendarDays } from 'lucide-react'
import ClientLayout from '@/components/ClientLayout'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Configure calendar localizer
const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface Booking {
  id: number
  service: { title: string }
  date: string
  description: string
  status: string
}

interface CalendarEvent extends Event {
  resource: Booking
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-green-500', icon: CheckCircle2 },
  completed: { label: 'Completed', color: 'bg-blue-500', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
}

export default function ClientDashboard() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid')
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<number | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Booking | null>(null)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      } else if (response.status === 401 || response.status === 403) {
        toast.error('Unauthorized access')
        router.push('/login')
      } else {
        toast.error('Error fetching your bookings.')
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Error fetching your bookings. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])


  const handleCancelBooking = async () => {
    if (!bookingToCancel) return

    try {
      setActionLoading(true)
      const response = await fetch(`/api/bookings/${bookingToCancel}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'cancelled' })
      })

      if (response.ok) {
        toast.success('Booking cancelled successfully')
        fetchBookings() // Refresh bookings
        setCancelDialogOpen(false)
        setBookingToCancel(null)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to cancel booking')
      }
    } catch (error) {
      console.error('Cancel booking error:', error)
      toast.error('Failed to cancel booking')
    } finally {
      setActionLoading(false)
    }
  }

  const openCancelDialog = (bookingId: number) => {
    setBookingToCancel(bookingId)
    setCancelDialogOpen(true)
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || booking.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // Convert bookings to calendar events
  const calendarEvents: CalendarEvent[] = filteredBookings.map(booking => ({
    title: booking.service.title,
    start: new Date(booking.date),
    end: new Date(booking.date),
    resource: booking,
  }))

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event.resource)
    setEventDialogOpen(true)
  }

  const eventStyleGetter = (event: CalendarEvent) => {
    const statusColors = {
      pending: '#eab308',
      confirmed: '#22c55e',
      completed: '#3b82f6',
      cancelled: '#ef4444',
    }

    return {
      style: {
        backgroundColor: statusColors[event.resource.status as keyof typeof statusColors] || '#6b7280',
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className={`h-4 w-4 ${color}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <ClientLayout>
      <div className="min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">My Bookings</h1>
              <p className="text-muted-foreground mt-2">View and manage your appointments</p>
            </div>
            <Button onClick={fetchBookings} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard title="Total Bookings" value={stats.total} icon={CalendarIcon} color="text-blue-500" />
          <StatCard title="Pending" value={stats.pending} icon={Clock} color="text-yellow-500" />
          <StatCard title="Confirmed" value={stats.confirmed} icon={CheckCircle2} color="text-green-500" />
          <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} color="text-blue-500" />
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
            <CardDescription>View and manage all your appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('calendar')}
                >
                  <CalendarDays className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Bookings Display */}
            {loading ? (
              viewMode === 'calendar' ? (
                <div className="h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <Skeleton className="h-8 w-48 mx-auto mb-4" />
                    <Skeleton className="h-96 w-full" />
                  </div>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2 mt-2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-3 w-full mb-2" />
                        <Skeleton className="h-3 w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            ) : filteredBookings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterStatus !== 'all'
                    ? 'Try adjusting your filters'
                    : "You haven't made any bookings yet"}
                </p>
              </motion.div>
            ) : viewMode === 'calendar' ? (
              <div className="h-[700px] bg-white dark:bg-gray-950 rounded-lg p-4">
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  onSelectEvent={handleSelectEvent}
                  eventPropGetter={eventStyleGetter}
                  views={['month', 'week', 'day', 'agenda']}
                  defaultView="month"
                />
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
                {filteredBookings.map((booking, index) => {
                  const StatusIcon = statusConfig[booking.status as keyof typeof statusConfig]?.icon || Clock
                  const statusColor = statusConfig[booking.status as keyof typeof statusConfig]?.color || 'bg-gray-500'

                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{booking.service.title}</CardTitle>
                              <CardDescription className="flex items-center gap-1 mt-1">
                                <CalendarIcon className="h-3 w-3" />
                                {format(new Date(booking.date), 'PPP')}
                              </CardDescription>
                            </div>
                            <Badge variant="secondary" className={`${statusColor} text-white`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[booking.status as keyof typeof statusConfig]?.label || booking.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {booking.description}
                          </p>

                          {/* Quick Actions */}
                          {(booking.status === 'pending' || booking.status === 'confirmed') && (
                            <div className="flex gap-2 mt-4 pt-4 border-t">
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1"
                                onClick={() => openCancelDialog(booking.id)}
                              >
                                <Ban className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              No, keep it
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? 'Cancelling...' : 'Yes, cancel booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Event Details Dialog */}
      <AlertDialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {selectedEvent && (
                <>
                  {selectedEvent.service.title}
                  <Badge variant="secondary" className={`${statusConfig[selectedEvent.status as keyof typeof statusConfig]?.color || 'bg-gray-500'} text-white`}>
                    {statusConfig[selectedEvent.status as keyof typeof statusConfig]?.label || selectedEvent.status}
                  </Badge>
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              {selectedEvent && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{format(new Date(selectedEvent.date), 'PPP')}</span>
                  </div>
                  <div className="text-sm">
                    <strong>Description:</strong>
                    <p className="mt-1 text-muted-foreground">{selectedEvent.description}</p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            {selectedEvent && (selectedEvent.status === 'pending' || selectedEvent.status === 'confirmed') && (
              <AlertDialogAction
                onClick={() => {
                  setEventDialogOpen(false)
                  openCancelDialog(selectedEvent.id)
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Cancel Booking
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </motion.div>
      </div>
    </ClientLayout>
  )
}
