// This page is for Visitors

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Search, User, Mail, Phone, Building, Calendar, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

function ChooseBookForVisitor({ asModal = false, onConfirm, onClose }) {
  const [bookingRooms, setBookingRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeVisitorsMap, setActiveVisitorsMap] = useState({});

  const navigate = useNavigate();
  // Removed unused location hook
  const APIConn = `${localStorage.url}admin.php`;

  const fetchBookingRooms = useCallback(async () => {
    try {
      const formData = new FormData();
      // Align with BookingRoomSelection: fetch unified booking rooms dataset (Checked-In join)
      formData.append('method', 'get_booking_rooms');

      const response = await axios.post(APIConn, formData);
      const rooms = Array.isArray(response.data) ? response.data : [];

      // Normalize capacity-related fields to ensure consistent calculations
      const normalized = rooms.map(item => ({
        ...item,
        max_capacity: item.max_capacity ?? item.roomtype_capacity ?? 0,
        bookingRoom_adult: item.bookingRoom_adult ?? item.booking_room_adult ?? item.booking_adult ?? 0,
        bookingRoom_children: item.bookingRoom_children ?? item.booking_room_children ?? item.booking_children ?? 0,
      }));

      setBookingRooms(normalized);
      setFilteredRooms(normalized);
    } catch (error) {
      console.error('Error fetching booking rooms:', error);
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
        const bookingRoomId = log.booking_room_id ?? log.booking_id;
        if (!bookingRoomId) return;
        const checkout = log.visitorlogs_checkout_time;
        const statusRaw = statusNameById[String(log.visitorapproval_id ?? '')] || '';
        const status = statusRaw.toLowerCase();
        const isLeftLike = status.includes('left') || status.includes('checked-out') || status.includes('checkout');
        // Count only those still inside (no checkout and not marked left/checked-out)
        if (!checkout && !isLeftLike) {
          counts[bookingRoomId] = (counts[bookingRoomId] || 0) + 1;
        }
      });

      setActiveVisitorsMap(counts);
    } catch (error) {
      console.error('Error fetching active visitors map:', error);
      setActiveVisitorsMap({});
    }
  }, [APIConn]);

  useEffect(() => {
    fetchBookingRooms();
    fetchActiveVisitorsMap();
  }, [fetchBookingRooms, fetchActiveVisitorsMap]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRooms(bookingRooms);
    } else {
      const filtered = bookingRooms.filter(room =>
        String(room.customer_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(room.reference_no).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(room.roomtype_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(room.roomnumber_id).includes(searchTerm)
      );
      setFilteredRooms(filtered);
    }
  }, [searchTerm, bookingRooms]);

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
    return Object.values(groups).map(group => {
      let currentTotal = 0;
      let maxTotal = 0;
      group.rooms.forEach(r => {
        const adults = Number(r.bookingRoom_adult ?? 0);
        const children = Number(r.bookingRoom_children ?? 0);
        const visitors = Number(activeVisitorsMap[r.booking_room_id] ?? 0);
        const current = adults + children + visitors;
        const max = Number(r.max_capacity ?? 0);
        currentTotal += current;
        maxTotal += max;
      });
      return { ...group, currentTotal, maxTotal };
    });
  }, [filteredRooms, activeVisitorsMap]);

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
      return 'Invalid Date';
    }
  };

  const handleSelectRoom = (room) => {
    // Prevent selecting rooms at full capacity
    const adults = Number(room.bookingRoom_adult ?? 0);
    const children = Number(room.bookingRoom_children ?? 0);
    const visitors = Number(activeVisitorsMap[room.booking_room_id] ?? 0);
    const current = adults + children + visitors;
    const max = Number(room.max_capacity ?? 0);
    const isFull = max > 0 && current >= max;

    if (isFull) {
      toast.error('This room is at full capacity and cannot be selected.');
      return;
    }

    // Visitor flow: only one room can be selected
    setSelectedRoom(prev => (prev && prev.booking_room_id === room.booking_room_id) ? null : room);
  };

  const handleConfirm = () => {
    if (!selectedRoom) {
      toast.error('Please select a booking room');
      return;
    }
    // Guard: prevent confirming selection if selected room is full
    const adults = Number(selectedRoom.bookingRoom_adult ?? 0);
    const children = Number(selectedRoom.bookingRoom_children ?? 0);
    const visitors = Number(activeVisitorsMap[selectedRoom.booking_room_id] ?? 0);
    const current = adults + children + visitors;
    const max = Number(selectedRoom.max_capacity ?? 0);
    const isFull = max > 0 && current >= max;
    if (isFull) {
      toast.error('Selected room is at full capacity. Please choose another.');
      return;
    }
    if (asModal && typeof onConfirm === 'function') {
      try {
        onConfirm(selectedRoom);
      } finally {
        if (typeof onClose === 'function') onClose();
      }
    } else {
      navigate('/admin/visitorslog', {
        state: {
          openVisitorModal: true,
          selectedBookingRoom: selectedRoom,
          selectedBookingRooms: [selectedRoom]
        }
      });
    }
  };

  const handleBack = () => {
    if (asModal && typeof onClose === 'function') {
      onClose();
    } else {
      navigate('/admin/visitorslog');
    }
  };

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
          <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {asModal ? 'Close' : 'Back to Visitors Log'}
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Select Booking Room</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Choose a booking room for visitor logging</p>
          </div>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Booking Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{bookingRooms.length}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Checked-In only</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Filtered Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{groupedRooms.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Search Rooms</CardTitle>
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

      {/* Selected Room Details with Confirmation */}
      {selectedRoom && (() => {
        const adults = Number(selectedRoom.bookingRoom_adult ?? 0);
        const children = Number(selectedRoom.bookingRoom_children ?? 0);
        const visitors = Number(activeVisitorsMap[selectedRoom.booking_room_id] ?? 0);
        const current = adults + children + visitors;
        const max = Number(selectedRoom.max_capacity ?? 0);
        const selectedIsFull = max > 0 && current >= max;
        return (
        <Card className="border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                <CheckCircle className="h-5 w-5" /> Selected Booking Room
              </CardTitle>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setSelectedRoom(null)} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  Clear
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={selectedIsFull}
                  className={`text-white shadow-lg hover:shadow-xl transition-all duration-200 ${
                    selectedIsFull
                      ? 'bg-red-600 hover:bg-red-700 cursor-not-allowed opacity-90'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  }`}
                >
                  Confirm Selection
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Customer</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedRoom.customer_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Room</p>
                  <p className="font-medium text-gray-900 dark:text-white">#{selectedRoom.roomnumber_id} • {selectedRoom.roomtype_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Check-in</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedRoom.booking_checkin_dateandtime)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {selectedRoom.reference_no}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs ${selectedIsFull ? 'text-red-700 border-red-300 dark:text-red-300 dark:border-red-700' : 'text-green-700 border-green-300 dark:text-green-300 dark:border-green-700'}`}
                >
                  {max ? `${current}/${max}` : `${current}`} capacity
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        );
      })()}

      {/* Booking Rooms Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" /> Available Booking Rooms
            </CardTitle>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Shows currently checked-in bookings only.</p>
        </CardHeader>
        <CardContent>
          {groupedRooms.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Building className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p className="font-medium text-lg mb-2 text-gray-700 dark:text-gray-300">{searchTerm ? 'No rooms found matching your search' : 'No booking rooms available'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{searchTerm ? 'Try adjusting your search terms' : 'Check back later for new bookings'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>

                    <TableHead>Reference</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>

                    <TableHead>Current Capacity</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedRooms.map((group) => {
                    const capacityInfo = group.rooms.map(r => {
                      const adults = Number(r.bookingRoom_adult ?? 0);
                      const children = Number(r.bookingRoom_children ?? 0);
                      const visitors = Number(activeVisitorsMap[r.booking_room_id] ?? 0);
                      const current = adults + children + visitors;
                      const max = Number(r.max_capacity ?? 0);
                      return { room: r, current, max, isFull: max > 0 && current >= max };
                    });
                    const allFull = capacityInfo.every(ci => ci.isFull);
                    const isSelected = selectedRoom && capacityInfo.some(ci => ci.room.booking_room_id === selectedRoom.booking_room_id);
                    return (
                      <TableRow
                        key={group.reference_no}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 ${
                          isSelected ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-sm' : ''
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
                            <p className="font-medium">{group.maxTotal > 0 ? `${group.currentTotal}/${group.maxTotal}` : `${group.currentTotal}`}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {group.rooms.map(r => {
                                const adults = Number(r.bookingRoom_adult ?? 0);
                                const children = Number(r.bookingRoom_children ?? 0);
                                const visitors = Number(activeVisitorsMap[r.booking_room_id] ?? 0);
                                const current = adults + children + visitors;
                                const max = Number(r.max_capacity ?? 0);
                                return `#${r.roomnumber_id} ${max ? `${current}/${max}` : `${current}`}`;
                              }).join(', ')}
                            </p>
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
                                variant={isSelected ? 'default' : 'outline'}
                                disabled={allFull}
                                className={`min-w-[140px] ${
                                  allFull
                                    ? 'bg-red-600 hover:bg-red-700 text-white cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                                    : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                }`}
                              >
                                {allFull ? 'All Rooms Full' : isSelected ? 'Selected' : 'Select'}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[260px]">
                              {capacityInfo.map(({ room, current, max, isFull }) => (
                                <DropdownMenuItem
                                  key={room.booking_room_id}
                                  disabled={isFull}
                                  onClick={() => {
                                    if (!isFull) handleSelectRoom(room);
                                  }}
                                >
                                  <div className="flex items-center w-full">
                                    <span className="mr-2">Room #{room.roomnumber_id}</span>
                                    <span className="text-xs text-gray-500">{room.roomtype_name}</span>
                                    <span className="ml-auto text-xs text-gray-500">{max ? `${current}/${max}` : `${current}`}</span>
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ChooseBookForVisitor;