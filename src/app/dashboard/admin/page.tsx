'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { motion } from 'framer-motion'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import {
  Users,
  Calendar,
  MessageSquare,
  Star,
  MessageCircle,
  ClipboardList,
  Download,
  RefreshCw,
  LayoutDashboard,
  Settings,
  TrendingUp,
  FileText,
  Image as ImageIcon,
  QrCode,
  Clock,
  Link2
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// Import CRUD components
import AdminUsers from '@/components/admin/AdminUsers'
import AdminBooking from '@/components/admin/AdminBooking'
import AdminServices from '@/components/admin/AdminServices'
import AdminMessages from '@/components/admin/AdminMessages'
import AdminReviews from '@/components/admin/AdminReviews'
import AdminFeedback from '@/components/admin/AdminFeedback'
import AdminSurveys from '@/components/admin/AdminSurveys'
import AdminGallery from '@/components/admin/AdminGallery'
import AdminQRCodes from '@/components/admin/AdminQRCodes'
import AdminTimeLogs from '@/components/admin/AdminTimeLogs'
import AdminInvitations from '@/components/admin/AdminInvitations'

type AdminData = {
  services: any[]
  bookings: any[]
  messages: any[]
  reviews: any[]
  feedbacks: any[]
  surveys: any[]
  users: any[]
  galleryItems: any[]
  qrCodes: any[]
  timeLogs: any[]
  invitations: any[]
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c']
const REFERRAL_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF']

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'manage'>('dashboard')
  const [activeManageSection, setActiveManageSection] = useState<string>('users')
  const [adminData, setAdminData] = useState<AdminData>({
    services: [],
    bookings: [],
    messages: [],
    reviews: [],
    feedbacks: [],
    surveys: [],
    users: [],
    galleryItems: [],
    qrCodes: [],
    timeLogs: [],
    invitations: [],
  })
  const [loading, setLoading] = useState(true)

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/full-data', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setAdminData({
          services: data.services ?? [],
          bookings: data.bookings ?? [],
          messages: data.messages ?? [],
          reviews: data.reviews ?? [],
          feedbacks: data.feedbacks ?? [],
          surveys: data.surveys ?? [],
          users: data.users ?? [],
          galleryItems: data.galleryItems ?? [],
          qrCodes: data.qrCodes ?? [],
          timeLogs: data.timeLogs ?? [],
          invitations: data.invitations ?? [],
        })
        toast.success('Dashboard data loaded successfully')
      } else if (response.status === 401 || response.status === 403) {
        toast.error('Unauthorized access')
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  const exportToExcel = (data: Record<string, unknown>[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(file, `${filename}.xlsx`)
    toast.success(`${filename} exported successfully`)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('Admin Dashboard Report', 14, 20)

    doc.setFontSize(12)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30)

    // Summary stats
    const stats = [
      ['Metric', 'Count'],
      ['Total Users', adminData.users.length.toString()],
      ['Total Services', adminData.services.length.toString()],
      ['Total Bookings', adminData.bookings.length.toString()],
      ['Total Messages', adminData.messages.length.toString()],
      ['Total Reviews', adminData.reviews.length.toString()],
      ['Total Feedback', adminData.feedbacks.length.toString()],
      ['Total Surveys', adminData.surveys.length.toString()],
    ]

    // @ts-expect-error - jsPDF autoTable plugin types
    doc.autoTable({
      head: [stats[0]],
      body: stats.slice(1),
      startY: 40,
    })

    doc.save('admin-dashboard-report.pdf')
    toast.success('PDF report generated successfully')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl">
          <Skeleton className="h-8 w-64" />
        </motion.div>
      </div>
    )
  }

  const serviceBookings = adminData.services.map(service => ({
    name: service.title,
    bookings: adminData.bookings.filter(booking => booking.serviceId === service.id).length,
  }))

  const feedbackQuality = adminData.feedbacks.map((feedback, index) => ({
    name: `Feedback ${index + 1}`,
    quality: feedback.quality,
  }))

  const reviewRatings = adminData.reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const reviewData = Object.entries(reviewRatings).map(([key, value]) => ({
    name: `${key} Stars`,
    value,
  }))

  const referralData = adminData.surveys.reduce((acc, survey) => {
    const source = survey.referralSource || 'Unknown'
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const referralChartData = Object.entries(referralData).map(([key, value]) => ({
    name: key,
    value,
  }))

  const menuItems = [
    { key: 'users', label: 'Users', count: adminData.users.length, icon: Users },
    { key: 'invitations', label: 'Invitations', count: adminData.invitations.length, icon: Link2 },
    { key: 'bookings', label: 'Bookings', count: adminData.bookings.length, icon: Calendar },
    { key: 'services', label: 'Services', count: adminData.services.length, icon: Settings },
    { key: 'messages', label: 'Messages', count: adminData.messages.length, icon: MessageSquare },
    { key: 'reviews', label: 'Reviews', count: adminData.reviews.length, icon: Star },
    { key: 'feedback', label: 'Feedback', count: adminData.feedbacks.length, icon: MessageCircle },
    { key: 'surveys', label: 'Surveys', count: adminData.surveys.length, icon: ClipboardList },
    { key: 'gallery', label: 'Gallery', count: adminData.galleryItems.length, icon: ImageIcon },
    { key: 'qrcodes', label: 'QR Codes', count: adminData.qrCodes.length, icon: QrCode },
    { key: 'timelogs', label: 'Time Logs', count: adminData.timeLogs.length, icon: Clock },
  ]

  const goToSection = (section: string) => {
    setActiveTab('manage')
    setActiveManageSection(section)
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    sectionKey,
    onSectionClick,
  }: {
    title: string
    value: number
    icon: React.ComponentType<{ className?: string }>
    trend?: string
    sectionKey?: string
    onSectionClick?: (section: string) => void
  }) => {
    const isClickable = sectionKey && onSectionClick
    const content = (
      <Card className={`overflow-hidden transition-colors ${isClickable ? 'hover:bg-muted/50' : ''}`}>
        <CardContent className="p-3 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-lg font-bold tabular-nums">{value}</p>
            {trend && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                <TrendingUp className="h-2.5 w-2.5" />
                {trend}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={isClickable ? { scale: 1.02 } : undefined}
      >
        {isClickable ? (
          <button
            type="button"
            className="w-full text-left rounded-lg border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => onSectionClick(sectionKey!)}
            aria-label={`Go to ${title} management`}
          >
            {content}
          </button>
        ) : (
          content
        )}
      </motion.div>
    )
  }

  const renderManageSection = () => {
    switch (activeManageSection) {
      case 'users':
        return <AdminUsers users={adminData.users} onUpdate={fetchAdminData} />
      case 'bookings':
        return <AdminBooking bookings={adminData.bookings} onUpdate={fetchAdminData} />
      case 'services':
        return <AdminServices services={adminData.services} onUpdate={fetchAdminData} />
      case 'messages':
        return <AdminMessages messages={adminData.messages} onUpdate={fetchAdminData} />
      case 'reviews':
        return <AdminReviews reviews={adminData.reviews} onUpdate={fetchAdminData} />
      case 'feedback':
        return <AdminFeedback feedbacks={adminData.feedbacks} onUpdate={fetchAdminData} />
      case 'surveys':
        return <AdminSurveys surveys={adminData.surveys} onUpdate={fetchAdminData} />
      case 'gallery':
        return <AdminGallery />
      case 'qrcodes':
        return <AdminQRCodes onUpdate={fetchAdminData} />
      case 'timelogs':
        return <AdminTimeLogs timeLogs={adminData.timeLogs} onUpdate={fetchAdminData} />
      case 'invitations':
        return <AdminInvitations onUpdate={fetchAdminData} />
      default:
        return <p className="text-muted-foreground">Select a section from the menu.</p>
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        {/* Header - compact */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your business operations</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={fetchAdminData} variant="outline" size="sm">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Refresh
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToPDF}>
                  <FileText className="mr-2 h-3.5 w-3.5" />
                  PDF report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToExcel(adminData.bookings, 'Bookings')}>
                  Excel: Bookings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToExcel(adminData.services, 'Services')}>
                  Excel: Services
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToExcel(adminData.users, 'Users')}>
                  Excel: Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToExcel(adminData.reviews, 'Reviews')}>
                  Excel: Reviews
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <TabsList className="h-9">
            <TabsTrigger value="dashboard" className="flex items-center gap-1.5 text-sm px-3">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-1.5 text-sm px-3">
              <Settings className="h-3.5 w-3.5" />
              Manage
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab - compact */}
          <TabsContent value="dashboard" className="space-y-4">
            {/* Stats: single compact row - click goes to Manage tab */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3">
              <StatCard
                title="Services"
                value={adminData.services.length}
                icon={Settings}
                sectionKey="services"
                onSectionClick={goToSection}
              />
              <StatCard
                title="Bookings"
                value={adminData.bookings.length}
                icon={Calendar}
                sectionKey="bookings"
                onSectionClick={goToSection}
              />
              <StatCard
                title="Messages"
                value={adminData.messages.length}
                icon={MessageSquare}
                sectionKey="messages"
                onSectionClick={goToSection}
              />
              <StatCard
                title="Reviews"
                value={adminData.reviews.length}
                icon={Star}
                sectionKey="reviews"
                onSectionClick={goToSection}
              />
              <StatCard
                title="Feedback"
                value={adminData.feedbacks.length}
                icon={MessageCircle}
                sectionKey="feedback"
                onSectionClick={goToSection}
              />
              <StatCard
                title="Surveys"
                value={adminData.surveys.length}
                icon={ClipboardList}
                sectionKey="surveys"
                onSectionClick={goToSection}
              />
              <StatCard
                title="Users"
                value={adminData.users.length}
                icon={Users}
                sectionKey="users"
                onSectionClick={goToSection}
              />
            </div>

            {/* Charts Grid - less height */}
            <div className="grid gap-4 md:grid-cols-2">
              <ChartCard title="Bookings by Service" loading={!serviceBookings.length}>
                <BarChart data={serviceBookings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} fontSize={12} />
                  <YAxis allowDecimals={false} stroke="#9ca3af" tick={{ fill: '#9ca3af' }} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f3f4f6'
                    }}
                    labelStyle={{ color: '#f3f4f6' }}
                    itemStyle={{ color: '#f3f4f6' }}
                  />
                  <Legend wrapperStyle={{ color: '#f3f4f6' }} formatter={(value) => <span style={{ color: '#f3f4f6' }}>{value}</span>} />
                  <Bar dataKey="bookings" fill="#82ca9d" />
                </BarChart>
              </ChartCard>

              <ChartCard title="Review Ratings Distribution" loading={!reviewData.length}>
                <PieChart>
                  <Pie data={reviewData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={{ fill: '#f3f4f6' }}>
                    {reviewData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f3f4f6'
                    }}
                    labelStyle={{ color: '#f3f4f6' }}
                    itemStyle={{ color: '#f3f4f6' }}
                  />
                  <Legend wrapperStyle={{ color: '#f3f4f6' }} formatter={(value) => <span style={{ color: '#f3f4f6' }}>{value}</span>} />
                </PieChart>
              </ChartCard>

              <ChartCard title="Feedback Quality Scores" loading={!feedbackQuality.length}>
                <BarChart data={feedbackQuality}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} fontSize={12} />
                  <YAxis allowDecimals={false} stroke="#9ca3af" tick={{ fill: '#9ca3af' }} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f3f4f6'
                    }}
                    labelStyle={{ color: '#f3f4f6' }}
                    itemStyle={{ color: '#f3f4f6' }}
                  />
                  <Legend wrapperStyle={{ color: '#f3f4f6' }} formatter={(value) => <span style={{ color: '#f3f4f6' }}>{value}</span>} />
                  <Bar dataKey="quality" fill="#8884d8" />
                </BarChart>
              </ChartCard>

              <ChartCard title="Client Referral Sources" loading={!referralChartData.length}>
                <PieChart>
                  <Pie data={referralChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={{ fill: '#f3f4f6' }}>
                    {referralChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={REFERRAL_COLORS[index % REFERRAL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f3f4f6'
                    }}
                    labelStyle={{ color: '#f3f4f6' }}
                    itemStyle={{ color: '#f3f4f6' }}
                  />
                  <Legend wrapperStyle={{ color: '#f3f4f6' }} formatter={(value) => <span style={{ color: '#f3f4f6' }}>{value}</span>} />
                </PieChart>
              </ChartCard>
            </div>
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage" className="space-y-6">
            <div className="flex gap-6">
              {/* Sidebar - Fixed narrow width */}
              <Card className="w-48 flex-shrink-0">
                <CardHeader className="py-3 px-3">
                  <CardTitle className="text-sm">Sections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 p-2">
                  {menuItems.map(item => {
                    const Icon = item.icon
                    return (
                      <Button
                        key={item.key}
                        onClick={() => setActiveManageSection(item.key)}
                        variant={activeManageSection === item.key ? 'default' : 'ghost'}
                        className="w-full justify-start text-xs h-8 px-2"
                        size="sm"
                      >
                        <Icon className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                        <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5">
                          {item.count}
                        </Badge>
                      </Button>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Main Content - Expands to fill remaining space */}
              <Card className="flex-1 min-w-0">
                <CardHeader>
                  <CardTitle className="capitalize">{activeManageSection} Management</CardTitle>
                  <CardDescription>Manage your {activeManageSection}</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  {renderManageSection()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

const ChartCard = ({ title, loading, children }: { title: string; loading?: boolean; children: React.ReactElement }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      {loading ? (
        <div className="flex items-center justify-center h-[240px]">
          <Skeleton className="h-full w-full" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          {children}
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
)
