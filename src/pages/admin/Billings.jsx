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

const Billings = () => {
 const APIConn = `${localStorage.url}admin.php`

 const [mainContent, setMainContent] = useState('default')
 const [bookings, setBookings] = useState([])
 const [selectedCustomer, setSelectedCustomer] = useState(null);
 const [searchName, setSearchName] = useState('')
 const [statusType, setStatusType] = useState('All')

 const getBookings = async () => {
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
  }
 }

 const filteredBookings = useMemo(() => {
  return bookings.filter((b) => {
   const name = b.fullname || b.customers_online_username || ''
   const matchesSearch = name.toLowerCase().includes(searchName.toLowerCase())
   const matchesStatus = statusType === 'All' || (b.booking_status_name || 'Pending') === statusType
   return matchesSearch && matchesStatus
  })
 }, [bookings, searchName, statusType])

 const formatDate = (dateString) => {
  if (!dateString || dateString.startsWith("1970")) return "N/A"
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
   year: 'numeric',
   month: 'short',
   day: 'numeric',
  })
 }

 const formatCurrency = (amount) => {
  return Number(amount).toLocaleString('en-PH', {
   style: 'currency',
   currency: 'PHP',
  })
 }

 const handleAddBilling = (row) => {
  setSelectedCustomer(row); // pass this data
  setMainContent('customerPayment');
 };

 const columns = [
  {
   header: 'Customer',
   accessor: (row) => row.fullname || row.customers_online_username || 'Unknown',
  },
  {
   header: 'Downpayment',
   accessor: (row) => formatCurrency(row.booking_downpayment),
  },
  {
   header: 'Status',
   accessor: (row) => row.booking_status_name || 'Pending',
  },
  {
   header: 'Check-In',
   accessor: (row) => formatDate(row.booking_checkin_dateandtime),
  },
  {
   header: 'Check-Out',
   accessor: (row) => formatDate(row.booking_checkout_dateandtime),
  },
  {
   header: 'Created At',
   accessor: (row) => formatDate(row.booking_created_at),
  },
  {
   header: 'Updated At',
   accessor: (row) => row.updated_at ? formatDate(row.updated_at) : 'Not Updated',
  },
  {
   header: 'Actions',
   accessor: (row) => (
    <button
     onClick={() => handleAddBilling(row)}
     className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-md"
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

   <div id='MainPage'>
    {mainContent === 'default' && (
     <div>
      {/* Your current default content with filters, table, etc. */}
      <div className="flex items-center gap-4 mb-4">
       <DropdownMenu>
        <DropdownMenuTrigger className="border px-4 py-2 rounded-md shadow-sm hover:bg-gray-100">
         Filter Status
        </DropdownMenuTrigger>
        <DropdownMenuContent>
         <DropdownMenuItem onClick={() => setStatusType('All')}>All</DropdownMenuItem>
         <DropdownMenuItem onClick={() => setStatusType('Checked-Out')}>Checked-Out</DropdownMenuItem>
         <DropdownMenuItem onClick={() => setStatusType('Declined')}>Declined</DropdownMenuItem>
         <DropdownMenuItem onClick={() => setStatusType('Pending')}>Pending</DropdownMenuItem>
        </DropdownMenuContent>
       </DropdownMenu>

       <Input
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
        placeholder="Search by name..."
        className="w-[250px]"
       />
      </div>

      <ScrollArea className="h-[calc(100vh-300px)] w-full">
       <DataTable columns={columns} data={filteredBookings} itemsPerPage={7} autoIndex />
      </ScrollArea>
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
