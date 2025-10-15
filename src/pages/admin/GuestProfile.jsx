import React, { useEffect, useMemo, useState } from 'react'
import AdminHeader from './components/AdminHeader'
import axios from 'axios'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, RefreshCw } from 'lucide-react'

function AdminGuestProfile() {
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const url = (localStorage.getItem('url') || '') + 'customer.php'

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('operation', 'getOnlineCustomers')
      const res = await axios.post(url, formData)
      const data = Array.isArray(res.data) ? res.data : (res.data !== 0 ? res.data : [])
      setCustomers(data)
    } catch (err) {
      console.error('getOnlineCustomers error', err)
      toast.error('Failed to load online customers')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    let list = Array.isArray(customers) ? customers.slice() : []
    const term = searchTerm.trim().toLowerCase()
    if (term) {
      list = list.filter((c) => {
        const name = (c.customers_fname && c.customers_lname) ? `${c.customers_fname} ${c.customers_lname}`.toLowerCase() : ''
        const username = (c.customers_online_username || '').toLowerCase()
        const email = (c.customers_online_email || c.customers_email || '').toLowerCase()
        const phone = (c.customers_online_phone || c.customers_phone || '').toLowerCase()
        return name.includes(term) || username.includes(term) || email.includes(term) || phone.includes(term)
      })
    }
    if (statusFilter !== 'all') {
      list = list.filter((c) => String(c.customers_online_authentication_status) === String(statusFilter))
    }
    return list
  }, [customers, searchTerm, statusFilter])

  const formatDate = (d) => {
    if (!d) return '—'
    try { return new Date(d).toLocaleString() } catch { return String(d) }
  }

  const getInitials = (c) => {
    const fname = c.customers_fname || ''
    const lname = c.customers_lname || ''
    const initials = `${fname.slice(0,1)}${lname.slice(0,1)}`
    return initials || (c.customers_online_username || 'U').slice(0,2).toUpperCase()
  }

  return (
    <div>
      <AdminHeader />
      <main id="MainPage" className="ml-0 lg:ml-72 px-2 sm:px-4 lg:px-6 py-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Guest Profiles</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchCustomers} disabled={isLoading}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-2"><CardTitle>Online Accounts</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, username, email, or phone"
                  className="pl-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  size="sm"
                >All</Button>
                <Button
                  variant={statusFilter === '1' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('1')}
                  size="sm"
                >Authenticated</Button>
                <Button
                  variant={statusFilter === '0' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('0')}
                  size="sm"
                >Unverified</Button>
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">No online customers found.</div>
            ) : (
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((c, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={c.customers_online_profile_image || ''} />
                              <AvatarFallback>{getInitials(c)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{(c.customers_fname && c.customers_lname) ? `${c.customers_fname} ${c.customers_lname}` : '—'}</div>
                              <div className="text-xs text-muted-foreground">{c.customers_online_username || '—'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{c.customers_online_email || c.customers_email || '—'}</div>
                            <div className="text-xs text-muted-foreground">{c.customers_online_phone || c.customers_phone || '—'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {String(c.customers_online_authentication_status) === '1' ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Authenticated</Badge>
                          ) : (
                            <Badge variant="secondary">Unverified</Badge>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{formatDate(c.customers_online_created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default AdminGuestProfile