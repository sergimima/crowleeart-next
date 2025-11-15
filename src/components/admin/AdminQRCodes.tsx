'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Download, Trash2, QrCode, Plus, Eye } from 'lucide-react'
import Image from 'next/image'

type QRCodeType = {
  id: number
  title: string
  description: string | null
  url: string
  refCode: string
  qrImageData: string
  scanCount: number
  createdAt: string
}

export default function AdminQRCodes({ onUpdate }: { onUpdate: () => void }) {
  const [qrCodes, setQrCodes] = useState<QRCodeType[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    refCode: '',
    baseUrl: typeof window !== 'undefined' ? window.location.origin : 'https://crowleeart.com'
  })

  const fetchQRCodes = async () => {
    try {
      const response = await fetch('/api/admin/qrcodes', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setQrCodes(data)
      } else {
        toast.error('Failed to load QR codes')
      }
    } catch (error) {
      console.error('Error fetching QR codes:', error)
      toast.error('Error loading QR codes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQRCodes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.refCode) {
      toast.error('Title and ref code are required')
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch('/api/admin/qrcodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('QR code created successfully')
        setFormData({
          title: '',
          description: '',
          refCode: '',
          baseUrl: formData.baseUrl
        })
        fetchQRCodes()
        onUpdate()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create QR code')
      }
    } catch (error) {
      console.error('Error creating QR code:', error)
      toast.error('Error creating QR code')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this QR code?')) return

    try {
      const response = await fetch(`/api/admin/qrcodes/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('QR code deleted')
        fetchQRCodes()
        onUpdate()
      } else {
        toast.error('Failed to delete QR code')
      }
    } catch (error) {
      console.error('Error deleting QR code:', error)
      toast.error('Error deleting QR code')
    }
  }

  const handleDownload = (qrCode: QRCodeType) => {
    const link = document.createElement('a')
    link.href = qrCode.qrImageData
    link.download = `qr-${qrCode.refCode}.png`
    link.click()
    toast.success('QR code downloaded')
  }

  const handleRefCodeChange = (value: string) => {
    // Auto-convert to lowercase and replace spaces with hyphens
    const formatted = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    setFormData({ ...formData, refCode: formatted })
  }

  if (loading) {
    return <div className="text-center py-8">Loading QR codes...</div>
  }

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New QR Code
          </CardTitle>
          <CardDescription>
            Generate QR codes with tracking parameters to monitor visitor sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Business Card, Van Door, Poster"
                required
              />
            </div>

            <div>
              <Label htmlFor="refCode">Reference Code *</Label>
              <Input
                id="refCode"
                value={formData.refCode}
                onChange={(e) => handleRefCodeChange(e.target.value)}
                placeholder="e.g., business-card, van-door"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lowercase letters, numbers, and hyphens only. This will be used in the URL: ?ref={formData.refCode || 'your-code'}
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional notes about this QR code"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                value={formData.baseUrl}
                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                placeholder="https://crowleeart.com"
                required
              />
            </div>

            <Button type="submit" disabled={isCreating}>
              <QrCode className="mr-2 h-4 w-4" />
              {isCreating ? 'Generating...' : 'Generate QR Code'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* QR Codes List */}
      <Card>
        <CardHeader>
          <CardTitle>Existing QR Codes ({qrCodes.length})</CardTitle>
          <CardDescription>Manage and track your QR codes</CardDescription>
        </CardHeader>
        <CardContent>
          {qrCodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No QR codes created yet
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {qrCodes.map((qr) => (
                <Card key={qr.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{qr.title}</CardTitle>
                    {qr.description && (
                      <CardDescription className="text-xs">{qr.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="relative aspect-square bg-white rounded-lg p-4">
                      <Image
                        src={qr.qrImageData}
                        alt={qr.title}
                        fill
                        className="object-contain"
                      />
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Ref Code:</span>
                        <code className="bg-muted px-2 py-1 rounded text-xs">{qr.refCode}</code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Scans:</span>
                        <span className="font-bold text-primary">{qr.scanCount}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(qr.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDownload(qr)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </Button>
                      <Button
                        onClick={() => window.open(qr.url, '_blank')}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Test
                      </Button>
                      <Button
                        onClick={() => handleDelete(qr.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
