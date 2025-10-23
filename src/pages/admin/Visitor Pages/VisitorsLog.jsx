import React, { useEffect, useState, useMemo, useCallback } from 'react'
import AdminHeader from '../components/AdminHeader'
import axios from 'axios'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
// Removed Dialog import; using custom modal
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from '@/components/ui/alert-dialog'
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
import { Textarea } from '@/components/ui/textarea'
import { useNavigate, useLocation } from 'react-router-dom'
import ChooseBookForVisitor from './ChooseBookForVisitor'
import VisitorModal from './VisitorModal'
// Removed chart imports per request
// import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
// import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Cell } from 'recharts'

const CustomModal = ({ open, onOpenChange, contentClassName, children }) => {
  React.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onOpenChange?.(false)
      }
    }
    if (open) document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
      <div className={`relative z-50 ${contentClassName || 'bg-background border border-border rounded-xl shadow-2xl p-4'}`}>
        {children}
      </div>
    </div>
  )
}

function AdminVisitorsLog() {
  const APIConn = useMemo(() => `${localStorage.url}admin.php`, [])

  const navigate = useNavigate()
  const location = useLocation()

  // Data states
  const [logs, setLogs] = useState([])
  const [approvals, setApprovals] = useState([]) // [{visitorapproval_id, visitorapproval_status}]
  const [filteredLogs, setFilteredLogs] = useState([])

  // UI states
  const [loading, setLoading] = useState(true)
  // const [statsLoading, setStatsLoading] = useState(true) // removed: not used
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Role detection (Admin vs Front-Desk)
  const rawType = (localStorage.getItem('userType') || '').toLowerCase().replace(/[\s_-]/g, '')
  const rawLevel = (localStorage.getItem('userLevel') || '').toLowerCase().replace(/[\s_-]/g, '')
  const normalizedRole = rawLevel || rawType
  const isAdmin = normalizedRole === 'admin'
  const isFrontDesk = normalizedRole === 'frontdesk'

  // UI states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // visitorapproval_id or 'all'
  const [dateFrom, setDateFrom] = useState('') // yyyy-MM-dd
  const [dateTo, setDateTo] = useState('')
  const [totalRange, setTotalRange] = useState('day')

  // Modal (Add/Edit)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLog, setEditingLog] = useState(null) // row object or null
  const [formVisitorName, setFormVisitorName] = useState('')
  const [formPurpose, setFormPurpose] = useState('')
  const [formCheckin, setFormCheckin] = useState('')
  const [formCheckout, setFormCheckout] = useState('')
  const [formStatusId, setFormStatusId] = useState('')
  const [formBookingRoomId, setFormBookingRoomId] = useState('')
  const [formBookingCustomerName, setFormBookingCustomerName] = useState('')
  
  // Add flow states
  const [addStep, setAddStep] = useState(1)
  const [bookingRooms, setBookingRooms] = useState([])
  const [activeVisitorsMap, setActiveVisitorsMap] = useState({})
  const [visitorNames, setVisitorNames] = useState([])
  const [newVisitorName, setNewVisitorName] = useState('')
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false)
  const [editingVisitorIndex, setEditingVisitorIndex] = useState(null)
  const [visitorModalInitialName, setVisitorModalInitialName] = useState('')
  const [visitorModalMode, setVisitorModalMode] = useState('add')
  const [isChooseRoomOpen, setIsChooseRoomOpen] = useState(false)
  // Remembered capacity snapshot when a room is selected
  const [selectedRoomSnapshot, setSelectedRoomSnapshot] = useState(null)
  const [rememberedMaxCapacity, setRememberedMaxCapacity] = useState(null)
  const [rememberedCurrentOccupancy, setRememberedCurrentOccupancy] = useState(null)
  
  // Booking preview modal state
  const [bookingPreviewOpen, setBookingPreviewOpen] = useState(false)
  const [bookingPreviewLoading, setBookingPreviewLoading] = useState(false)
  const [bookingPreview, setBookingPreview] = useState(null)
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false)
  const [leaveCountdown, setLeaveCountdown] = useState(3)
  const [leaveConfirmEnabled, setLeaveConfirmEnabled] = useState(false)
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  
  // Helpers
  const getStatusNameById = useCallback((id) => {
    const found = approvals.find(a => String(a.visitorapproval_id) === String(id))
    return found?.visitorapproval_status || 'Unknown'
  }, [approvals])

  const getStatusIdByName = useCallback((targetStatusName) => {
    const target = approvals.find(a => (a.visitorapproval_status || '').toLowerCase().includes(String(targetStatusName).toLowerCase()))
    return target?.visitorapproval_id || ''
  }, [approvals])

  const nowLocalDT = useCallback(() => {
    const d = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const mi = pad(d.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
  }, [])

  const getStatusColor = useCallback((statusName) => {
    const s = (statusName || '').toLowerCase()
    if (s.includes('pending')) return 'bg-yellow-500/15 text-yellow-700 border border-yellow-300'
    if (s.includes('approved')) return 'bg-green-500/15 text-green-700 border border-green-300'
    if (s.includes('rejected') || s.includes('declined')) return 'bg-red-500/15 text-red-700 border border-red-300'
    if (s.includes('left')) return 'bg-indigo-500/15 text-indigo-700 border border-indigo-300'
    if (s.includes('checked-out') || s.includes('checkout')) return 'bg-gray-500/15 text-gray-700 border border-gray-300'
    return 'bg-blue-500/15 text-blue-700 border border-blue-300'
  }, [])

  const canChangeStatus = useCallback((row) => {
    const name = getStatusNameById(row?.visitorapproval_id).toLowerCase()
    return name.includes('pending') || name.includes('approved')
  }, [getStatusNameById])

  // Disable actions after visitor has left or been checked-out
  const hasLeft = useCallback((row) => {
    const statusName = (getStatusNameById(row?.visitorapproval_id) || '').toLowerCase()
    return !!row?.visitorlogs_checkout_time || statusName.includes('left') || statusName.includes('checked-out') || statusName.includes('checkout')
  }, [getStatusNameById])

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
      fd.append('method', 'getVisitorLogs')
      const res = await axios.post(APIConn, fd)
      const list = Array.isArray(res.data) ? res.data : []
      const normalized = list.map(item => ({
        visitorlogs_id: item.visitorlogs_id ?? item.id ?? '',
        visitorapproval_id: item.visitorapproval_id ?? item.status_id ?? null,
        booking_room_id: item.booking_room_id ?? item.booking_id ?? null,
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

   useEffect(() => {
     let t1, t2
     if (leaveConfirmOpen) {
       setLeaveConfirmEnabled(false)
       setLeaveCountdown(3)
       t2 = setInterval(() => setLeaveCountdown(c => (c > 0 ? c - 1 : 0)), 1000)
       t1 = setTimeout(() => setLeaveConfirmEnabled(true), 3000)
     }
     return () => {
       clearTimeout(t1)
       clearInterval(t2)
     }
   }, [leaveConfirmOpen])
 
   const applyFilters = useCallback(() => {
     let result = [...logs]
     // Search
     if (searchTerm) {
       const term = searchTerm.toLowerCase()
       result = result.filter(r => (
         (r.visitorlogs_visitorname || '').toLowerCase().includes(term) ||
         (r.visitorlogs_purpose || '').toLowerCase().includes(term) ||
         String(r.booking_room_id || '').includes(term)
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
       const toEnd = new Date(to)
       toEnd.setHours(23, 59, 59, 999)
       result = result.filter(r => {
         const d = r.visitorlogs_checkin_time ? new Date(r.visitorlogs_checkin_time) : null
         return d ? d <= toEnd : false
       })
     }
     setFilteredLogs(result)
   }, [logs, searchTerm, statusFilter, dateFrom, dateTo])
 
   const handleRefresh = useCallback(() => {
      fetchApprovals()
      fetchLogs()
    }, [fetchApprovals, fetchLogs])

  // If navigated back from booking room selection for visitors, prefill and auto-open
  useEffect(() => {
    if (location.state?.openVisitorModal) {
      const selRooms = location.state?.selectedBookingRooms
      const selRoom = location.state?.selectedBookingRoom || (Array.isArray(selRooms) && selRooms[0])
      if (selRoom?.booking_room_id) {
        setFormBookingRoomId(String(selRoom.booking_room_id))
      }
      if (selRoom?.customer_name) {
        setFormBookingCustomerName(selRoom.customer_name)
      }
      // Remember capacity snapshot from navigation
      if (selRoom) {
        setSelectedRoomSnapshot(selRoom)
        setRememberedMaxCapacity(Number(selRoom?.max_capacity ?? selRoom?.roomtype_capacity ?? 0))
        const baseAdults = Number(selRoom?.bookingRoom_adult ?? selRoom?.booking_room_adult ?? selRoom?.booking_adult ?? 0)
        const baseChildren = Number(selRoom?.bookingRoom_children ?? selRoom?.booking_room_children ?? selRoom?.booking_children ?? 0)
        setRememberedCurrentOccupancy(baseAdults + baseChildren)
      }
      setIsDialogOpen(true)
    }
  }, [location.state])

  useEffect(() => {
     applyFilters()
   }, [applyFilters])
 
   const clearFilters = useCallback(() => {
     setSearchTerm('')
     setStatusFilter('all')
     setDateFrom('')
     setDateTo('')
   }, [])
 
   const resetForm = () => {
    setEditingLog(null)
    setFormVisitorName('')
    setFormPurpose('')
    setFormCheckin('')
    setFormCheckout('')
    setFormStatusId('')
    setFormBookingRoomId('')
    setFormBookingCustomerName('')
    setVisitorNames([])
    setNewVisitorName('')
    setIsVisitorModalOpen(false)
    setEditingVisitorIndex(null)
    setVisitorModalInitialName('')
    setVisitorModalMode('add')
    // Clear remembered capacity snapshot
    setSelectedRoomSnapshot(null)
    setRememberedMaxCapacity(null)
    setRememberedCurrentOccupancy(null)
  }

  // Quick helpers for better form UX
  const setCheckinNowInForm = useCallback(() => {
    setFormCheckin(nowLocalDT())
  }, [nowLocalDT])
  const setCheckoutNowInForm = useCallback(() => {
    setFormCheckout(nowLocalDT())
  }, [nowLocalDT])
  const clearCheckinInForm = useCallback(() => {
    setFormCheckin('')
  }, [])
  const clearCheckoutInForm = useCallback(() => {
    setFormCheckout('')
  }, [])
  const quickSetStatus = useCallback((name) => {
    const id = getStatusIdByName(name)
    if (id) setFormStatusId(String(id))
  }, [getStatusIdByName])
  const isPendingSelected = useMemo(
    () => getStatusNameById(formStatusId) === 'Pending',
    [formStatusId, getStatusNameById]
  )
  /* removed duplicate isFormValid; see capacity-aware version below */

  // Limit status options to IDs 1 and 3 (Approved, Pending)
  const statusOptions13 = useMemo(
    () => approvals.filter(a => ['1', '3'].includes(String(a.visitorapproval_id))),
    [approvals]
  )
  const bookingDisplayLabel = useMemo(() => {
    const idStr = String(formBookingRoomId || '').trim()
    if (!idStr) return ''
    const nameStr = String(formBookingCustomerName || '').trim()
    return nameStr ? `${idStr} — ${nameStr}` : idStr
  }, [formBookingRoomId, formBookingCustomerName])
  // Derived selection data and capacity calculations
  const selectedBookingRoomObj = useMemo(() => (
    bookingRooms.find(r => String(r.booking_room_id) === String(formBookingRoomId))
  ), [bookingRooms, formBookingRoomId])
  const maxCapacity = useMemo(() => {
    if (rememberedMaxCapacity != null) return Number(rememberedMaxCapacity || 0)
    return Number(selectedBookingRoomObj?.max_capacity ?? selectedBookingRoomObj?.roomtype_capacity ?? 0)
  }, [rememberedMaxCapacity, selectedBookingRoomObj])
  const currentOccupancy = useMemo(() => {
    if (rememberedCurrentOccupancy != null) return Number(rememberedCurrentOccupancy || 0)
    const adults = Number(selectedBookingRoomObj?.bookingRoom_adult || 0)
    const children = Number(selectedBookingRoomObj?.bookingRoom_children || 0)
    const act = Number(activeVisitorsMap[String(selectedBookingRoomObj?.booking_room_id)] || 0)
    return adults + children + act
  }, [rememberedCurrentOccupancy, selectedBookingRoomObj, activeVisitorsMap])
  const remainingCapacity = useMemo(() => (
    Math.max(0, maxCapacity - currentOccupancy)
  ), [maxCapacity, currentOccupancy])
  const isCapacityConfigured = useMemo(() => maxCapacity > 0, [maxCapacity])
  // Keep remembered current occupancy in sync with active visitors map
  useEffect(() => {
    if (selectedRoomSnapshot?.booking_room_id) {
      const baseAdults = Number(selectedRoomSnapshot?.bookingRoom_adult ?? selectedRoomSnapshot?.booking_room_adult ?? selectedRoomSnapshot?.booking_adult ?? 0)
      const baseChildren = Number(selectedRoomSnapshot?.bookingRoom_children ?? selectedRoomSnapshot?.booking_room_children ?? selectedRoomSnapshot?.booking_children ?? 0)
      const act = Number(activeVisitorsMap[String(selectedRoomSnapshot?.booking_room_id)] || 0)
      setRememberedCurrentOccupancy(baseAdults + baseChildren + act)
    }
  }, [selectedRoomSnapshot, activeVisitorsMap])
  // Form validity includes capacity constraints for add flow
  const isFormValid = useMemo(() => {
    if (editingLog) {
      // Edit flow still uses single visitor name
      const baseValidEdit = Boolean(
        formVisitorName.trim() &&
        formPurpose.trim() &&
        (isPendingSelected || formCheckin)
      )
      return baseValidEdit && String(formBookingRoomId).trim()
    }

    const roomSelected = String(formBookingRoomId).trim()
    const namesFilled = visitorNames.length >= 1 && visitorNames.every(n => String(n || '').trim())
    const capacityOk = isCapacityConfigured ? visitorNames.length <= Number(remainingCapacity) : true
    const baseValidAdd = Boolean(
      namesFilled &&
      formPurpose.trim() &&
      (isPendingSelected || formCheckin)
    )
    return baseValidAdd && roomSelected && capacityOk
  }, [visitorNames, remainingCapacity, isCapacityConfigured, formPurpose, formCheckin, isPendingSelected, editingLog, formVisitorName, formBookingRoomId])

  const handleNavigateToBookingRoomSelection = () => {
    navigate('/admin/choosebookforvisitor', { state: { origin: 'visitorslog' } })
  }


  // Fetch booking rooms and active visitors for step 1 capacity calc
  const fetchBookingRoomsForStep = useCallback(async () => {
    try {
      const fd = new FormData()
      fd.append('method', 'get_booking_rooms')
      const res = await axios.post(APIConn, fd)
      const arr = Array.isArray(res.data) ? res.data : []
      const normalized = arr.map(item => ({
        ...item,
        max_capacity: item.max_capacity ?? item.roomtype_capacity ?? 0,
        bookingRoom_adult: item.bookingRoom_adult ?? item.booking_room_adult ?? item.booking_adult ?? 0,
        bookingRoom_children: item.bookingRoom_children ?? item.booking_room_children ?? item.booking_children ?? 0,
      }))
      setBookingRooms(normalized)
    } catch (err) {
      console.error('Failed to fetch booking rooms', err)
      setBookingRooms([])
    }
  }, [APIConn])
  const fetchActiveVisitorsForStep = useCallback(async () => {
    try {
      const fd = new FormData()
      fd.append('method', 'getVisitorLogs')
      const res = await axios.post(APIConn, fd)
      const list = Array.isArray(res.data) ? res.data : []
      const map = {}
      list.forEach(v => {
        const key = String(v.booking_room_id || v.booking_id || '')
        const isActive = !v.visitorlogs_checkout_time
        if (key && isActive) map[key] = (map[key] || 0) + 1
      })
      setActiveVisitorsMap(map)
    } catch (err) {
      console.error('Failed to compute active visitors map', err)
      setActiveVisitorsMap({})
    }
  }, [APIConn])

  const openAddDialog = () => {
    resetForm()
    setAddStep(1)
    setVisitorNames([])
    setNewVisitorName('')
    // Defaults for better UX
    setFormCheckin(nowLocalDT())
    const approvedId = getStatusIdByName('Approved')
    if (approvedId) setFormStatusId(String(approvedId))
    // Prefill booking from navigation state if user came back from selection
    const selRooms = location.state?.selectedBookingRooms
    const selRoom = location.state?.selectedBookingRoom || (Array.isArray(selRooms) && selRooms[0])
    if (selRoom?.booking_room_id) {
      setFormBookingRoomId(String(selRoom.booking_room_id))
      setFormBookingCustomerName(selRoom.customer_name || '')
      // Snapshot the room and remember its capacities
      setSelectedRoomSnapshot(selRoom)
      setRememberedMaxCapacity(Number(selRoom?.max_capacity ?? selRoom?.roomtype_capacity ?? 0))
      const baseAdults = Number(selRoom?.bookingRoom_adult ?? selRoom?.booking_room_adult ?? selRoom?.booking_adult ?? 0)
      const baseChildren = Number(selRoom?.bookingRoom_children ?? selRoom?.booking_room_children ?? selRoom?.booking_children ?? 0)
      const act = Number(activeVisitorsMap[String(selRoom?.booking_room_id)] || 0)
      setRememberedCurrentOccupancy(baseAdults + baseChildren + act)
    }
    // Load rooms and active visitors for step 1
    fetchBookingRoomsForStep()
    fetchActiveVisitorsForStep()
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
    setFormBookingRoomId(row.booking_room_id ? String(row.booking_room_id) : '')
    setIsDialogOpen(true)
  }

  const submitLog = async () => {
    try {
      // Basic validation for better UX
      if (!String(formBookingRoomId).trim()) { toast.error('Booking Room ID is required'); return }

      if (editingLog) {
        if (!formVisitorName.trim()) { toast.error('Visitor name is required'); return }
        if (!formPurpose.trim()) { toast.error('Purpose is required'); return }
        if (!isPendingSelected && !formCheckin) { toast.error('Check-in time is required'); return }
        // Prevent reverting status to Pending when editing an already non-pending entry
        const selectedName = (getStatusNameById(formStatusId) || '').toLowerCase()
        const currentName = (getStatusNameById(editingLog.visitorapproval_id) || '').toLowerCase()
        if (!currentName.includes('pending') && selectedName.includes('pending')) {
          toast.error('You cannot revert status back to Pending')
          return
        }
        const fd = new FormData()
        fd.append('method', 'updateVisitorLog')
        fd.append('visitorlogs_id', editingLog.visitorlogs_id)
        fd.append('visitorlogs_visitorname', formVisitorName)
        fd.append('visitorlogs_purpose', formPurpose)
        if (formCheckout) fd.append('visitorlogs_checkout_time', formCheckout.replace('T', ' ') + ':00')
        const statusToSend = formStatusId || String(getStatusIdByName('Approved') || '')
        if (statusToSend) fd.append('visitorapproval_id', statusToSend)
        // Ensure backend receives correct booking identifier
        const bookingIdToSend = String(editingLog.booking_id || selectedBookingRoomObj?.booking_id || selectedRoomSnapshot?.booking_id || '')
        const bookingRoomIdToSend = String(editingLog.booking_room_id || selectedBookingRoomObj?.booking_room_id || selectedRoomSnapshot?.booking_room_id || '')
        if (bookingIdToSend) fd.append('booking_id', bookingIdToSend)
        if (bookingRoomIdToSend) fd.append('booking_room_id', bookingRoomIdToSend)
        const employeeId = localStorage.getItem('userId')
        if (employeeId) fd.append('employee_id', employeeId)
        console.group('VisitorsLog:updateVisitorLog')
        console.log('POST', APIConn)
        console.log('payload', Object.fromEntries([...fd.entries()]))
        const res = await axios.post(APIConn, fd)
        console.log('response', res?.data)
        console.groupEnd()
        const ok = res.data?.response === true || res.data?.success === true
        if (ok) {
          toast.success('Visitor log updated')
          setIsDialogOpen(false)
          resetForm()
          navigate(location.pathname, { replace: true, state: {} })
          fetchLogs()
        } else {
          toast.error(res.data?.message || 'Failed to save visitor log')
        }
        return
      }

      // Add flow: bulk-insert respecting capacity and dynamic names
      if (!formPurpose.trim()) { toast.error('Purpose is required'); return }
      if (!isPendingSelected && !formCheckin) { toast.error('Check-in time is required'); return }
      const names = visitorNames.map(n => String(n || '').trim())
      if (!names.length) { toast.error('Please add at least one visitor'); return }
      if (!names.every(Boolean)) { toast.error('Please fill all visitor names'); return }
      if (isCapacityConfigured && names.length > Number(remainingCapacity || 0)) {
        toast.error('Exceeded the amount of visitors')
        return
      }
      const limit = isCapacityConfigured ? Math.min(names.length, Number(remainingCapacity || 0)) : names.length

      let successCount = 0
      for (let i = 0; i < limit; i++) {
        const fd = new FormData()
        fd.append('method', 'addVisitorLog')
        fd.append('visitorlogs_visitorname', names[i])
        fd.append('visitorlogs_purpose', formPurpose)
        if (formCheckin) fd.append('visitorlogs_checkin_time', formCheckin.replace('T', ' ') + ':00')
        const statusToSend = formStatusId || String(getStatusIdByName('Approved') || '')
        if (statusToSend) fd.append('visitorapproval_id', statusToSend)
        // Send correct booking identifiers
        const bookingIdToSend = String(selectedBookingRoomObj?.booking_id || selectedRoomSnapshot?.booking_id || '')
        const bookingRoomIdToSend = String(selectedBookingRoomObj?.booking_room_id || selectedRoomSnapshot?.booking_room_id || formBookingRoomId || '')
        if (bookingIdToSend) fd.append('booking_id', bookingIdToSend)
        if (bookingRoomIdToSend) fd.append('booking_room_id', bookingRoomIdToSend)
        const employeeId = localStorage.getItem('userId')
        if (employeeId) fd.append('employee_id', employeeId)
        console.group(`VisitorsLog:addVisitorLog #${i+1}`)
        console.log('POST', APIConn)
        console.log('payload', Object.fromEntries([...fd.entries()]))
        const res = await axios.post(APIConn, fd)
        console.log('response', res?.data)
        console.groupEnd()
        const ok = res.data?.response === true || res.data?.success === true
        if (ok) successCount++
      }
      if (successCount > 0) {
        toast.success(`Added ${successCount} visitor log${successCount > 1 ? 's' : ''}`)
        setIsDialogOpen(false)
        resetForm()
        navigate(location.pathname, { replace: true, state: {} })
        fetchLogs()
      } else {
        toast.error('Failed to save visitor log(s)')
      }
    } catch (err) {
      console.error('Error saving visitor log:', err)
      toast.error('Error saving visitor log')
    }
  }

  const setRowStatus = async (row, targetStatusName) => {
    try {
      if (!canChangeStatus(row)) {
        toast.error('Status changes are allowed only for Pending or Approved entries')
        return
      }
      // Normalize common synonyms to match backend statuses
      const normalized = (() => {
        const n = (targetStatusName || '').toLowerCase()
        if (n.includes('reject')) return 'declined'
        if (n.includes('decline')) return 'declined'
        if (n.includes('approve')) return 'approved'
        if (n.includes('left')) return 'left'
        if (n.includes('check-out') || n.includes('checked-out')) return 'checked-out'
        if (n.includes('cancel')) return 'cancelled'
        if (n.includes('pend')) return 'pending'
        return n
      })()
      // Find status id by normalized name (case-insensitive contains)
      const target = approvals.find(a => (a.visitorapproval_status || '').toLowerCase().includes(normalized))
      if (!target) {
        toast.error(`Status "${targetStatusName}" not found. Please use Edit to set a status.`)
        return
      }
      const fd = new FormData()
      fd.append('method', 'setVisitorApproval')
      fd.append('visitorlogs_id', row.visitorlogs_id)
      fd.append('visitorapproval_id', target.visitorapproval_id)
      console.group('VisitorsLog:setVisitorApproval')
      console.log('POST', APIConn)
      console.log('row', row)
      console.log('target_status', target)
      console.log('payload', Object.fromEntries([...fd.entries()]))
      const res = await axios.post(APIConn, fd)
      console.log('response', res?.data)
      console.groupEnd()
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
      fd.append('method', 'updateVisitorLog')
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

      console.group('VisitorsLog:updateVisitorLog:checkout')
      console.log('POST', APIConn)
      console.log('row', row)
      console.log('payload', Object.fromEntries([...fd.entries()]))
      const res = await axios.post(APIConn, fd)
      console.log('response', res?.data)
      console.groupEnd()
      const ok = res.data?.response === true || res.data?.success === true
      if (ok) {
        if (canChangeStatus(row)) {
          const leftStatus = approvals.find(a => (a.visitorapproval_status || '').toLowerCase().includes('left'))
          const checkedOutStatus = approvals.find(a => (a.visitorapproval_status || '').toLowerCase().includes('checked-out'))
          const nextStatus = leftStatus || checkedOutStatus
          if (nextStatus) {
            const fd2 = new FormData()
            fd2.append('method', 'setVisitorApproval')
            fd2.append('visitorlogs_id', row.visitorlogs_id)
            fd2.append('visitorapproval_id', nextStatus.visitorapproval_id)
            console.group('VisitorsLog:setVisitorApproval:autoAfterCheckout')
            console.log('POST', APIConn)
            console.log('row', row)
            console.log('next_status', nextStatus)
            console.log('payload', Object.fromEntries([...fd2.entries()]))
            const res2 = await axios.post(APIConn, fd2)
            console.log('response', res2?.data)
            console.groupEnd()
          }
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

  const saveAndSetStatus = useCallback(async (targetName) => {
    // Prevent approving without required info
    if ((targetName || '').toLowerCase().includes('approve')) {
      if (!formVisitorName.trim()) { toast.error('Visitor name is required before approval'); return }
      if (!String(formBookingRoomId).trim()) { toast.error('Booking Room ID is required before approval'); return }
    }
    const current = editingLog
    await submitLog()
    if (current) {
      await setRowStatus(current, targetName)
    }
  }, [editingLog, submitLog, setRowStatus, formVisitorName, formBookingRoomId])

  const saveAndLeave = useCallback(async () => {
    const current = editingLog
    await submitLog()
    if (current) {
      await setCheckoutNow(current)
    }
    setLeaveConfirmOpen(false)
  }, [editingLog, submitLog, setCheckoutNow])

  const confirmCancel = useCallback(async () => {
    const current = editingLog
    if (!current) { setCancelConfirmOpen(false); return }
    await setRowStatus(current, 'Cancelled')
    setCancelConfirmOpen(false)
    setIsDialogOpen(false)
    resetForm()
    navigate(location.pathname, { replace: true, state: {} })
  }, [editingLog, setRowStatus, navigate])

  // In-component helper: open booking preview modal with details
  const openBookingPreview = useCallback(async (row) => {
    try {
      setBookingPreviewOpen(true)
      setBookingPreviewLoading(true)
      setBookingPreview(null)

      // Query booking rooms and show details by booking_room_id
      const fd2 = new FormData()
      fd2.append('method', 'get_tbl_booking_room')
      const res2 = await axios.post(APIConn, fd2)
      const rooms = Array.isArray(res2.data) ? res2.data : []
      const bookingRoom = rooms.find(r => String(r.booking_room_id) === String(row.booking_room_id))

      if (!bookingRoom) {
        toast.info('No booking room details found for this log')
        setBookingPreview({ reference_no: '—', name: '—', room_numbers: '—', purpose: row.visitorlogs_purpose || '—' })
        setBookingPreviewLoading(false)
        return
      }

      const reference_no = bookingRoom.reference_no || '—'
      const name = bookingRoom.customer_name || 'Walk-In'
      const room_numbers = bookingRoom.roomnumber_id ? String(bookingRoom.roomnumber_id) : (bookingRoom.room_numbers ? String(bookingRoom.room_numbers) : '—')
      const purpose = row.visitorlogs_purpose || '—'
      setBookingPreview({ reference_no, name, room_numbers, purpose })
      setBookingPreviewLoading(false)
    } catch (err) {
      console.error('Error opening booking preview:', err)
      toast.error('Failed to load booking details')
      setBookingPreview({ reference_no: '—', name: '—', room_numbers: '—', purpose: row.visitorlogs_purpose || '—' })
      setBookingPreviewLoading(false)
    }
  }, [APIConn])

  // Derived stats
  const stats = useMemo(() => {
    const counts = { total: logs.length, pending: 0, approved: 0, rejected: 0, checked_out: 0, left: 0 }
    logs.forEach(r => {
      const name = getStatusNameById(r.visitorapproval_id).toLowerCase()
      if (name.includes('pending')) counts.pending++
      else if (name.includes('approved')) counts.approved++
      else if (name.includes('rejected') || name.includes('declined')) counts.rejected++
      else if (name.includes('left')) counts.left++
      else if (name.includes('checked-out') || name.includes('checkout')) counts.checked_out++
    })
    return counts
  }, [logs, getStatusNameById])

  const totalLogsInRange = useMemo(() => {
    const now = new Date()
    let start = new Date(now)
    const end = new Date(now)
    end.setHours(23, 59, 59, 999)
    if (totalRange === 'day') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    } else if (totalRange === 'week') {
      start = new Date(now)
      start.setDate(now.getDate() - 6)
      start.setHours(0, 0, 0, 0)
    } else if (totalRange === 'month') {
      start = new Date(now)
      start.setDate(now.getDate() - 29)
      start.setHours(0, 0, 0, 0)
    } else if (totalRange === 'year') {
      start = new Date(now)
      start.setFullYear(now.getFullYear() - 1)
      start.setHours(0, 0, 0, 0)
    }
    return logs.filter(r => {
      const dt = r.visitorlogs_checkin_time ? new Date(r.visitorlogs_checkin_time) : null
      if (!(dt && dt >= start && dt <= end)) return false
      const statusName = getStatusNameById(r.visitorapproval_id).toLowerCase()
      return statusName.includes('approved') || statusName.includes('pending')
    }).length
  }, [logs, totalRange, getStatusNameById])

  // Chart removed per request
  // Horizontal bar chart data for visitor statuses
  // const statusBarData = useMemo(() => (
  //   [
  //     { name: 'Pending', value: stats.pending },
  //     { name: 'Approved', value: stats.approved },
  //     { name: 'Rejected', value: stats.rejected },
  //     { name: 'Left', value: stats.left },
  //   ]
  // ), [stats])
  // const statusColors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)']

  return (
    <div className="min-h-screen w-full">
      {/* Pass onCollapse so content can offset for the fixed Sidebar */}
      <AdminHeader onCollapse={setIsCollapsed} />
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-0' : 'lg:ml-72'} px-4 md-px-6 lg:px-8 py-4`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Visitors Log</h2>
          <div className="flex gap-2">
            <Button variant="default" onClick={handleRefresh} className="gap-2">
              <Clock className="h-4 w-4" /> Refresh
            </Button>
            <Button onClick={openAddDialog} className="gap-2">
              <Plus className="h-4 w-4" /> Add Visitor Log
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card className="bg-muted/30 border-border">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-foreground">Total Logs</CardTitle>
                <Select value={String(totalRange)} onValueChange={(v) => setTotalRange(v)}>
                  <SelectTrigger className="h-8 w-[110px] bg-muted/30 border-border">
                    <SelectValue placeholder="Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="py-3"><div className="text-2xl font-bold">{totalLogsInRange}</div></CardContent>
          </Card>
          <Card className="bg-muted/30 border-border">
            <CardHeader className="py-3"><CardTitle className="text-sm text-foreground">Pending</CardTitle></CardHeader>
            <CardContent className="py-3"><div className="text-2xl font-bold text-yellow-600">{stats.pending}</div></CardContent>
          </Card>
          <Card className="bg-muted/30 border-border">
            <CardHeader className="py-3"><CardTitle className="text-sm text-foreground">Approved</CardTitle></CardHeader>
            <CardContent className="py-3"><div className="text-2xl font-bold text-green-600">{stats.approved}</div></CardContent>
          </Card>
          {/* Removed Checked-Out card as per new requirement */}
          {/*
          <Card className="bg-muted/30 border-border">
            <CardHeader className="py-3"><CardTitle className="text-sm">Checked-Out</CardTitle></CardHeader>
            <CardContent className="py-3"><div className="text-2xl font-bold text-gray-600">{stats.checked_out}</div></CardContent>
          </Card>
          */}
          <Card className="bg-muted/30 border-border">
            <CardHeader className="py-3"><CardTitle className="text-sm text-foreground">Left</CardTitle></CardHeader>
            <CardContent className="py-3"><div className="text-2xl font-bold text-indigo-600">{stats.left}</div></CardContent>
          </Card>
        </div>


        {/* Filters */}
        <Card className="mb-4 bg-muted/20 border-border">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="flex items-center gap-2 md:col-span-2">
                <Search className="h-4 w-4" />
                <Input className="bg-muted/30 border-border" placeholder="Search visitor, purpose, booking room id" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1 block">Status</Label>
                <Select value={String(statusFilter)} onValueChange={(v) => setStatusFilter(v)}>
                  <SelectTrigger className="w-full bg-muted/30 border-border">
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
                <Label className="mb-1 block">From</Label>
                <Input className="bg-muted/30 border-border" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1 block">To</Label>
                <div className="flex gap-2">
                  <Input className="bg-muted/30 border-border" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                  <Button variant="outline" onClick={clearFilters}>Clear</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-muted/20 border-border">
          <CardContent className="py-0">
            <ScrollArea className="w-full max-h-[60vh]">
              <Table>
                <TableHeader className="sticky top-0 z-10">
                  <TableRow className="bg-muted/40">
                    {/* Removed ID column globally */}
                    <TableHead>Visitor</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Booking Room</TableHead>
                    {isAdmin && (<TableHead>Employee</TableHead>)}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`sk-${i}`}>
                        <TableCell><div className="h-4 w-40 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell><div className="h-4 w-56 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell><div className="h-4 w-40 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell><div className="h-4 w-40 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell><div className="h-6 w-24 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                        {isAdmin && (<TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>)}
                        <TableCell className="text-right"><div className="h-6 w-40 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 8 : 7}>
                        <div className="py-8 text-center text-sm text-muted-foreground">No logs found. Try adjusting filters or adding a new visitor log.</div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map(row => (
                      <TableRow key={row.visitorlogs_id}>
                        {/* Removed ID cell globally */}
                        <TableCell className="font-medium flex items-center gap-2">
                          <UserRound className="h-4 w-4" /> {row.visitorlogs_visitorname || '—'}
                        </TableCell>
                        <TableCell className="max-w-[280px] truncate">{row.visitorlogs_purpose || '—'}</TableCell>
                        <TableCell>{row.visitorlogs_checkin_time ? new Date(row.visitorlogs_checkin_time).toLocaleString() : '—'}</TableCell>
                        <TableCell>{row.visitorlogs_checkout_time ? new Date(row.visitorlogs_checkout_time).toLocaleString() : '—'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(getStatusNameById(row.visitorapproval_id))}>
                            {getStatusNameById(row.visitorapproval_id)}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-24">
                          {row.booking_room_id ? (
                            <Button variant="link" className="p-0 h-auto text-primary" onClick={() => openBookingPreview(row)}>
                              {row.booking_room_id}
                            </Button>
                          ) : '—'}
                        </TableCell>
                        {isAdmin && (<TableCell className="w-20">{row.employee_id ?? '—'}</TableCell>)}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(row)} className="gap-1" disabled={hasLeft(row)} title={hasLeft(row) ? 'Visitor already left' : undefined}>More...</Button>
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

      {/* Add/Edit Modal */}
      <CustomModal open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) { resetForm(); navigate(location.pathname, { replace: true, state: {} }) } }} contentClassName="w-[95vw] sm:max-w-[900px] md:max-w-[1000px] lg:max-w-[1100px] bg-background border border-border rounded-xl shadow-2xl p-6 text-base md:text-lg">
        <div className="flex flex-col">
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <span>{editingLog ? 'Edit Visitor Log' : 'Add Visitor Log'}</span>
              {editingLog && (
                <Badge className={getStatusColor(getStatusNameById(editingLog.visitorapproval_id))}>
                  {getStatusNameById(editingLog.visitorapproval_id)}
                </Badge>
              )}
            </div>
            <p className="text-sm md:text-base text-muted-foreground">
              {editingLog ? `Log #${editingLog.visitorlogs_id}` : 'Create a new visitor entry. Fields marked * are required.'}
            </p>
          </div>

          {editingLog ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Row 1: Visitor Name and Check-in */}
              <div>
                <Label className="mb-1 block text-base md:text-lg">Visitor Name *</Label>
                <Input className="bg-muted/30 border-border" value={formVisitorName} onChange={(e) => setFormVisitorName(e.target.value)} placeholder="Enter visitor name" />
                <p className="text-sm md:text-base text-muted-foreground mt-1">Full name of the visitor.</p>
              </div>
              <div>
                <Label className="mb-1 block text-base md:text-lg">Check-in {isPendingSelected ? '' : '*'}*</Label>
                <div className="flex items-center gap-2">
                  <Input className="bg-muted/30 border-border" type="datetime-local" value={formCheckin} onChange={(e) => setFormCheckin(e.target.value)} disabled={!!editingLog} readOnly={!!editingLog} />
                  <Button type="button" variant="outline" size="sm" onClick={setCheckinNowInForm} disabled={isPendingSelected || !!editingLog}>Now</Button>
                  <Button type="button" variant="outline" size="sm" onClick={clearCheckinInForm} disabled={!!editingLog}>Reset</Button>
                </div>
              </div>
              {/* Row 2: Booking ID and Status */}
              <div>
                <Label className="mb-1 block text-base md:text-lg">Booking ID *(locked on edit)</Label>
                <div className="flex items-center gap-2">
                  <Input className="bg-muted/30 border-border" value={bookingDisplayLabel} readOnly={true} disabled={!!editingLog} placeholder="Select booking room" />
                </div>
              </div>
              <div>
                <Label className="mb-1 block text-base md:text-lg">Status *</Label>
                <Select value={String(formStatusId)} onValueChange={(v) => setFormStatusId(v)}>
                  <SelectTrigger className="w-full bg-muted/30 border-border">
                    <SelectValue placeholder="Approved or Pending only" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions13
                      .filter(st => {
                        if (editingLog) {
                          const currentName = (getStatusNameById(editingLog.visitorapproval_id) || '').toLowerCase()
                          const isCurrentPending = currentName.includes('pending')
                          const isItemPending = (st.visitorapproval_status || '').toLowerCase().includes('pending')
                          if (!isCurrentPending && isItemPending) return false
                        }
                        return true
                      })
                      .map(st => (
                        <SelectItem key={st.visitorapproval_id} value={String(st.visitorapproval_id)}>
                          {st.visitorapproval_status}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-sm md:text-base text-muted-foreground mt-1">Approved or Pending only.</p>
              </div>
              {/* Row 3: Purpose */}
              <div className="md:col-span-2">
                <Label className="mb-1 block text-base md:text-lg">Purpose *</Label>
                <Textarea className="bg-muted/30 border-border" value={formPurpose} onChange={(e) => setFormPurpose(e.target.value)} placeholder="Enter purpose of visit" />
                <p className="text-base md:text-lg text-muted-foreground mt-1">Brief description of the visitor's purpose.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                <Badge variant="outline" className={addStep === 1 ? 'bg-primary/10' : ''}>Step 1</Badge>
                <span>Select Booking Room</span>
                <span className="mx-2">→</span>
                <Badge variant="outline" className={addStep === 2 ? 'bg-primary/10' : ''}>Step 2</Badge>
                <span>Visitor Details</span>
                <span className="mx-2">→</span>
                <Badge variant="outline" className={addStep === 3 ? 'bg-primary/10' : ''}>Step 3</Badge>
                <span>Visit Details</span>
                <span className="mx-2">→</span>
                <Badge variant="outline" className={addStep === 4 ? 'bg-primary/10' : ''}>Step 4</Badge>
                <span>Summary</span>
              </div>
              {addStep === 1 && (
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label className="mb-1 block text-base md:text-lg">Booking Room *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-muted/30 border-border justify-start"
                      onClick={handleNavigateToBookingRoomSelection}
                    >
                      {bookingDisplayLabel || 'Choose a booking room'}
                    </Button>
                    {formBookingRoomId && (
                      <p className="text-sm md:text-base text-muted-foreground mt-1">
                        {isCapacityConfigured
                          ? <>Remaining capacity: {remainingCapacity} / {maxCapacity}. Occupied: {currentOccupancy}.</>
                          : <>No capacity configured. Occupied: {currentOccupancy}.</>}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {addStep === 2 && (
                <div className="grid grid-cols-1 gap-3">
                  {formBookingRoomId && (
                    <p className="text-sm md:text-base text-muted-foreground">
                      {isCapacityConfigured
                        ? <>Current total: {Number(currentOccupancy || 0) + visitorNames.length} / {maxCapacity}. Remaining: {Math.max(Number(maxCapacity || 0) - (Number(currentOccupancy || 0) + visitorNames.length), 0)}.</>
                        : <>No capacity configured. Occupied: {currentOccupancy}.</>}
                    </p>
                  )}

                  <div>
                    <Label className="mb-1 block text-base md:text-lg">Visitor List</Label>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visitorNames.length > 0 ? (
                          visitorNames.map((n, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="w-12">{idx + 1}</TableCell>
                              <TableCell>{String(n || '')}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setVisitorModalMode('edit')
                                    setEditingVisitorIndex(idx)
                                    setVisitorModalInitialName(String(n || ''))
                                    setIsVisitorModalOpen(true)
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="ml-2"
                                  onClick={() => {
                                    setVisitorNames(prev => prev.filter((_, i) => i !== idx))
                                  }}
                                >
                                  Remove
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              No visitors added yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <Label className="mb-1 block text-base md:text-lg">Visitor Name *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        className="bg-muted/30 border-border"
                        value={newVisitorName}
                        onChange={(e) => setNewVisitorName(e.target.value)}
                        placeholder="Enter visitor name"
                      />
                      <Button
                        type="button"
                        variant={(isCapacityConfigured && (Number(currentOccupancy || 0) + visitorNames.length) >= Number(maxCapacity || 0)) ? "destructive" : "outline"}
                        disabled={!String(newVisitorName || '').trim() || (isCapacityConfigured && (Number(currentOccupancy || 0) + visitorNames.length) >= Number(maxCapacity || 0))}
                        title={(isCapacityConfigured && (Number(currentOccupancy || 0) + visitorNames.length) >= Number(maxCapacity || 0)) ? "Capacity reached" : undefined}
                        onClick={() => {
                          const name = String(newVisitorName || '').trim()
                          if (!name) { toast.error('Please enter a visitor name'); return }
                          const capacityReached = isCapacityConfigured && (Number(currentOccupancy || 0) + visitorNames.length) >= Number(maxCapacity || 0)
                          if (capacityReached) { toast.error('Exceeded the amount of visitors'); return }
                          setVisitorNames(prev => [...prev, name])
                          setNewVisitorName('')
                        }}
                      >
                        {(isCapacityConfigured && (Number(currentOccupancy || 0) + visitorNames.length) >= Number(maxCapacity || 0)) ? 'Full Capacity' : 'Add Visitor'}
                      </Button>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">Use "Add Visitor" to add to list. You can edit or remove entries below.</p>
                  </div>

                  <VisitorModal
                    open={isVisitorModalOpen}
                    onOpenChange={setIsVisitorModalOpen}
                    title={visitorModalMode === 'edit' ? 'Edit Visitor' : 'Add Visitor'}
                    initialName={visitorModalInitialName}
                    confirmLabel={visitorModalMode === 'edit' ? 'Save' : 'Add'}
                    isCapacityConfigured={isCapacityConfigured}
                    maxCapacity={maxCapacity}
                    currentOccupancy={currentOccupancy}
                    currentVisitorsCount={visitorNames.length}
                    mode={visitorModalMode}
                    onConfirm={(name) => {
                      if (visitorModalMode === 'edit' && editingVisitorIndex != null) {
                        setVisitorNames(prev => prev.map((n, i) => (i === editingVisitorIndex ? name : n)))
                        setEditingVisitorIndex(null)
                      } else {
                        const exceeds = isCapacityConfigured && (visitorNames.length + 1) > Number(remainingCapacity || 0)
                        if (exceeds) { toast.error('Exceeded the amount of visitors'); return }
                        setVisitorNames(prev => [...prev, name])
                        setNewVisitorName('')
                      }
                    }}
                  />
                </div>
              )}
              {addStep === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-1 block text-base md:text-lg">Check-in {isPendingSelected ? '' : '*'}*</Label>
                    <div className="flex items-center gap-2">
                      <Input className="bg-muted/30 border-border" type="datetime-local" value={formCheckin} onChange={(e) => setFormCheckin(e.target.value)} />
                      <Button type="button" variant="outline" size="sm" onClick={setCheckinNowInForm} disabled={isPendingSelected}>Now</Button>
                      <Button type="button" variant="outline" size="sm" onClick={clearCheckinInForm}>Reset</Button>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1 block">Status *</Label>
                    <Select value={String(formStatusId)} onValueChange={(v) => setFormStatusId(v)}>
                      <SelectTrigger className="w-full bg-muted/30 border-border">
                        <SelectValue placeholder="Approved or Pending only" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions13.map(st => (
                          <SelectItem key={st.visitorapproval_id} value={String(st.visitorapproval_id)}>
                            {st.visitorapproval_status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-1 block text-base md:text-lg">Purpose *</Label>
                    <Textarea className="bg-muted/30 border-border" value={formPurpose} onChange={(e) => setFormPurpose(e.target.value)} placeholder="Enter purpose of visit" />
                    <p className="text-base md:text-lg text-muted-foreground mt-1">Brief description of the visitor's purpose.</p>
                  </div>
                </div>
              )}
              {addStep === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-1 block text-base md:text-lg">Selected Booking</Label>
                    <Input className="bg-muted/30 border-border" value={bookingDisplayLabel} readOnly />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-1 block">Visitor Names</Label>
                    <div className="space-y-2">
                      {visitorNames.map((n, i) => (
                        <Input key={i} className="bg-muted/30 border-border" value={String(n || '')} readOnly />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1 block text-base md:text-lg">Check-in</Label>
                    <Input className="bg-muted/30 border-border" value={formCheckin || ''} readOnly />
                  </div>
                  <div>
                    <Label className="mb-1 block">Status</Label>
                    <Input className="bg-muted/30 border-border" value={getStatusNameById(formStatusId)} readOnly />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-1 block">Purpose</Label>
                    <Textarea className="bg-muted/30 border-border" value={formPurpose} readOnly />
                  </div>
                  {formBookingRoomId && (
                    <p className="text-base md:text-lg text-muted-foreground mt-1 md:col-span-2">
                      {isCapacityConfigured
                        ? <>Remaining capacity: {remainingCapacity} / {maxCapacity}. Occupied: {currentOccupancy}.</>
                        : <>No capacity configured. Occupied: {currentOccupancy}.</>}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Check-out (Edit mode only) */}
          {editingLog && (
            <div className="mt-2">
              <Label className="mb-1 block">Check-out</Label>
              <div className="flex items-center gap-2">
                <Input className="bg-muted/30 border-border" type="datetime-local" value={formCheckout} onChange={(e) => setFormCheckout(e.target.value)} />
                <Button type="button" variant="outline" size="sm" onClick={setCheckoutNowInForm}>Now</Button>
                <Button type="button" variant="outline" size="sm" onClick={clearCheckoutInForm}>Clear</Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); navigate(location.pathname, { replace: true, state: {} }) }}>Cancel</Button>
            {editingLog ? (
              <>
                <Button
                  onClick={() => setCancelConfirmOpen(true)}
                  className="gap-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={!canChangeStatus(editingLog)}
                >
                  <XCircle className="h-4 w-4" /> Cancelled
                </Button>

                {String(getStatusNameById(editingLog.visitorapproval_id) || '').toLowerCase().includes('approved') ? (
                  <>
                    <Button onClick={() => setLeaveConfirmOpen(true)} className="gap-1 bg-green-600 hover:bg-green-700 text-white">
                      <LogOut className="h-4 w-4" /> Visitor Leave
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => saveAndSetStatus('Approved')} className="gap-1">
                    <CheckCircle className="h-4 w-4" /> Save & Approve
                  </Button>
                )}
              </>
            ) : addStep === 1 ? (
              <Button onClick={() => setAddStep(2)} disabled={!formBookingRoomId || (isCapacityConfigured && remainingCapacity <= 0)}>Next</Button>
            ) : addStep === 2 ? (
              <>
                <Button variant="outline" onClick={() => setAddStep(1)}>Back</Button>
                <Button
                  onClick={() => setAddStep(3)}
                  disabled={
                    visitorNames.length < 1 ||
                    !visitorNames.every(n => String(n || '').trim()) ||
                    (isCapacityConfigured && visitorNames.length > Number(remainingCapacity || 0))
                  }
                >
                  Next
                </Button>
              </>
            ) : addStep === 3 ? (
              <>
                <Button variant="outline" onClick={() => setAddStep(2)}>Back</Button>
                <Button
                  onClick={() => setAddStep(4)}
                  disabled={!formPurpose.trim() || !(isPendingSelected || formCheckin)}
                >
                  Next
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setAddStep(3)}>Back</Button>
                <Button onClick={submitLog} disabled={!isFormValid}>Add {visitorNames.length > 1 ? `${visitorNames.length} Logs` : 'Log'}</Button>
              </>
            )}
          </div>
        </div>
      </CustomModal>

      {/* Pop-out dialogs */}
      <AlertDialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Cancellation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this visitor log as Cancelled?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancelConfirmOpen(false)}>No</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-red-600 hover:bg-red-700 text-white">
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={leaveConfirmOpen} onOpenChange={setLeaveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Visitor Leave</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure this visitor is leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLeaveConfirmOpen(false)}>No</AlertDialogCancel>
            <AlertDialogAction
              onClick={saveAndLeave}
              disabled={!leaveConfirmEnabled}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {`Yes${!leaveConfirmEnabled ? ` (${leaveCountdown}s)` : ''}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CustomModal open={isChooseRoomOpen} onOpenChange={setIsChooseRoomOpen} contentClassName="max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw] w-[95vw] lg:w-[90vw] xl:w-[85vw] max-h-[90vh] h-[90vh] overflow-y-auto p-0 m-0 rounded-xl shadow-2xl border-0 bg-background">
        <ChooseBookForVisitor
          asModal
          onConfirm={(room) => {
            try {
              setFormBookingRoomId(String(room?.booking_room_id || room?.booking_id || ''))
              setFormBookingCustomerName(String(room?.customer_name || room?.bookingCustomer || ''))
              // Also persist capacity numbers from the selection
              setSelectedRoomSnapshot(room || null)
              setRememberedMaxCapacity(Number(room?.max_capacity ?? room?.roomtype_capacity ?? 0))
              const baseAdults = Number(room?.bookingRoom_adult ?? room?.booking_room_adult ?? room?.booking_adult ?? 0)
              const baseChildren = Number(room?.bookingRoom_children ?? room?.booking_room_children ?? room?.booking_children ?? 0)
              const act = Number(activeVisitorsMap[String(room?.booking_room_id || room?.booking_id)] || 0)
              setRememberedCurrentOccupancy(baseAdults + baseChildren + act)
            } catch (e) {
              console.warn('Failed to apply selected room', e)
            } finally {
              setIsChooseRoomOpen(false)
            }
          }}
          onClose={() => setIsChooseRoomOpen(false)}
        />
      </CustomModal>
    </div>
  )
}

// Helper to open booking preview
async function openBookingPreview(row) {
  try {
    // Access axios and APIConn via window scope is not available; implement within component
  } catch (e) {}
}

// Removed outdated external helper to avoid confusion
// async function openBookingPreview(row) {
//   try {
//     // Access axios and APIConn via window scope is not available; implement within component
//   } catch (e) {}
// }

export default AdminVisitorsLog