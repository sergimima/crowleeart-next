'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Survey {
  id: number
  name: string
  email: string
  referralSource: string
  improvementSuggestions: string
  createdAt: string
}

interface AdminSurveysProps {
  surveys: Survey[]
  onUpdate: () => void
}

export default function AdminSurveys({ surveys: initialSurveys, onUpdate }: AdminSurveysProps) {
  const [surveys, setSurveys] = useState<Survey[]>(initialSurveys || [])
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    setSurveys(initialSurveys)
  }, [initialSurveys])

  const handleDeleteSurvey = async (id: number) => {
    try {
      setActionLoading(id)

      const response = await fetch(`/api/admin/surveys/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to delete survey')

      setSurveys(prev => prev.filter(survey => survey.id !== id))
      toast.success('Survey deleted successfully!')
      onUpdate()
    } catch (err: any) {
      console.error('Error deleting survey:', err)
      toast.error(err.message || 'Failed to delete survey.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <>
      <div className="space-y-6">
        {surveys.length === 0 ? (
          <p className="text-white">No surveys found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-white/10 text-center">
              <thead className="bg-white/5">
                <tr>
                  {['Name', 'Email', 'Referral Source', 'Suggestions', 'Date', 'Actions'].map(header => (
                    <th key={header} className="border border-white/10 p-2 text-white">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {surveys.map(survey => (
                  <tr key={survey.id} className="hover:bg-white/5 transition">
                    <td className="border border-white/10 p-2">{survey.name}</td>
                    <td className="border border-white/10 p-2">{survey.email}</td>
                    <td className="border border-white/10 p-2">{survey.referralSource}</td>
                    <td className="border border-white/10 p-2">{survey.improvementSuggestions}</td>
                    <td className="border border-white/10 p-2">{new Date(survey.createdAt).toLocaleString()}</td>
                    <td className="border border-white/10 p-2">
                      <button
                        onClick={() => handleDeleteSurvey(survey.id)}
                        className={`${
                          actionLoading === survey.id ? 'bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                        } text-white px-3 py-1 rounded transition`}
                        disabled={actionLoading === survey.id}
                      >
                        {actionLoading === survey.id ? 'Processing...' : 'Delete'}
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
