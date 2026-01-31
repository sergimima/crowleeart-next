'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Review {
  id: number
  name: string
  rating: number
  comment: string
  createdAt: string
}

interface AdminReviewsProps {
  reviews: Review[]
  onUpdate: () => void
}

export default function AdminReviews({ reviews: initialReviews, onUpdate }: AdminReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews || [])
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    setReviews(initialReviews)
  }, [initialReviews])

  const deleteReview = async (id: number) => {
    try {
      setActionLoading(id)

      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to delete review')

      setReviews(prev => prev.filter(review => review.id !== id))
      toast.success('Review deleted successfully!')
      onUpdate()
    } catch (err: any) {
      console.error('Error deleting review:', err)
      toast.error(err.message || 'Failed to delete review.')
    } finally {
      setActionLoading(null)
    }
  }

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating)
  }

  return (
    <>
      <div className="space-y-8">
        {reviews.length === 0 ? (
          <p className="text-white">No reviews found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-white/10 text-center">
              <thead className="bg-white/5">
                <tr>
                  <th className="border border-white/10 p-2 text-white">Name</th>
                  <th className="border border-white/10 p-2 text-white">Rating</th>
                  <th className="border border-white/10 p-2 text-white">Comment</th>
                  <th className="border border-white/10 p-2 text-white">Date</th>
                  <th className="border border-white/10 p-2 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(review => (
                  <tr key={review.id} className="hover:bg-white/5 transition">
                    <td className="border border-white/10 p-2">{review.name}</td>
                    <td className="border border-white/10 p-2">{renderStars(review.rating)}</td>
                    <td className="border border-white/10 p-2">{review.comment}</td>
                    <td className="border border-white/10 p-2">
                      {new Date(review.createdAt).toLocaleString()}
                    </td>
                    <td className="border border-white/10 p-2">
                      <button
                        onClick={() => deleteReview(review.id)}
                        className={`${
                          actionLoading === review.id
                            ? 'bg-gray-600'
                            : 'bg-red-600 hover:bg-red-700'
                        } text-white px-3 py-1 rounded transition`}
                        disabled={actionLoading === review.id}
                      >
                        {actionLoading === review.id ? 'Processing...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
