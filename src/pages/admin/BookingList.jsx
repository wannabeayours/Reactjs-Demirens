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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Filter, ArrowRightLeft, Eye, Settings, CalendarPlus, ChevronDown, ChevronUp, CalendarIcon, AlertTriangle, ExternalLink, ClockArrowUp, ClockArrowDown } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import { NumberFormatter } from './Function_Files/NumberFormatter'
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
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [sortBy, setSortBy] = useState('booking_created_at');
  const [status, setStatus] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [showRoomChange, setShowRoomChange] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [showExtendBooking, setShowExtendBooking] = useState(false);
  const [newCheckoutDate, setNewCheckoutDate] = useState(null);
  const [extendStep, setExtendStep] = useState(1); // 1: Room selection (if multi-room), 2: Date selection, 3: Payment review, 4: Payment processing
  const [extensionCalculation, setExtensionCalculation] = useState(null);
  const [roomData, setRoomData] = useState([]);
  const [dateWarning, setDateWarning] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('2'); // Default to Cash
  const [isRoomDetailsExpanded, setIsRoomDetailsExpanded] = useState(false);
  const [selectedRoomsForExtension, setSelectedRoomsForExtension] = useState([]);
  const [isMultiRoomBooking, setIsMultiRoomBooking] = useState(false);
  const [showPaymentValidation, setShowPaymentValidation] = useState(false);
  const [validationBooking, setValidationBooking] = useState(null);
  const [extendedRooms, setExtendedRooms] = useState([]);

  const getAllStatus = useCallback(async () => {
    const formData = new FormData();
    formData.append('method', 'getAllStatus');

    try {
      const res = await axios.post(APIConn, formData);
      if (res.data) {
        setStatus(res.data);
        console.log('Existing Statuses: ', res.data);
      } else {
        toast.error('Failed to Fetch Status');
      }
    } catch (err) {
      toast.error('Failed to get connect');
      console.log(err);
    }
  }, [APIConn]);

  const fetchRoomData = useCallback(async () => {
    const formData = new FormData();
    formData.append('method', 'viewAllRooms');

    try {
      const res = await axios.post(APIConn, formData);
      if (res.data) {
        setRoomData(res.data);
        console.log('Room Data: ', res.data);
      } else {
        toast.error('Failed to Fetch Room Data');
      }
    } catch (err) {
      toast.error('Failed to get room data');
      console.log(err);
    }
  }, [APIConn]);

  const fetchExtendedRooms = useCallback(async (bookingId) => {
    const formData = new FormData();
    formData.append('method', 'getExtendedRooms');
    formData.append('json', JSON.stringify({ booking_id: bookingId }));

    try {
      const res = await axios.post(APIConn, formData);
      if (res.data && res.data.success) {
        setExtendedRooms(res.data.data);
        console.log('Extended Rooms: ', res.data.data);
        return res.data.data;
      } else {
        setExtendedRooms([]);
        return [];
      }
    } catch (err) {
      toast.error('Failed to fetch extended rooms');
      console.log(err);
      setExtendedRooms([]);
      return [];
    }
  }, [APIConn]);


  const getBookings = useCallback(async () => {
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
  }, [APIConn]);

  useEffect(() => {
    getBookings();
    getAllStatus();
    fetchRoomData();
  }, [getBookings, getAllStatus, fetchRoomData]);

  // Filter bookings based on search term and filters
  useEffect(() => {
    let filtered = bookings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.reference_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.nationality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.roomtype_name?.toLowerCase().includes(searchTerm.toLowerCase()) && getRoomTypeDisplay(booking) !== 'More Rooms...')
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

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'booking_created_at' || sortBy === 'booking_checkin_dateandtime' || sortBy === 'booking_checkout_dateandtime') {
        // Date sorting
        const aValue = new Date(a[sortBy]);
        const bValue = new Date(b[sortBy]);
        comparison = aValue - bValue;
      } else if (sortBy === 'total_amount') {
        // Numeric sorting
        const aValue = parseFloat(a[sortBy]) || 0;
        const bValue = parseFloat(b[sortBy]) || 0;
        comparison = aValue - bValue;
      } else {
        // String sorting (customer_name, reference_no)
        const aValue = (a[sortBy] || '').toLowerCase();
        const bValue = (b[sortBy] || '').toLowerCase();
        comparison = aValue.localeCompare(bValue);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, dateFrom, dateTo, sortOrder, sortBy]);

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
      formData.append("method", "viewBookingList");
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
      toast.error('Room changes are only allowed for bookings with "Approved" or "Checked-In" status');
      return;
    }

    // Fetch available rooms and show room change sheet
    fetchAvailableRooms();
    setShowRoomChange(true);
  };

  const handleViewCustomerDetails = (booking) => {
    console.log('View Customer Details clicked for booking:', booking);
    setSelectedBooking(booking);
    setIsRoomDetailsExpanded(false); // Reset dropdown state when opening modal
    setShowCustomerDetails(true);
  };

  const handleRoomChangeSuccess = () => {
    // Refresh bookings list after successful room change
    getBookings();
  };

  const handleExtendBooking = async (booking) => {
    console.log('Extend Booking clicked for booking:', booking);
    setSelectedBooking(booking);

    // Check if booking status allows extension
    if (booking.booking_status !== 'Approved' && booking.booking_status !== 'Checked-In') {
      toast.error('Booking extensions are only allowed for bookings with "Approved" or "Checked-In" status');
      return;
    }

    // Fetch extended rooms for this booking
    await fetchExtendedRooms(booking.booking_id);

    // Check if this is a multi-room booking
    const hasMultipleRooms = Array.isArray(booking.room_ids) && booking.room_ids.length > 1;
    const hasMultipleNumbers = booking.room_numbers &&
      (booking.room_numbers.includes(',') || booking.room_numbers.includes(';') ||
        (booking.room_numbers.includes('-') && booking.room_numbers !== booking.room_numbers.replace('-', '')));

    const isMultiRoom = hasMultipleRooms || hasMultipleNumbers;
    setIsMultiRoomBooking(isMultiRoom);

    setNewCheckoutDate(null);
    setSelectedRoomsForExtension([]);
    setExtendStep(1);
    setExtensionCalculation(null);
    setDateWarning('');
    setPaymentAmount('0');
    setPaymentMethod('2');
    setShowExtendBooking(true);
  };

  // Payment validation function
  const checkRemainingBalance = (booking) => {
    const totalAmount = parseFloat(booking.total_amount) || 0;
    const downpayment = parseFloat(booking.downpayment) || 0;
    const remaining = Math.max(0, totalAmount - downpayment);
    return remaining;
  };

  const isValidForCheckOut = (booking) => {
    const remainingBalance = checkRemainingBalance(booking);
    return remainingBalance <= 0;
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

    // Check for outstanding payments before allowing Checked-Out
    if (newStatus === 'Checked-Out' && !isValidForCheckOut(selectedBooking)) {
      console.log('Payment validation triggered for booking:', selectedBooking);
      setValidationBooking(selectedBooking);
      setShowPaymentValidation(true);
      return;
    }

    // Find the status ID for the new status
    const selectedStatusItem = status.find(item => item.booking_status_name === newStatus);

    // Get current employee/admin ID (you may need to adjust this based on your auth system)
    const currentEmployeeId = localStorage.getItem('employeeId') || 1; // Default to 1 if not found

    // Build JSON data for the API
    const jsonData = {
      booking_id: selectedBooking.booking_id,
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

  const calculateExtensionPayment = () => {
    console.log('=== CALCULATE EXTENSION PAYMENT START ===');
    console.log('Selected Booking:', selectedBooking);
    console.log('New Checkout Date:', newCheckoutDate);
    console.log('Is Multi Room Booking:', isMultiRoomBooking);
    console.log('Selected Rooms for Extension:', selectedRoomsForExtension);
    console.log('Room Data:', roomData);

    if (!selectedBooking || !newCheckoutDate) {
      console.log('Missing required data for calculation');
      return null;
    }

    const currentCheckout = new Date(selectedBooking.booking_checkout_dateandtime);
    const newCheckout = new Date(newCheckoutDate);
    console.log('Current Checkout:', currentCheckout);
    console.log('New Checkout:', newCheckout);

    // Calculate number of additional nights
    const timeDiff = newCheckout.getTime() - currentCheckout.getTime();
    const additionalNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    console.log('Time Difference (ms):', timeDiff);
    console.log('Additional Stays:', additionalNights);

    if (additionalNights <= 0) {
      console.log('Invalid additional nights calculation');
      return null;
    }

    // Calculate pricing for selected rooms
    let totalAdditionalAmount = 0;
    let roomBreakdown = [];

    if (isMultiRoomBooking && selectedRoomsForExtension.length > 0) {
      console.log('Calculating for multi-room booking...');
      // Calculate for each selected room
      selectedRoomsForExtension.forEach((room, index) => {
        console.log(`Processing room ${index + 1}:`, room);
        const roomPrice = parseFloat(room.roomtype_price) || 0;
        const roomAmount = roomPrice * additionalNights;
        totalAdditionalAmount += roomAmount;

        console.log(`Room ${room.roomnumber_id}: ${roomPrice} * ${additionalNights} = ${roomAmount}`);

        roomBreakdown.push({
          roomNumber: room.roomnumber_id,
          roomType: room.roomtype_name || 'Standard Room',
          pricePerNight: roomPrice,
          totalAmount: roomAmount
        });
      });
    } else {
      console.log('Calculating for single room booking...');
      // Single room booking - use original logic
      let roomPrice = 0;
      let roomType = 'Standard Room';

      // Find the room data for this booking
      if (roomData && roomData.length > 0) {
        console.log('Searching room data for booking...');
        // Try to find room by room numbers from booking
        const bookingRoomNumbers = selectedBooking.room_numbers ? selectedBooking.room_numbers.split(',') : [];
        console.log('Booking Room Numbers:', bookingRoomNumbers);

        for (const room of roomData) {
          if (bookingRoomNumbers.includes(room.roomnumber_id.toString())) {
            roomPrice = parseFloat(room.roomtype_price) || 0;
            roomType = room.roomtype_name || 'Standard Room';
            console.log('Found room in room data:', { roomPrice, roomType });
            break;
          }
        }
      }

      // Fallback to booking data if room data not found
      if (roomPrice === 0) {
        roomPrice = parseFloat(selectedBooking.roomtype_price) || 0;
        roomType = selectedBooking.roomtype_name || 'Standard Room';
        console.log('Using booking data as fallback:', { roomPrice, roomType });
      }

      totalAdditionalAmount = roomPrice * additionalNights;
      console.log(`Single room calculation: ${roomPrice} * ${additionalNights} = ${totalAdditionalAmount}`);

      roomBreakdown.push({
        roomNumber: selectedBooking.room_numbers || 'N/A',
        roomType: roomType,
        pricePerNight: roomPrice,
        totalAmount: totalAdditionalAmount
      });
    }

    const result = {
      additionalNights,
      totalAdditionalAmount,
      currentCheckout: currentCheckout.toISOString().split('T')[0],
      newCheckout: newCheckout.toISOString().split('T')[0],
      roomBreakdown
    };

    console.log('Final calculation result:', result);
    console.log('=== CALCULATE EXTENSION PAYMENT END ===');
    return result;
  };

  const handleDateSelect = (date) => {
    if (!selectedBooking) return;

    const currentCheckout = new Date(selectedBooking.booking_checkout_dateandtime);
    
    // Normalize dates to compare only the date part (ignore time)
    const currentDateOnly = new Date(currentCheckout.getFullYear(), currentCheckout.getMonth(), currentCheckout.getDate());
    const selectedDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (selectedDateOnly <= currentDateOnly) {
      setDateWarning('New checkout date must be after the current checkout date');
      setNewCheckoutDate(null);
      return;
    }

    setDateWarning('');
    setNewCheckoutDate(date);
  };

  const handleExtendBookingNext = () => {
    console.log('=== HANDLE EXTEND BOOKING NEXT ===');
    console.log('Current Step:', extendStep);
    console.log('Is Multi Room Booking:', isMultiRoomBooking);
    console.log('Selected Rooms Count:', selectedRoomsForExtension.length);
    console.log('New Checkout Date:', newCheckoutDate);

    // Step 1: Room selection (if multi-room)
    if (extendStep === 1 && isMultiRoomBooking) {
      console.log('Step 1: Room selection validation');
      if (selectedRoomsForExtension.length === 0) {
        console.error('No rooms selected for extension');
        toast.error('Please select at least one room to extend');
        return;
      }
      console.log('Room selection valid, moving to step 2');
      setExtendStep(2);
      return;
    }

    // Step 2: Date selection (or Step 1 for single room)
    if ((extendStep === 1 && !isMultiRoomBooking) || (extendStep === 2 && isMultiRoomBooking)) {
      console.log('Step 2: Date selection validation');
      if (!selectedBooking || !newCheckoutDate) {
        console.error('Missing booking or checkout date');
        toast.error('Please select a new checkout date');
        return;
      }

      // Validate that new checkout date is after current checkout date
      const currentCheckout = new Date(selectedBooking.booking_checkout_dateandtime);
      
      // Normalize dates to compare only the date part (ignore time)
      const currentDateOnly = new Date(currentCheckout.getFullYear(), currentCheckout.getMonth(), currentCheckout.getDate());
      const newDateOnly = new Date(newCheckoutDate.getFullYear(), newCheckoutDate.getMonth(), newCheckoutDate.getDate());
      
      console.log('Current Checkout:', currentCheckout);
      console.log('Current Date Only:', currentDateOnly);
      console.log('New Checkout:', newCheckoutDate);
      console.log('New Date Only:', newDateOnly);

      if (newDateOnly <= currentDateOnly) {
        console.error('New checkout date is not after current checkout date');
        toast.error('New checkout date must be after the current checkout date');
        return;
      }

      // Calculate extension payment
      console.log('Calculating extension payment...');
      const calculation = calculateExtensionPayment();
      if (!calculation) {
        console.error('Extension payment calculation failed');
        toast.error('Unable to calculate extension payment');
        return;
      }

      console.log('Extension calculation successful:', calculation);
      setExtensionCalculation(calculation);
      setPaymentAmount(calculation.totalAdditionalAmount.toString()); // Set default payment amount to full amount
      const nextStep = isMultiRoomBooking ? 3 : 2;
      console.log('Moving to step:', nextStep);
      setExtendStep(nextStep);
    }
  };

  const handlePaymentNext = () => {
    if (!extensionCalculation) {
      toast.error('Missing extension calculation');
      return;
    }

    const numPaymentAmount = parseFloat(paymentAmount) || 0;
    if (numPaymentAmount < 0 || numPaymentAmount > extensionCalculation.totalAdditionalAmount) {
      toast.error('Payment amount must be between 0 and the total additional amount');
      return;
    }

    setExtendStep(isMultiRoomBooking ? 4 : 3);
  };

  const handleExtendBookingSubmit = async () => {
    console.log('=== EXTEND BOOKING SUBMIT START ===');
    console.log('Selected Booking:', selectedBooking);
    console.log('New Checkout Date:', newCheckoutDate);
    console.log('Extension Calculation:', extensionCalculation);
    console.log('Payment Amount:', paymentAmount);
    console.log('Payment Method:', paymentMethod);
    console.log('Selected Rooms for Extension:', selectedRoomsForExtension);
    console.log('Is Multi Room Booking:', isMultiRoomBooking);

    if (!selectedBooking || !newCheckoutDate || !extensionCalculation) {
      console.error('Missing required information:', {
        selectedBooking: !!selectedBooking,
        newCheckoutDate: !!newCheckoutDate,
        extensionCalculation: !!extensionCalculation
      });
      toast.error('Missing required information for extension');
      return;
    }

    const numPaymentAmount = parseFloat(paymentAmount) || 0;
    if (numPaymentAmount < 0 || numPaymentAmount > extensionCalculation.totalAdditionalAmount) {
      console.error('Invalid payment amount:', {
        paymentAmount: numPaymentAmount,
        maxAmount: extensionCalculation.totalAdditionalAmount
      });
      toast.error('Invalid payment amount');
      return;
    }

    // Get current employee/admin ID
    const currentEmployeeId = localStorage.getItem('employeeId') || 1;
    console.log('Employee ID:', currentEmployeeId);

    // Format the new checkout date properly - use 12:00 PM (noon) for checkout
    const newCheckoutDateTime = new Date(newCheckoutDate);
    newCheckoutDateTime.setHours(12, 0, 0, 0); // Set to 12:00 PM (noon)
    console.log('Formatted Checkout DateTime:', newCheckoutDateTime.toISOString().slice(0, 19).replace('T', ' '));

    // Build JSON data for the API
    const jsonData = {
      booking_id: selectedBooking.booking_id,
      employee_id: currentEmployeeId,
      new_checkout_date: newCheckoutDateTime.toISOString().slice(0, 19).replace('T', ' '),
      additional_nights: extensionCalculation.additionalNights,
      additional_amount: extensionCalculation.totalAdditionalAmount,
      payment_amount: numPaymentAmount,
      payment_method_id: paymentMethod,
      room_breakdown: extensionCalculation.roomBreakdown
    };

    // Add room selection for multi-room bookings
    if (isMultiRoomBooking && selectedRoomsForExtension.length > 0) {
      jsonData.selected_rooms = selectedRoomsForExtension.map(room => ({
        room_id: room.roomnumber_id,
        room_type: room.roomtype_name,
        price_per_night: parseFloat(room.roomtype_price) || 0
      }));
      console.log('Selected Rooms Data:', jsonData.selected_rooms);
    }

    console.log('Final JSON Data being sent:', jsonData);

    // Build FormData and submit to API
    const formData = new FormData();
    const methodName = isMultiRoomBooking ? 'extendMultiRoomBookingWithPayment' : 'extendBookingWithPayment';
    formData.append('method', methodName);
    formData.append('json', JSON.stringify(jsonData));

    console.log('API Method:', methodName);
    console.log('API Connection:', APIConn);
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      console.log('Sending API request...');
      const res = await axios.post(APIConn, formData);
      console.log('API Response:', res);
      console.log('Response Data:', res.data);

      if (res?.data?.success) {
        const responseData = res.data;
        const roomInfo = isMultiRoomBooking && selectedRoomsForExtension.length > 0
          ? ` for ${selectedRoomsForExtension.length} room(s): ${selectedRoomsForExtension.map(r => r.roomnumber_id).join(', ')}`
          : '';
        
        console.log('Extension successful!', responseData);
        
        // Show success message with new reference number
        let successMessage = `Booking extended successfully${roomInfo} for ${selectedBooking.reference_no}`;
        if (responseData.extension_reference_no) {
          successMessage += `\nNew Extension Reference: ${responseData.extension_reference_no}`;
        }
        
        toast.success(successMessage);
        setShowExtendBooking(false);
        setSelectedBooking(null);
        setNewCheckoutDate(null);
        setSelectedRoomsForExtension([]);
        setIsMultiRoomBooking(false);
        setExtendStep(1);
        setExtensionCalculation(null);
        setPaymentAmount('0');
        setPaymentMethod('2');
        setExtendedRooms([]); // Clear extended rooms state
        
        // Refresh bookings list
        await getBookings();
      } else {
        const errMsg = res?.data?.message || res?.data?.error || 'Failed to extend booking';
        console.error('Extension failed - API response indicates failure:', {
          success: res?.data?.success,
          message: res?.data?.message,
          error: res?.data?.error,
          fullResponse: res?.data
        });
        toast.error(errMsg);
      }
    } catch (err) {
      console.error('=== BOOKING EXTENSION ERROR ===');
      console.error('Error object:', err);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      console.error('Error config:', err.config);
      toast.error(`Failed to connect: ${err.message}`);
    }

    console.log('=== EXTEND BOOKING SUBMIT END ===');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFrom(null);
    setDateTo(null);
    setSortOrder('desc');
    setSortBy('booking_created_at');
  };

  // Navigation function to Invoice.jsx
  const navigateToInvoice = (booking) => {
    // Store the reference number in localStorage for Invoice.jsx to pick up
    localStorage.setItem('invoiceSearchReference', booking.reference_no);
    // Navigate to invoice page
    window.location.href = '/admin/invoice';
  };

  // Handle Confirm Check-Out button click
  const handleConfirmCheckOut = async (booking) => {
    // Check if customer has remaining balance
    const remainingBalance = checkRemainingBalance(booking);

    if (remainingBalance > 0) {
      // Customer has outstanding payments - navigate to Invoice
      console.log('Customer has outstanding payments, navigating to Invoice');
      showPaymentValidationModal(booking);
    } else {
      // Customer is fully paid - proceed with check-out
      console.log('Customer is fully paid, proceeding with check-out');
      await proceedWithCheckOut(booking);
    }
  };

  // Show payment validation modal and navigate to Invoice
  const showPaymentValidationModal = (booking) => {
    setShowPaymentValidation(true);
    setValidationBooking(booking);
  };

  // Proceed with check-out (fully paid customer)
  const proceedWithCheckOut = async (booking) => {
    console.log('=== PROCEED WITH CHECK-OUT ===');
    console.log('Available statuses:', status);

    // Find the status ID for Checked-Out status
    const checkedOutStatus = status.find(item => item.booking_status_name === 'Checked-Out');
    console.log('Found Checked-Out status:', checkedOutStatus);

    if (!checkedOutStatus) {
      console.error('Checked-Out status not found in available statuses:', status);
      toast.error('Checked-Out status not found. Available statuses: ' + status.map(s => s.booking_status_name).join(', '));
      return;
    }

    // Get current employee/admin ID
    const currentEmployeeId = localStorage.getItem('employeeId') || 1;
    console.log('Employee ID:', currentEmployeeId);

    // Build JSON data for the API
    const jsonData = {
      booking_id: booking.booking_id,
      employee_id: currentEmployeeId,
      booking_status_id: checkedOutStatus.booking_status_id
    };

    // Add room_ids if available
    const candidateRoomIds = Array.isArray(booking?.room_ids) ? booking.room_ids : undefined;
    if (Array.isArray(candidateRoomIds)) {
      jsonData.room_ids = candidateRoomIds;
    }

    console.log('Final JSON data:', jsonData);

    // Build FormData and submit to API
    const formData = new FormData();
    formData.append('method', 'changeBookingStatus');
    formData.append('json', JSON.stringify(jsonData));

    try {
      console.log('Sending check-out request...');
      const res = await axios.post(APIConn, formData);
      console.log('Check-out response:', res);
      console.log('Response data:', res.data);

      if (res?.data?.success) {
        toast.success(`Customer ${booking.customer_name} has been successfully checked out!`);
        setShowCustomerDetails(false);
        getBookings(); // Refresh bookings list
      } else {
        const errMsg = res?.data?.message || res?.data?.error || 'Failed to check out customer';
        console.error('Check-out failed:', res?.data);
        toast.error(errMsg);
      }
    } catch (err) {
      console.error('Check-out error:', err);
      console.error('Error response:', err.response?.data);
      toast.error(`Failed to connect: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { variant: 'secondary', className: 'bg-yellow-500 hover:bg-yellow-600' },
      'Approved': { variant: 'default', className: 'bg-green-500 hover:bg-green-600' },
      'Checked-In': { variant: 'default', className: 'bg-emerald-500 hover:bg-emerald-600' },
      'Checked-Out': { variant: 'default', className: 'bg-[#34699a] hover:bg-[#2a5580]' },
      'Cancelled': { variant: 'destructive', className: 'bg-red-500 hover:bg-red-600' }
    };

    const config = statusConfig[status] || { variant: 'outline', className: 'bg-gray-100 text-gray-800' };

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };


  const getRoomTypeDisplay = (booking) => {
    // Check if booking has multiple rooms by examining room_ids array
    const hasMultipleRooms = Array.isArray(booking.room_ids) && booking.room_ids.length > 1;

    // Also check room_numbers for multiple rooms
    const roomNumbers = booking.room_numbers;
    const hasMultipleNumbers = roomNumbers &&
      (roomNumbers.includes(',') || roomNumbers.includes(';') ||
        (roomNumbers.includes('-') && roomNumbers !== roomNumbers.replace('-', '')));

    if (hasMultipleRooms || hasMultipleNumbers) {
      return 'More Rooms...';
    }

    return booking.roomtype_name || 'Standard Room';
  };

  const getRoomTypeGroupsFromBooking = (booking) => {
    // Parse room numbers from the booking
    if (!booking.room_numbers) {
      return [{ roomType: booking.roomtype_name || 'Standard Room', count: 1, roomNumbers: ['Pending'] }];
    }

    const roomNumbers = booking.room_numbers.toString().split(',').map(num => num.trim());
    const roomTypeGroups = {};

    // Group rooms by type
    roomNumbers.forEach(roomNum => {
      // Find room data for this room number
      const roomInfo = roomData.find(room => room.roomnumber_id.toString() === roomNum);
      const roomType = roomInfo ? roomInfo.roomtype_name : 'Standard Room';

      if (!roomTypeGroups[roomType]) {
        roomTypeGroups[roomType] = {
          roomType: roomType,
          count: 0,
          roomNumbers: [],
          rooms: [] // Store full room objects
        };
      }

      roomTypeGroups[roomType].count += 1;
      roomTypeGroups[roomType].roomNumbers.push(roomNum);
      if (roomInfo) {
        roomTypeGroups[roomType].rooms.push(roomInfo);
      }
    });

    return Object.values(roomTypeGroups);
  };

  // Helper functions for room selection
  const toggleRoomSelection = (room) => {
    setSelectedRoomsForExtension(prev => {
      const isSelected = prev.some(r => r.roomnumber_id === room.roomnumber_id);
      if (isSelected) {
        return prev.filter(r => r.roomnumber_id !== room.roomnumber_id);
      } else {
        return [...prev, room];
      }
    });
  };

  const selectAllRoomsInGroup = (rooms) => {
    setSelectedRoomsForExtension(prev => {
      const existingIds = prev.map(r => r.roomnumber_id);
      const newRooms = rooms.filter(room => !existingIds.includes(room.roomnumber_id));
      return [...prev, ...newRooms];
    });
  };

  const deselectAllRoomsInGroup = (rooms) => {
    setSelectedRoomsForExtension(prev => {
      const roomIds = rooms.map(room => room.roomnumber_id);
      return prev.filter(r => !roomIds.includes(r.roomnumber_id));
    });
  };

  const isRoomSelected = (room) => {
    return selectedRoomsForExtension.some(r => r.roomnumber_id === room.roomnumber_id);
  };

  const areAllRoomsInGroupSelected = (rooms) => {
    return rooms.every(room => isRoomSelected(room));
  };

  // Helper functions for room extension
  const isRoomExtended = (roomNumber) => {
    return extendedRooms.some(extension => 
      extension.rooms.some(room => room.room_number.toString() === roomNumber.toString())
    );
  };

  const getRoomExtensionRef = (roomNumber) => {
    for (const extension of extendedRooms) {
      const room = extension.rooms.find(room => room.room_number.toString() === roomNumber.toString());
      if (room) {
        return extension.extension_reference;
      }
    }
    return null;
  };

  const canRoomBeExtended = (roomNumber) => {
    return !isRoomExtended(roomNumber);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-2 sm:px-4 py-4 sm:py-6 md:px-8">
      <AdminHeader />

      <div className="ml-0 lg:ml-72 px-2 sm:px-4 py-4 sm:py-6 md:px-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Booking Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            View and manage all hotel bookings and their current status
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-[#34699a]/10 dark:bg-[#34699a]/20 rounded-lg">
                  <svg className="w-6 h-6 text-[#34699a] dark:text-[#34699a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredBookings.filter(b => b.booking_status === 'Pending').length}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active/Checked-In</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredBookings.filter(b => b.booking_status === 'Approved' || b.booking_status === 'Checked-In').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-[#34699a]/10 dark:bg-[#34699a]/20 rounded-lg">
                  <svg className="w-6 h-6 text-[#34699a] dark:text-[#34699a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Checked-Out</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredBookings.filter(b => b.booking_status === 'Checked-Out').length}
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
              {sortBy && (
                <span className="text-sm font-normal text-blue-600 dark:text-blue-400 ml-auto flex items-center gap-1">
                  Sorted by: {sortBy === 'booking_created_at' ? 'Created Date' : 
                             sortBy === 'booking_checkin_dateandtime' ? 'Check-in Date' :
                             sortBy === 'booking_checkout_dateandtime' ? 'Check-out Date' :
                             sortBy === 'customer_name' ? 'Customer Name' :
                             sortBy === 'reference_no' ? 'Reference No' :
                             sortBy === 'total_amount' ? 'Total Amount' : sortBy}
                  ({sortOrder === 'asc' ? (
                    <>
                      <ClockArrowUp className="w-3 h-3" />
                      Ascending
                    </>
                  ) : (
                    <>
                      <ClockArrowDown className="w-3 h-3" />
                      Descending
                    </>
                  )})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
              {/* Search Bar */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Customer, Reference, Phone..."
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From:</label>
                <Input
                  type="date"
                  value={dateFrom ? dateFrom.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDateFrom(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full"
                />
              </div>

              {/* Date To Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To:</label>
                <Input
                  type="date"
                  value={dateTo ? dateTo.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDateTo(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full"
                />
              </div>

              {/* Sort By Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Created Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booking_created_at">Created Date</SelectItem>
                    <SelectItem value="booking_checkin_dateandtime">Check-in Date</SelectItem>
                    <SelectItem value="booking_checkout_dateandtime">Check-out Date</SelectItem>
                    <SelectItem value="customer_name">Customer Name</SelectItem>
                    <SelectItem value="reference_no">Reference No</SelectItem>
                    <SelectItem value="total_amount">Total Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Order</label>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger>
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">
                      <div className="flex items-center gap-2">
                        <ClockArrowDown className="w-4 h-4" />
                        Descending (Newest First)
                      </div>
                    </SelectItem>
                    <SelectItem value="asc">
                      <div className="flex items-center gap-2">
                        <ClockArrowUp className="w-4 h-4" />
                        Ascending (Oldest First)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={clearFilters} className="text-sm">
                Clear All Filters & Sorting
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#34699a]"></div>
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
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
                <Table className="w-full min-w-[1050px]">
                  <TableCaption className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    A comprehensive list of all hotel bookings
                    {sortBy && (
                      <span className="block mt-1 text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1">
                        📊 Currently sorted by: {sortBy === 'booking_created_at' ? 'Created Date' : 
                                                 sortBy === 'booking_checkin_dateandtime' ? 'Check-in Date' :
                                                 sortBy === 'booking_checkout_dateandtime' ? 'Check-out Date' :
                                                 sortBy === 'customer_name' ? 'Customer Name' :
                                                 sortBy === 'reference_no' ? 'Reference No' :
                                                 sortBy === 'total_amount' ? 'Total Amount' : sortBy} 
                        ({sortOrder === 'asc' ? (
                          <>
                            <ClockArrowUp className="w-3 h-3" />
                            Ascending
                          </>
                        ) : (
                          <>
                            <ClockArrowDown className="w-3 h-3" />
                            Descending
                          </>
                        )})
                      </span>
                    )}
                  </TableCaption>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-700 border-b">
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center w-[110px] min-w-[110px]">
                        <button
                          onClick={() => setSortBy('reference_no')}
                          className="flex items-center justify-center gap-1 hover:text-blue-600 transition-colors text-xs sm:text-sm"
                        >
                          <span className="hidden sm:inline">Reference No</span>
                          <span className="sm:hidden">Ref</span>
                          {sortBy === 'reference_no' && (
                            sortOrder === 'asc' ? (
                              <ClockArrowUp className="w-2 h-2 sm:w-3 sm:h-3 text-blue-600" />
                            ) : (
                              <ClockArrowDown className="w-2 h-2 sm:w-3 sm:h-3 text-blue-600" />
                            )
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white w-[180px] min-w-[180px]">
                        <button
                          onClick={() => setSortBy('customer_name')}
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors text-xs sm:text-sm"
                        >
                          <span className="hidden sm:inline">Customer</span>
                          <span className="sm:hidden">Customer</span>
                          {sortBy === 'customer_name' && (
                            sortOrder === 'asc' ? (
                              <ClockArrowUp className="w-2 h-2 sm:w-3 sm:h-3 text-blue-600" />
                            ) : (
                              <ClockArrowDown className="w-2 h-2 sm:w-3 sm:h-3 text-blue-600" />
                            )
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center w-[130px] min-w-[130px] text-xs sm:text-sm">
                        <span className="hidden sm:inline">Room Type</span>
                        <span className="sm:hidden">Room</span>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center w-[130px] min-w-[130px]">
                        <button
                          onClick={() => setSortBy('booking_checkin_dateandtime')}
                          className="flex items-center justify-center gap-1 hover:text-blue-600 transition-colors text-xs sm:text-sm"
                        >
                          <span className="hidden sm:inline">Check-in</span>
                          <span className="sm:hidden">Check-in</span>
                          {sortBy === 'booking_checkin_dateandtime' && (
                            sortOrder === 'asc' ? (
                              <ClockArrowUp className="w-2 h-2 sm:w-3 sm:h-3 text-blue-600" />
                            ) : (
                              <ClockArrowDown className="w-2 h-2 sm:w-3 sm:h-3 text-blue-600" />
                            )
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center w-[130px] min-w-[130px]">
                        <button
                          onClick={() => setSortBy('booking_checkout_dateandtime')}
                          className="flex items-center justify-center gap-1 hover:text-blue-600 transition-colors text-xs sm:text-sm"
                        >
                          <span className="hidden sm:inline">Check-out</span>
                          <span className="sm:hidden">Check-out</span>
                          {sortBy === 'booking_checkout_dateandtime' && (
                            sortOrder === 'asc' ? (
                              <ClockArrowUp className="w-2 h-2 sm:w-3 sm:h-3 text-blue-600" />
                            ) : (
                              <ClockArrowDown className="w-2 h-2 sm:w-3 sm:h-3 text-blue-600" />
                            )
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center w-[110px] min-w-[110px]">
                        <button
                          onClick={() => setSortBy('total_amount')}
                          className="flex items-center justify-center gap-1 hover:text-blue-600 transition-colors text-xs sm:text-sm"
                        >
                          <span className="hidden sm:inline">Amount</span>
                          <span className="sm:hidden">Amount</span>
                          {sortBy === 'total_amount' && (
                            sortOrder === 'asc' ? (
                              <ClockArrowUp className="w-2 h-2 sm:w-3 sm:h-3 text-blue-600" />
                            ) : (
                              <ClockArrowDown className="w-2 h-2 sm:w-3 sm:h-3 text-blue-600" />
                            )
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center w-[100px] min-w-[100px] text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center w-[280px] min-w-[280px] text-xs sm:text-sm">
                        <span className="hidden sm:inline">Actions</span>
                        <span className="sm:hidden">✨</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((b, i) => (
                      <TableRow key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-600">
                        <TableCell className="font-mono text-sm text-gray-900 dark:text-white text-center py-3">
                          <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                            {b.reference_no || '—'}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-white py-3">
                          <div className="space-y-1">
                            <div className="font-semibold text-xs sm:text-sm truncate">{b.customer_name}</div>
                            <div className="space-y-1">
                              {b.nationality && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-1 py-0.5 rounded-full inline-block">
                                  {b.nationality}
                                </div>
                              )}
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">{b.customer_phone}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300 text-center py-3">
                          <div className={`text-sm font-medium px-2 py-1 rounded-full ${getRoomTypeDisplay(b) === 'More Rooms...'
                            ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                            : 'bg-[#34699a]/10 dark:bg-[#34699a]/20 text-[#34699a] dark:text-[#34699a]'
                            }`}>
                            {getRoomTypeDisplay(b)}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300 text-center py-3">
                          <div className="text-xs">
                            {formatDateTime(b.booking_checkin_dateandtime)}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300 text-center py-3">
                          <div className="text-xs">
                            {formatDateTime(b.booking_checkout_dateandtime)}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300 text-center py-3">
                          <div className="space-y-1">
                            <div className="font-semibold text-green-600 dark:text-green-400 text-xs">
                              {NumberFormatter.formatCurrency(b.total_amount || 0)}
                            </div>
                            {b.downpayment && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Down: {NumberFormatter.formatCurrency(b.downpayment)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-3">
                          {getStatusBadge(b.booking_status)}
                        </TableCell>
                        <TableCell className="text-center py-3">
                          <div className="flex gap-1 sm:gap-2 justify-center flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewCustomerDetails(b)}
                              className="text-xs h-6 sm:h-7 px-2 sm:px-3 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            >
                              <Eye className="w-2 h-2 sm:w-3 sm:h-3 sm:mr-1" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExtendBooking(b)}
                              disabled={b.booking_status === 'Pending'}
                              className="text-xs h-6 sm:h-7 px-2 sm:px-3 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CalendarPlus className="w-2 h-2 sm:w-3 sm:h-3 sm:mr-1" />
                              <span className="hidden sm:inline">Extend</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleChangeRoom(b)}
                              disabled={b.booking_status === 'Pending'}
                              className="text-xs h-6 sm:h-7 px-2 sm:px-3 text-[#34699a] hover:text-[#2a5580] hover:bg-[#34699a]/10 dark:hover:bg-[#34699a]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ArrowRightLeft className="w-2 h-2 sm:w-3 sm:h-3 sm:mr-1" />
                              <span className="hidden sm:inline">Room</span>
                              <span className="sm:hidden">R</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Details Modal */}
        <Dialog open={showCustomerDetails} onOpenChange={setShowCustomerDetails}>
          <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[85vh] overflow-y-auto mx-4">
            <DialogHeader className="text-center pb-6 border-b">
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Booking Information
                {selectedBooking && (
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-3">
                    #{selectedBooking.booking_id || 'N/A'}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-6 mt-6">
                {/* Status Banner */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#34699a]/10 to-[#34699a]/5 dark:from-[#34699a]/20 dark:to-[#34699a]/10 p-6 border border-[#34699a]/20 dark:border-[#34699a]/30">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#34699a]/20 to-transparent rounded-bl-full"></div>
                  <div className="relative flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(selectedBooking.booking_status)}
                        <span className="text-sm text-gray-600 dark:text-gray-400">Booking Status</span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedBooking.customer_name}</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedBooking.customer_email}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#34699a] dark:text-[#34699a]">
                        {NumberFormatter.formatCurrency(selectedBooking.total_amount || 0)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Amount</div>
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
                    {selectedBooking.downpayment && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Downpayment</label>
                        <p className="text-gray-900 dark:text-white font-semibold">{NumberFormatter.formatCurrency(selectedBooking.downpayment)}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</label>
                      <p className="text-gray-900 dark:text-white font-semibold">{NumberFormatter.formatCurrency(selectedBooking.total_amount || 0)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining Balance</label>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {(() => {
                          const totalAmount = parseFloat(selectedBooking.total_amount) || 0;
                          const downpayment = parseFloat(selectedBooking.downpayment) || 0;
                          const remaining = Math.max(0, totalAmount - downpayment); // Ensure non-negative
                          return NumberFormatter.formatCurrencyDecimals(remaining, 0, { showCurrency: false });
                        })()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Room Details</label>
                      <div className="text-gray-900 dark:text-white">
                        {(() => {
                          const roomGroups = getRoomTypeGroupsFromBooking(selectedBooking);
                          const totalRooms = roomGroups.reduce((sum, group) => sum + group.count, 0);

                          return (
                            <div className="space-y-2">
                              {/* Summary Row with Dropdown Button */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {roomGroups.length > 1 ? (
                                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                                      Multiple Room Types ({totalRooms} total rooms)
                                    </span>
                                  ) : (
                                    <span className="font-semibold">
                                      {roomGroups[0]?.roomType || 'Standard Room'}
                                      {roomGroups[0]?.count > 1 && (
                                        <span className="ml-2 bg-[#34699a]/10 dark:bg-[#34699a]/20 text-[#34699a] dark:text-[#34699a] px-2 py-1 rounded text-xs font-medium">
                                          ×{roomGroups[0].count}
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setIsRoomDetailsExpanded(!isRoomDetailsExpanded)}
                                  className="h-7 px-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                  {isRoomDetailsExpanded ? (
                                    <>
                                      <ChevronUp className="w-4 h-4" />
                                      <span className="ml-1 text-xs">Hide Details</span>
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-4 h-4" />
                                      <span className="ml-1 text-xs">Show Details</span>
                                    </>
                                  )}
                                </Button>
                              </div>

                              {/* Collapsible Room Details */}
                              {isRoomDetailsExpanded && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                                    {roomGroups.map((group, index) => (
                                      <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                                        <div className={group.count > 1 ? 'flex items-center gap-2' : ''}>
                                          <span className="font-semibold text-sm">{group.roomType}</span>
                                          {group.count > 1 && (
                                            <span className="bg-[#34699a]/10 dark:bg-[#34699a]/20 text-[#34699a] dark:text-[#34699a] px-2 py-1 rounded text-xs font-medium">
                                              ×{group.count}
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                          Room #{group.roomNumbers.join(', #')}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
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
                <div className="flex justify-end gap-3 pt-4 border-t flex-wrap">
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
                    disabled={selectedBooking.booking_status === 'Pending'}
                    className="bg-[#34699a] hover:bg-[#2a5580] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Change Room
                  </Button>
                  {/* Confirm Check-Out Button - Only shows for Checked-In status */}
                  {selectedBooking.booking_status === 'Checked-In' && (
                    <Button
                      onClick={() => handleConfirmCheckOut(selectedBooking)}
                      className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    >
                      <CalendarIcon className="w-4 h-4" />
                      Confirm Check-Out
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Status Change Modal */}
        <Dialog open={showStatusChange} onOpenChange={setShowStatusChange}>
          <DialogContent className="max-w-[95vw] sm:max-w-md mx-4">
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
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select New Status">
                        {newStatus || "Select New Status"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(status) && status
                        .filter(statusItem =>
                          // Filter out statuses that admins cannot manually set
                          statusItem.booking_status_name !== 'Approved' &&
                          statusItem.booking_status_name !== 'Cancelled' &&
                          statusItem.booking_status_name !== 'Pending' &&
                          statusItem.booking_status_name !== 'Check-Out' &&
                          statusItem.booking_status_name !== 'Checked-Out'
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

        {/* Extend Booking Modal */}
        <Dialog open={showExtendBooking} onOpenChange={setShowExtendBooking}>
          <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarPlus className="w-5 h-5" />
                Extend Booking
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Step {extendStep} of {isMultiRoomBooking ? 4 : 3}
                  </span>
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 rounded-full ${extendStep >= 1 ? 'bg-[#34699a]' : 'bg-gray-300'}`}></div>
                    <div className={`w-2 h-2 rounded-full ${extendStep >= 2 ? 'bg-[#34699a]' : 'bg-gray-300'}`}></div>
                    <div className={`w-2 h-2 rounded-full ${extendStep >= 3 ? 'bg-[#34699a]' : 'bg-gray-300'}`}></div>
                    {isMultiRoomBooking && (
                      <div className={`w-2 h-2 rounded-full ${extendStep >= 4 ? 'bg-[#34699a]' : 'bg-gray-300'}`}></div>
                    )}
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-6">
                {/* Current Booking Info */}
                <div className="bg-gradient-to-r from-[#34699a]/10 to-[#34699a]/5 dark:from-[#34699a]/20 dark:to-[#34699a]/10 p-4 rounded-lg border border-[#34699a]/20 dark:border-[#34699a]/30">
                  <h3 className="text-sm font-medium text-[#34699a] dark:text-[#34699a] mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Booking Details
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium text-blue-700 dark:text-blue-300">Reference:</span>
                      <span className="ml-2 font-mono bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-xs">
                        {selectedBooking.reference_no}
                      </span>
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium text-blue-700 dark:text-blue-300">Customer:</span> {selectedBooking.customer_name}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium text-blue-700 dark:text-blue-300">Current Checkout:</span>
                      <span className="ml-2 font-medium">{formatDateTime(selectedBooking.booking_checkout_dateandtime)}</span>
                    </p>
                  </div>
                </div>

                {extendStep === 1 && isMultiRoomBooking && (
                  <>
                    {/* Multi-Room Selection for Extension */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Select Rooms to Extend
                        </label>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedRoomsForExtension.length} room(s) selected
                        </div>
                      </div>

                      <div className="space-y-3">
                        {getRoomTypeGroupsFromBooking(selectedBooking).map((group, index) => {
                          const allRoomsInGroup = group.rooms || [];
                          const extendableRooms = allRoomsInGroup.filter(room => canRoomBeExtended(room.roomnumber_id));
                          const allSelected = extendableRooms.length > 0 && areAllRoomsInGroupSelected(extendableRooms);
                          const someSelected = extendableRooms.some(room => isRoomSelected(room));

                          return (
                            <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                              {/* Group Header with Select All */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      if (extendableRooms.length === 0) return; // Don't allow selection if no extendable rooms
                                      if (allSelected) {
                                        deselectAllRoomsInGroup(extendableRooms);
                                      } else {
                                        selectAllRoomsInGroup(extendableRooms);
                                      }
                                    }}
                                    disabled={extendableRooms.length === 0}
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                      extendableRooms.length === 0
                                        ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                                        : allSelected
                                          ? 'bg-blue-600 border-blue-600 text-white'
                                          : someSelected
                                            ? 'bg-blue-100 border-blue-600 text-blue-600'
                                            : 'border-gray-300 hover:border-blue-500'
                                      }`}
                                  >
                                    {allSelected && (
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                    {someSelected && !allSelected && (
                                      <div className="w-2 h-2 bg-blue-600 rounded"></div>
                                    )}
                                  </button>
                                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                                    {group.roomType} {group.count > 1 && `(${group.count} rooms)`}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {NumberFormatter.formatCurrency(allRoomsInGroup[0]?.roomtype_price || 0)}/stay
                                </div>
                              </div>

                              {/* Individual Room Selection */}
                              <div className="grid grid-cols-2 gap-2">
                                {group.roomNumbers.map((roomNum, roomIndex) => {
                                  const roomInfo = allRoomsInGroup.find(room => room.roomnumber_id.toString() === roomNum) ||
                                    { roomnumber_id: roomNum, roomtype_name: group.roomType, roomtype_price: 0 };
                                  const isSelected = isRoomSelected(roomInfo);
                                  const isExtended = isRoomExtended(roomNum);
                                  const extensionRef = getRoomExtensionRef(roomNum);
                                  const canExtend = canRoomBeExtended(roomNum);

                                  return (
                                    <div
                                      key={roomIndex}
                                      onClick={() => canExtend && toggleRoomSelection(roomInfo)}
                                      className={`p-3 rounded border transition-all duration-200 ${
                                        isExtended 
                                          ? 'bg-gray-100 border-gray-400 cursor-not-allowed opacity-60 dark:bg-gray-700 dark:border-gray-500'
                                          : isSelected
                                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200 cursor-pointer dark:bg-blue-900/20 dark:border-blue-400 dark:ring-blue-800'
                                            : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-blue-300 cursor-pointer dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                          isExtended
                                            ? 'border-gray-400 bg-gray-300 dark:border-gray-500 dark:bg-gray-600'
                                            : isSelected
                                              ? 'bg-blue-600 border-blue-600 text-white'
                                              : 'border-gray-300'
                                          }`}>
                                          {isExtended && (
                                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h6a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                                            </svg>
                                          )}
                                          {!isExtended && isSelected && (
                                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <div className={`text-sm font-medium ${
                                            isExtended
                                              ? 'text-gray-600 dark:text-gray-400'
                                              : isSelected
                                                ? 'text-blue-700 dark:text-blue-300'
                                                : 'text-gray-900 dark:text-white'
                                            }`}>
                                            Room #{roomNum}
                                          </div>
                                          <div className={`text-xs ${
                                            isExtended
                                              ? 'text-red-600 dark:text-red-400'
                                              : isSelected
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-gray-500 dark:text-gray-400'
                                            }`}>
                                            {isExtended ? (
                                              <span className="font-medium">
                                                Extended ({extensionRef})
                                              </span>
                                            ) : (
                                              `₱${parseFloat(roomInfo.roomtype_price || 0).toLocaleString()}/stay`
                                            )}
                                          </div>
                                          {isExtended && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                              This room has been extended, you can find it in {extensionRef}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Selection Summary */}
                      {selectedRoomsForExtension.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                            Selected Rooms ({selectedRoomsForExtension.length})
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedRoomsForExtension.map((room, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                              >
                                Room #{room.roomnumber_id}
                                <button
                                  onClick={() => toggleRoomSelection(room)}
                                  className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full p-0.5"
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowExtendBooking(false)}
                        className="px-6"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleExtendBookingNext}
                        className="bg-blue-600 hover:bg-blue-700 px-6"
                        disabled={selectedRoomsForExtension.length === 0}
                      >
                        Next: Select Date
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </div>
                  </>
                )}

                {((extendStep === 1 && !isMultiRoomBooking) || (extendStep === 2 && isMultiRoomBooking)) && (
                  <>
                    {/* Date Selection */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        Select New Checkout Date
                        {isMultiRoomBooking && selectedRoomsForExtension.length > 0 && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
                            ({selectedRoomsForExtension.length} room(s) selected)
                          </span>
                        )}
                      </label>
                      <Input
                        type="date"
                        value={newCheckoutDate ? newCheckoutDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          const dateValue = e.target.value;
                          if (dateValue) {
                            const selectedDate = new Date(dateValue);
                            handleDateSelect(selectedDate);
                          } else {
                            setDateWarning('');
                            setNewCheckoutDate(null);
                          }
                        }}
                        min={(() => {
                          if (!selectedBooking) return '';
                          const currentCheckout = new Date(selectedBooking.booking_checkout_dateandtime);
                          // Set minimum date to the day AFTER current checkout
                          const minDate = new Date(currentCheckout);
                          minDate.setDate(minDate.getDate() + 1);
                          return minDate.toISOString().split('T')[0];
                        })()}
                        className="w-full h-12 border-2 hover:border-blue-500 focus:border-blue-500 transition-colors text-center"
                      />
                      {dateWarning ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                          <p className="text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            {dateWarning}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                          <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            New checkout date must be after the current checkout date
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowExtendBooking(false)}
                        className="px-6"
                      >
                        Cancel
                      </Button>
                      <div className="flex gap-3">
                        {isMultiRoomBooking && (
                          <Button
                            variant="outline"
                            onClick={() => setExtendStep(1)}
                            className="px-6"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                          </Button>
                        )}
                        <Button
                          onClick={handleExtendBookingNext}
                          className="bg-blue-600 hover:bg-blue-700 px-6"
                          disabled={!newCheckoutDate || dateWarning}
                        >
                          Next: Review Payment
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {((extendStep === 2 && !isMultiRoomBooking) || (extendStep === 3 && isMultiRoomBooking)) && extensionCalculation && (
                  <>
                    {/* Payment Calculation Review */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <h3 className="text-sm font-medium text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Extension Payment Calculation
                      </h3>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Selected Rooms:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {extensionCalculation.roomBreakdown.length} room(s)
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Additional Nights:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {extensionCalculation.additionalNights} stay(s)
                            </p>
                          </div>
                        </div>

                        {/* Room Breakdown */}
                        {extensionCalculation.roomBreakdown.length > 1 && (
                          <div className="border-t border-green-200 dark:border-green-700 pt-3">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Room Breakdown:
                            </div>
                            <div className="space-y-2">
                              {extensionCalculation.roomBreakdown.map((room, index) => (
                                <div key={index} className="flex justify-between items-center text-sm bg-white dark:bg-gray-800 p-2 rounded border">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    Room #{room.roomNumber} ({room.roomType})
                                  </span>
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    ₱{room.totalAmount.toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="border-t border-green-200 dark:border-green-700 pt-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Current Checkout:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{extensionCalculation.currentCheckout}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">New Checkout:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{extensionCalculation.newCheckout}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-3 rounded border border-green-200 dark:border-green-700">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Additional Nights:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{extensionCalculation.additionalNights} stay(s)</span>
                          </div>
                          {extensionCalculation.roomBreakdown.length === 1 && (
                            <div className="flex justify-between items-center text-sm mt-1">
                              <span className="text-gray-600 dark:text-gray-400">Rate per Night:</span>
                              <span className="font-medium text-gray-900 dark:text-white">₱{extensionCalculation.roomBreakdown[0].pricePerNight.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900 dark:text-white">Total Additional Amount:</span>
                              <span className="font-bold text-lg text-green-600 dark:text-green-400">
                                ₱{extensionCalculation.totalAdditionalAmount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setExtendStep(isMultiRoomBooking ? 2 : 1)}
                        className="px-6"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                      </Button>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowExtendBooking(false)}
                          className="px-6"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handlePaymentNext}
                          className="bg-blue-600 hover:bg-blue-700 px-6"
                        >
                          Next: Payment
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {((extendStep === 3 && !isMultiRoomBooking) || (extendStep === 4 && isMultiRoomBooking)) && extensionCalculation && (
                  <>
                    {/* Payment Processing */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                      <h3 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Payment Processing
                      </h3>

                      <div className="space-y-4">
                        {/* Payment Summary */}
                        <div className="bg-white dark:bg-gray-800 p-3 rounded border border-purple-200 dark:border-purple-700">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-600 dark:text-gray-400">Total Additional Amount:</span>
                            <span className="font-medium text-gray-900 dark:text-white">₱{extensionCalculation.totalAdditionalAmount.toLocaleString()}</span>
                          </div>
                          <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900 dark:text-white">Remaining Balance:</span>
                              <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
                                ₱{(extensionCalculation.totalAdditionalAmount - (parseFloat(paymentAmount) || 0)).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Payment Method
                          </label>
                          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2">Cash</SelectItem>
                              <SelectItem value="1">GCash</SelectItem>
                              <SelectItem value="3">PayMaya</SelectItem>
                              <SelectItem value="4">Check</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Payment Amount */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Payment Amount (₱)
                          </label>
                          <Input
                            type="text"
                            value={paymentAmount}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow only numbers and decimal point
                              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                const numValue = parseFloat(value) || 0;
                                if (numValue <= extensionCalculation.totalAdditionalAmount) {
                                  setPaymentAmount(value);
                                }
                              }
                            }}
                            placeholder="Enter payment amount"
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Enter 0 if customer cannot pay now, or partial amount if paying partially
                          </p>
                        </div>

                        {/* Payment Summary */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Amount Paid:</span>
                              <p className="font-medium text-green-600 dark:text-green-400">₱{(parseFloat(paymentAmount) || 0).toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Added to Booking:</span>
                              <p className="font-medium text-blue-600 dark:text-blue-400">₱{(extensionCalculation.totalAdditionalAmount - (parseFloat(paymentAmount) || 0)).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setExtendStep(isMultiRoomBooking ? 3 : 2)}
                        className="px-6"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                      </Button>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowExtendBooking(false)}
                          className="px-6"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleExtendBookingSubmit}
                          className="bg-green-600 hover:bg-green-700 px-6"
                        >
                          <CalendarPlus className="w-4 h-4 mr-2" />
                          Confirm Extension
                        </Button>
                      </div>
                    </div>
                  </>
                )}
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

        {/* Payment Validation Modal */}
        <Dialog open={showPaymentValidation} onOpenChange={setShowPaymentValidation}>
          <DialogContent className="max-w-[95vw] sm:max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Outstanding Payments Detected
              </DialogTitle>
            </DialogHeader>

            {validationBooking && (
              <div className="space-y-4">
                {/* Payment Info */}
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        Reference:
                      </span>
                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200 rounded text-sm font-mono">
                        {validationBooking.reference_no}
                      </span>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        Outstanding Balance:
                      </span>
                      <p className="text-lg font-bold text-orange-800 dark:text-orange-200 mt-1">
                        ₱{checkRemainingBalance(validationBooking).toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded border border-orange-200 dark:border-orange-700 p-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                        <span className="text-gray-900 dark:text-white">₱{(parseFloat(validationBooking.total_amount) || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Paid Amount:</span>
                        <span className="text-gray-900 dark:text-white">₱{(parseFloat(validationBooking.downpayment) || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning Message */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    This reference <strong>#{validationBooking.reference_no}</strong> still has payments left.
                    Please complete the leftover payments. Do you want to check this user's invoice?
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPaymentValidation(false);
                      setValidationBooking(null);
                    }}
                    className="px-6"
                  >
                    No
                  </Button>
                  <Button
                    onClick={() => {
                      navigateToInvoice(validationBooking);
                      setShowPaymentValidation(false);
                      setValidationBooking(null);
                      setShowCustomerDetails(false); // Close the customer details modal too
                    }}
                    className="bg-blue-600 hover:bg-blue-700 px-6 flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Yes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default AdminBookingList