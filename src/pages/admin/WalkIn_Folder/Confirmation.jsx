import React, { useState, useEffect } from 'react';
import { useWalkIn } from './WalkInContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function Confirmation() {
  const APIConn = `${localStorage.url}customer.php`;
  const navigate = useNavigate();
  const { walkInData, resetWalkIn } = useWalkIn();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState(null); // 'success', 'error', or null

  // Step guard: do not allow direct access if previous steps incomplete
  useEffect(() => {
    const hasRooms = Array.isArray(walkInData.selectedRooms) && walkInData.selectedRooms.length > 0;
    const hasDates = !!walkInData.checkIn && !!walkInData.checkOut;
    const hasCustomer = !!walkInData.customers_fname && !!walkInData.customers_lname && !!walkInData.customers_phone_number && !!walkInData.customers_address && !!walkInData.customers_date_of_birth;
    const hasPayment = !!(walkInData.payment && walkInData.payment.method && walkInData.payment.amountPaid);

    if (!hasRooms || !hasDates) {
      navigate('/admin/choose-rooms', { replace: true });
      return;
    }
    if (!hasCustomer) {
      navigate('/admin/add-walk-in', { replace: true });
      return;
    }
    if (!hasPayment) {
      navigate('/admin/payment-method', { replace: true });
      return;
    }
  }, [navigate, walkInData]);

  const handleConfirm = async () => {
    // Validate payment fields
    const amountPaidRaw = walkInData.payment?.amountPaid;
    const paymentMethod = walkInData.payment?.method || '';
    const referenceNumber = walkInData.payment?.referenceNumber || '';

    const totalAmount = walkInData.billing?.total || 0;
    const numericAmountPaid = Number(amountPaidRaw);

    console.log('🔍 Confirmation.jsx - handleConfirm called');
    console.log('📊 Current walkInData:', walkInData);
    console.log('💰 Payment details:', {
      amountPaid: numericAmountPaid,
      paymentMethod,
      referenceNumber,
      total: totalAmount
    });

    if (!paymentMethod) {
      alert('Please select a payment method.');
      return;
    }

    if (paymentMethod.toLowerCase() !== 'cash' && !referenceNumber.trim()) {
      alert('Reference Number is required for this payment method.');
      return;
    }

    if (!Number.isFinite(numericAmountPaid) || numericAmountPaid <= 0) {
      alert('Please enter a valid amount paid.');
      return;
    }

    const minimumPayment = totalAmount * 0.5;
    if (numericAmountPaid < minimumPayment) {
      alert(`The amount paid must be at least 50% of the total (₱${minimumPayment.toLocaleString()})`);
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
    setConfirmStatus(null);
  };

  const handleConfirmBooking = async () => {
    console.log('🚀 Confirmation.jsx - handleConfirmBooking called');
    console.log('📋 Original walkInData before processing:', walkInData);
    
    setIsLoading(true);
    setConfirmStatus(null);

    try {
      // Ensure total is correct
      const total =
        walkInData.billing?.total ??
        ((walkInData.billing?.subtotal ?? 0) +
          (walkInData.billing?.vat ?? 0) -
          (walkInData.payment?.discount ?? 0));

      console.log('🧮 Total calculation:', {
        billingTotal: walkInData.billing?.total,
        subtotal: walkInData.billing?.subtotal ?? 0,
        vat: walkInData.billing?.vat ?? 0,
        discount: walkInData.payment?.discount ?? 0,
        calculatedTotal: total
      });

      // Clean up data for the backend
      const cleanedData = {
        ...walkInData,
        // Ensure check-in and check-out times are set correctly
        checkIn: (() => {
          const checkInDate = new Date(walkInData.checkIn);
          checkInDate.setHours(14, 0, 0, 0); // 2:00 PM
          // Format manually to avoid timezone issues
          const year = checkInDate.getFullYear();
          const month = String(checkInDate.getMonth() + 1).padStart(2, '0');
          const day = String(checkInDate.getDate()).padStart(2, '0');
          const hours = String(checkInDate.getHours()).padStart(2, '0');
          const minutes = String(checkInDate.getMinutes()).padStart(2, '0');
          const seconds = String(checkInDate.getSeconds()).padStart(2, '0');
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        })(),
        checkOut: (() => {
          const checkOutDate = new Date(walkInData.checkOut);
          checkOutDate.setHours(12, 0, 0, 0); // 12:00 PM
          // Format manually to avoid timezone issues
          const year = checkOutDate.getFullYear();
          const month = String(checkOutDate.getMonth() + 1).padStart(2, '0');
          const day = String(checkOutDate.getDate()).padStart(2, '0');
          const hours = String(checkOutDate.getHours()).padStart(2, '0');
          const minutes = String(checkOutDate.getMinutes()).padStart(2, '0');
          const seconds = String(checkOutDate.getSeconds()).padStart(2, '0');
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        })(),
        billing: {
          ...walkInData.billing,
          total
        },
        selectedRooms: walkInData.selectedRooms.map((room) => ({
          roomnumber_id: room.roomnumber_id || room.id,
          roomtype_id: room.roomtype_id,
          roomtype_name: room.roomtype_name || room.name || 'Room',
          roomtype_price: room.roomtype_price || room.price,
          roomfloor: room.roomfloor || room.floor,
          roomtype_capacity: room.roomtype_capacity || room.capacity,
          roomtype_beds: room.roomtype_beds || room.beds,
          roomtype_sizes: room.roomtype_sizes || room.size,
          roomtype_description: room.roomtype_description || room.description,
          status_name: room.status_name
        }))
      };

      console.log('✅ Final cleanedData to send:', cleanedData);
      console.log('🕐 Check-in/Check-out times:', {
        originalCheckIn: walkInData.checkIn,
        originalCheckOut: walkInData.checkOut,
        processedCheckIn: cleanedData.checkIn,
        processedCheckOut: cleanedData.checkOut
      });
      console.log('🏨 Selected rooms:', cleanedData.selectedRooms);
      console.log('👤 Customer info:', {
        name: `${cleanedData.customers_fname} ${cleanedData.customers_lname}`,
        email: cleanedData.customers_email,
        phone: cleanedData.customers_phone_number
      });

      // Attach current employee_id for backend attribution
      cleanedData.employee_id = Number(localStorage.getItem('userId')) || 1;

      // Build payload for customerBookingNoAccount
      const adultsTotal = Number(walkInData.adult || 0);
      const childrenTotal = Number(walkInData.children || 0);
      const roomsLen = Math.max(1, cleanedData.selectedRooms.length || 1);
      const distribute = (count) => {
        const base = Math.floor(count / roomsLen);
        const extra = count % roomsLen;
        return Array.from({ length: roomsLen }, (_, i) => base + (i < extra ? 1 : 0));
      };
      const adultDist = distribute(adultsTotal);
      const childDist = distribute(childrenTotal);

      const roomDetails = cleanedData.selectedRooms.map((room, idx) => ({
        roomTypeId: Number(room.roomtype_id),
        adultCount: Number(adultDist[idx] || 0),
        childrenCount: Number(childDist[idx] || 0),
        bedCount: 0
      }));

      const method = (walkInData.payment?.method || '').toLowerCase();
      const paymentMethodId = method === 'gcash' ? 1 : method === 'paypal' ? 2 : method === 'cash' ? 3 : method === 'check' ? 4 : 1;
      const numericAmountPaid = Number(walkInData.payment?.amountPaid || 0);
      const bookingDetails = {
        checkIn: cleanedData.checkIn,
        checkOut: cleanedData.checkOut,
        downpayment: numericAmountPaid,
        children: childrenTotal,
        adult: adultsTotal,
        totalAmount: Number(cleanedData.billing.total || 0),
        payment_method_id: paymentMethodId,
        displayedVat: Number(walkInData.billing?.vat || 0),
        totalPay: numericAmountPaid
      };

      const payload = {
        walkinfirstname: cleanedData.customers_fname,
        walkinlastname: cleanedData.customers_lname,
        email: cleanedData.customers_email,
        contactNumber: cleanedData.customers_phone_number,
        bookingDetails,
        roomDetails
      };

      // Prepare and send data
      const formData = new FormData();
      formData.append('operation', 'customerBookingNoAccount');
      formData.append('json', JSON.stringify(payload));
      // Optional proof image support if present in state
      if (walkInData.payment?.proofFile) {
        formData.append('file', walkInData.payment.proofFile);
      }

      console.log('📤 FormData to be sent:', formData);
      console.log('📦 JSON payload:', JSON.stringify(payload, null, 2));
      console.log('🌐 Sending request to:', APIConn);
      const res = await axios.post(APIConn, formData);

      let responseData = res.data;
      try {
        // In case backend returns JSON string
        if (typeof responseData === 'string') {
          responseData = JSON.parse(responseData);
        }
      } catch (_) {}

      const isSuccess = responseData === 1 || responseData?.success === true;
      if (isSuccess) {
        setConfirmStatus('success');
        // Clear persisted Walk-In flow state on successful submission
        resetWalkIn();
        setTimeout(() => {
          navigate('/admin/choose-rooms');
        }, 2000);
      } else {
        setConfirmStatus('error');
        const code = Number(responseData);
        if (code === -1) {
          alert('No available rooms for the selected date range.');
        } else if (code === 2) {
          alert('File upload failed: invalid file type.');
        } else if (code === 3) {
          alert('File upload failed: file too large or error.');
        } else if (code === 4) {
          alert('File upload failed: move error on server.');
        } else if (typeof responseData === 'string') {
          alert(responseData);
        } else {
          alert('Booking failed due to an unknown error.');
        }
      }

    } catch (err) {
      console.error('❌ Error confirming booking:', err);
      console.error('🔍 Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });
      setConfirmStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const amountPaid = Number(walkInData.payment?.amountPaid) || 0;
  const total = Number(walkInData.billing?.total || 0);
  const methodLower = (walkInData.payment?.method || '').toLowerCase();
  const change = methodLower === 'cash' ? Math.max(0, amountPaid - total) : 0;

  return (
    <div className="lg:ml-72 max-w-3xl mx-auto p-6 space-y-8 bg-white dark:bg-gray-900 rounded-md">
      <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-gray-100">
        Booking Confirmation
      </h2>

      {/* Customer Info */}
      <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 border-b border-gray-300 dark:border-gray-700 pb-2 text-gray-700 dark:text-gray-200">
          Customer Information
        </h3>
        <p className="text-gray-800 dark:text-gray-300">
          <span className="font-medium">Name:</span> {walkInData.customers_fname} {walkInData.customers_lname}
        </p>
        <p className="text-gray-800 dark:text-gray-300">
          <span className="font-medium">Email:</span> {walkInData.customers_email}
        </p>
        <p className="text-gray-800 dark:text-gray-300">
          <span className="font-medium">Phone:</span> {walkInData.customers_phone_number}
        </p>
      </section>

      {/* Stay Details */}
      <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 border-b border-gray-300 dark:border-gray-700 pb-2 text-gray-700 dark:text-gray-200">
          Stay Details
        </h3>
        <p className="text-gray-800 dark:text-gray-300">
          <span className="font-medium">Check-In:</span> {walkInData.checkIn ? new Date(walkInData.checkIn).toLocaleDateString('en-PH') + ' at 2:00 PM' : 'N/A'}
        </p>
        <p className="text-gray-800 dark:text-gray-300">
          <span className="font-medium">Check-Out:</span> {walkInData.checkOut ? new Date(walkInData.checkOut).toLocaleDateString('en-PH') + ' at 12:00 PM' : 'N/A'}
        </p>
        <p className="text-gray-800 dark:text-gray-300">
          <span className="font-medium">Adults:</span> {walkInData.adult || 0}
        </p>
        <p className="text-gray-800 dark:text-gray-300">
          <span className="font-medium">Children:</span> {walkInData.children || 0}
        </p>
        <p className="text-gray-800 dark:text-gray-300">
          <span className="font-medium">Total Guests:</span> {(walkInData.adult || 0) + (walkInData.children || 0)}
        </p>
      </section>


      {/* Selected Rooms */}
      <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 border-b border-gray-300 dark:border-gray-700 pb-2 text-gray-700 dark:text-gray-200">
          Selected Rooms
        </h3>
        {walkInData.selectedRooms?.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 text-gray-800 dark:text-gray-300">
            {walkInData.selectedRooms.map((room, index) => (
              <li key={index}>
                <span className="font-medium">Room #{room.roomnumber_id || room.id}</span> 
                (Floor {room.roomfloor || room.floor}) - 
                {room.roomtype_name || room.name || 'Room'} - 
                ₱{(room.roomtype_price || room.price || 0).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 italic">No rooms selected</p>
        )}
      </section>

      {/* Payment Summary */}
      <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 border-b border-gray-300 dark:border-gray-700 pb-2 text-gray-700 dark:text-gray-200">
          Payment Summary
        </h3>
        <div className="grid grid-cols-2 gap-4 text-gray-800 dark:text-gray-300">
          <div>
            <p>
              <span className="font-medium">Payment Method:</span> {walkInData.payment?.method || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Amount Paid:</span>{' '}
              ₱{amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p>
              <span className="font-medium">Total Amount:</span>{' '}
              ₱{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p>
              <span className="font-medium">Change:</span>{' '}
              {change >= 0 ? `₱${change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₱0.00'}
            </p>
          </div>
        </div>
      </section>

      {/* Confirm Button */}
      <div className="text-center">
        <button
          onClick={handleConfirm}
          className="bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 text-white font-semibold px-8 py-3 rounded-md transition"
        >
          Confirm Booking
        </button>
      </div>

      {/* Custom Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {confirmStatus === 'success' ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="h-6 w-6" />
                  Booking Confirmed!
                </div>
              ) : confirmStatus === 'error' ? (
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <XCircle className="h-6 w-6" />
                  Booking Failed
                </div>
              ) : (
                'Confirm Booking'
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6">
            {confirmStatus === 'success' ? (
              <div className="text-center space-y-4">
                <div className="text-green-600 text-lg font-medium">
                  Your booking has been successfully confirmed!
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  You will be redirected to the room selection page shortly.
                </div>
              </div>
            ) : confirmStatus === 'error' ? (
              <div className="text-center space-y-4">
                <div className="text-red-600 text-lg font-medium">
                  Failed to confirm booking
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Please try again or contact support if the problem persists.
                </div>
                <Button 
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to confirm this booking?
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  This action cannot be undone.
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleConfirmBooking}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      'Confirm'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
