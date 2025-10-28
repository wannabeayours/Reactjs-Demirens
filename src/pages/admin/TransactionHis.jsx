import React, { useState, useEffect, useCallback } from 'react'
import AdminHeader from './components/AdminHeader'
import axios from 'axios'
import { toast } from 'sonner'

// ShadCN Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign as DollarSignIcon } from 'lucide-react'

// Icons
import { 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp, 
  Eye, 
  RefreshCw,
  Clock,
  CreditCard,
  Bed,
  Coffee,
  ChevronLeft,
  ChevronRight,
  Activity
} from "lucide-react"

// Utils
import { formatDateTime } from "@/lib/utils"

// Custom Components
import { RevenueCard, TransactionCard } from './Function_Files/MoneyCard'

function AdminTransactionHis() {
  const APIConn = `${localStorage.url}admin.php`
  
  // State management
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [transactionType, setTransactionType] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [timeSortOrder, setTimeSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  // Modal states
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  
  // Pagination
  const itemsPerPage = 20
  
  // New helper: derive raw source type ('invoice' | 'billing' | 'booking')
  const deriveSourceType = (t) => {
    const raw = (t?.source_type ?? '')
      .toString()
      .replace(/^\s*"|"\s*$/g, '')
      .toLowerCase()
    if (raw) return raw
    const tbl = (t?.target_table ?? '').toLowerCase()
    if (tbl.includes('invoice')) return 'invoice'
    if (tbl.includes('billing')) return 'billing'
    return 'booking'
  }
  
  // Helper: normalize numeric id safely (restored)
  const normalizeId = (v) => {
    if (v === null || v === undefined) return null
    const n = parseInt(String(v).replace(/[^0-9-]/g, ''), 10)
    return isNaN(n) ? null : n
  }
  
  // Helper: ownership check based on viewer context
  const isOwnedByViewer = (t, viewer_user_type, viewer_employee_id) => {
    // Admin sees all
    if (viewer_user_type === 'admin') return true
  
    // Front desk: restrict to current employee's records
    const viewerEmp = normalizeId(viewer_employee_id)
    if (viewerEmp === null) return false
  
    // Consider multiple possible creator/actor identifiers from backend
    const candidatesRaw = [
      t?.employee_id,
      t?.user_id,
      t?.actor_user_id,
      t?.actor_id,
      t?.created_by
    ]
    const candidates = candidatesRaw
      .map(normalizeId)
      .filter((v) => v !== null)
  
    if (candidates.length === 0) return false
  
    return candidates.some((id) => id === viewerEmp)
  }
  
  // Compute employee-specific stats from invoices and billings
  const computeInvoiceStats = useCallback((list) => {
    try {
      setIsStatsLoading(true)
      const now = new Date()
      const startOfWeek = new Date(now)
      const day = now.getDay() // 0 (Sun) - 6 (Sat)
      startOfWeek.setDate(now.getDate() - ((day + 6) % 7)) // Monday as start
      startOfWeek.setHours(0, 0, 0, 0)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)
      endOfWeek.setHours(23, 59, 59, 999)
  
      const toNumber = (amount) => {
        let val = amount
        if (val === null || val === undefined || val === '' || val === 'null') return 0
        if (typeof val === 'string') {
          const stripped = val.replace(/^\s*"|"\s*$/g, '').replace(/[^0-9.-]/g, '')
          val = stripped
        }
        const num = parseFloat(val)
        return isNaN(num) ? 0 : num
      }
  
      // Include invoices and billings for stats
      const billingAndInvoices = (Array.isArray(list) ? list : []).filter((t) => {
        const src = deriveSourceType(t)
        return src === 'invoice' || src === 'billing'
      })
  
      let todayCount = 0, todaySum = 0
      let weekCount = 0, weekSum = 0
      let monthCount = 0, monthSum = 0
  
      billingAndInvoices.forEach((t) => {
        const dtStr = sanitizeJSONValue(t.transaction_date)
        const date = new Date(dtStr)
        if (isNaN(date)) return
        const amt = toNumber(t.amount)
  
        // Today
        if (date.toDateString() === now.toDateString()) {
          todayCount += 1
          todaySum += amt
        }
        // This Week (Mon-Sun)
        if (date >= startOfWeek && date <= endOfWeek) {
          weekCount += 1
          weekSum += amt
        }
        // This Month
        if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) {
          monthCount += 1
          monthSum += amt
        }
      })
  
      setStats({
        today: { total_transactions: todayCount, total_amount_today: todaySum },
        week: { total_transactions: weekCount, total_amount_week: weekSum },
        month: { total_transactions: monthCount, total_amount_month: monthSum },
      })
    } catch (e) {
      console.error('Error computing stats:', e)
    } finally {
      setIsStatsLoading(false)
    }
  }, [])
  
  // Fetch transaction statistics (disabled: replaced by client-side computation)
  const fetchStats = useCallback(async () => {
    // No-op: stats are computed from filtered transactions handled by the current employee (Invoices only)
    return
  }, [])
  
  // Fetch transactions with filters
  const fetchTransactions = useCallback(async (page = 1) => {
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('method', 'getAllTransactionHistories')
  
      // Determine viewer context (role & id) from localStorage
      const userId = localStorage.getItem('userId')
      const rawType = (localStorage.getItem('userType') || '').toLowerCase().replace(/[\s_-]/g, '')
      const rawLevel = (localStorage.getItem('userLevel') || '').toLowerCase().replace(/[\s_-]/g, '')
      const normalizedRole = rawLevel || rawType // prefer explicit userLevel when available
      // Map to backend expected values: admin vs front_desk
      const viewer_user_type = normalizedRole === 'admin' ? 'admin' : 'front_desk'
      const viewer_employee_id = userId ? parseInt(userId, 10) : null
  
      const filters = {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        transaction_type: transactionType,
        status_filter: statusFilter,
        date_from: dateFrom || null,
        date_to: dateTo || null,
        // Role context for backend restriction
        viewer_user_type,
        viewer_employee_id
      }
  
      formData.append('json', JSON.stringify(filters))
  
      const response = await axios.post(APIConn, formData)
      const result = response.data
  
      console.log('Transaction History API Response:', result)
  
      if (result.success) {
        const combined = Array.isArray(result.transactions) ? result.transactions : []
        // Show only Billing and Invoice items in the table
        let filtered = combined.filter(t => {
          const src = deriveSourceType(t)
          return src === 'billing' || src === 'invoice'
        })
        // Enforce viewer ownership: Admin sees all; Front Desk sees only their own
        filtered = filtered.filter(t => isOwnedByViewer(t, viewer_user_type, viewer_employee_id))
        // Apply client-side filters for type, status, and date
        if (transactionType && transactionType !== 'all') {
          filtered = filtered.filter(t => (t.transaction_type || '').toLowerCase() === transactionType.toLowerCase())
        }
        if (statusFilter && statusFilter !== 'all') {
          filtered = filtered.filter(t => (t.status || '').toLowerCase() === statusFilter.toLowerCase())
        }
        if (dateFrom) {
          const from = new Date(dateFrom)
          filtered = filtered.filter(t => {
            const dtStr = sanitizeJSONValue(t.transaction_date)
            const dt = new Date(dtStr)
            return dt >= from
          })
        }
        if (dateTo) {
          const to = new Date(dateTo)
          filtered = filtered.filter(t => {
            const dtStr = sanitizeJSONValue(t.transaction_date)
            const dt = new Date(dtStr)
            return dt <= to
          })
        }
        // Apply time sort order
        filtered.sort((a, b) => {
          const da = new Date((a.billing_dateandtime ?? a.transaction_date) || a.transaction_date)
          const db = new Date((b.billing_dateandtime ?? b.transaction_date) || b.transaction_date)
          return timeSortOrder === 'asc' ? da - db : db - da
        })
        // Pagination
        const total = filtered.length
        setTotalCount(total)
        const startIdx = (page - 1) * itemsPerPage
        const pageData = filtered.slice(startIdx, startIdx + itemsPerPage)
  
        setTransactions(pageData)
        setTotalPages(Math.max(1, Math.ceil(total / itemsPerPage)))
  
        // Stats from filtered (Invoices only)
        computeInvoiceStats(filtered)
      } else {
        setTransactions([])
        setTotalPages(1)
        setTotalCount(0)
      }
    } catch (error) {
      console.error('Transaction History API Error:', error)
      toast.error('Failed to load transactions')
      setTransactions([])
      setTotalPages(1)
      setTotalCount(0)
    } finally {
      setIsLoading(false)
      setIsStatsLoading(false)
    }
  }, [APIConn, itemsPerPage, transactionType, statusFilter, dateFrom, dateTo, computeInvoiceStats])
  
  // Search transactions
  const searchTransactions = useCallback(async () => {
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('method', 'getAllTransactionHistories')
  
      const userId = localStorage.getItem('userId')
      const rawType = (localStorage.getItem('userType') || '').toLowerCase().replace(/[\s_-]/g, '')
      const rawLevel = (localStorage.getItem('userLevel') || '').toLowerCase().replace(/[\s_-]/g, '')
      const normalizedRole = rawLevel || rawType
      const viewer_user_type = normalizedRole === 'admin' ? 'admin' : 'front_desk'
      const viewer_employee_id = userId ? parseInt(userId, 10) : null
  
      const filters = {
        viewer_user_type,
        viewer_employee_id
      }
      formData.append('json', JSON.stringify(filters))
  
      const response = await axios.post(APIConn, formData)
      const result = response.data
      if (result.success) {
        let list = Array.isArray(result.transactions) ? result.transactions : []
        // Restrict to Billing and Invoice sources only
        list = list.filter(t => {
          const src = deriveSourceType(t)
          return src === 'billing' || src === 'invoice'
        })
        // Enforce viewer ownership: Admin sees all; Front Desk sees only their own
        list = list.filter(t => isOwnedByViewer(t, viewer_user_type, viewer_employee_id))
        const term = searchTerm.trim().toLowerCase()
        if (term) {
          list = list.filter(t => {
            const ref = (t.reference_no || '').toLowerCase()
            const cust = (t.customer_name || '').toLowerCase()
            const email = (t.customer_email || '').toLowerCase()
            const type = (t.transaction_type || '').toLowerCase()
            return ref.includes(term) || cust.includes(term) || email.includes(term) || type.includes(term)
          })
        }
        // Apply selected dropdown filters too
        if (transactionType && transactionType !== 'all') {
          list = list.filter(t => (t.transaction_type || '').toLowerCase() === transactionType.toLowerCase())
        }
        if (statusFilter && statusFilter !== 'all') {
          list = list.filter(t => (t.status || '').toLowerCase() === statusFilter.toLowerCase())
        }
        if (dateFrom) {
          const from = new Date(dateFrom)
          list = list.filter(t => new Date(t.transaction_date) >= from)
        }
        if (dateTo) {
          const to = new Date(dateTo)
          list = list.filter(t => new Date(t.transaction_date) <= to)
        }
  
        // Sort by date according to timeSortOrder
        list.sort((a, b) => {
          const da = new Date((a.billing_dateandtime ?? a.transaction_date) || a.transaction_date)
          const db = new Date((b.billing_dateandtime ?? b.transaction_date) || b.transaction_date)
          return timeSortOrder === 'asc' ? da - db : db - da
        })
        // Update state
        setCurrentPage(1)
        setTotalCount(list.length)
        setTotalPages(Math.max(1, Math.ceil(list.length / itemsPerPage)))
        setTransactions(list.slice(0, itemsPerPage))
        // Stats from search results (Invoices only)
        computeInvoiceStats(list)
      } else {
        setTransactions([])
        setTotalPages(1)
        setTotalCount(0)
      }
    } catch (error) {
      console.error('Search Transactions Error:', error)
      toast.error('Search failed')
    } finally {
      setIsLoading(false)
      setIsStatsLoading(false)
    }
  }, [APIConn, searchTerm, transactionType, statusFilter, dateFrom, dateTo, itemsPerPage, computeInvoiceStats])
  
  // Handle filter changes
  const handleFilterChange = useCallback(() => {
    setCurrentPage(1)
    fetchTransactions(1)
  }, [fetchTransactions])
  
  // Handle search
  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) {
      searchTransactions()
    } else {
      fetchTransactions(1)
    }
  }, [searchTerm, searchTransactions, fetchTransactions])
  
  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setTransactionType('all')
    setStatusFilter('all')
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
  }, [])
  
  // Test API function
  const testAPI = useCallback(async () => {
    try {
      const formData = new FormData()
      formData.append('method', 'testTransactionAPI')
      
      const response = await axios.post(APIConn, formData)
      const result = response.data
      
      console.log('Test API Response:', result)
      toast.success('API Test: ' + (result.message || 'Success'))
    } catch (error) {
      console.error('Test API Error:', error)
      toast.error('API Test Failed')
    }
  }, [APIConn])
  
  // Add sample booking function
  const addSampleBooking = useCallback(async () => {
    try {
      const formData = new FormData()
      formData.append('method', 'addSampleBooking')
      
      const response = await axios.post(APIConn, formData)
      const result = response.data
      
      console.log('Add Sample Booking Response:', result)
      toast.success(result.message || 'Sample booking added')
      
      // Refresh the transactions list
      fetchTransactions(1)
    } catch (error) {
      console.error('Add Sample Booking Error:', error)
      toast.error('Failed to add sample booking')
    }
  }, [APIConn, fetchTransactions])
  
  // Load data on component mount and filter changes
  useEffect(() => {
    // Removed backend stats call; stats are now computed from fetched transactions
    fetchTransactions(1)
  }, [fetchTransactions])
  
  useEffect(() => {
    if (searchTerm === '') {
      fetchTransactions(1)
    }
  }, [transactionType, statusFilter, dateFrom, dateTo, searchTerm, fetchTransactions])
  
  // Get transaction type icon and color
  const getTransactionTypeInfo = (type) => {
    switch (type) {
      case 'booking':
        return { icon: Bed, color: 'bg-blue-500', label: 'Booking' }
      case 'amenity_request':
        return { icon: Coffee, color: 'bg-green-500', label: 'Amenity Request' }
      case 'payment':
        return { icon: CreditCard, color: 'bg-purple-500', label: 'Payment' }
      case 'billing':
        return { icon: DollarSignIcon, color: 'bg-indigo-500', label: 'Billing' }
      default:
        return { icon: Activity, color: 'bg-gray-500', label: 'Transaction' }
    }
  }
  
  // Get status badge variant
  const getStatusBadge = (status, statusColor) => {
    let variant = 'secondary'
    if (statusColor === 'success' || status === 'approved' || status === 'confirmed' || status === 'Active') {
      variant = 'default'
    } else if (statusColor === 'warning' || status === 'pending') {
      variant = 'secondary'
    } else if (statusColor === 'danger' || status === 'rejected' || status === 'cancelled') {
      variant = 'destructive'
    }
    return variant
  }
  
  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      fetchTransactions(page)
    }
  }
  
  // Format currency
  const formatAmount = (amount) => {
    // Handle JSON_EXTRACT returning quoted strings (e.g., "\"100.00\"")
    let val = amount
    if (val === null || val === undefined || val === '' || val === 'null') {
      return '₱0.00'
    }
    if (typeof val === 'string') {
      // strip surrounding quotes and non-numeric chars except dot and minus
      const stripped = val.replace(/^\s*"|"\s*$/g, '').replace(/[^0-9.-]/g, '')
      val = stripped
    }
    const num = parseFloat(val)
    if (isNaN(num)) return '₱0.00'
    return `₱${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  
  // Helper to sanitize JSON_EXTRACT string outputs (removes surrounding quotes)
  const sanitizeJSONValue = (value) => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'string') {
      return value.replace(/^\s*"|"\s*$/g, '')
    }
    return String(value)
  }
  
  // Convert a string to Title Case for display
  const toTitleCase = (s) => {
    if (!s) return ''
    return String(s)
      .toLowerCase()
      .split(/[\s_-]+/)
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
      .join(' ')
  }
  
  // Date range helpers for card clicks
  const toISODate = (d) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  const getTodayRange = () => {
    const now = new Date()
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    const end = new Date(now)
    // use next day midnight to include all of today in <= comparison
    end.setDate(end.getDate() + 1)
    end.setHours(0, 0, 0, 0)
    return { from: toISODate(start), to: toISODate(end) }
  }
  
  const getWeekRange = () => {
    const now = new Date()
    const day = now.getDay() // 0 (Sun) - 6 (Sat)
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((day + 6) % 7))
    monday.setHours(0, 0, 0, 0)
    const nextMonday = new Date(monday)
    nextMonday.setDate(monday.getDate() + 7)
    nextMonday.setHours(0, 0, 0, 0)
    return { from: toISODate(monday), to: toISODate(nextMonday) }
  }
  
  const getMonthRange = () => {
    const now = new Date()
    const first = new Date(now.getFullYear(), now.getMonth(), 1)
    first.setHours(0, 0, 0, 0)
    const nextFirst = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    nextFirst.setHours(0, 0, 0, 0)
    return { from: toISODate(first), to: toISODate(nextFirst) }
  }
  
  const applyRange = ({ from, to }) => {
    setSearchTerm('')
    setTransactionType('all')
    setStatusFilter('all')
    setDateFrom(from)
    setDateTo(to)
    setCurrentPage(1)
    fetchTransactions(1)
  }
  
  // Determine a user-friendly Transaction Type label (prefer Payment Method when available)
  const getTransactionSourceDisplay = (t) => {
    const pm = sanitizeJSONValue(t.payment_method_name)
    if (pm) return toTitleCase(pm)
    const raw = sanitizeJSONValue(t.source_type)
    const base = raw
      ? raw
      : (t.target_table?.includes('invoice')
          ? 'invoice'
          : (t.target_table?.includes('billing')
              ? 'billing'
              : 'booking'))
    return toTitleCase(base)
  }

  // Prefer backend-provided reference_no; if missing or looks like a raw table-name, build a friendly fallback
  const getReferenceDisplay = (t) => {
    const ref = sanitizeJSONValue(t.reference_no)
    if (ref && !/^tbl_/.test(ref)) return ref
    if (t.target_table?.includes('billing') && t.target_id) return `BILL-${t.target_id}`
    if (t.target_table?.includes('invoice') && t.target_id) return `INV-${t.target_id}`
    if (t.target_table?.includes('booking') && t.target_id) return `REF-${t.target_id}`
    if (t.target_table?.includes('booking_charges') && t.target_id) return `${t.target_table}-${t.target_id}`
    return ref || ''
  }

  // Compute viewer role once for conditional rendering
  const viewer_is_admin = (
    ((localStorage.getItem('userLevel') || '').toLowerCase().replace(/[\s_-]/g, '') === 'admin') ||
    ((localStorage.getItem('userType') || '').toLowerCase().replace(/[\s_-]/g, '') === 'admin')
  )
  // New: Get employee display label
  const getEmployeeDisplay = (t) => {
    const name = sanitizeJSONValue(t?.employee_name)
    const userIdRaw = localStorage.getItem('userId')
    const viewer_employee_id = userIdRaw ? parseInt(userIdRaw, 10) : null
    const candidates = [t?.employee_id, t?.user_id, t?.actor_user_id, t?.actor_id, t?.created_by]
      .map(normalizeId)
      .filter((v) => v !== null)
    const isViewer = viewer_employee_id !== null && candidates.length > 0 && candidates.some((id) => id === viewer_employee_id)
    const roleRawType = (localStorage.getItem('userType') || '').toLowerCase().replace(/[\s_-]/g, '')
    const roleRawLevel = (localStorage.getItem('userLevel') || '').toLowerCase().replace(/[\s_-]/g, '')
    const viewer_is_admin = (roleRawType === 'admin' || roleRawLevel === 'admin')
    if (!viewer_is_admin && isViewer) return 'You'
    if (name) return name
    if (candidates.length > 0) return `Employee #${candidates[0]}`
    return '—'
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />
      
      <div className="lg:ml-72 p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Billing & Invoice History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {(((localStorage.getItem('userLevel') || '').toLowerCase().replace(/[\s_-]/g, '') === 'admin') ||
              ((localStorage.getItem('userType') || '').toLowerCase().replace(/[\s_-]/g, '') === 'admin'))
              ? 'Showing all Billings and Invoices (Admin)'
              : 'Showing Billings and Invoices handled by you (Front Desk)'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Note: Statistics cards include Billings and Invoices.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          {/* Today's Stats */}
          <TransactionCard
            title="Today's Transactions"
            amount={stats.today?.total_transactions || 0}
            subtitle={`Invoices & Bills — Total: ${formatAmount(stats.today?.total_amount_today)}`}
            icon={Clock}
            isLoading={isStatsLoading}
            breakdownItems={[
              { 
                label: "Today's Invoice Revenue", 
                value: stats.today?.total_amount_today || 0, 
                count: stats.today?.total_transactions || 0,
                countLabel: "transactions",
                type: "revenue"
              }
            ]}
            onClick={() => applyRange(getTodayRange())}
          />

          {/* This Week */}
          <TransactionCard
            title="This Week"
            amount={stats.week?.total_transactions || 0}
            subtitle={`Invoices & Bills — Total: ${formatAmount(stats.week?.total_amount_week)}`}
            icon={TrendingUp}
            isLoading={isStatsLoading}
            breakdownItems={[
              { 
                label: "This Week's Invoice Revenue", 
                value: stats.week?.total_amount_week || 0, 
                count: stats.week?.total_transactions || 0,
                countLabel: "transactions",
                type: "revenue"
              }
            ]}
            onClick={() => applyRange(getWeekRange())}
          />

          {/* This Month */}
          <TransactionCard
            title="This Month"
            amount={stats.month?.total_transactions || 0}
            subtitle={`Invoices & Bills — Total: ${formatAmount(stats.month?.total_amount_month)}`}
            icon={Calendar}
            isLoading={isStatsLoading}
            breakdownItems={[
              { 
                label: "This Month's Invoice Revenue", 
                value: stats.month?.total_amount_month || 0, 
                count: stats.month?.total_transactions || 0,
                countLabel: "transactions",
                type: "revenue"
              }
            ]}
            onClick={() => applyRange(getMonthRange())}
          />

           {/* Total Revenue */}
           <RevenueCard
             title="Total Revenue"
             amount={stats.month?.total_amount_month || 0}
             subtitle="Invoices only — This month's total revenue"
             icon={DollarSignIcon}
             isLoading={isStatsLoading}
             breakdownTitle="Invoice Revenue Breakdown"
             breakdownItems={[
               { 
                 label: "Today's Invoice Revenue", 
                 value: stats.today?.total_amount_today || 0, 
                 count: stats.today?.total_transactions || 0,
                 countLabel: "transactions",
                 type: "revenue"
               },
               { 
                 label: "This Week's Invoice Revenue", 
                 value: stats.week?.total_amount_week || 0, 
                 count: stats.week?.total_transactions || 0,
                 countLabel: "transactions",
                 type: "revenue"
               },
               { 
                 label: "This Month's Invoice Revenue", 
                 value: stats.month?.total_amount_month || 0, 
                 count: stats.month?.total_transactions || 0,
                 countLabel: "transactions",
                 type: "revenue"
               }
             ]}
             onClick={() => applyRange(getMonthRange())}
           />
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by reference, customer name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Transaction Type */}
              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="booking">Bookings</SelectItem>
                  <SelectItem value="amenity_request">Amenity Requests</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range */}
              <div className="flex gap-2">
                <Input
                  type="date"
                  placeholder="From Date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Select value={timeSortOrder} onValueChange={(v) => { setTimeSortOrder(v) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Latest → Oldest</SelectItem>
                  <SelectItem value="asc">Oldest → Latest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button onClick={handleSearch} className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </Button>
              <Button onClick={handleFilterChange} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Apply Filters
              </Button>
              <Button onClick={clearFilters} variant="outline" className="flex items-center gap-2">
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Transactions</CardTitle>
              <Badge variant="outline">
                {totalCount} total transactions
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No transactions found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Transaction Type</TableHead>
                        <TableHead>Customer</TableHead>
                        {viewer_is_admin && (<TableHead>Handled By</TableHead>)}
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Billing Date/Time</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => {
                        const typeInfo = getTransactionTypeInfo(transaction.transaction_type)
                        const IconComponent = typeInfo.icon
                        
                        return (
                          <TableRow key={`${transaction.transaction_type}-${transaction.transaction_id}`}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-full ${typeInfo.color} text-white`}>
                                  <IconComponent className="h-4 w-4" />
                                </div>
                                <span className="font-medium">{typeInfo.label}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {getReferenceDisplay(transaction)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getTransactionSourceDisplay(transaction)}
                              </Badge>
                            </TableCell>
                           <TableCell>
                             <div>
                               <div className="font-medium">{transaction.customer_name}</div>
                               <div className="text-sm text-gray-500">{transaction.customer_email}</div>
                             </div>
                           </TableCell>
                           {viewer_is_admin && (
                             <TableCell>
                               <div>
                                 <div className="font-medium">{getEmployeeDisplay(transaction)}</div>
                               </div>
                             </TableCell>
                           )}
                            <TableCell className="font-medium">
                              {formatAmount(transaction.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadge(transaction.status, transaction.status_color)}>
                                {transaction.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {formatDateTime(transaction.billing_dateandtime || transaction.transaction_date)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTransaction(transaction)
                                  setShowDetails(true)
                                }}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} transactions
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Transaction Details Modal */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Reference Number</label>
                    <p className="font-mono">{selectedTransaction.reference_no}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Transaction Type</label>
                    <p className="capitalize">{selectedTransaction.transaction_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer Name</label>
                    <p>{selectedTransaction.customer_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer Email</label>
                    <p>{selectedTransaction.customer_email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Handled By</label>
                    <p>{getEmployeeDisplay(selectedTransaction)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Amount</label>
                    <p className="font-bold text-lg">{formatAmount(selectedTransaction.amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <Badge variant={getStatusBadge(selectedTransaction.status, selectedTransaction.status_color)}>
                      {selectedTransaction.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Transaction Date</label>
                    <p>{formatDateTime(selectedTransaction.transaction_date)}</p>
                  </div>
                  {selectedTransaction.room_number && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Room Number</label>
                      <p>{selectedTransaction.room_number}</p>
                    </div>
                  )}
                  {selectedTransaction.amenity_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Amenity</label>
                      <p>{selectedTransaction.amenity_name}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="mt-1">{selectedTransaction.description}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}

export default AdminTransactionHis

const DollarSign = ({ className = "" }) => <span className={className}>₱</span>


// Only show Billing & Invoice items that were handled by the current front-desk employee
const filterToBillingAndInvoices = (list, employeeId) => {
  if (!Array.isArray(list)) return []
  return list.filter((t) => {
    const table = (t.target_table || '').toLowerCase()
    const isBillingOrInvoice = table.includes('billing') || table.includes('invoice')
    // Consider multiple possible employee identifiers coming from backend
    const candidates = [t.user_id, t.employee_id, t.actor_user_id, t.actor_id, t.created_by]
      .filter((v) => v !== null && v !== undefined)
      .map((v) => (typeof v === 'string' ? parseInt(v, 10) : v))

    const matchesEmployee = employeeId
      ? (candidates.length === 0 ? false : candidates.some((id) => id === employeeId))
      : true

    return isBillingOrInvoice && matchesEmployee
  })
}