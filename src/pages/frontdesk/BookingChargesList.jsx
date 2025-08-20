import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function BookingChargesList() {
  const [charges, setCharges] = useState([]);

  const getBookingCharges = async () => {
    try {
      const url = localStorage.getItem('url') + 'transactions.php';
      const formData = new FormData();
      formData.append('operation', 'bookingChargesList');

      const res = await axios.post(url, formData);
      setCharges(res.data !== 0 ? res.data : []);
    } catch (err) {
      toast.error('Failed to load booking charges.');
    }
  };

  

  useEffect(() => {
    getBookingCharges();
  }, []);

  return (
    <div>
      <h2>Booking Charges List</h2>
      {charges.length === 0 ? (
        <p>No charges found.</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Charge ID</th>
              <th>Room Booking ID</th>
              <th>Category</th>
              <th>Charge Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {charges.map((charge, index) => (
              <tr key={index}>
                <td>{charge['Charge ID']}</td>
                <td>{charge['Room Booking ID']}</td>
                <td>{charge['Category']}</td>
                <td>{charge['Charge Name']}</td>
                <td>{charge['Price']}</td>
                <td>{charge['Quantity']}</td>
                <td>{charge['Total Amount']}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default BookingChargesList;
