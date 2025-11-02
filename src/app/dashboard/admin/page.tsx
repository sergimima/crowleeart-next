'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { motion } from 'framer-motion'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
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
  FileText
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

type AdminData = {
  services: any[]
  bookings: any[]
  messages: any[]
  reviews: any[]
  feedbacks: any[]
  surveys: any[]
  users: any[]
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
        })
        toast.success('Dashboard data loaded successfully')
      } else if (response.status === 401 || response.status === 403) {
        toast.error('Unauthorized access')
        router.push('/login')
      }
    } catch (error: any) {
      console.error('Error fetching admin data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  const exportToExcel = (data: any[], filename: string) => {
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

    ;(doc as any).autoTable({
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
    { key: 'bookings', label: 'Bookings', count: adminData.bookings.length, icon: Calendar },
    { key: 'services', label: 'Services', count: adminData.services.length, icon: Settings },
    { key: 'messages', label: 'Messages', count: adminData.messages.length, icon: MessageSquare },
    { key: 'reviews', label: 'Reviews', count: adminData.reviews.length, icon: Star },
    { key: 'feedback', label: 'Feedback', count: adminData.feedbacks.length, icon: MessageCircle },
    { key: 'surveys', label: 'Surveys', count: adminData.surveys.length, icon: ClipboardList },
  ]

  const StatCard = ({ title, value, icon: Icon, trend }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

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
      default:
        return <p className="text-muted-foreground">Select a section from the menu.</p>
    }
  }

  return (
    <div className="min-h-screen p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your business operations</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchAdminData} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={exportToPDF} variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Manage
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Total Services" value={adminData.services.length} icon={Settings} />
              <StatCard title="Total Bookings" value={adminData.bookings.length} icon={Calendar} />
              <StatCard title="Messages" value={adminData.messages.length} icon={MessageSquare} />
              <StatCard title="Reviews" value={adminData.reviews.length} icon={Star} />
            </div>

            {/* Additional Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard title="Feedback" value={adminData.feedbacks.length} icon={MessageCircle} />
              <StatCard title="Surveys" value={adminData.surveys.length} icon={ClipboardList} />
              <StatCard title="Users" value={adminData.users.length} icon={Users} />
            </div>

            {/* Export Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
                <CardDescription>Download your data in various formats</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button onClick={() => exportToExcel(adminData.bookings, 'Bookings')} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Bookings
                </Button>
                <Button onClick={() => exportToExcel(adminData.services, 'Services')} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Services
                </Button>
                <Button onClick={() => exportToExcel(adminData.users, 'Users')} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Users
                </Button>
                <Button onClick={() => exportToExcel(adminData.reviews, 'Reviews')} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Reviews
                </Button>
              </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              <ChartCard title="Bookings by Service" loading={!serviceBookings.length}>
                <BarChart data={serviceBookings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="bookings" fill="#82ca9d" />
                </BarChart>
              </ChartCard>

              <ChartCard title="Review Ratings Distribution" loading={!reviewData.length}>
                <PieChart>
                  <Pie data={reviewData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {reviewData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ChartCard>

              <ChartCard title="Feedback Quality Scores" loading={!feedbackQuality.length}>
                <BarChart data={feedbackQuality}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="quality" fill="#8884d8" />
                </BarChart>
              </ChartCard>

              <ChartCard title="Client Referral Sources" loading={!referralChartData.length}>
                <PieChart>
                  <Pie data={referralChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {referralChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={REFERRAL_COLORS[index % REFERRAL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ChartCard>
            </div>
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-4">
              {/* Sidebar */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Sections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 p-2">
                  {menuItems.map(item => {
                    const Icon = item.icon
                    return (
                      <Button
                        key={item.key}
                        onClick={() => setActiveManageSection(item.key)}
                        variant={activeManageSection === item.key ? 'default' : 'ghost'}
                        className="w-full justify-start"
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                        <Badge variant="secondary" className="ml-auto">
                          {item.count}
                        </Badge>
                      </Button>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Main Content */}
              <div className="md:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="capitalize">{activeManageSection} Management</CardTitle>
                    <CardDescription>Manage your {activeManageSection}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderManageSection()}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

const ChartCard = ({ title, loading, children }: { title: string; loading?: boolean; children: React.ReactElement }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="flex items-center justify-center h-[300px]">
          <Skeleton className="h-full w-full" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          {children}
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
)
