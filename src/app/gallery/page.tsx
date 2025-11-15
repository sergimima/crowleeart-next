'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, Star, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const pathname = usePathname()

  useEffect(() => {
    fetchGallery()
  }, [])

  useEffect(() => {
    // Scroll to top when pathname changes
    const mainElement = document.querySelector('main')
    if (mainElement) {
      mainElement.scrollTop = 0
    }
  }, [pathname])

  useEffect(() => {
    if (categoryFilter === 'all') {
      setFilteredItems(galleryItems)
    } else {
      setFilteredItems(galleryItems.filter(item => item.category === categoryFilter))
    }
  }, [categoryFilter, galleryItems])

  const fetchGallery = async () => {
    try {
      const response = await fetch('/api/gallery')
      if (response.ok) {
        const data = await response.json()
        setGalleryItems(data)
        setFilteredItems(data)
      }
    } catch (error) {
      console.error('Error fetching gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = Array.from(new Set(galleryItems.map(item => item.category).filter(Boolean)))

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="container mx-auto px-4 py-12 md:py-20 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Our Gallery
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore our portfolio of completed work and creative projects
          </p>
        </motion.div>

        {/* Filter */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category!}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}

        {/* Gallery Grid */}
        {filteredItems.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedImage(item)}
                className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                    {item.category && (
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  {item.featured && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No gallery items yet. Check back soon!</p>
          </div>
        )}

        {/* CTA */}
        <motion.div
          className="text-center bg-purple-800/30 mt-20 p-10 rounded-lg shadow-lg max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-3xl font-semibold text-white mb-4">
            ✨ Impressed with our work?
          </h3>
          <p className="text-white/80 mb-6">
            We bring this quality to your home. Book your service today or contact us for a personalized quote.
          </p>
          <Link
            href="/booking"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded shadow-md transition"
          >
            Book Now
          </Link>
        </motion.div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-6 w-6" />
          </Button>

          <div className="max-w-6xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-video w-full mb-4">
              <Image
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">{selectedImage.title}</h2>
              {selectedImage.description && (
                <p className="text-gray-300 mb-4">{selectedImage.description}</p>
              )}
              {selectedImage.category && (
                <Badge variant="secondary">{selectedImage.category}</Badge>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
