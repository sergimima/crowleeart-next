'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Service {
  id: number
  title: string
  description: string
  price: number
  marketPrice: number
  createdAt?: string
}

interface AdminServicesProps {
  services: Service[]
  onUpdate: () => void
}

export default function AdminServices({ services: initialServices, onUpdate }: AdminServicesProps) {
  const [services, setServices] = useState<Service[]>(initialServices || [])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    price: '',
    marketPrice: '',
  })

  useEffect(() => {
    setServices(initialServices)
  }, [initialServices])

  const resetForm = () => {
    setNewService({ title: '', description: '', price: '', marketPrice: '' })
    setEditingService(null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      const response = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: newService.title.trim(),
          description: newService.description.trim(),
          price: parseFloat(newService.price),
          marketPrice: parseFloat(newService.marketPrice),
        }),
      })

      if (!response.ok) throw new Error('Failed to add service')

      const data = await response.json()
      setServices(prev => [...prev, data])
      toast.success('Service created successfully!')
      setIsCreateOpen(false)
      resetForm()
      onUpdate()
    } catch (err: any) {
      console.error('Error adding service:', err)
      toast.error(err.message || 'Failed to create service')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingService) return

    setFormLoading(true)

    try {
      const response = await fetch(`/api/admin/services/${editingService.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingService),
      })

      if (!response.ok) throw new Error('Failed to update service')

      setServices(prev =>
        prev.map(service => (service.id === editingService.id ? editingService : service))
      )

      toast.success('Service updated successfully!')
      setIsEditOpen(false)
      resetForm()
      onUpdate()
    } catch (err: any) {
      console.error('Error updating service:', err)
      toast.error(err.message || 'Failed to update service')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to delete service')

      setServices(prev => prev.filter(service => service.id !== id))
      toast.success('Service deleted successfully!')
      onUpdate()
    } catch (err: any) {
      console.error('Error deleting service:', err)
      toast.error(err.message || 'Failed to delete service')
    }
  }

  const openEditDialog = (service: Service) => {
    setEditingService({ ...service })
    setIsEditOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Services</h3>
          <p className="text-sm text-muted-foreground">Manage your service catalog</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
              <DialogDescription>Add a new service to your catalog</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-title">Title</Label>
                  <Input
                    id="create-title"
                    placeholder="Service title"
                    value={newService.title}
                    onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-description">Description</Label>
                  <Input
                    id="create-description"
                    placeholder="Service description"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-price">Price (£)</Label>
                    <Input
                      id="create-price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-market-price">Market Price (£)</Label>
                    <Input
                      id="create-market-price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newService.marketPrice}
                      onChange={(e) => setNewService({ ...newService, marketPrice: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Creating...' : 'Create Service'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services Table */}
      {services.length === 0 ? (
        <Alert>
          <AlertDescription>
            No services found. Create your first service to get started.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Market Price</TableHead>
                <TableHead className="text-right">Savings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => {
                const price = service.price ?? 0
                const marketPrice = service.marketPrice ?? 0
                const savings = marketPrice - price
                const savingsPercent = marketPrice > 0 ? ((savings / marketPrice) * 100).toFixed(0) : '0'

                return (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.title}</TableCell>
                    <TableCell className="max-w-md truncate">{service.description}</TableCell>
                    <TableCell className="text-right">£{price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">£{marketPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {savings > 0 ? (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                          {savingsPercent}% off
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(service.id)}
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

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update service details</DialogDescription>
          </DialogHeader>
          {editingService && (
            <form onSubmit={handleEdit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingService.title}
                    onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={editingService.description}
                    onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Price (£)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      step="0.01"
                      value={editingService.price ?? 0}
                      onChange={(e) => setEditingService({ ...editingService, price: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-market-price">Market Price (£)</Label>
                    <Input
                      id="edit-market-price"
                      type="number"
                      step="0.01"
                      value={editingService.marketPrice ?? 0}
                      onChange={(e) => setEditingService({ ...editingService, marketPrice: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
