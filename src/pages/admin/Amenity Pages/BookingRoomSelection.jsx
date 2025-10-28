// This page is for booking room selection in Amenities

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft,
  Search,
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Users,
  CheckCircle,
  Package
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

function AdminBookingRoomSelection() {
  const [bookingRooms, setBookingRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [activeVisitorsMap, setActiveVisitorsMap] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const origin = location.state?.origin || null;
  const isVisitorOrigin = origin === 'visitorslog';
  const APIConn = `${localStorage.url}admin.php`;

  // Function to filter out duplicate bookings - keep latest booking rooms and non-extended rooms from older bookings
  const filterLatestBookings = (rooms) => {
    if (!rooms || rooms.length === 0) return [];
    
    // Group bookings by customer (using email + phone as unique identifier)
    const customerBookings = {};
    
    rooms.forEach(room => {
      const customerKey = `${room.customers_email}_${room.customers_phone}`;
      
      if (!customerBookings[customerKey]) {
        customerBookings[customerKey] = [];
      }
      customerBookings[customerKey].push(room);
    });
    
    const filteredBookings = [];
    
    Object.values(customerBookings).forEach(customerRooms => {
      // Sort by booking_id in descending order to get the latest booking first
      const sortedRooms = customerRooms.sort((a, b) => b.booking_id - a.booking_id);
      
      // If the latest booking is not Checked-In, skip all rooms for this customer
      const latestStatusName = String(sortedRooms[0]?.booking_status_name || '').toLowerCase();
      if (latestStatusName !== 'checked-in') {
        console.log(`⛔ Skipping customer ${customerRooms[0].customer_name}: latest status is ${sortedRooms[0]?.booking_status_name || 'Unknown'}`);
        return; // Do not include any rooms for customers not currently checked-in
      }
      
      if (sortedRooms.length === 1) {
        // Only one booking, keep all rooms
        filteredBookings.push(...sortedRooms);
        return;
      }
      
      // Get the latest booking (highest booking_id)
      const latestBookingId = sortedRooms[0].booking_id;
      const latestBookingRooms = customerRooms.filter(room => room.booking_id === latestBookingId);
      
      // Get all other bookings (older bookings)
      const olderBookings = customerRooms.filter(room => room.booking_id !== latestBookingId);
      
      // Find which rooms from older bookings are NOT covered in the latest booking
      const latestRoomNumbers = latestBookingRooms.map(room => room.roomnumber_id);
      const nonExtendedRooms = olderBookings.filter(room => 
        !latestRoomNumbers.includes(room.roomnumber_id)
      );
      
      // Combine latest booking rooms with non-extended rooms from older bookings
      const finalRooms = [...latestBookingRooms, ...nonExtendedRooms];
      filteredBookings.push(...finalRooms);
      
      console.log(`🔍 Customer: ${customerRooms[0].customer_name}`);
      console.log(`   Latest booking (ID: ${latestBookingId}): ${latestBookingRooms.length} rooms`);
      console.log(`   Non-extended rooms from older bookings: ${nonExtendedRooms.length} rooms`);
      console.log(`   Total rooms for this customer: ${finalRooms.length}`);
    });
    
    console.log('🔍 Original bookings:', rooms.length);
    console.log('🔍 Filtered bookings (smart filtering):', filteredBookings.length);
    console.log('🔍 Removed duplicates:', rooms.length - filteredBookings.length);
    
    return filteredBookings;
  };

  const fetchBookingRooms = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append('method', 'get_booking_rooms');
      
      console.log('🏨 Fetching booking rooms from:', APIConn);
      const response = await axios.post(APIConn, formData);
      console.log('📋 Booking rooms API response:', response.data);
      console.log('📊 Number of booking rooms received:', response.data?.length || 0);
      
      const rooms = response.data || [];
      
      // Filter out duplicate bookings - keep only the latest booking for each customer
      const filteredRooms = filterLatestBookings(rooms);
      console.log('🔄 Filtered rooms (removed duplicates):', filteredRooms.length);
      
      setBookingRooms(filteredRooms);
      setFilteredRooms(filteredRooms);
      console.log('✅ Booking rooms set successfully');
    } catch (error) {
      console.error('❌ Error fetching booking rooms:', error);
      console.error('📝 Error response:', error.response?.data);
      console.error('📝 Error status:', error.response?.status);
      toast.error('Failed to fetch booking rooms');
      setBookingRooms([]);
      setFilteredRooms([]);
    } finally {
      setLoading(false);
    }
  }, [APIConn]);

  // Fetch active visitors per booking using visitor logs and approval statuses.
  // Active = no checkout time AND status is not a "left" or "checked-out" variant.
  const fetchActiveVisitorsMap = useCallback(async () => {
    try {
      // Get approval statuses to translate ids to names
      const fdStatuses = new FormData();
      fdStatuses.append('method', 'get_visitor_approval_statuses');
      const resStatuses = await axios.post(APIConn, fdStatuses);
      const approvals = Array.isArray(resStatuses.data) ? resStatuses.data : [];
      const statusNameById = {};
      approvals.forEach(a => {
        const id = String(a.visitorapproval_id ?? a.id ?? '');
        const name = String(a.visitorapproval_status ?? a.status ?? '').toLowerCase();
        if (id) statusNameById[id] = name;
      });

      // Get visitor logs
      const fdLogs = new FormData();
      fdLogs.append('method', 'getVisitorLogs');
      const resLogs = await axios.post(APIConn, fdLogs);
      const logs = Array.isArray(resLogs.data) ? resLogs.data : [];

      const counts = {};
      logs.forEach(log => {
        const bookingId = log.booking_id;
        if (!bookingId) return;
        const checkout = log.visitorlogs_checkout_time;
        const statusRaw = statusNameById[String(log.visitorapproval_id ?? '')] || '';
        const status = statusRaw.toLowerCase();
        const isLeftLike = status.includes('left') || status.includes('checked-out') || status.includes('checkout');
        // Count only those still inside (no checkout and not marked left/checked-out)
        if (!checkout && !isLeftLike) {
          counts[bookingId] = (counts[bookingId] || 0) + 1;
        }
      });

      setActiveVisitorsMap(counts);
    } catch (error) {
      console.error('❌ Error fetching active visitors map:', error);
      setActiveVisitorsMap({});
    }
  }, [APIConn]);

  // Filter rooms based on search term
  useEffect(() => {
    // Base rooms from fetch + smart dedup
    let rooms = bookingRooms;
  
    // When coming from Visitors Log, only show bookings that are Checked-In
    // Backend already filters to Checked-In only, so no need to filter here
    // if (isVisitorOrigin) {
    //   rooms = rooms.filter(room => String(room.booking_status_name).toLowerCase() === 'checked-in');
    // }
  
    if (!searchTerm.trim()) {
      setFilteredRooms(rooms);
    } else {
      const filtered = rooms.filter(room =>
        room.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.reference_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.roomtype_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(room.roomnumber_id).includes(searchTerm)
      );
      setFilteredRooms(filtered);
    }
  }, [searchTerm, bookingRooms, isVisitorOrigin]);

  useEffect(() => {
    fetchBookingRooms();
    fetchActiveVisitorsMap();
  }, [fetchBookingRooms, fetchActiveVisitorsMap]);

  // Group rooms by reference number for a compact, clearer display
  const groupedRooms = useMemo(() => {
    const groups = {};
    filteredRooms.forEach(room => {
      const ref = room.reference_no || room.booking_id || 'N/A';
      if (!groups[ref]) {
        groups[ref] = {
          reference_no: ref,
          customer_name: room.customer_name,
          customers_email: room.customers_email,
          customers_phone: room.customers_phone,
          booking_checkin_dateandtime: room.booking_checkin_dateandtime,
          booking_checkout_dateandtime: room.booking_checkout_dateandtime,
          rooms: []
        };
      }
      groups[ref].rooms.push(room);
    });
    return Object.values(groups);
  }, [filteredRooms]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '₱0.00';
    }
    
    try {
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return '₱0.00';
    }
  };

  const handleRoomSelect = (room) => {
    // Prevent selecting rooms at full capacity only for Visitors flow
    const adults = Number(room.bookingRoom_adult ?? 0);
    const children = Number(room.bookingRoom_children ?? 0);
    const visitors = Number(activeVisitorsMap[room.booking_id] ?? 0);
    const current = adults + children + visitors;
    const max = Number(room.max_capacity ?? 0);
    const isFull = max > 0 && current >= max;
    if (isVisitorOrigin && isFull) {
      toast.error('This room is at full capacity and cannot be selected.');
      return;
    }

    setSelectedRooms(prevSelected => {
      const isSelected = prevSelected.some(selected => selected.booking_room_id === room.booking_room_id);

      if (isSelected) {
        // Remove room from selection
        const updated = prevSelected.filter(selected => selected.booking_room_id !== room.booking_room_id);
        console.log('🏨 Removed room from selection:', room.roomnumber_id, 'Total selected:', updated.length);
        return updated;
      } else {
        if (isVisitorOrigin) {
          // Visitors can only select ONE booking
          const updated = [room];
          console.log('🏨 Selected single room for visitor flow:', room.roomnumber_id);
          return updated;
        }
        const updated = [...prevSelected, room];
        console.log('🏨 Added room to selection (amenities flow):', room.roomnumber_id, 'Total selected:', updated.length);
        return updated;
      }
    });
  };

  const handleConfirmSelection = () => {
    if (selectedRooms.length === 0) {
      toast.error('Please select at least one booking room');
      return;
    }

    // Capacity guard applies only to Visitors flow
    if (isVisitorOrigin) {
      const hasFull = selectedRooms.some(r => {
        const adults = Number(r.bookingRoom_adult ?? 0);
        const children = Number(r.bookingRoom_children ?? 0);
        const visitors = Number(activeVisitorsMap[r.booking_id] ?? 0);
        const current = adults + children + visitors;
        const max = Number(r.max_capacity ?? 0);
        return max > 0 && current >= max;
      });
      if (hasFull) {
        toast.error('One or more selected rooms are at full capacity. Please adjust selection.');
        return;
      }
    }

    console.log('✅ Confirmed selected rooms:', selectedRooms);
    if (origin === 'visitorslog') {
      navigate('/admin/visitorslog', {
        state: { selectedBookingRooms: selectedRooms, openVisitorModal: true }
      });
      return;
    }

    // Amenities flow: return to Requested Amenities and auto-open modal
    navigate('/admin/requestedamenities', {
      state: { selectedBookingRooms: selectedRooms, openAmenityModal: true }
    });
  };

  const handleBackToAmenities = () => {
    const origin = location.state?.origin || null;
    if (origin === 'visitorslog') {
      navigate('/admin/visitorslog');
      return;
    }
    navigate('/admin/requestedamenities');
  };

  const handleCancelSelection = () => {
    setSelectedRooms([]);
  };

  const handleSelectAll = () => {
    const selectableRooms = filteredRooms.filter(r => {
      if (!isVisitorOrigin) return true; // In amenities flow, allow all rooms
      const adults = Number(r.bookingRoom_adult ?? 0);
      const children = Number(r.bookingRoom_children ?? 0);
      const visitors = Number(activeVisitorsMap[r.booking_id] ?? 0);
      const current = adults + children + visitors;
      const max = Number(r.max_capacity ?? 0);
      return !(max > 0 && current >= max);
    });
    if (selectedRooms.length === selectableRooms.length) {
      setSelectedRooms([]);
      console.log('🏨 Deselected all rooms');
    } else {
      setSelectedRooms([...selectableRooms]);
      console.log('🏨 Selected all rooms (excluding full capacity):', selectableRooms.length);
    }
  };

  // Define columns for DataTable
  const columns = useMemo(() => [
    {
      header: 'Reference',
      accessor: (row) => row?.reference_no || '—',
      sortable: true,
      headerClassName: 'min-w-[140px]'
    },
    {
      header: 'Customer',
      accessor: (row) => row?.customer_name || '—',
      sortable: true,
      cell: (row) => (
        <div className="space-y-1">
          <p className="font-medium text-gray-900 dark:text-white">{row.customer_name}</p>
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <Users className="h-3 w-3" />
            {(Number(row.bookingRoom_adult || 0) + Number(row.bookingRoom_children || 0))} guests
          </div>
        </div>
      )
    },
    {
      header: 'Contact',
      accessor: (row) => row?.customers_email || row?.customers_phone || '—',
      sortable: false,
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
            <Mail className="h-3 w-3" />
            {row.customers_email}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
            <Phone className="h-3 w-3" />
            {row.customers_phone}
          </div>
        </div>
      )
    },
    {
      header: 'Room Details',
      accessor: (row) => row?.roomnumber_id || 0,
      sortable: true,
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Building className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">
              Room #{row.roomnumber_id}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">{row.roomtype_name}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Floor {row.roomfloor}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(row.roomtype_price)}/night
            </Badge>
          </div>
        </div>
      )
    },
    {
      header: 'Current Capacity',
      accessor: (row) => {
        const adults = Number(row.bookingRoom_adult || 0);
        const children = Number(row.bookingRoom_children || 0);
        const visitors = Number(activeVisitorsMap[row.booking_id] || 0);
        return adults + children + visitors;
      },
      sortable: true,
      cell: (row) => {
        const adults = Number(row.bookingRoom_adult || 0);
        const children = Number(row.bookingRoom_children || 0);
        const visitors = Number(activeVisitorsMap[row.booking_id] || 0);
        return (
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
            <Users className="h-3 w-3" />
            {`${adults + children + visitors}/${Number(row.max_capacity || 0)}`}
          </div>
        );
      }
    },
    {
      header: 'Check-in',
      accessor: (row) => row?.booking_checkin_dateandtime || '',
      sortable: true,
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
            <Calendar className="h-3 w-3" />
            {formatDate(row.booking_checkin_dateandtime)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Check-out: {formatDate(row.booking_checkout_dateandtime)}
          </p>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row) => row?.booking_status_name || '—',
      sortable: true,
      cell: (row) => (
        <Badge 
          variant="outline" 
          className={`${
            row.booking_status_name === 'Approved' 
              ? 'border-green-500 text-green-700 dark:text-green-400' 
              : row.booking_status_name === 'Checked-In'
              ? 'border-blue-500 text-blue-700 dark:text-blue-400'
              : 'border-gray-500 text-gray-700 dark:text-gray-400'
          }`}
        >
          {row.booking_status_name}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'action',
      cell: (row) => {
        const adults = Number(row.bookingRoom_adult || 0);
        const children = Number(row.bookingRoom_children || 0);
        const visitors = Number(activeVisitorsMap[row.booking_id] || 0);
        const current = adults + children + visitors;
        const max = Number(row.max_capacity || 0);
        const isFull = max > 0 && current >= max;
        const isSelected = selectedRooms.some(s => s.booking_room_id === row.booking_room_id);
        return (
          <Button
            size="sm"
            variant={isSelected ? 'default' : 'outline'}
            disabled={isVisitorOrigin && isFull}
            onClick={(e) => {
              e.stopPropagation();
              if (isVisitorOrigin && isFull) return;
              handleRoomSelect(row);
            }}
            className={`min-w-[100px] transition-all duration-200 ${
              isVisitorOrigin && isFull
                ? 'bg-red-600 hover:bg-red-700 text-white cursor-not-allowed opacity-90'
                : isSelected 
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
                : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
          >
            {isVisitorOrigin && isFull ? 'Full Capacity' : isSelected ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Selected
              </>
            ) : 'Select'}
          </Button>
        );

      },
      headerClassName: 'text-right',
      className: 'text-right'
    }
  ], [activeVisitorsMap, selectedRooms]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleBackToAmenities}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {isVisitorOrigin ? 'Back to Visitors Log' : 'Back to Amenity Requests'}
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Select Booking Room
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isVisitorOrigin ? 'Choose a booking room for visitor logging' : 'Choose a booking room to add amenities for'}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Available Booking Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {bookingRooms.length}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Smart filtering active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Filtered Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {groupedRooms.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Selected Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedRooms.length}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {selectedRooms.length > 0 ? `${selectedRooms.map(r => `#${r.roomnumber_id}`).join(', ')}` : 'None selected'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Search Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, reference, room type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Rooms Details with Confirmation */}
      {selectedRooms.length > 0 && (
        <Card className="border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                <CheckCircle className="h-5 w-5" />
                Selected Booking Rooms ({selectedRooms.length})
              </CardTitle>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleCancelSelection}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Clear All
                </Button>
                <Button
                  onClick={handleConfirmSelection}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Package className="h-4 w-4 mr-2" />
                  {isVisitorOrigin ? 'Select Booking' : `Add Amenities to ${selectedRooms.length} Room${selectedRooms.length > 1 ? 's' : ''}`}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedRooms.map((room) => (
                <div key={room.booking_room_id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Customer</p>
                      <p className="font-medium text-gray-900 dark:text-white">{room.customer_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Room</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        #{room.roomnumber_id} • {room.roomtype_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Check-in</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(room.booking_checkin_dateandtime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Reference</p>
                      <p className="font-medium text-gray-900 dark:text-white">{room.reference_no}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Rooms Table with Pagination */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Available Booking Rooms
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Smart filtering
              </Badge>
              {!isVisitorOrigin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  {selectedRooms.length === filteredRooms.filter(r => {
                    const adults = Number(r.bookingRoom_adult ?? 0);
                    const children = Number(r.bookingRoom_children ?? 0);
                    const visitors = Number(activeVisitorsMap[r.booking_id] ?? 0);
                    const current = adults + children + visitors;
                    const max = Number(r.max_capacity ?? 0);
                    return !(max > 0 && current >= max);
                  }).length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Shows latest booking rooms and non-extended rooms from older bookings to avoid confusion.
          </p>
        </CardHeader>
        <CardContent>
          {/* Grouped-by-reference table with multi-select actions */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedRooms.map((group) => {
                  const isGroupSelected = selectedRooms.some(sr => group.rooms.some(r => r.booking_room_id === sr.booking_room_id));
                  return (
                    <TableRow
                      key={group.reference_no}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 ${
                        isGroupSelected ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-sm' : ''
                      }`}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{group.reference_no}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Group of {group.rooms.length} rooms</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-gray-900 dark:text-white">{group.customer_name}</p>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                            <Mail className="h-3 w-3" /> {group.customers_email}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                            <Phone className="h-3 w-3" /> {group.customers_phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                            <Calendar className="h-3 w-3" /> {formatDate(group.booking_checkin_dateandtime)}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Check-out: {formatDate(group.booking_checkout_dateandtime)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant={isGroupSelected ? 'default' : 'outline'}
                              className="min-w-[120px]"
                            >
                              {isGroupSelected ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Selected
                                </>
                              ) : 'Select Rooms'}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-[280px]">
                            <DropdownMenuLabel>Select rooms</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {group.rooms.map((room) => {
                              const adults = Number(room.bookingRoom_adult ?? 0);
                              const children = Number(room.bookingRoom_children ?? 0);
                              const visitors = Number(activeVisitorsMap[room.booking_id] ?? 0);
                              const current = adults + children + visitors;
                              const max = Number(room.max_capacity ?? 0);
                              const isFull = max > 0 && current >= max;
                              const isSelectedRoom = selectedRooms.some(s => s.booking_room_id === room.booking_room_id);
                              return (
                                <DropdownMenuItem
                                  key={room.booking_room_id}
                                  disabled={isVisitorOrigin && isFull}
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (isVisitorOrigin && isFull) return;
                                    handleRoomSelect(room);
                                  }}
                                  className={`${isSelectedRoom ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
                                >
                                  <div className="flex items-center gap-2 w-full">
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-white">#{room.roomnumber_id}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">{room.roomtype_name}</p>
                                    </div>
                                    <span className="ml-auto text-xs text-gray-500">
                                      {max ? `${current}/${max}` : `${current}`}
                                    </span>
                                    {isSelectedRoom && <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />}
                                  </div>
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

export default AdminBookingRoomSelection;
