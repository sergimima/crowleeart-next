'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Link2, Trash2, Copy, Check, UserPlus, Users, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Invitation {
  id: number
  token: string
  role: string
  expiresAt: string
  usedAt: string | null
  usedBy: number | null
  createdAt: string
}

interface AdminInvitationsProps {
  onUpdate: () => void
}

export default function AdminInvitations({ onUpdate }: AdminInvitationsProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [newRole, setNewRole] = useState<string>('client')
  const [newExpiration, setNewExpiration] = useState<string>('48')

  // Fetch invitations
  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/admin/invitations', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setInvitations(data.invitations)
      }
    } catch (error) {
      console.error('Error fetching invitations:', error)
      toast.error('Failed to load invitations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvitations()
  }, [])

  // Create new invitation
  const createInvitation = async () => {
    setCreating(true)
    try {
      const response = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          role: newRole,
          expiresInHours: parseInt(newExpiration)
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Invitation link created for ${newRole}!`)

        // Copy to clipboard immediately
        await navigator.clipboard.writeText(data.inviteUrl)
        toast.success('Link copied to clipboard!')

        fetchInvitations()
        onUpdate()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create invitation')
      }
    } catch (error) {
      console.error('Error creating invitation:', error)
      toast.error('Failed to create invitation')
    } finally {
      setCreating(false)
    }
  }

  // Delete invitation
  const deleteInvitation = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/invitations/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('Invitation deleted')
        setInvitations(prev => prev.filter(inv => inv.id !== id))
        setDeleteId(null)
        onUpdate()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete invitation')
      }
    } catch (error) {
      console.error('Error deleting invitation:', error)
      toast.error('Failed to delete invitation')
    }
  }

  // Copy link to clipboard
  const copyLink = async (token: string, id: number) => {
    const baseUrl = window.location.origin
    const link = `${baseUrl}/login?invite=${token}`

    try {
      await navigator.clipboard.writeText(link)
      setCopiedId(id)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  // Get status of invitation
  const getStatus = (invitation: Invitation) => {
    if (invitation.usedAt) {
      return { label: 'Used', color: 'bg-blue-500/20 text-blue-600' }
    }
    if (new Date(invitation.expiresAt) < new Date()) {
      return { label: 'Expired', color: 'bg-red-500/20 text-red-600' }
    }
    return { label: 'Active', color: 'bg-green-500/20 text-green-600' }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading invitations...
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Invitation Links
          </CardTitle>
          <CardDescription>
            Generate invitation links to register new clients or workers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create new invitation */}
          <div className="flex flex-wrap items-end gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Client
                    </div>
                  </SelectItem>
                  <SelectItem value="worker">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Worker
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Expires in</Label>
              <Select value={newExpiration} onValueChange={setNewExpiration}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="48">48 hours</SelectItem>
                  <SelectItem value="72">3 days</SelectItem>
                  <SelectItem value="168">7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={createInvitation} disabled={creating}>
              <Link2 className="mr-2 h-4 w-4" />
              {creating ? 'Creating...' : 'Generate Link'}
            </Button>
          </div>

          {/* Invitations table */}
          {invitations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-semibold">No invitations yet</p>
              <p className="text-sm">Generate a link above to invite users</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => {
                  const status = getStatus(invitation)
                  const isActive = status.label === 'Active'

                  return (
                    <TableRow key={invitation.id}>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {invitation.role === 'worker' ? (
                            <UserPlus className="h-3 w-3 mr-1" />
                          ) : (
                            <Users className="h-3 w-3 mr-1" />
                          )}
                          {invitation.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(invitation.createdAt), 'PP')}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(invitation.expiresAt), 'PP p')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyLink(invitation.token, invitation.id)}
                            >
                              {copiedId === invitation.id ? (
                                <>
                                  <Check className="h-4 w-4 mr-1 text-green-600" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy Link
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeleteId(invitation.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this invitation link. Anyone with the link will no longer be able to register.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteInvitation(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
