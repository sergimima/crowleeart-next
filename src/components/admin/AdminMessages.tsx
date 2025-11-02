'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface Message {
  id: number
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
}

interface AdminMessagesProps {
  messages: Message[]
  onUpdate: () => void
}

export default function AdminMessages({ messages: initialMessages, onUpdate }: AdminMessagesProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || [])
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  const deleteMessage = async (id: number) => {
    try {
      setActionLoading(id)
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to delete message')

      setMessages(prev => prev.filter(message => message.id !== id))
      toast.success('Message deleted successfully!')
      onUpdate()
    } catch (err: any) {
      console.error('Error deleting message:', err)
      toast.error(err.message || 'Failed to delete message.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-8">
      {messages.length === 0 ? (
        <p className="text-white">No messages found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="border border-white/10 p-2 text-left text-white">Name</th>
                <th className="border border-white/10 p-2 text-left text-white">Email</th>
                <th className="border border-white/10 p-2 text-left text-white">Subject</th>
                <th className="border border-white/10 p-2 text-left text-white">Message</th>
                <th className="border border-white/10 p-2 text-left text-white">Date</th>
                <th className="border border-white/10 p-2 text-left text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(msg => (
                <tr key={msg.id} className="hover:bg-white/5 transition">
                  <td className="border border-white/10 p-2">{msg.name}</td>
                  <td className="border border-white/10 p-2">{msg.email}</td>
                  <td className="border border-white/10 p-2">{msg.subject}</td>
                  <td className="border border-white/10 p-2">{msg.message}</td>
                  <td className="border border-white/10 p-2">{new Date(msg.createdAt).toLocaleString()}</td>
                  <td className="border border-white/10 p-2">
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className={`${
                        actionLoading === msg.id ? 'bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                      } text-white px-3 py-1 rounded transition`}
                      disabled={actionLoading === msg.id}
                    >
                      {actionLoading === msg.id ? 'Processing...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
