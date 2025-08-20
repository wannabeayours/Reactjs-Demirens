import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function BookingCreateInvoice() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  //   const fetchBookings = async () => {
  //     try {
  //       const res = await axios.get("http://localhost/api/getBookingsWithBillingStatus.php");
  //       setBookings(res.data);
  //     } catch (err) {
  //       console.error("Error fetching bookings", err);
  //     }
  //   };

  const fetchBookings = async () => {
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "getBookingsWithBillingStatus");
      const res = await axios.post(url, formData);
      setBookings(res.data !== 0 ? res.data : []);
    } catch (err) {
      toast.error("Error loading bookings");
    }
  };

  const createInvoice = async (billing_id) => {
    try {
      setLoading(true);

      const jsonData = {
        billing_ids: [billing_id],
        employee_id: 1, // Replace with secureLocalStorage/session value
        payment_method_id: 2,
        invoice_status_id: 1,
      };

      const formData = new FormData();
      formData.append("operation", "createInvoice");
      formData.append("json", JSON.stringify(jsonData));

      const url = localStorage.getItem("url") + "transactions.php";

      const res = await axios.post(url, formData);
      console.log("Invoice API response:", res.data);

      if (res.data?.success) {
        alert(res.data.message || "Invoice created successfully!");
        fetchBookings(); // Refresh list
      } else {
        alert(res.data.message || "Failed to create invoice.");
      }
    } catch (err) {
      console.error("Error creating invoice:", err);
      alert("An error occurred while creating the invoice.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div>
      <h2>Booking List</h2>
      {loading && <p>Processing invoice...</p>}
      <table border="1" cellPadding={5}>
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Reference No</th>
            <th>Customer</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Billing ID</th>
            <th>Invoice</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.booking_id}>
              <td>{b.booking_id}</td>
              <td>{b.reference_no}</td>
              <td>{b.customer_name || "Walk-In"}</td>
              <td>{b.booking_checkin_dateandtime}</td>
              <td>{b.booking_checkout_dateandtime}</td>
              <td>{b.billing_id || "None"}</td>
              <td>{b.invoice_id ? "✅ Created" : "❌ Not Created"}</td>
              <td>
                {!b.invoice_id && b.billing_id ? (
                  <button onClick={() => createInvoice(b.billing_id)}>
                    Create Invoice
                  </button>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BookingCreateInvoice;
