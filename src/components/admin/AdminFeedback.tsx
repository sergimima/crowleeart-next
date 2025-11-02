'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface Feedback {
  id: number
  name: string
  email: string
  quality: number
  comments: string
  createdAt: string
}

interface AdminFeedbackProps {
  feedbacks: Feedback[]
  onUpdate: () => void
}

export default function AdminFeedback({ feedbacks: initialFeedbacks, onUpdate }: AdminFeedbackProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks || [])
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    setFeedbacks(initialFeedbacks)
  }, [initialFeedbacks])

  const deleteFeedback = async (id: number) => {
    try {
      setActionLoading(id)

      const response = await fetch(`/api/admin/feedbacks/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to delete feedback')

      setFeedbacks(prev => prev.filter(feedback => feedback.id !== id))
      toast.success('Feedback deleted successfully!')
      onUpdate()
    } catch (err: any) {
      console.error('Error deleting feedback:', err)
      toast.error(err.message || 'Failed to delete feedback.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <>
      <div className="space-y-8">
        {feedbacks.length === 0 ? (
          <p className="text-white">No feedbacks found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-white/10 text-center">
              <thead className="bg-white/5">
                <tr>
                  <th className="border border-white/10 p-2 text-white">Name</th>
                  <th className="border border-white/10 p-2 text-white">Email</th>
                  <th className="border border-white/10 p-2 text-white">Quality</th>
                  <th className="border border-white/10 p-2 text-white">Comments</th>
                  <th className="border border-white/10 p-2 text-white">Date</th>
                  <th className="border border-white/10 p-2 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map(feedback => (
                  <tr key={feedback.id} className="hover:bg-white/5 transition">
                    <td className="border border-white/10 p-2">{feedback.name}</td>
                    <td className="border border-white/10 p-2">{feedback.email}</td>
                    <td className="border border-white/10 p-2">{feedback.quality} / 5</td>
                    <td className="border border-white/10 p-2">{feedback.comments}</td>
                    <td className="border border-white/10 p-2">
                      {new Date(feedback.createdAt).toLocaleString()}
                    </td>
                    <td className="border border-white/10 p-2">
                      <button
                        onClick={() => deleteFeedback(feedback.id)}
                        className={`${
                          actionLoading === feedback.id ? 'bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                        } text-white px-3 py-1 rounded transition`}
                        disabled={actionLoading === feedback.id}
                      >
                        {actionLoading === feedback.id ? 'Processing...' : 'Delete'}
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
