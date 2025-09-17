import React from 'react';
import { useWalkIn } from './WalkInContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Confirmation() {
  const APIConn = `${localStorage.url}admin.php`;
  const navigate = useNavigate();
  const { walkInData } = useWalkIn();

  const handleConfirm = async () => {
    // Validate payment fields
    const amountPaid = walkInData.payment?.amountPaid || 0;
    const paymentMethod = walkInData.payment?.method || '';
    const referenceNumber = walkInData.payment?.referenceNumber || '';

    if (!paymentMethod) {
      alert('Please select a payment method.');
      return;
    }

    if (paymentMethod.toLowerCase() !== 'cash' && !referenceNumber.trim()) {
      alert('Reference Number is required for this payment method.');
      return;
    }

    if (amountPaid <= 0) {
      alert('Please enter a valid amount paid.');
      return;
    }

    // Ensure total is correct
    const total =
      walkInData.billing?.total ??
      ((walkInData.billing?.subtotal ?? 0) +
        (walkInData.billing?.vat ?? 0) -
        (walkInData.payment?.discount ?? 0));

    // Clean up data for the backend
    const cleanedData = {
      ...walkInData,
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

    console.log('Final booking data to send:', cleanedData);

    // Prepare and send data
    const formData = new FormData();
    formData.append('method', 'finalizeBooking');
    formData.append('json', JSON.stringify(cleanedData));

    console.log('FormData to be sent:', formData);
    try {
      const res = await axios.post(APIConn, formData);
      alert('Booking confirmed!');
      navigate('/admin/choose-rooms');
    } catch (err) {
      console.error('Error confirming booking:', err);
      alert('Failed to confirm booking. Please try again.');
    }
  };

  const amountPaid = walkInData.payment?.amountPaid || 0;
  const total = walkInData.billing?.total || 0;
  const change = amountPaid - total;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 bg-white dark:bg-gray-900 rounded-md">
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
          <span className="font-medium">Check-In:</span> {walkInData.checkIn}
        </p>
        <p className="text-gray-800 dark:text-gray-300">
          <span className="font-medium">Check-Out:</span> {walkInData.checkOut}
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
                ₱{(room.roomtype_price || room.price || 0).toLocaleString()}
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
              ₱{change >= 0 ? change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '₱0.00'}
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
    </div>
  );
}
