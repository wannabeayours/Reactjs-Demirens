import React, { useEffect, useMemo, useState } from 'react'
import AdminHeader from './components/AdminHeader'
import axios from 'axios'
import CustomerPayment from './SubPages/CustomerPayment'
import DataTable from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from 'sonner'
import { NumberFormatter } from './Function_Files/NumberFormatter'
import { DateFormatter } from './Function_Files/DateFormatter'

const Billings = () => {
 const APIConn = `${localStorage.url}admin.php`

 const [mainContent, setMainContent] = useState('default')
 const [bookings, setBookings] = useState([])
 const [selectedCustomer, setSelectedCustomer] = useState(null);
 const [searchName, setSearchName] = useState('')
 const [statusType, setStatusType] = useState('All')
 const [loading, setLoading] = useState(true)

 const getBookings = async () => {
  setLoading(true)
  const formData = new FormData()
  formData.append('method', 'viewBookings')

  try {
   const res = await axios.post(APIConn, formData)
   if (res.data && Array.isArray(res.data)) {
    setBookings(res.data)
   } else {
    setBookings([])
    toast.warning('No bookings found.')
   }
  } catch (err) {
   console.error(err)
   toast.error('Error fetching bookings.')
  } finally {
   setLoading(false)
  }
 }

 const filteredBookings = useMemo(() => {
  return bookings.filter((b) => {
   const name = b.customer_name || ''
   const matchesSearch = name.toLowerCase().includes(searchName.toLowerCase())
   const matchesStatus = statusType === 'All' || (b.booking_status || 'Pending') === statusType
   return matchesSearch && matchesStatus
  })
 }, [bookings, searchName, statusType])

 // Using formatDateOnly from utils instead of custom formatDate function

 const formatCurrency = (amount) => {
  return NumberFormatter.formatCurrency(amount)
 }

 const handleAddBilling = (row) => {
  setSelectedCustomer(row); // pass this data
  setMainContent('customerPayment');
 };

 const columns = [
  {
   header: 'Reference',
   accessor: (row) => (
    <span className="text-gray-900 dark:text-gray-100 font-mono text-sm">
     {row.reference_no || 'N/A'}
    </span>
   ),
  },
  {
   header: 'Customer',
   accessor: (row) => (
    <div className="text-gray-900 dark:text-gray-100">
     <div className="font-medium">{row.customer_name || 'Unknown'}</div>
     <div className="text-xs text-gray-500 dark:text-gray-400">{row.customer_email}</div>
    </div>
   ),
  },
  {
   header: 'Room Numbers',
   accessor: (row) => (
    <span className="text-gray-900 dark:text-gray-100 font-medium">
     {row.room_numbers || 'N/A'}
    </span>
   ),
  },
  {
   header: 'Total Amount',
   accessor: (row) => (
    <span className="text-gray-900 dark:text-gray-100 font-medium">
     {formatCurrency(row.total_amount)}
    </span>
   ),
  },
  {
   header: 'Downpayment',
   accessor: (row) => (
    <span className="text-gray-900 dark:text-gray-100">
     {formatCurrency(row.downpayment)}
    </span>
   ),
  },
  {
   header: 'Status',
   accessor: (row) => {
    const status = row.booking_status || 'Pending';
    const statusColors = {
     'Pending': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
     'Approved': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
     'Checked-In': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
     'Checked-Out': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
     'Declined': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    };
    return (
     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || statusColors['Pending']}`}>
      {status}
     </span>
    );
   },
  },
  {
   header: 'Check-In',
   accessor: (row) => (
    <span className="text-gray-900 dark:text-gray-100">
     {DateFormatter.formatDateOnly(row.booking_checkin_dateandtime)}
    </span>
   ),
  },
  {
   header: 'Check-Out',
   accessor: (row) => (
    <span className="text-gray-900 dark:text-gray-100">
     {DateFormatter.formatDateOnly(row.booking_checkout_dateandtime)}
    </span>
   ),
  },
  {
   header: 'Created At',
   accessor: (row) => (
    <span className="text-gray-900 dark:text-gray-100">
     {DateFormatter.formatDateOnly(row.booking_created_at)}
    </span>
   ),
  },
  {
   header: 'Actions',
   accessor: (row) => (
    <button
     onClick={() => handleAddBilling(row)}
     className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs px-3 py-1 rounded-md transition-colors font-medium"
    >
     Add Billing
    </button>
   ),
  }
 ]

 useEffect(() => {
  getBookings()
 }, [])

 return (
  <>
   <div>
    <AdminHeader />
   </div>

   <div id='MainPage' className="lg:ml-72 p-6 bg-white dark:bg-gray-900 min-h-screen">
    {mainContent === 'default' && (
     <div className="bg-white dark:bg-gray-900">
      {/* Page Title */}
      <div className="mb-6">
       <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billings Management</h1>
       <p className="text-gray-600 dark:text-gray-300 mt-1">Manage customer billing and payments</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
       <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
         <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status:</label>
         <DropdownMenu>
          <DropdownMenuTrigger className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors font-medium">
           {statusType}
           <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
           </svg>
          </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
         <DropdownMenuItem 
          onClick={() => setStatusType('All')}
          className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
         >
          All
         </DropdownMenuItem>
         <DropdownMenuItem 
          onClick={() => setStatusType('Pending')}
          className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
         >
          Pending
         </DropdownMenuItem>
         <DropdownMenuItem 
          onClick={() => setStatusType('Approved')}
          className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
         >
          Approved
         </DropdownMenuItem>
         <DropdownMenuItem 
          onClick={() => setStatusType('Checked-In')}
          className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
         >
          Checked-In
         </DropdownMenuItem>
         <DropdownMenuItem 
          onClick={() => setStatusType('Checked-Out')}
          className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
         >
          Checked-Out
         </DropdownMenuItem>
         <DropdownMenuItem 
          onClick={() => setStatusType('Declined')}
          className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
         >
          Declined
         </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
         <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search:</label>
         <Input
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          placeholder="Search by customer name..."
          className="w-[250px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
         />
        </div>
       </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
       {loading ? (
        <div className="flex items-center justify-center h-[400px]">
         <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading bookings...</p>
         </div>
        </div>
       ) : filteredBookings.length === 0 ? (
        <div className="flex items-center justify-center h-[400px]">
         <div className="flex flex-col items-center gap-4">
          <div className="text-gray-400 dark:text-gray-500">
           <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
           </svg>
          </div>
          <div className="text-center">
           <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No bookings found</h3>
           <p className="text-gray-500 dark:text-gray-400 mt-1">
            {searchName || statusType !== 'All' 
             ? 'Try adjusting your search or filter criteria.' 
             : 'No bookings are available at the moment.'}
           </p>
          </div>
         </div>
        </div>
       ) : (
        <ScrollArea className="h-[calc(100vh-350px)] w-full">
         <DataTable 
          columns={columns} 
          data={filteredBookings} 
          itemsPerPage={7} 
          autoIndex 
          className="dark:text-gray-100"
         />
        </ScrollArea>
       )}
      </div>
     </div>
    )}

    {mainContent === 'customerPayment' && (
     <CustomerPayment customer={selectedCustomer} onBack={() => setMainContent('default')} />
    )}
   </div>

  </>
 )
}

export default Billings
