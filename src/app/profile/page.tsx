'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import ClientLayout from '@/components/ClientLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, MapPin, CreditCard, Shield, Settings, Plus, Trash2, Star, Edit, X } from 'lucide-react'

export default function ProfileSettings() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [personalData, setPersonalData] = useState({ name: '', phone: '' })
  const [addresses, setAddresses] = useState<any[]>([])
  const [editingAddress, setEditingAddress] = useState<any>(null)
  const [addressForm, setAddressForm] = useState({
    fullName: '', phone: '', street1: '', street2: '', city: '',
    state: '', postalCode: '', country: 'United Kingdom', type: 'shipping'
  })
  const [securityData, setSecurityData] = useState({ newPassword: '', confirmPassword: '' })
  const [preferences, setPreferences] = useState({ emailNotifications: true, smsNotifications: false, language: 'en' })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setProfile(data)
          setPersonalData({ name: data.name || '', phone: data.phone || '' })
          if (data.address) {
            setAddresses([{
              id: 1, fullName: data.name || '', phone: data.phone || '',
              street1: data.address, street2: '', city: '', state: '',
              postalCode: '', country: 'United Kingdom', type: 'shipping', isPrimary: true
            }])
          }
        } else if (response.status === 401 || response.status === 403) {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
        toast.error('Failed to load profile data.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const primaryAddress = addresses.find(a => a.isPrimary)
      const addressString = primaryAddress
        ? `${primaryAddress.street1}${primaryAddress.street2 ? ', ' + primaryAddress.street2 : ''}, ${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.postalCode}, ${primaryAddress.country}`
        : ''
      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...personalData, address: addressString })
      })
      if (response.ok) toast.success('Personal info updated!')
    } catch (error) {
      toast.error('Failed to update.')
    }
  }

  const handleSaveAddress = () => {
    if (!addressForm.fullName || !addressForm.phone || !addressForm.street1 || !addressForm.city || !addressForm.postalCode) {
      toast.error('Please fill all required fields')
      return
    }

    if (editingAddress) {
      setAddresses(addresses.map(a => a.id === editingAddress.id ? { ...addressForm, id: editingAddress.id, isPrimary: editingAddress.isPrimary } : a))
      toast.success('Address updated!')
    } else {
      const id = Date.now()
      setAddresses([...addresses, { ...addressForm, id, isPrimary: addresses.length === 0 }])
      toast.success('Address added!')
    }

    setEditingAddress(null)
    setAddressForm({ fullName: '', phone: '', street1: '', street2: '', city: '', state: '', postalCode: '', country: 'United Kingdom', type: 'shipping' })
  }

  const handleEditAddress = (addr: any) => {
    setEditingAddress(addr)
    setAddressForm({ ...addr })
  }

  const handleCancelEdit = () => {
    setEditingAddress(null)
    setAddressForm({ fullName: '', phone: '', street1: '', street2: '', city: '', state: '', postalCode: '', country: 'United Kingdom', type: 'shipping' })
  }

  const handleRemoveAddress = (id: number) => {
    setAddresses(addresses.filter(a => a.id !== id))
    toast.success('Address removed!')
  }

  const handleSetPrimary = (id: number) => {
    setAddresses(addresses.map(a => ({ ...a, isPrimary: a.id === id })))
  }

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    try {
      const primaryAddress = addresses.find(a => a.isPrimary)
      const addressString = primaryAddress
        ? `${primaryAddress.street1}${primaryAddress.street2 ? ', ' + primaryAddress.street2 : ''}, ${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.postalCode}, ${primaryAddress.country}`
        : ''
      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...personalData, address: addressString, password: securityData.newPassword })
      })
      if (response.ok) {
        toast.success('Password updated!')
        setSecurityData({ newPassword: '', confirmPassword: '' })
      }
    } catch (error) {
      toast.error('Failed to update.')
    }
  }

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </ClientLayout>
    )
  }

  const inputStyle = 'w-full px-4 py-2 rounded-md bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <ClientLayout>
      <div className="min-h-screen p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your account settings</p>
          </div>

          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal"><User className="h-4 w-4" /><span className="hidden sm:inline ml-2">Personal</span></TabsTrigger>
              <TabsTrigger value="addresses"><MapPin className="h-4 w-4" /><span className="hidden sm:inline ml-2">Addresses</span></TabsTrigger>
              <TabsTrigger value="payment"><CreditCard className="h-4 w-4" /><span className="hidden sm:inline ml-2">Payment</span></TabsTrigger>
              <TabsTrigger value="security"><Shield className="h-4 w-4" /><span className="hidden sm:inline ml-2">Security</span></TabsTrigger>
              <TabsTrigger value="preferences"><Settings className="h-4 w-4" /><span className="hidden sm:inline ml-2">Preferences</span></TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePersonalSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input type="email" value={profile?.email || ''} disabled className={`${inputStyle} opacity-60`} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <input type="text" value={personalData.name} onChange={(e) => setPersonalData(p => ({ ...p, name: e.target.value }))} className={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input type="tel" value={personalData.phone} onChange={(e) => setPersonalData(p => ({ ...p, phone: e.target.value }))} className={inputStyle} />
                    </div>
                    <Button type="submit">Update Personal Info</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses">
              <Card>
                <CardHeader>
                  <CardTitle>Addresses</CardTitle>
                  <CardDescription>Manage your delivery and billing addresses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Saved Addresses */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Saved Addresses</h3>
                    {addresses.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No addresses saved yet.</p>
                    ) : (
                      addresses.map(addr => (
                        <div key={addr.id} className="flex items-start justify-between p-4 border border-border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {addr.isPrimary && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
                              <p className="font-medium">{addr.fullName}</p>
                              <span className="text-xs px-2 py-1 rounded bg-muted">{addr.type === 'shipping' ? 'Shipping' : 'Billing'}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{addr.phone}</p>
                            <p className="text-sm text-muted-foreground">{addr.street1}</p>
                            {addr.street2 && <p className="text-sm text-muted-foreground">{addr.street2}</p>}
                            <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.postalCode}</p>
                            <p className="text-sm text-muted-foreground">{addr.country}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditAddress(addr)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!addr.isPrimary && (
                              <Button variant="outline" size="sm" onClick={() => handleSetPrimary(addr.id)}>
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="destructive" size="sm" onClick={() => handleRemoveAddress(addr.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add/Edit Address Form */}
                  <div className="pt-6 border-t border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                      {editingAddress && (
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name *</label>
                        <input
                          type="text"
                          value={addressForm.fullName}
                          onChange={(e) => setAddressForm(p => ({ ...p, fullName: e.target.value }))}
                          className={inputStyle}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm(p => ({ ...p, phone: e.target.value }))}
                          className={inputStyle}
                          placeholder="+44 7700 900000"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
                        <input
                          type="text"
                          value={addressForm.street1}
                          onChange={(e) => setAddressForm(p => ({ ...p, street1: e.target.value }))}
                          className={inputStyle}
                          placeholder="123 Main Street"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Address Line 2</label>
                        <input
                          type="text"
                          value={addressForm.street2}
                          onChange={(e) => setAddressForm(p => ({ ...p, street2: e.target.value }))}
                          className={inputStyle}
                          placeholder="Apartment 4B (optional)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm(p => ({ ...p, city: e.target.value }))}
                          className={inputStyle}
                          placeholder="London"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">State / Province</label>
                        <input
                          type="text"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm(p => ({ ...p, state: e.target.value }))}
                          className={inputStyle}
                          placeholder="Greater London"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Postal Code *</label>
                        <input
                          type="text"
                          value={addressForm.postalCode}
                          onChange={(e) => setAddressForm(p => ({ ...p, postalCode: e.target.value }))}
                          className={inputStyle}
                          placeholder="SW1A 1AA"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Country *</label>
                        <select
                          value={addressForm.country}
                          onChange={(e) => setAddressForm(p => ({ ...p, country: e.target.value }))}
                          className={inputStyle}
                        >
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="United States">United States</option>
                          <option value="Spain">Spain</option>
                          <option value="France">France</option>
                          <option value="Germany">Germany</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Address Type</label>
                        <div className="flex gap-4">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="type"
                              value="shipping"
                              checked={addressForm.type === 'shipping'}
                              onChange={(e) => setAddressForm(p => ({ ...p, type: e.target.value }))}
                              className="mr-2"
                            />
                            <span className="text-sm">Shipping</span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="type"
                              value="billing"
                              checked={addressForm.type === 'billing'}
                              onChange={(e) => setAddressForm(p => ({ ...p, type: e.target.value }))}
                              className="mr-2"
                            />
                            <span className="text-sm">Billing</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleSaveAddress} className="mt-4">
                      {editingAddress ? 'Update Address' : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Address
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your saved payment methods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12">
                    <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Under Construction</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      Payment methods management is currently being developed. This feature will be available soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Update your password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSecuritySubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">New Password</label>
                      <input type="password" value={securityData.newPassword} onChange={(e) => setSecurityData(p => ({ ...p, newPassword: e.target.value }))} className={inputStyle} minLength={6} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Confirm Password</label>
                      <input type="password" value={securityData.confirmPassword} onChange={(e) => setSecurityData(p => ({ ...p, confirmPassword: e.target.value }))} className={inputStyle} />
                    </div>
                    <Button type="submit">Update Password</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <span className="text-sm">Email Notifications</span>
                      <input type="checkbox" checked={preferences.emailNotifications} onChange={(e) => setPreferences(p => ({ ...p, emailNotifications: e.target.checked }))} />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm">SMS Notifications</span>
                      <input type="checkbox" checked={preferences.smsNotifications} onChange={(e) => setPreferences(p => ({ ...p, smsNotifications: e.target.checked }))} />
                    </label>
                    <div>
                      <label className="block text-sm font-medium mb-2">Language</label>
                      <select value={preferences.language} onChange={(e) => setPreferences(p => ({ ...p, language: e.target.value }))} className={inputStyle}>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </ClientLayout>
  )
}
