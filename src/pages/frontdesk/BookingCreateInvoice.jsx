import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function BookingCreateInvoice() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingCharges, setBookingCharges] = useState([]);
  const [newChargeForm, setNewChargeForm] = useState({
    charge_name: '',
    charge_price: '',
    quantity: 1,
    category_id: 4
  });
  const [invoiceForm, setInvoiceForm] = useState({
    payment_method_id: 2,
    discount_id: null,
    vat_rate: 0.12,
    downpayment: 0,
    invoice_status_id: 1
  });

  const fetchBookings = async () => {
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      console.log("Fetching bookings from URL:", url);
      const formData = new FormData();
      formData.append("operation", "getBookingsWithBillingStatus");
      const res = await axios.post(url, formData);
      console.log("API Response:", res.data);
      setBookings(res.data !== 0 ? res.data : []);
      console.log("Bookings set:", res.data !== 0 ? res.data : []);
    } catch (err) {
      console.error("Error loading bookings:", err);
      toast.error("Error loading bookings: " + err.message);
    }
  };

  const validateBilling = async (bookingId) => {
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "validateBillingCompleteness");
      formData.append("json", JSON.stringify({ booking_id: bookingId }));
      
      const res = await axios.post(url, formData);
      return res.data;
    } catch (err) {
      toast.error("Error validating billing");
      return { success: false, message: "Validation failed" };
    }
  };

  const createBillingRecord = async (bookingId) => {
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "createBillingRecord");
      formData.append("json", JSON.stringify({ 
        booking_id: bookingId,
        employee_id: 1
      }));
      
      const res = await axios.post(url, formData);
      return res.data?.success || false;
    } catch (err) {
      console.error("Error creating billing record:", err);
      return false;
    }
  };

  const calculateBillingBreakdown = async (bookingId) => {
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "calculateComprehensiveBilling");
      formData.append("json", JSON.stringify({ 
        booking_id: bookingId,
        discount_id: invoiceForm.discount_id,
        vat_rate: invoiceForm.vat_rate,
        downpayment: invoiceForm.downpayment
      }));
      
      console.log("Calculating billing breakdown for booking:", bookingId);
      console.log("Request data:", { 
        booking_id: bookingId,
        discount_id: invoiceForm.discount_id,
        vat_rate: invoiceForm.vat_rate,
        downpayment: invoiceForm.downpayment
      });
      
      const res = await axios.post(url, formData);
      console.log("Billing breakdown API response:", res.data);
      console.log("Billing breakdown type check:", {
        room_total: typeof res.data.room_total,
        room_total_value: res.data.room_total,
        charge_total: typeof res.data.charge_total,
        charge_total_value: res.data.charge_total
      });
      return res.data;
    } catch (err) {
      console.error("Error calculating billing breakdown:", err);
      toast.error("Error calculating billing breakdown: " + err.message);
      return null;
    }
  };

  const handleCreateInvoice = async (booking) => {
    setSelectedBooking(booking);
    
    try {
      // Step 1: Check if billing exists, if not create it
      if (!booking.billing_id) {
        toast.info("Creating billing record...");
        const billingCreated = await createBillingRecord(booking.booking_id);
        if (!billingCreated) {
          toast.error("Failed to create billing record");
          return;
        }
        // Refresh bookings to get the new billing_id
        toast.success("Billing record created! Refreshing data...");
        await fetchBookings();
        // Continue to invoice creation after creating billing record
      }

      // Step 2: Load charges data for the invoice modal
      toast.info("Loading charges data...");
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "getBookingCharges");
      formData.append("json", JSON.stringify({ booking_id: booking.booking_id }));
      
      const chargesRes = await axios.post(url, formData);
      
      if (chargesRes.data.success) {
        setBookingCharges(chargesRes.data.charges);
        toast.success(`Loaded ${chargesRes.data.total_charges_count} charges for invoice`);
      } else {
        toast.error("Failed to load charges: " + chargesRes.data.message);
        setBookingCharges([]);
      }

      toast.info("Validating billing...");

      // Step 3: Validate billing completeness
      const validation = await validateBilling(booking.booking_id);
      
      if (!validation.success) {
        toast.error("Validation failed: " + validation.message);
        return;
      }

      // Only block if there are pending charges, not missing room assignments
      if (validation.pending_charges > 0) {
        toast.warning(validation.message);
        return;
      }

      // Show warning if no rooms assigned but continue anyway
      if (validation.assigned_rooms === 0) {
        toast.warning("Note: No rooms assigned to this booking yet. Invoice will be created with current charges only.");
      }

      toast.info("Calculating billing breakdown...");

      // Step 4: Calculate billing breakdown
      const breakdown = await calculateBillingBreakdown(booking.booking_id);
      
      if (!breakdown || !breakdown.success) {
        toast.error("Failed to calculate billing breakdown: " + (breakdown?.message || "Unknown error"));
        return;
      }

      toast.success("Billing breakdown calculated successfully!");
      
      setShowInvoiceModal(true);
      
    } catch (error) {
      toast.error("An error occurred while preparing invoice creation: " + error.message);
    }
  };

  const handleCreateBilling = async (booking) => {
    setSelectedBooking(booking);
    
    try {
      // If no billing_id exists, create billing record first
      if (!booking.billing_id) {
        const billingCreated = await createBillingRecord(booking.booking_id);
        if (!billingCreated) {
          toast.error("Failed to create billing record");
          return;
        }
        toast.success("Billing record created successfully!");
      }

      // Load all charges for this booking
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "getBookingCharges");
      formData.append("json", JSON.stringify({ booking_id: booking.booking_id }));
      
      const res = await axios.post(url, formData);
      
      if (res.data.success) {
        setBookingCharges(res.data.charges);
        setShowBillingModal(true);
        toast.success(`Found ${res.data.total_charges_count} charges for this booking`);
      } else {
        toast.error("Failed to load charges: " + res.data.message);
      }
    } catch (error) {
      toast.error("Error loading billing information: " + error.message);
    }
  };

  const handleAddCharge = async () => {
    if (!newChargeForm.charge_name || !newChargeForm.charge_price) {
      toast.error("Please fill in charge name and price");
      return;
    }

    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "addBookingCharge");
      formData.append("json", JSON.stringify({
        booking_id: selectedBooking.booking_id,
        charge_name: newChargeForm.charge_name,
        charge_price: parseFloat(newChargeForm.charge_price),
        quantity: parseInt(newChargeForm.quantity),
        category_id: newChargeForm.category_id
      }));
      
      const res = await axios.post(url, formData);
      
      if (res.data.success) {
        toast.success("Charge added successfully!");
        // Reset form
        setNewChargeForm({
          charge_name: '',
          charge_price: '',
          quantity: 1,
          category_id: 4
        });
        // Reload charges
        handleCreateBilling(selectedBooking);
      } else {
        toast.error("Failed to add charge: " + res.data.message);
      }
    } catch (error) {
      toast.error("Error adding charge: " + error.message);
    }
  };

  const handleBillingDone = async () => {
    // Close modal and reset states
    setShowBillingModal(false);
    setSelectedBooking(null);
    setBookingCharges([]);
    setNewChargeForm({
      charge_name: '',
      charge_price: '',
      quantity: 1,
      category_id: 4
    });
    
    // Refresh bookings to update the button status
    await fetchBookings();
    toast.success("Billing review completed! You can now create the invoice.");
  };


  const confirmCreateInvoice = async () => {
    if (!selectedBooking) {
      toast.error("No booking selected");
      return;
    }

    // If no billing_id, try to create one first
    if (!selectedBooking.billing_id) {
      const billingCreated = await createBillingRecord(selectedBooking.booking_id);
      if (!billingCreated) {
        toast.error("Failed to create billing record");
        return;
      }
      // Refresh and get updated booking data
      await fetchBookings();
      toast.info("Billing record created. Please try creating invoice again.");
      return;
    }

    try {
      setLoading(true);

      const jsonData = {
        billing_ids: [selectedBooking.billing_id],
        employee_id: 1, // Replace with session value
        payment_method_id: invoiceForm.payment_method_id,
        invoice_status_id: invoiceForm.invoice_status_id,
        discount_id: invoiceForm.discount_id,
        vat_rate: invoiceForm.vat_rate,
        downpayment: invoiceForm.downpayment
      };

      console.log("Creating invoice with data:", jsonData);

      const formData = new FormData();
      formData.append("operation", "createInvoice");
      formData.append("json", JSON.stringify(jsonData));

      const url = localStorage.getItem("url") + "transactions.php";
      const res = await axios.post(url, formData);

      if (res.data?.success) {
        toast.success(res.data.message || "Invoice created successfully!");
        setShowInvoiceModal(false);
        setSelectedBooking(null);
        fetchBookings(); // Refresh list
      } else {
        toast.error(res.data.message || "Failed to create invoice.");
      }
    } catch (err) {
      toast.error("An error occurred while creating the invoice: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);


  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Comprehensive Invoice Management</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: '5px 0 0 0' }}>
            This system validates all billing components before creating invoices, ensuring accuracy and completeness.
          </p>
        </div>
      </div>
      
      {loading && <p>Processing invoice...</p>}
      
      <table border="1" cellPadding={5} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th>Booking ID</th>
            <th>Reference No</th>
            <th>Customer</th>
            <th>Customer Type</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Billing ID</th>
            <th>Invoice Status</th>
            <th>Validation</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b, index) => (
            <tr key={`booking-${b.booking_id}-${index}`}>
              <td>{b.booking_id}</td>
              <td>{b.reference_no}</td>
              <td>{b.customer_name || "Unknown Customer"}</td>
              <td>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: b.customer_type === 'Online' ? '#d4edda' : '#fff3cd',
                  color: b.customer_type === 'Online' ? '#155724' : '#856404'
                }}>
                  {b.customer_type || 'Unknown'}
                </span>
              </td>
              <td>{b.booking_checkin_dateandtime}</td>
              <td>{b.booking_checkout_dateandtime}</td>
              <td>{b.billing_id || "None"}</td>
              <td>
                {b.invoice_id ? (
                  <span style={{ color: 'green' }}>✅ Created</span>
                ) : (
                  <span style={{ color: 'red' }}>❌ Not Created</span>
                )}
              </td>
              <td>
                {b.billing_id && !b.invoice_id ? (
                  <button 
                    onClick={() => validateBilling(b.booking_id)}
                    style={{ fontSize: '12px', padding: '2px 6px' }}
                  >
                    Validate
                  </button>
                ) : (
                  "—"
                )}
              </td>
              <td>
                {!b.invoice_id ? (
                  <button 
                    onClick={async () => {
                      if (b.billing_id) {
                        // If billing exists, go directly to invoice creation
                        handleCreateInvoice(b);
                      } else {
                        // If no billing, open billing review modal
                        handleCreateBilling(b);
                      }
                    }}
                    style={{ 
                      backgroundColor: b.billing_id ? '#28a745' : '#ffc107', 
                      color: b.billing_id ? 'white' : 'black', 
                      border: 'none', 
                      padding: '5px 10px', 
                      borderRadius: '3px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {b.billing_id ? 'Create Invoice' : 'Create Billing'}
                  </button>
                ) : (
                  <span style={{ color: 'green', fontSize: '12px' }}>✅ Invoice Created</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Invoice Creation Modal */}
      {showInvoiceModal && selectedBooking && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '12px', 
            maxWidth: '95%', 
            maxHeight: '95%', 
            overflow: 'auto',
            width: '1200px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            {/* Header */}
            <div style={{ borderBottom: '2px solid #e9ecef', paddingBottom: '20px', marginBottom: '25px' }}>
              <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>📑 Official Invoice Creation - Booking #{selectedBooking.booking_id}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', fontSize: '14px' }}>
                <div>
                  <strong>Invoice No.:</strong><br/>
                  <span style={{ color: '#6c757d' }}>INV-{new Date().getFullYear()}-{String(selectedBooking.booking_id).padStart(4, '0')}</span>
                </div>
                <div>
                  <strong>Invoice Date:</strong><br/>
                  <span style={{ color: '#6c757d' }}>{new Date().toLocaleDateString()}</span>
                </div>
                <div>
                  <strong>Guest Name:</strong><br/>
                  <span style={{ color: '#6c757d' }}>{selectedBooking.customer_name || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Customer Information Section */}
            <div style={{ 
              marginBottom: '25px', 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ marginBottom: '15px', color: '#495057' }}>👤 Customer Information (BIR Required)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Full Name:</label>
                  <input
                    type="text"
                    value={selectedBooking.customer_name || ''}
                    readOnly
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #ced4da', 
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#e9ecef'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Address:</label>
                  <input
                    type="text"
                    placeholder="Enter customer address (required for invoices > ₱1,000)"
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #ced4da', 
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>TIN (Optional):</label>
                  <input
                    type="text"
                    placeholder="Tax Identification Number"
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #ced4da', 
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Contact Number:</label>
                  <input
                    type="text"
                    placeholder="Customer contact number"
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #ced4da', 
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Charges Summary (Read-only) */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ marginBottom: '15px', color: '#495057' }}>📋 Charges Summary (Finalized)</h3>
              <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Description</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingCharges.map((charge, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f1f3f4' }}>
                        <td style={{ padding: '12px' }}>{charge.charge_name}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '500' }}>
                          ₱{(parseFloat(charge.total_amount) || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                      <td style={{ padding: '12px' }}>Subtotal</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        ₱{bookingCharges.reduce((sum, charge) => sum + (parseFloat(charge.total_amount) || 0), 0).toFixed(2)}
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: '#fff3cd' }}>
                      <td style={{ padding: '12px' }}>VAT (12%)</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                        ₱{(bookingCharges.reduce((sum, charge) => sum + (parseFloat(charge.total_amount) || 0), 0) * 0.12).toFixed(2)}
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: '#d4edda', fontWeight: 'bold', fontSize: '16px' }}>
                      <td style={{ padding: '12px' }}>Grand Total</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#28a745' }}>
                        ₱{(bookingCharges.reduce((sum, charge) => sum + (parseFloat(charge.total_amount) || 0), 0) * 1.12).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Detailed Charges Dropdown */}
              {bookingCharges.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                  <details style={{ 
                    border: '1px solid #dee2e6', 
                    borderRadius: '8px', 
                    padding: '15px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <summary style={{ 
                      cursor: 'pointer', 
                      fontWeight: 'bold', 
                      fontSize: '16px',
                      color: '#495057',
                      marginBottom: '10px'
                    }}>
                      📋 More Details ({bookingCharges.length} charges)
                    </summary>
                    <div style={{ marginTop: '15px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#e9ecef' }}>
                            <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Type</th>
                            <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Description</th>
                            <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Category</th>
                            <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>Unit Price</th>
                            <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Qty</th>
                            <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookingCharges.map((charge, index) => (
                            <tr key={index} style={{ 
                              borderBottom: '1px solid #f1f3f4',
                              backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'
                            }}>
                              <td style={{ padding: '8px' }}>
                                <span style={{ 
                                  padding: '2px 6px', 
                                  borderRadius: '3px', 
                                  fontSize: '11px',
                                  backgroundColor: charge.charge_type === 'Room Charges' ? '#d4edda' : '#fff3cd',
                                  color: charge.charge_type === 'Room Charges' ? '#155724' : '#856404'
                                }}>
                                  {charge.charge_type}
                                </span>
                              </td>
                              <td style={{ padding: '8px', fontWeight: '500' }}>{charge.charge_name}</td>
                              <td style={{ padding: '8px', color: '#6c757d' }}>{charge.category}</td>
                              <td style={{ padding: '8px', textAlign: 'right', fontWeight: '500' }}>
                                ₱{(parseFloat(charge.unit_price) || 0).toFixed(2)}
                              </td>
                              <td style={{ padding: '8px', textAlign: 'center' }}>{charge.quantity}</td>
                              <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600', color: '#28a745' }}>
                                ₱{(parseFloat(charge.total_amount) || 0).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
                    </div>
                  </details>
                </div>
              )}
            </div>

            {/* Payment Details */}
            <div style={{ 
              marginBottom: '25px', 
              padding: '20px', 
              backgroundColor: '#e8f5e8', 
              borderRadius: '8px',
              border: '1px solid #c3e6c3'
            }}>
              <h4 style={{ marginBottom: '15px', color: '#155724' }}>💳 Payment Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Payment Method:</label>
                  <select 
                    value={invoiceForm.payment_method_id} 
                    onChange={(e) => setInvoiceForm({...invoiceForm, payment_method_id: parseInt(e.target.value)})}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #ced4da', 
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value={1}>GCash</option>
                    <option value={2}>Cash</option>
                    <option value={3}>Paymaya</option>
                    <option value={4}>Check</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Amount Paid:</label>
                  <input
                    type="number"
                    value={invoiceForm.downpayment || (bookingCharges.reduce((sum, charge) => sum + (parseFloat(charge.total_amount) || 0), 0) * 1.12)}
                    onChange={(e) => setInvoiceForm({...invoiceForm, downpayment: parseFloat(e.target.value)})}
                    min="0"
                    step="0.01"
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #ced4da', 
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Balance Due:</label>
                  <div style={{ 
                    padding: '10px', 
                    backgroundColor: '#fff3cd', 
                    border: '1px solid #ffc107',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}>
                    ₱{Math.max(0, (bookingCharges.reduce((sum, charge) => sum + (parseFloat(charge.total_amount) || 0), 0) * 1.12) - (invoiceForm.downpayment || 0)).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Status */}
            <div style={{ 
              marginBottom: '25px', 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ marginBottom: '15px', color: '#495057' }}>📊 Invoice Status</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Status:</label>
                  <select 
                    value={invoiceForm.invoice_status_id} 
                    onChange={(e) => setInvoiceForm({...invoiceForm, invoice_status_id: parseInt(e.target.value)})}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #ced4da', 
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value={1}>Paid</option>
                    <option value={2}>Partially Paid</option>
                    <option value={3}>Unpaid</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Authorized Representative:</label>
                  <input
                    type="text"
                    value="Front Desk Staff"
                    readOnly
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #ced4da', 
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#e9ecef'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div style={{ 
              marginBottom: '25px', 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ marginBottom: '15px', color: '#495057' }}>📝 Notes</h4>
              <textarea
                placeholder="Thank you for staying with us! Additional notes..."
                rows="3"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ced4da', 
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ textAlign: 'right', borderTop: '1px solid #e9ecef', paddingTop: '20px' }}>
              <button 
                onClick={confirmCreateInvoice}
                disabled={loading}
                style={{ 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px 30px', 
                  borderRadius: '6px',
                  marginRight: '15px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  opacity: loading ? 0.6 : 1
                }}
              >
                ✅ Create Invoice
              </button>
              <button 
                onClick={() => {
                  setShowInvoiceModal(false);
                  setSelectedBooking(null);
                }}
                style={{ 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px 30px', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing Review Modal */}
      {showBillingModal && selectedBooking && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '12px', 
            maxWidth: '95%', 
            maxHeight: '95%', 
            overflow: 'auto',
            width: '1000px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            {/* Header */}
            <div style={{ borderBottom: '2px solid #e9ecef', paddingBottom: '20px', marginBottom: '25px' }}>
              <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>🧾 Billing Review - Booking #{selectedBooking.booking_id}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', fontSize: '14px' }}>
                <div>
                  <strong>Guest Name:</strong><br/>
                  <span style={{ color: '#6c757d' }}>{selectedBooking.customer_name || 'N/A'}</span>
                </div>
                <div>
                  <strong>Room Type:</strong><br/>
                  <span style={{ color: '#6c757d' }}>Standard Room</span>
                </div>
                <div>
                  <strong>Booking Period:</strong><br/>
                  <span style={{ color: '#6c757d' }}>
                    {selectedBooking.booking_checkin_dateandtime ? 
                      new Date(selectedBooking.booking_checkin_dateandtime).toLocaleDateString() : 'N/A'} - 
                    {selectedBooking.booking_checkout_dateandtime ? 
                      new Date(selectedBooking.booking_checkout_dateandtime).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Charges Table */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ marginBottom: '15px', color: '#495057' }}>Current Charges</h3>
              <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Type</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Description</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Category</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>Unit Price</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Qty</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>Total</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingCharges.map((charge, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f1f3f4' }}>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            fontSize: '12px',
                            backgroundColor: charge.charge_type === 'Room Charges' ? '#d4edda' : '#fff3cd',
                            color: charge.charge_type === 'Room Charges' ? '#155724' : '#856404'
                          }}>
                            {charge.charge_type}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: '500' }}>{charge.charge_name}</td>
                        <td style={{ padding: '12px', color: '#6c757d' }}>{charge.category}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '500' }}>
                          ₱{(parseFloat(charge.unit_price) || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{charge.quantity}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#28a745' }}>
                          ₱{(parseFloat(charge.total_amount) || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button style={{ 
                            backgroundColor: '#dc3545', 
                            color: 'white', 
                            border: 'none', 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {bookingCharges.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
                          No charges found for this booking
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add New Charge Form */}
            <div style={{ 
              marginBottom: '25px', 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ marginBottom: '15px', color: '#495057' }}>➕ Add New Charge</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Description:</label>
                  <input
                    type="text"
                    placeholder="e.g., Aircon Damage, TV Repair, Broken Vase"
                    value={newChargeForm.charge_name}
                    onChange={(e) => setNewChargeForm({...newChargeForm, charge_name: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #ced4da', 
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Price:</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={newChargeForm.charge_price}
                    onChange={(e) => setNewChargeForm({...newChargeForm, charge_price: e.target.value})}
                    min="0"
                    step="0.01"
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #ced4da', 
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Quantity:</label>
                  <input
                    type="number"
                    value={newChargeForm.quantity}
                    onChange={(e) => setNewChargeForm({...newChargeForm, quantity: parseInt(e.target.value) || 1})}
                    min="1"
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #ced4da', 
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Category:</label>
                  <select
                    value={newChargeForm.category_id}
                    onChange={(e) => setNewChargeForm({...newChargeForm, category_id: parseInt(e.target.value)})}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #ced4da', 
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value={1}>Room</option>
                    <option value={2}>Food</option>
                    <option value={3}>Service</option>
                    <option value={4}>Damage</option>
                  </select>
                </div>
                <div>
                  <button 
                    onClick={handleAddCharge}
                    style={{ 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      border: 'none', 
                      padding: '10px 20px', 
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Add Charge
                  </button>
                </div>
              </div>
            </div>

            {/* Totals Section */}
            <div style={{ 
              marginBottom: '25px', 
              padding: '20px', 
              backgroundColor: '#e8f5e8', 
              borderRadius: '8px',
              border: '1px solid #c3e6c3'
            }}>
              <h4 style={{ marginBottom: '15px', color: '#155724' }}>💰 Billing Totals</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '5px' }}>Subtotal (before VAT)</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#495057' }}>
                    ₱{bookingCharges.reduce((sum, charge) => sum + (parseFloat(charge.total_amount) || 0), 0).toFixed(2)}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '5px' }}>VAT (12%)</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#495057' }}>
                    ₱{(bookingCharges.reduce((sum, charge) => sum + (parseFloat(charge.total_amount) || 0), 0) * 0.12).toFixed(2)}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '5px' }}>Grand Total</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#28a745' }}>
                    ₱{(bookingCharges.reduce((sum, charge) => sum + (parseFloat(charge.total_amount) || 0), 0) * 1.12).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ textAlign: 'right', borderTop: '1px solid #e9ecef', paddingTop: '20px' }}>
              <button 
                onClick={handleBillingDone}
                style={{ 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px 30px', 
                  borderRadius: '6px',
                  marginRight: '15px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                ✅ Done / Confirm Billing
              </button>
              <button 
                onClick={() => {
                  setShowBillingModal(false);
                  setSelectedBooking(null);
                  setBookingCharges([]);
                  setNewChargeForm({
                    charge_name: '',
                    charge_price: '',
                    quantity: 1,
                    category_id: 4
                  });
                }}
                style={{ 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px 30px', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingCreateInvoice;
