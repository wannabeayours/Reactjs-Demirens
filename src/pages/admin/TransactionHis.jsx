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
  Activity,
  DollarSign
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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  // Modal states
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  
  // Pagination
  const itemsPerPage = 20

  // Fetch transaction statistics
  const fetchStats = useCallback(async () => {
    try {
      setIsStatsLoading(true)
      const formData = new FormData()
      formData.append('method', 'getTransactionStats')
      
      const response = await axios.post(APIConn, formData)
      const result = response.data
      
      console.log('Transaction Stats API Response:', result)
      
      if (result.success) {
        setStats(result)
        console.log('Stats breakdown:', {
          today: result.today,
          week: result.week,
          month: result.month
        })
      } else {
        console.error('Stats API Error:', result.error || 'Unknown error')
      }
    } catch (error) {
      console.error('Error fetching transaction stats:', error)
      toast.error('Failed to load transaction statistics')
    } finally {
      setIsStatsLoading(false)
    }
  }, [APIConn])

  // Fetch transactions with filters
  const fetchTransactions = useCallback(async (page = 1) => {
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('method', 'getTransactionHistory')
      
      const filters = {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        transaction_type: transactionType,
        status_filter: statusFilter,
        date_from: dateFrom || null,
        date_to: dateTo || null
      }
      
      formData.append('json', JSON.stringify(filters))
      
      const response = await axios.post(APIConn, formData)
      const result = response.data
      
      console.log('Transaction History API Response:', result)
      
      if (result.success) {
        setTransactions(result.transactions || [])
        setTotalCount(result.total_count || 0)
        setTotalPages(result.total_pages || 1)
        setCurrentPage(result.current_page || 1)
      } else {
        console.error('API Error:', result.error || 'Unknown error')
        toast.error('Failed to load transactions: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }, [APIConn, transactionType, statusFilter, dateFrom, dateTo, itemsPerPage])

  // Search transactions
  const searchTransactions = useCallback(async () => {
    if (!searchTerm.trim()) {
      fetchTransactions(1)
      return
    }
    
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('method', 'searchTransactions')
      
      const searchData = {
        search_term: searchTerm,
        limit: 50
      }
      
      formData.append('json', JSON.stringify(searchData))
      
      const response = await axios.post(APIConn, formData)
      const result = response.data
      
      if (result.success) {
        setTransactions(result || [])
        setTotalCount(result.length || 0)
        setTotalPages(1)
        setCurrentPage(1)
      }
    } catch (error) {
      console.error('Error searching transactions:', error)
      toast.error('Search failed')
    } finally {
      setIsLoading(false)
    }
  }, [APIConn, searchTerm, fetchTransactions])

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
    fetchStats()
    fetchTransactions(1)
  }, [fetchStats, fetchTransactions])

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
    if (!amount) return '₱0.00'
    return `₱${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />
      
      <div className="lg:ml-72 p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Transaction History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track all hotel transactions, bookings, and amenity requests
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          {/* Today's Stats */}
          <TransactionCard
            title="Today's Transactions"
            amount={stats.today?.total_transactions || 0}
            subtitle={`Total: ${formatAmount(stats.today?.total_amount_today)}`}
            icon={Clock}
            isLoading={isStatsLoading}
            breakdownItems={[
              { 
                label: "Today's Revenue", 
                value: stats.today?.total_amount_today || 0, 
                count: stats.today?.total_transactions || 0,
                countLabel: "transactions",
                type: "revenue"
              }
            ]}
          />

          {/* This Week */}
          <TransactionCard
            title="This Week"
            amount={stats.week?.total_transactions || 0}
            subtitle={`Total: ${formatAmount(stats.week?.total_amount_week)}`}
            icon={TrendingUp}
            isLoading={isStatsLoading}
            breakdownItems={[
              { 
                label: "This Week's Revenue", 
                value: stats.week?.total_amount_week || 0, 
                count: stats.week?.total_transactions || 0,
                countLabel: "transactions",
                type: "revenue"
              }
            ]}
          />

          {/* This Month */}
          <TransactionCard
            title="This Month"
            amount={stats.month?.total_transactions || 0}
            subtitle={`Total: ${formatAmount(stats.month?.total_amount_month)}`}
            icon={Calendar}
            isLoading={isStatsLoading}
            breakdownItems={[
              { 
                label: "This Month's Revenue", 
                value: stats.month?.total_amount_month || 0, 
                count: stats.month?.total_transactions || 0,
                countLabel: "transactions",
                type: "revenue"
              }
            ]}
          />

           {/* Total Revenue */}
           <RevenueCard
             title="Total Revenue"
             amount={stats.month?.total_amount_month || 0}
             subtitle="This month's total revenue"
             icon={DollarSign}
             isLoading={isStatsLoading}
             breakdownTitle="Revenue Breakdown"
             breakdownItems={[
               { 
                 label: "Today's Revenue", 
                 value: stats.today?.total_amount_today || 0, 
                 count: stats.today?.total_transactions || 0,
                 countLabel: "transactions",
                 type: "revenue"
               },
               { 
                 label: "This Week's Revenue", 
                 value: stats.week?.total_amount_week || 0, 
                 count: stats.week?.total_transactions || 0,
                 countLabel: "transactions",
                 type: "revenue"
               },
               { 
                 label: "This Month's Revenue", 
                 value: stats.month?.total_amount_month || 0, 
                 count: stats.month?.total_transactions || 0,
                 countLabel: "transactions",
                 type: "revenue"
               }
             ]}
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
              <Button onClick={testAPI} variant="outline" className="flex items-center gap-2">
                Test API
              </Button>
              <Button onClick={addSampleBooking} variant="outline" className="flex items-center gap-2">
                Add Sample Booking
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
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
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
                              {transaction.reference_no}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{transaction.customer_name}</div>
                                <div className="text-sm text-gray-500">{transaction.customer_email}</div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatAmount(transaction.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadge(transaction.status, transaction.status_color)}>
                                {transaction.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {formatDateTime(transaction.transaction_date)}
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