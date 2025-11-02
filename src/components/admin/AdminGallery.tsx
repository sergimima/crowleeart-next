'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Image as ImageIcon, Plus, Trash2, Edit, Star } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface GalleryItem {
  id: number
  title: string
  description: string | null
  imageUrl: string
  category: string | null
  featured: boolean
  createdAt: string
}

export default function AdminGallery() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    featured: false
  })

  useEffect(() => {
    fetchGalleryItems()
  }, [])

  const fetchGalleryItems = async () => {
    try {
      const response = await fetch('/api/admin/gallery', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setGalleryItems(data)
      }
    } catch (err) {
      console.error('Error fetching gallery:', err)
      toast.error('Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingItem && !imageFile) {
      toast.error('Please select an image')
      return
    }

    const data = new FormData()
    data.append('title', formData.title)
    data.append('description', formData.description)
    data.append('category', formData.category)
    data.append('featured', formData.featured.toString())
    if (imageFile) {
      data.append('image', imageFile)
    }

    try {
      if (editingItem) {
        // Update existing item
        const response = await fetch(`/api/admin/gallery/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          toast.success('Gallery item updated!')
          fetchGalleryItems()
          closeDialog()
        } else {
          toast.error('Failed to update item')
        }
      } else {
        // Create new item
        const response = await fetch('/api/admin/gallery', {
          method: 'POST',
          credentials: 'include',
          body: data
        })

        if (response.ok) {
          toast.success('Gallery item added!')
          fetchGalleryItems()
          closeDialog()
        } else {
          toast.error('Failed to add item')
        }
      }
    } catch (err) {
      console.error('Error saving gallery item:', err)
      toast.error('Failed to save item')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('Item deleted!')
        fetchGalleryItems()
      } else {
        toast.error('Failed to delete item')
      }
    } catch (err) {
      console.error('Error deleting item:', err)
      toast.error('Failed to delete item')
    }
  }

  const openAddDialog = () => {
    setFormData({ title: '', description: '', category: '', featured: false })
    setEditingItem(null)
    setImageFile(null)
    setImagePreview(null)
    setShowAddDialog(true)
  }

  const openEditDialog = (item: GalleryItem) => {
    setFormData({
      title: item.title,
      description: item.description || '',
      category: item.category || '',
      featured: item.featured
    })
    setEditingItem(item)
    setImagePreview(item.imageUrl)
    setShowAddDialog(true)
  }

  const closeDialog = () => {
    setShowAddDialog(false)
    setEditingItem(null)
    setImageFile(null)
    setImagePreview(null)
  }

  if (loading) {
    return <div className="p-8">Loading gallery...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gallery Management</h2>
          <p className="text-muted-foreground">Manage portfolio images</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Image
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {galleryItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
              />
              {item.featured && (
                <Badge className="absolute top-2 right-2 bg-yellow-500">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold truncate">{item.title}</h3>
              {item.category && (
                <Badge variant="outline" className="mt-2">{item.category}</Badge>
              )}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(item)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {galleryItems.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No gallery items yet. Add your first image!</p>
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Gallery Item</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update' : 'Upload'} an image to the gallery
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingItem && (
              <div>
                <Label>Image *</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                />
                {imagePreview && (
                  <div className="mt-2 relative aspect-video w-full">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
              </div>
            )}

            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter title"
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description (optional)"
                rows={3}
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tattoo">Tattoo</SelectItem>
                  <SelectItem value="piercing">Piercing</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="renovation">Renovation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded cursor-pointer"
              />
              <Label htmlFor="featured" className="cursor-pointer">Mark as featured</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? 'Update' : 'Add'} Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
