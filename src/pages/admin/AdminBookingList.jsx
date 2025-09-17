import React, { useEffect, useCallback } from 'react'
import AdminHeader from '@/pages/admin/components/AdminHeader';
import { useState } from 'react';
import axios from 'axios';

// ShadCN
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, Search, Filter, ArrowRightLeft, Eye, Settings } from "lucide-react"
import { format } from "date-fns"
import { formatDateTime } from "@/lib/utils"
import RoomChangeSheet from "./SubPages/RoomChangeSheet"

function AdminBookingList() {
  const APIConn = `${localStorage.url}admin.php`;

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [status, setStatus] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [showRoomChange, setShowRoomChange] = useState(false);
  const [rooms, setRooms] = useState([]);

  const getAllStatus = useCallback(async () => {
    const formData = new FormData();
    formData.append('method', 'getAllStatus');

    try {
      const res = await axios.post(APIConn, formData);
      if (res.data) {
        setStatus(res.data);
        console.log('Existing Statuses: ', res.data);
      } else {
        toast.error('Failed to connect');
      }
    } catch (err) {
      toast.error('Failed to connect');
      console.log(err);
    }
  }, [APIConn]);
  

  const getBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('method', 'viewBookings');
      formData.append('json', JSON.stringify({}));
      const res = await axios.post(APIConn, formData);

      // Ensure we always set an array, even if the response is unexpected
      if (Array.isArray(res.data)) {
        setBookings(res.data);
      } else if (res.data === 0 || res.data === null || res.data === undefined) {
        setBookings([]);
      } else {
        // If response is not an array but has some value, log it and set empty array
        console.warn('Unexpected API response format:', res.data);
        setBookings([]);
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
      toast.error('Error loading bookings');
      setBookings([]); // Ensure state is always an array even on error
    } finally {
      setIsLoading(false);
    }
  }, [APIConn]);

  useEffect(() => {
    getBookings();
    getAllStatus();
  }, [getBookings, getAllStatus]);

  // Filter bookings based on search term and filters
  useEffect(() => {
    let filtered = bookings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.reference_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.room_numbers?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.booking_status === statusFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(booking => {
        const checkInDate = new Date(booking.booking_checkin_dateandtime);
        return checkInDate >= dateFrom;
      });
    }

    if (dateTo) {
      filtered = filtered.filter(booking => {
        const checkOutDate = new Date(booking.booking_checkout_dateandtime);
        return checkOutDate <= dateTo;
      });
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, dateFrom, dateTo]);

  // Button handlers
  const handleStatusChange = (booking) => {
    console.log('Change Status clicked for booking:', booking);
    setSelectedBooking(booking);
    setNewStatus(booking.booking_status); // Set current status as default
    setShowStatusChange(true);
  };

  const fetchAvailableRooms = async () => {
    try {
      const formData = new FormData();
      formData.append("method", "viewRooms");
      formData.append("json", JSON.stringify({}));
      const res = await axios.post(APIConn, formData);
      const data = Array.isArray(res.data) ? res.data : [];

      setRooms(data);
    } catch (err) {
      console.error("Error fetching available rooms:", err);
      setRooms([]);
    }
  };

  const handleChangeRoom = (booking) => {
    console.log('Change Room clicked for booking:', booking);
    setSelectedBooking(booking);
    
    // Check if booking status allows room changes
    if (booking.booking_status !== 'Approved' && booking.booking_status !== 'Checked-In') {
      toast.error('Room changes are only allowed for bookings with "Approved" or "Checked In" status');
      return;
    }
    
    // Fetch available rooms and show room change sheet
    fetchAvailableRooms();
    setShowRoomChange(true);
  };

  const handleViewCustomerDetails = (booking) => {
    console.log('View Customer Details clicked for booking:', booking);
    setSelectedBooking(booking);
    setShowCustomerDetails(true);
  };

  const handleRoomChangeSuccess = () => {
    // Refresh bookings list after successful room change
    getBookings();
  };

  const handleUpdateStatus = async () => {
    if (!selectedBooking || !newStatus) {
      toast.error('Please select a new status');
      return;
    }

    // Prevent setting restricted statuses
    if (newStatus === 'Approved' || newStatus === 'Cancelled') {
      toast.error('Cannot set status to "Approved" or "Cancelled"');
      return;
    }

    // Find the status ID for the new status
    const selectedStatusItem = status.find(item => item.booking_status_name === newStatus);

    // Get current employee/admin ID (you may need to adjust this based on your auth system)
    const currentEmployeeId = localStorage.getItem('employeeId') || 1; // Default to 1 if not found

    // Build JSON data for the API
    const jsonData = {
      booking_id: selectedBooking.booking_id || selectedBooking.id,
      employee_id: currentEmployeeId
    };

    // Add booking_status_id if available
    if (selectedStatusItem?.booking_status_id != null) {
      jsonData.booking_status_id = selectedStatusItem.booking_status_id;
    }

    // Add room_ids if available
    const candidateRoomIds = Array.isArray(selectedBooking?.room_ids)
      ? selectedBooking.room_ids
      : undefined;
    if (Array.isArray(candidateRoomIds)) {
      jsonData.room_ids = candidateRoomIds;
    }

    // Build FormData and submit to API
    const formData = new FormData();
    formData.append('method', 'changeBookingStatus');
    formData.append('json', JSON.stringify(jsonData));

    try {
      const res = await axios.post(APIConn, formData);
      if (res?.data?.success) {
        toast.success(`Status updated to ${newStatus} for booking ${selectedBooking.reference_no}`);
        setShowStatusChange(false);
        setSelectedBooking(null);
        setNewStatus('');
        getBookings();
      } else {
        const errMsg = res?.data?.message || res?.data?.error || 'Failed to update status';
        toast.error(errMsg);
      }
    } catch (err) {
      console.error('Status update error:', err);
      toast.error('Failed to connect');
    }
  }

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFrom(null);
    setDateTo(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Upcoming': { variant: 'secondary', className: 'bg-yellow-500 hover:bg-yellow-600' },
      'Active': { variant: 'default', className: 'bg-emerald-500 hover:bg-emerald-600' },
      'Completed': { variant: 'default', className: 'bg-blue-500 hover:bg-blue-600' },
      'Cancelled': { variant: 'destructive', className: 'bg-red-500 hover:bg-red-600' },
      // legacy/other statuses just in case
      'Approved': { variant: 'default', className: 'bg-green-500 hover:bg-green-600' },
      'Pending': { variant: 'secondary', className: 'bg-yellow-500 hover:bg-yellow-600' },
      'Checked In': { variant: 'default', className: 'bg-emerald-500 hover:bg-emerald-600' },
      'Checked Out': { variant: 'secondary', className: 'bg-slate-500 hover:bg-slate-600' }
    };

    const config = statusConfig[status] || { variant: 'outline', className: 'bg-gray-100 text-gray-800' };

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const renderOrPending = (value) => {
    const stringValue = (value ?? '').toString().trim();
    if (!stringValue || stringValue.toLowerCase() === 'null') return 'Pending';
    return stringValue;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Booking Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all hotel bookings and their current status
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredBookings.filter(b => b.booking_status === 'Upcoming').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                  <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredBookings.filter(b => b.booking_status === 'Active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredBookings.filter(b => b.booking_status === 'Completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Bar */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Room, Customer, Reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Array.isArray(status) && status.map((statusItem, index) => (
                      <SelectItem key={statusItem.booking_status_id} value={statusItem.booking_status_name}>
                        {statusItem.booking_status_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date From Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date To Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={clearFilters} className="text-sm">
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              All Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading bookings...</span>
              </div>
            ) : !Array.isArray(filteredBookings) || filteredBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {filteredBookings.length === 0 && bookings.length > 0 ? 'No Matching Bookings' : 'No Bookings Available'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {filteredBookings.length === 0 && bookings.length > 0
                    ? 'Try adjusting your search criteria or filters.'
                    : 'There are currently no bookings to display.'}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[480px] w-full">
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>A comprehensive list of all hotel bookings</TableCaption>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-700">
                        <TableHead className="font-semibold text-gray-900 dark:text-white sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Reference No</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-white sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Customer</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-white sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Check-in</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-white sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Check-out</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-white sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Room Numbers</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-white sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-white sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((b, i) => (
                        <TableRow key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <TableCell className="font-mono text-sm text-gray-900 dark:text-white">
                            {b.reference_no || '—'}
                          </TableCell>
                          <TableCell className="font-medium text-gray-900 dark:text-white">
                            {b.customer_name}
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">
                            {formatDateTime(b.booking_checkin_dateandtime)}
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">
                            {formatDateTime(b.booking_checkout_dateandtime)}
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">
                            {renderOrPending(b.room_numbers)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(b.booking_status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewCustomerDetails(b)}
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(b)}
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              >
                                <Settings className="w-4 h-4 mr-1" />
                                Change Status
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleChangeRoom(b)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <ArrowRightLeft className="w-4 h-4 mr-1" />
                                Change Room
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Customer Details Modal */}
        <Dialog open={showCustomerDetails} onOpenChange={setShowCustomerDetails}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Customer & Booking Details
              </DialogTitle>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer Name</label>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedBooking.customer_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                      <p className="text-gray-900 dark:text-white">{selectedBooking.customer_email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone Number</label>
                      <p className="text-gray-900 dark:text-white">{selectedBooking.customer_phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nationality</label>
                      <p className="text-gray-900 dark:text-white">{selectedBooking.nationality || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Booking Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Reference Number</label>
                      <p className="text-gray-900 dark:text-white font-mono">{selectedBooking.reference_no || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedBooking.booking_status)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Check-in Date</label>
                      <p className="text-gray-900 dark:text-white">{formatDateTime(selectedBooking.booking_checkin_dateandtime)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Check-out Date</label>
                      <p className="text-gray-900 dark:text-white">{formatDateTime(selectedBooking.booking_checkout_dateandtime)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Room Numbers</label>
                      <p className="text-gray-900 dark:text-white">{renderOrPending(selectedBooking.room_numbers)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</label>
                      <p className="text-gray-900 dark:text-white font-semibold">${selectedBooking.total_amount || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                {(selectedBooking.special_requests || selectedBooking.notes) && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Additional Information</h3>
                    {selectedBooking.special_requests && (
                      <div className="mb-3">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Special Requests</label>
                        <p className="text-gray-900 dark:text-white">{selectedBooking.special_requests}</p>
                      </div>
                    )}
                    {selectedBooking.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes</label>
                        <p className="text-gray-900 dark:text-white">{selectedBooking.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowCustomerDetails(false)}>
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      handleStatusChange(selectedBooking);
                      setShowCustomerDetails(false);
                    }}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Change Status
                  </Button>
                  <Button
                    onClick={() => {
                      handleChangeRoom(selectedBooking);
                      setShowCustomerDetails(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Change Room
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Status Change Modal */}
        <Dialog open={showStatusChange} onOpenChange={setShowStatusChange}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Change Booking Status
              </DialogTitle>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-4">
                {/* Current Booking Info */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Booking Details</h3>
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">Reference:</span> {selectedBooking.reference_no}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">Customer:</span> {selectedBooking.customer_name}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">Current Status:</span>
                    <span className="ml-2">{getStatusBadge(selectedBooking.booking_status)}</span>
                  </p>
                </div>

                {/* Status Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select New Status
                  </label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(status) && status
                        .filter(statusItem =>
                          // Filter out statuses that admins cannot manually set
                          statusItem.booking_status_name !== 'Approved' &&
                          statusItem.booking_status_name !== 'Cancelled'
                        )
                        .map((statusItem) => (
                          <SelectItem key={statusItem.booking_status_id} value={statusItem.booking_status_name}>
                            {statusItem.booking_status_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowStatusChange(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateStatus}
                    className="bg-orange-600 hover:bg-orange-700"
                    disabled={!newStatus || newStatus === selectedBooking.booking_status}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Update Status
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
         </Dialog>

         {/* Room Change Sheet */}
         <RoomChangeSheet
           isOpen={showRoomChange}
           onClose={() => setShowRoomChange(false)}
           selectedBooking={selectedBooking}
           availableRooms={rooms}
           onRoomChangeSuccess={handleRoomChangeSuccess}
         />
       </div>
     </div>
   )
 }

export default AdminBookingList