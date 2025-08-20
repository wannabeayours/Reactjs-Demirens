import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function BookingDisplayInvoiceSample() {
  const [bookingId, setBookingId] = useState("");
  const [invoice, setInvoice] = useState(null);

  const fetchInvoice = async () => {
    if (!bookingId) {
      toast.error("Please enter a Booking ID.");
      return;
    }

    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "getBookingInvoice");
      formData.append(
        "json",
        JSON.stringify({ booking_id: parseInt(bookingId) })
      );

      const res = await axios.post(url, formData);

      if (res.data?.error) {
        toast.error(res.data.error);
        setInvoice(null);
      } else {
        setInvoice(res.data);
      }
    } catch (error) {
      toast.error("Error fetching invoice.");
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Booking Invoice Viewer</h2>
      <input
        type="number"
        value={bookingId}
        onChange={(e) => setBookingId(e.target.value)}
        placeholder="Enter Booking ID"
      />
      <button onClick={fetchInvoice}>View Invoice</button>

      {invoice && (
        <div style={{ marginTop: "20px" }}>
          <h3>Invoice Details</h3>
          <p>
            <strong>Booking ID:</strong> {invoice.booking_id}
          </p>
          <p>
            <strong>Reference No:</strong> {invoice.reference_no}
          </p>
          <p>
            <strong>Customer Name:</strong> {invoice.customer_name}
          </p>
          <p>
            <strong>Billing ID:</strong> {invoice.billing_id}
          </p>
          <p>
            <strong>Total Amount:</strong> ₱{invoice.billing_total_amount}
          </p>
          <p>
            <strong>Downpayment:</strong> ₱{invoice.billing_downpayment}
          </p>
          <p>
            <strong>Balance:</strong> ₱{invoice.billing_balance}
          </p>
          <p>
            <strong>Invoice ID:</strong> {invoice.invoice_id}
          </p>
          <p>
            <strong>Invoice Date:</strong> {invoice.invoice_date}
          </p>
          <p>
            <strong>Invoice Time:</strong> {invoice.invoice_time}
          </p>
          <p>
            <strong>Paid Via:</strong> {invoice.payment_method_name}
          </p>
          <p>
            <strong>Processed By:</strong> {invoice.employee_fname}
          </p>
        </div>
      )}
    </div>
  );
}

export default BookingDisplayInvoiceSample;
