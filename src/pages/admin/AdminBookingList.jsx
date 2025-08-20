import React, { useEffect } from 'react'
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

function AdminBookingList() {
  const APIConn = `${localStorage.url}admin.php`;

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getBookings = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('method', 'viewBookings');
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
  };

  useEffect(() => {
    getBookings();
  }, []);

  const getAllStatus = async () => {
    const formData = new FormData();
    formData.append('method', 'getAllStatus');

    try {
      const res = await axios.post(APIConn, formData);
      console.log(res.data);
    } catch (err) {
      console.error('Error loading status:', err);
      toast.error('Error loading status');
    }
  }

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
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{bookings.length}</p>
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
                    {bookings.filter(b => b.booking_status === 'Upcoming').length}
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
                    {bookings.filter(b => b.booking_status === 'Active').length}
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
                    {bookings.filter(b => b.booking_status === 'Completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
            </div>

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
            ) : !Array.isArray(bookings) || bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Bookings Available</h3>
                <p className="text-gray-500 dark:text-gray-400">There are currently no bookings to display.</p>
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
                        <TableHead className="font-semibold text-gray-900 dark:text-white sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Room Types</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-white sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Room Numbers</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-white sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((b, i) => (
                        <TableRow key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <TableCell className="font-mono text-sm text-gray-900 dark:text-white">
                            {b.reference_no || '—'}
                          </TableCell>
                          <TableCell className="font-medium text-gray-900 dark:text-white">
                            {b.customer_name}
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">
                            {b.booking_checkin_dateandtime}
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">
                            {b.booking_checkout_dateandtime}
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">
                            {renderOrPending(b.room_types)}
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">
                            {renderOrPending(b.room_numbers)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(b.booking_status)}
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
      </div>
    </div>
  )
}

export default AdminBookingList