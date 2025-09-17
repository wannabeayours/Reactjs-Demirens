import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, AlertCircle, Search, X } from "lucide-react";
import axios from 'axios';
import { formatDateTime } from '@/lib/utils';

function RoomChangeSheet({
  isOpen,
  onClose,
  selectedBooking,
  availableRooms = [],
  onRoomChangeSuccess
}) {
  const APIConn = `${localStorage.url}admin.php`;

  const [loading, setLoading] = useState(false);
  const [roomNumbers, setRoomNumbers] = useState({});
  const [currentRooms, setCurrentRooms] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate payment details based on selected rooms
  const calculatePaymentDetails = () => {
    if (!selectedBooking) return { total: 0, vat: 0, nights: 0, downpayment: 0 };

    // Calculate nights
    const checkIn = new Date(selectedBooking.booking_checkin_dateandtime);
    const checkOut = new Date(selectedBooking.booking_checkout_dateandtime);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    // Calculate total based on selected rooms
    let totalAmount = 0;
    const selectedRoomNumbers = Object.values(roomNumbers).filter(room => room.trim() !== '');
    const currentRoomNumbers = currentRooms.map(room => room.trim());

    // Only calculate for new rooms (not current rooms)
    const newRoomsOnly = selectedRoomNumbers.filter(room => !currentRoomNumbers.includes(room));

    newRoomsOnly.forEach(roomNumber => {
      const room = availableRooms.find(r => r.roomnumber_id.toString() === roomNumber);
      if (room) {
        totalAmount += parseFloat(room.roomtype_price) * nights;
      }
    });

    // Add original booking amount for current rooms
    const originalAmount = parseFloat(selectedBooking.total_amount) || 0;
    totalAmount += originalAmount;

    // Apply discount if selected
    const discountAmount = selectedDiscount ? (totalAmount * selectedDiscount.discounts_percent / 100) : 0;
    const discountedAmount = totalAmount - discountAmount;

    const vat = discountedAmount * 0.12; // 12% VAT on discounted amount
    const totalWithVat = discountedAmount + vat;
    const downpayment = totalWithVat * 0.5; // 50% downpayment

    return {
      total: totalAmount,
      discountAmount: discountAmount,
      discountedAmount: discountedAmount,
      vat: vat,
      totalWithVat: totalWithVat,
      nights: nights,
      downpayment: downpayment
    };
  };

  const paymentDetails = calculatePaymentDetails();

  // Filter available rooms based on search query
  const filteredRooms = availableRooms.filter(room => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      room.roomnumber_id.toString().includes(query) ||
      (room.roomtype_name && room.roomtype_name.toLowerCase().includes(query)) ||
      room.roomfloor.toString().includes(query) ||
      room.roomtype_capacity.toString().includes(query) ||
      (room.roomtype_beds && room.roomtype_beds.toString().toLowerCase().includes(query)) ||
      (room.roomtype_sizes && room.roomtype_sizes.toString().toLowerCase().includes(query)) ||
      room.roomtype_price.toString().includes(query)
    );
  });

  // Fetch available discounts
  const fetchDiscounts = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append('method', 'getAllDiscounts');
      formData.append('json', JSON.stringify({}));

      const res = await axios.post(APIConn, formData);
      if (res.data && Array.isArray(res.data)) {
        setDiscounts(res.data);
      }
    } catch (err) {
      console.error('Error fetching discounts:', err);
    }
  }, [APIConn]);

  // Recalculate payment details when room numbers or discount change
  useEffect(() => {
    // This will trigger a re-render when roomNumbers, availableRooms, or selectedDiscount change
  }, [roomNumbers, availableRooms, selectedDiscount]);

  // Fetch discounts when component mounts
  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  // Check if booking status allows room changes
  const canChangeRooms = () => {
    if (!selectedBooking) return false;
    return selectedBooking.booking_status === 'Approved' ||
      selectedBooking.booking_status === 'Checked In' ||
      selectedBooking.booking_status === 'Checked-In';
  };

  // Initialize current rooms when booking changes
  useEffect(() => {
    if (selectedBooking && selectedBooking.room_numbers) {
      const rooms = selectedBooking.room_numbers.split(',').map(room => room.trim()).filter(room => room);
      setCurrentRooms(rooms);

      // Initialize room numbers mapping
      const roomMap = {};
      rooms.forEach((room, index) => {
        roomMap[index] = room;
      });
      setRoomNumbers(roomMap);
    }
  }, [selectedBooking]);

  // Clear search when sheet is closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle room number change
  const handleRoomNumberChange = (index, newRoomNumber) => {
    setRoomNumbers(prev => ({
      ...prev,
      [index]: newRoomNumber
    }));
  };

  // Clear search query
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Handle room change submission
  const handleSubmitRoomChange = async () => {
    if (!canChangeRooms()) {
      toast.error('Room changes are only allowed for Approved or Checked-In bookings');
      return;
    }

    const newRoomNumbers = Object.values(roomNumbers).filter(room => room.trim() !== '');

    if (newRoomNumbers.length === 0) {
      toast.error('Please select at least one room');
      return;
    }

    // Check if any room numbers are duplicated
    const uniqueRooms = [...new Set(newRoomNumbers)];
    if (uniqueRooms.length !== newRoomNumbers.length) {
      toast.error('Duplicate room numbers are not allowed');
      return;
    }

    // Check if all selected rooms are available (excluding current rooms)
    const currentRoomNumbers = currentRooms.map(room => room.trim());
    const newRoomsOnly = newRoomNumbers.filter(room => !currentRoomNumbers.includes(room));

    const unavailableRooms = newRoomsOnly.filter(room =>
      !availableRooms.some(availableRoom => availableRoom.roomnumber_id.toString() === room)
    );

    if (unavailableRooms.length > 0) {
      toast.error(`The following rooms are not available: ${unavailableRooms.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      // Prepare the data that will be sent to the API
      const requestData = {
        booking_id: selectedBooking.booking_id || selectedBooking.id,
        room_numbers: newRoomNumbers.join(','), // Convert array to comma-separated string
        employee_id: localStorage.getItem('employeeId') || 1,
        booking_totalAmount: paymentDetails.totalWithVat,
        booking_downpayment: paymentDetails.downpayment,
        discounts_id: selectedDiscount ? selectedDiscount.discounts_id : null
      };

      // Display the data that will be sent (for review)
      console.log('=== ROOM CHANGE DATA PREVIEW ===');
      console.log('Method:', 'changeCustomerRoomsNumber');
      console.log('Request Data:', requestData);
      console.log('FormData Structure:');
      console.log('  method: changeCustomerRoomsNumber');
      console.log('  json:', JSON.stringify(requestData));
      console.log('================================');

      // Show the data in a toast for easy review
      toast.info(
        `Data to be sent:\nMethod: changeCustomerRoomsNumber\nData: ${JSON.stringify(requestData, null, 2)}`,
        { duration: 10000 }
      );

      const formData = new FormData();
      formData.append('method', 'changeCustomerRoomsNumber');
      formData.append('json', JSON.stringify(requestData));

      const res = await axios.post(APIConn, formData);

      console.log('API Response:', res.data);

      if (res?.data?.success || res?.data === 1 || res?.data === 'success' || res?.data === true) {
        toast.success(`Room numbers updated successfully for booking ${selectedBooking.reference_no}`);
        onRoomChangeSuccess && onRoomChangeSuccess();
        onClose();
      } else {
        const errorMsg = res?.data?.message || res?.data?.error || res?.data || 'Failed to update room numbers';
        console.error('API Error Response:', res.data);
        toast.error(`Error: ${errorMsg}`);
      }


    } catch (err) {
      console.error('Room change error:', err);
      toast.error('Error preparing room change data');
    } finally {
      setLoading(false);
    }
  };

  // add/remove room slots disabled

  if (!selectedBooking) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="w-full h-[85vh] max-h-[85vh] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Change Room Numbers
          </SheetTitle>
          <SheetDescription>
            Update room numbers for booking {selectedBooking.reference_no}
          </SheetDescription>
          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Instructions:</strong> Click on any available room below to auto-fill, or manually type room numbers.
              You can only change existing room numbers; adding or removing rooms is disabled.
            </p>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Booking Status Check */}
          {!canChangeRooms() && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">
                    Room changes are only allowed for bookings with "Approved" or "Checked In" status.
                    Current status: <Badge variant="outline">{selectedBooking.booking_status}</Badge>
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer & Booking Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Customer</Label>
                  <p className="text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                    {selectedBooking.customer_name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs sm:text-sm">{selectedBooking.booking_status}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Check-in</Label>
                  <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                    {formatDateTime(selectedBooking.booking_checkin_dateandtime)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Check-out</Label>
                  <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                    {formatDateTime(selectedBooking.booking_checkout_dateandtime)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Rooms */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Room Numbers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {currentRooms.map((room, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    Room {room}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Room Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">New Room Numbers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {Object.entries(roomNumbers).map(([index, roomNumber]) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="flex-1 w-full">
                    <Label htmlFor={`room-${index}`} className="text-sm">Room {parseInt(index) + 1}</Label>
                    <Input
                      id={`room-${index}`}
                      value={roomNumber}
                      onChange={(e) => handleRoomNumberChange(index, e.target.value)}
                      onFocus={() => setActiveIndex(parseInt(index))}
                      placeholder="Enter room number"
                      disabled={!canChangeRooms()}
                      className="text-sm sm:text-base"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Available Rooms Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Available Rooms ({filteredRooms.length}{searchQuery && ` of ${availableRooms.length}`})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search Input */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search by room number, type, floor, capacity, beds, size, or price..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <p className="text-sm text-gray-500 mt-2">
                    Showing {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} matching "{searchQuery}"
                  </p>
                )}
              </div>

              <div className="max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4">
                  {filteredRooms.map((room, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-3 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors min-h-[140px] flex flex-col justify-between"
                      onClick={() => {
                        if (canChangeRooms() && activeIndex !== null) {
                          handleRoomNumberChange(activeIndex, room.roomnumber_id.toString());
                        }
                      }}
                    >
                      <div className="text-center">
                        <div className="font-bold text-lg text-blue-600 mb-1">
                          Room {room.roomnumber_id}
                        </div>
                        <div className="text-sm text-gray-700 mb-2 leading-tight">
                          {room.roomtype_name}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          Floor {room.roomfloor} • {room.roomtype_capacity} guests
                        </div>
                        <div className="text-xs text-gray-500">
                          {room.roomtype_beds} beds • {room.roomtype_sizes}
                        </div>
                      </div>
                      <div className="text-center mt-2">
                        <div className="font-bold text-lg text-green-600">
                          ${parseFloat(room.roomtype_price).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">per night</div>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredRooms.length === 0 && (
                  <div className="text-center py-8">
                    {searchQuery ? (
                      <div>
                        <p className="text-gray-500 text-sm mb-2">No rooms found matching "{searchQuery}"</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearSearch}
                          className="text-xs"
                        >
                          Clear search
                        </Button>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No available rooms found</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Discount Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Apply Discount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor="discount-select">Select Discount</Label>
                <Select
                  value={selectedDiscount ? selectedDiscount.discounts_id.toString() : "none"}
                  onValueChange={(value) => {
                    if (value === "none") {
                      setSelectedDiscount(null)
                    } else {
                      const discount = discounts.find(d => d.discounts_id.toString() === value)
                      setSelectedDiscount(discount || null)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No discount applied" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No discount</SelectItem>   {/* ✅ fixed */}
                    {discounts.map((discount) => (
                      <SelectItem
                        key={discount.discounts_id}
                        value={discount.discounts_id.toString()}
                      >
                        {discount.discounts_type} - {discount.discounts_percent}% off
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedDiscount && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      <strong>{selectedDiscount.discounts_type}</strong>: {selectedDiscount.discounts_percent}% discount applied
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Payment Details
                {paymentDetails.total !== (parseFloat(selectedBooking?.total_amount) || 0) && (
                  <Badge variant="secondary" className="text-xs">
                    Updated
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Base Amount:</span>
                <span className="font-medium">${paymentDetails.total.toFixed(2)}</span>
              </div>
              {selectedDiscount && (
                <>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Discount ({selectedDiscount.discounts_percent}%):</span>
                    <span className="font-medium text-red-600">-${paymentDetails.discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">After Discount:</span>
                    <span className="font-medium">${paymentDetails.discountedAmount.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">VAT (12%):</span>
                <span className="font-medium">${paymentDetails.vat.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Total with VAT:</span>
                <span className="font-semibold">${paymentDetails.totalWithVat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Nights:</span>
                <span className="font-medium">{paymentDetails.nights}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Downpayment (50%):</span>
                <span className="font-semibold text-blue-600">${paymentDetails.downpayment.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Balance (50%):</span>
                <span className="font-semibold text-green-600">${(paymentDetails.totalWithVat - paymentDetails.downpayment).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRoomChange}
              disabled={!canChangeRooms() || loading}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Update Rooms
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default RoomChangeSheet;
