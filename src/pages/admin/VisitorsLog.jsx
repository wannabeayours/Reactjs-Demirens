import React, { useEffect, useState, useMemo, useCallback } from 'react'
import AdminHeader from './components/AdminHeader'
import axios from 'axios'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  Plus, 
  Pencil, 
  CheckCircle, 
  XCircle, 
  LogOut, 
  Clock, 
  UserRound 
} from 'lucide-react'

function AdminVisitorsLog() {
  const APIConn = useMemo(() => `${localStorage.url}admin.php`, [])

  // Data states
  const [logs, setLogs] = useState([])
  const [approvals, setApprovals] = useState([]) // [{visitorapproval_id, visitorapproval_status}]
  const [filteredLogs, setFilteredLogs] = useState([])

  // UI states
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // visitorapproval_id or 'all'
  const [dateFrom, setDateFrom] = useState('') // yyyy-MM-dd
  const [dateTo, setDateTo] = useState('')

  // Modal (Add/Edit)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLog, setEditingLog] = useState(null) // row object or null
  const [formVisitorName, setFormVisitorName] = useState('')
  const [formPurpose, setFormPurpose] = useState('')
  const [formCheckin, setFormCheckin] = useState('')
  const [formCheckout, setFormCheckout] = useState('')
  const [formStatusId, setFormStatusId] = useState('')
  const [formBookingId, setFormBookingId] = useState('')

  // Helpers
  const getStatusNameById = useCallback((id) => {
    const found = approvals.find(a => String(a.visitorapproval_id) === String(id))
    return found?.visitorapproval_status || 'Unknown'
  }, [approvals])

  const getStatusColor = useCallback((statusName) => {
    const s = (statusName || '').toLowerCase()
    if (s.includes('pending')) return 'bg-yellow-500 text-white'
    if (s.includes('approved')) return 'bg-green-600 text-white'
    if (s.includes('rejected') || s.includes('declined')) return 'bg-red-600 text-white'
    if (s.includes('checked-out') || s.includes('checkout')) return 'bg-gray-600 text-white'
    return 'bg-blue-600 text-white'
  }, [])

  const fetchApprovals = useCallback(async () => {
    try {
      const fd = new FormData()
      fd.append('method', 'get_visitor_approval_statuses')
      const res = await axios.post(APIConn, fd)
      const arr = Array.isArray(res.data) ? res.data : []
      // Normalize keys if backend returns different casing
      const normalized = arr.map(item => ({
        visitorapproval_id: item.visitorapproval_id ?? item.id ?? '',
        visitorapproval_status: item.visitorapproval_status ?? item.status ?? 'Unknown'
      }))
      setApprovals(normalized)
    } catch (err) {
      console.error('Error fetching visitor approval statuses:', err)
      setApprovals([])
    }
  }, [APIConn])

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const fd = new FormData()
      fd.append('method', 'get_visitor_logs')
      const res = await axios.post(APIConn, fd)
      const list = Array.isArray(res.data) ? res.data : []
      const normalized = list.map(item => ({
        visitorlogs_id: item.visitorlogs_id ?? item.id ?? '',
        visitorapproval_id: item.visitorapproval_id ?? item.status_id ?? null,
        booking_id: item.booking_id ?? null,
        employee_id: item.employee_id ?? null,
        visitorlogs_visitorname: item.visitorlogs_visitorname ?? item.visitor_name ?? '',
        visitorlogs_purpose: item.visitorlogs_purpose ?? item.purpose ?? '',
        visitorlogs_checkin_time: item.visitorlogs_checkin_time ?? item.checkin_time ?? '',
        visitorlogs_checkout_time: item.visitorlogs_checkout_time ?? item.checkout_time ?? ''
      }))
      setLogs(normalized)
      setFilteredLogs(normalized)
    } catch (err) {
      console.error('Error fetching visitor logs:', err)
      toast.error('Failed to fetch visitor logs')
      setLogs([])
      setFilteredLogs([])
    } finally {
      setLoading(false)
    }
  }, [APIConn])

  useEffect(() => {
    // Initial fetch
    fetchApprovals()
    fetchLogs()
  }, [fetchApprovals, fetchLogs])

  const applyFilters = useCallback(() => {
    let result = [...logs]

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(r => (
        (r.visitorlogs_visitorname || '').toLowerCase().includes(term) ||
        (r.visitorlogs_purpose || '').toLowerCase().includes(term) ||
        String(r.booking_id || '').includes(term)
      ))
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(r => String(r.visitorapproval_id) === String(statusFilter))
    }

    // Date range filter on check-in
    const from = dateFrom ? new Date(dateFrom) : null
    const to = dateTo ? new Date(dateTo) : null

    if (from) {
      result = result.filter(r => {
        const d = r.visitorlogs_checkin_time ? new Date(r.visitorlogs_checkin_time) : null
        return d ? d >= from : false
      })
    }
    if (to) {
      // Include the entire day for 'to'
      const toEnd = new Date(to)
      toEnd.setHours(23, 59, 59, 999)
      result = result.filter(r => {
        const d = r.visitorlogs_checkin_time ? new Date(r.visitorlogs_checkin_time) : null
        return d ? d <= toEnd : false
      })
    }

    setFilteredLogs(result)
  }, [logs, searchTerm, statusFilter, dateFrom, dateTo])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const resetForm = () => {
    setEditingLog(null)
    setFormVisitorName('')
    setFormPurpose('')
    setFormCheckin('')
    setFormCheckout('')
    setFormStatusId('')
    setFormBookingId('')
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (row) => {
    setEditingLog(row)
    setFormVisitorName(row.visitorlogs_visitorname || '')
    setFormPurpose(row.visitorlogs_purpose || '')
    // Convert to datetime-local format if needed
    const toLocalDT = (dt) => {
      if (!dt) return ''
      // Assuming dt is like 'YYYY-MM-DD HH:mm:ss'
      const d = new Date(dt)
      const pad = (n) => String(n).padStart(2, '0')
      const yyyy = d.getFullYear()
      const mm = pad(d.getMonth() + 1)
      const dd = pad(d.getDate())
      const hh = pad(d.getHours())
      const mi = pad(d.getMinutes())
      return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
    }
    setFormCheckin(toLocalDT(row.visitorlogs_checkin_time))
    setFormCheckout(row.visitorlogs_checkout_time ? toLocalDT(row.visitorlogs_checkout_time) : '')
    setFormStatusId(row.visitorapproval_id ? String(row.visitorapproval_id) : '')
    setFormBookingId(row.booking_id ? String(row.booking_id) : '')
    setIsDialogOpen(true)
  }

  const submitLog = async () => {
    try {
      const fd = new FormData()
      const method = editingLog ? 'update_visitor_log' : 'add_visitor_log'
      fd.append('method', method)
      if (editingLog) fd.append('visitorlogs_id', editingLog.visitorlogs_id)
      fd.append('visitorlogs_visitorname', formVisitorName)
      fd.append('visitorlogs_purpose', formPurpose)
      if (formCheckin) fd.append('visitorlogs_checkin_time', formCheckin.replace('T', ' ') + ':00')
      if (formCheckout) fd.append('visitorlogs_checkout_time', formCheckout.replace('T', ' ') + ':00')
      if (formStatusId) fd.append('visitorapproval_id', formStatusId)
      if (formBookingId) fd.append('booking_id', formBookingId)
      // Include employee_id if available
      const employeeId = localStorage.getItem('userId')
      if (employeeId) fd.append('employee_id', employeeId)

      const res = await axios.post(APIConn, fd)
      const ok = res.data?.response === true || res.data?.success === true
      if (ok) {
        toast.success(editingLog ? 'Visitor log updated' : 'Visitor log added')
        setIsDialogOpen(false)
        resetForm()
        fetchLogs()
      } else {
        toast.error(res.data?.message || 'Failed to save visitor log')
      }
    } catch (err) {
      console.error('Error saving visitor log:', err)
      toast.error('Error saving visitor log')
    }
  }

  const setRowStatus = async (row, targetStatusName) => {
    try {
      // Find status id by name (case-insensitive contains)
      const target = approvals.find(a => (a.visitorapproval_status || '').toLowerCase().includes(targetStatusName.toLowerCase()))
      if (!target) {
        toast.error(`Status "${targetStatusName}" not found. Please use Edit to set a status.`)
        return
      }
      const fd = new FormData()
      fd.append('method', 'set_visitor_approval')
      fd.append('visitorlogs_id', row.visitorlogs_id)
      fd.append('visitorapproval_id', target.visitorapproval_id)
      const res = await axios.post(APIConn, fd)
      const ok = res.data?.response === true || res.data?.success === true
      if (ok) {
        toast.success(`Status set to ${target.visitorapproval_status}`)
        fetchLogs()
      } else {
        toast.error(res.data?.message || 'Failed to update status')
      }
    } catch (err) {
      console.error('Error updating status:', err)
      toast.error('Error updating status')
    }
  }

  const setCheckoutNow = async (row) => {
    try {
      const fd = new FormData()
      fd.append('method', 'update_visitor_log')
      fd.append('visitorlogs_id', row.visitorlogs_id)
      const now = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      const yyyy = now.getFullYear()
      const mm = pad(now.getMonth() + 1)
      const dd = pad(now.getDate())
      const hh = pad(now.getHours())
      const mi = pad(now.getMinutes())
      const ss = pad(now.getSeconds())
      fd.append('visitorlogs_checkout_time', `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`)

      const res = await axios.post(APIConn, fd)
      const ok = res.data?.response === true || res.data?.success === true
      if (ok) {
        // Try set status to Checked-Out if available
        const checkedOut = approvals.find(a => (a.visitorapproval_status || '').toLowerCase().includes('checked-out'))
        if (checkedOut) {
          const fd2 = new FormData()
          fd2.append('method', 'set_visitor_approval')
          fd2.append('visitorlogs_id', row.visitorlogs_id)
          fd2.append('visitorapproval_id', checkedOut.visitorapproval_id)
          await axios.post(APIConn, fd2)
        }
        toast.success('Checkout time updated')
        fetchLogs()
      } else {
        toast.error(res.data?.message || 'Failed to update checkout time')
      }
    } catch (err) {
      console.error('Error updating checkout time:', err)
      toast.error('Error updating checkout time')
    }
  }

  // Derived stats
  const stats = useMemo(() => {
    const counts = { total: logs.length, pending: 0, approved: 0, rejected: 0, checked_out: 0 }
    logs.forEach(r => {
      const name = getStatusNameById(r.visitorapproval_id).toLowerCase()
      if (name.includes('pending')) counts.pending++
      else if (name.includes('approved')) counts.approved++
      else if (name.includes('rejected') || name.includes('declined')) counts.rejected++
      else if (name.includes('checked-out') || name.includes('checkout')) counts.checked_out++
    })
    return counts
  }, [logs, getStatusNameById])

  return (
    <div className="min-h-screen w-full">
      {/* Pass onCollapse so content can offset for the fixed Sidebar */}
      <AdminHeader onCollapse={setIsCollapsed} />
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-0' : 'lg:ml-72'} px-4 md:px-6 lg:px-8 py-4`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold">Visitors Log</h2>
          <div className="flex gap-2">
            <Button onClick={openAddDialog} className="gap-2">
              <Plus className="h-4 w-4" /> Add Visitor Log
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card>
            <CardHeader className="py-3"><CardTitle className="text-sm">Total Logs</CardTitle></CardHeader>
            <CardContent className="py-3"><div className="text-2xl font-bold">{stats.total}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3"><CardTitle className="text-sm">Pending</CardTitle></CardHeader>
            <CardContent className="py-3"><div className="text-2xl font-bold text-yellow-600">{stats.pending}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3"><CardTitle className="text-sm">Approved</CardTitle></CardHeader>
            <CardContent className="py-3"><div className="text-2xl font-bold text-green-600">{stats.approved}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3"><CardTitle className="text-sm">Checked-Out</CardTitle></CardHeader>
            <CardContent className="py-3"><div className="text-2xl font-bold text-gray-600">{stats.checked_out}</div></CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-4">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <Input placeholder="Search visitor, purpose, booking id" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1 block">Status</Label>
                <Select value={String(statusFilter)} onValueChange={(v) => setStatusFilter(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {approvals.map(st => (
                      <SelectItem key={st.visitorapproval_id} value={String(st.visitorapproval_id)}>
                        {st.visitorapproval_status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block">Check-in From</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1 block">Check-in To</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="py-0">
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Visitor</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Booking</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <div className="py-8 text-center text-sm text-gray-500">Loading visitor logs...</div>
                      </TableCell>
                    </TableRow>
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <div className="py-8 text-center text-sm text-gray-500">No logs found</div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map(row => (
                      <TableRow key={row.visitorlogs_id}>
                        <TableCell>{row.visitorlogs_id}</TableCell>
                        <TableCell className="font-medium flex items-center gap-2">
                          <UserRound className="h-4 w-4" /> {row.visitorlogs_visitorname || '—'}
                        </TableCell>
                        <TableCell>{row.visitorlogs_purpose || '—'}</TableCell>
                        <TableCell>{row.visitorlogs_checkin_time ? new Date(row.visitorlogs_checkin_time).toLocaleString() : '—'}</TableCell>
                        <TableCell>{row.visitorlogs_checkout_time ? new Date(row.visitorlogs_checkout_time).toLocaleString() : '—'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(getStatusNameById(row.visitorapproval_id))}>
                            {getStatusNameById(row.visitorapproval_id)}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.booking_id ?? '—'}</TableCell>
                        <TableCell>{row.employee_id ?? '—'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(row)} className="gap-1">
                              <Pencil className="h-3 w-3" /> Edit
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setRowStatus(row, 'Approved')} className="gap-1">
                              <CheckCircle className="h-3 w-3" /> Approve
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setRowStatus(row, 'Rejected')} className="gap-1">
                              <XCircle className="h-3 w-3" /> Reject
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setCheckoutNow(row)} className="gap-1">
                              <LogOut className="h-3 w-3" /> Check-Out
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) resetForm() }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingLog ? 'Edit Visitor Log' : 'Add Visitor Log'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block">Visitor Name</Label>
              <Input value={formVisitorName} onChange={(e) => setFormVisitorName(e.target.value)} placeholder="Enter visitor name" />
            </div>
            <div>
              <Label className="mb-1 block">Purpose</Label>
              <Input value={formPurpose} onChange={(e) => setFormPurpose(e.target.value)} placeholder="Enter purpose" />
            </div>
            <div>
              <Label className="mb-1 block">Check-in</Label>
              <Input type="datetime-local" value={formCheckin} onChange={(e) => setFormCheckin(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1 block">Check-out</Label>
              <Input type="datetime-local" value={formCheckout} onChange={(e) => setFormCheckout(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1 block">Status</Label>
              <Select value={String(formStatusId)} onValueChange={(v) => setFormStatusId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {approvals.map(st => (
                    <SelectItem key={st.visitorapproval_id} value={String(st.visitorapproval_id)}>
                      {st.visitorapproval_status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Booking (optional)</Label>
              <Input type="number" value={formBookingId} onChange={(e) => setFormBookingId(e.target.value)} placeholder="Enter booking ID" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm() }}>Cancel</Button>
            <Button onClick={submitLog}>{editingLog ? 'Save Changes' : 'Add Log'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminVisitorsLog