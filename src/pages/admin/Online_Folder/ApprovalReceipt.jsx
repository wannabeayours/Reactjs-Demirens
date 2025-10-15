// src/admin/approval/ApprovalReceipt.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AdminHeader from "../components/AdminHeader";
import { useApproval } from "./ApprovalContext";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import SuccessModal from "../../../components/ui/SuccessModal";
import { NumberFormatter } from '../Function_Files/NumberFormatter';
import DateFormatter from '../Function_Files/DateFormatter';

const currency = (n) => NumberFormatter.formatCurrency(n);

// Helper to format like "16 NOV 2016"
const formatUpperShort = (date) => {
  try {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d)) return '—';
    const day = String(d.getDate()).padStart(2, '0');
    const mon = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const year = d.getFullYear();
    return `${day} ${mon} ${year}`;
  } catch (_) {
    return '—';
  }
};

export default function ApprovalReceipt() {
  const APIConn = `${localStorage.url}admin.php`;
  const navigate = useNavigate();
  const { bookingId: bookingIdParam } = useParams();
  const { state, setState } = useApproval();

  // Local meta info fetched from backend
  const [bookingMeta, setBookingMeta] = useState(null);
  const [guestCounts, setGuestCounts] = useState({ adult: 0, children: 0 });
  // Fallback room ids from existing booking rooms (used when no manual selection)
  const [fallbackRoomIds, setFallbackRoomIds] = useState([]);

  const bookingId = state.bookingId || Number(bookingIdParam);
  const nights = state.nights || 0;

  // Fetch comprehensive booking details by bookingId (customer info, dates, totals, reference, image)
  useEffect(() => {
    if (!bookingId) return;
    const fetchMeta = async () => {
      try {
        const fd = new FormData();
        fd.append("method", "viewBookingsEnhanced");
        const res = await axios.post(APIConn, fd);
        const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        const row = Array.isArray(data) ? data.find((x) => Number(x.booking_id) === Number(bookingId)) : null;
        if (!row) return;

        // Compute nights based on check-in/out dates
        const checkIn = row.booking_checkin_dateandtime;
        const checkOut = row.booking_checkout_dateandtime;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const msPerDay = 1000 * 60 * 60 * 24;
        const computedNights = Math.max(0, Math.round((end - start) / msPerDay));

        setBookingMeta({
          booking_id: row.booking_id,
          customer_name: row.customer_name,
          customer_email: row.customer_email,
          customer_phone: row.customer_phone,
          customer_address: row.customer_address || null,
          booking_checkin_dateandtime: checkIn,
          booking_checkout_dateandtime: checkOut,
          booking_created_at: row.booking_created_at,
          reference_no: row.reference_no,
          room_numbers: row.room_numbers,
          total_amount: Number(row.total_amount || 0),
          downpayment: Number(row.downpayment || 0),
          balance: Number(row.balance || 0),
          vat: Number(row.vat || 0),
          booking_fileName: row.booking_fileName || null,
        });

        // Hydrate context with core meta for header
        setState((prev) => ({
          ...prev,
          customerName: row.customer_name,
          checkIn: checkIn,
          checkOut: checkOut,
          nights: computedNights,
        }));
      } catch (e) {
        console.error("Failed to fetch booking meta:", e);
      }
    };
    fetchMeta();
  }, [bookingId, APIConn, setState]);

  // Fetch room-level guest counts (adult/children) for this booking
  useEffect(() => {
    if (!bookingId) return;
    const fetchRooms = async () => {
      try {
        const fd = new FormData();
        fd.append("method", "get_booking_rooms_by_booking");
        fd.append("json", JSON.stringify({ booking_id: bookingId }));
        const res = await axios.post(APIConn, fd);
        const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        const rows = Array.isArray(data) ? data : [];
        const adult = rows.reduce((sum, r) => sum + Number(r.bookingRoom_adult || 0), 0);
        const children = rows.reduce((sum, r) => sum + Number(r.bookingRoom_children || 0), 0);
        setGuestCounts({ adult, children });
        // NEW: derive fallback room IDs from booking rooms
        const fallbackIds = rows.map((r) => Number(r.roomnumber_id)).filter(Boolean);
        setFallbackRoomIds(fallbackIds);
      } catch (e) {
        console.error("Failed to fetch booking rooms:", e);
      }
    };
    fetchRooms();
  }, [bookingId, APIConn]);



  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  const lineItems = useMemo(
    () =>
      (state.selectedRooms || []).map((r) => ({
        ...r,
        nights,
        lineTotal: nights * Number(r.price || 0),
      })),
    [state.selectedRooms, nights]
  );

  const subtotal = useMemo(
    () => lineItems.reduce((sum, li) => sum + li.lineTotal, 0),
    [lineItems]
  );
  const vat = useMemo(() => subtotal * 0.12, [subtotal]);
  const grandTotal = useMemo(() => subtotal + vat, [subtotal, vat]);
  const downpayment = useMemo(() => grandTotal * 0.5, [grandTotal]);

  const effectiveTotals = useMemo(() => {
    const computed = {
      subtotal,
      vat,
      grandTotal,
      downpayment,
      balance: grandTotal - downpayment,
      source: "selection",
    };
    if ((lineItems || []).length > 0) return computed;
    const metaTotal = Number(bookingMeta?.total_amount || 0);
    const metaVat = Number(bookingMeta?.vat || 0);
    const metaDown = Number(bookingMeta?.downpayment || 0);
    const metaBalance = Number(
      bookingMeta?.balance ?? Math.max(0, metaTotal - metaDown)
    );
    const metaSubtotal = Math.max(0, metaTotal - metaVat);
    return {
      subtotal: metaSubtotal,
      vat: metaVat,
      grandTotal: metaTotal,
      downpayment: metaDown,
      balance: metaBalance,
      source: "booking",
    };
  }, [lineItems, subtotal, vat, grandTotal, downpayment, bookingMeta]);

  // Compact per-night price derived from subtotal
  const perNight = useMemo(() => {
    if (!nights || nights <= 0) return 0;
    return effectiveTotals.subtotal > 0 ? (effectiveTotals.subtotal / nights) : 0;
  }, [effectiveTotals.subtotal, nights]);

  // store totals (so you can access them later if needed)
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      totals: { subtotal, vat, grandTotal, downpayment },
    }));
  }, [subtotal, vat, grandTotal, downpayment, setState]);

  // Ensure userId is present in context (fallback to localStorage keys)
  useEffect(() => {
    const getEffectiveUserId = () => {
      const keys = ["user_id", "userId", "userID", "admin_id", "employee_id", "employeeId"];
      for (const k of keys) {
        const v = localStorage.getItem(k);
        if (v) return v;
      }
      return null;
    };

    if (!state.userId) {
      const v = getEffectiveUserId();
      if (v) {
        setState((prev) => ({ ...prev, userId: v }));
      }
    }
  }, [state.userId, setState]);

  const handleConfirmClick = () => {
    const effectiveUserId = state.userId || (() => {
      const keys = ["user_id", "userId", "userID", "admin_id", "employee_id", "employeeId"];
      for (const k of keys) {
        const v = localStorage.getItem(k);
        if (v) return v;
      }
      return null;
    })();

    if (!state.userId && effectiveUserId) {
      // hydrate context immediately for downstream usage
      setState((prev) => ({ ...prev, userId: effectiveUserId }));
    }

    const hasSelection = Array.isArray(state.selectedRooms) && state.selectedRooms.length > 0;
    const hasFallback = Array.isArray(fallbackRoomIds) && fallbackRoomIds.length > 0;
    // Allow proceeding even if there are no selected or fallback rooms; backend supports empty room assignment
    if (!bookingId || !effectiveUserId) {
      alert("Missing data to confirm approval.");
      console.log({ bookingId, userId: effectiveUserId, selectedRoomsLen: state.selectedRooms?.length || 0, fallbackRoomIdsLen: fallbackRoomIds.length || 0 });
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmApproval = async () => {
    setIsProcessing(true);
    try {
      const effectiveUserId = state.userId || (() => {
        const keys = ["user_id", "userId", "userID", "admin_id", "employee_id", "employeeId"];
        for (const k of keys) {
          const v = localStorage.getItem(k);
          if (v) return v;
        }
        return null;
      })();

      const hasSelection = Array.isArray(state.selectedRooms) && state.selectedRooms.length > 0;
      const roomIds = hasSelection
        ? state.selectedRooms.map((r) => Number(r.id ?? r.roomnumber_id)).filter(Boolean)
        : (Array.isArray(fallbackRoomIds) ? fallbackRoomIds : []);

      const payload = {
        booking_id: bookingId,
        user_id: effectiveUserId,
        room_ids: roomIds,
        booking_totalAmount: Number(effectiveTotals.grandTotal || 0),
        booking_downpayment: Number(effectiveTotals.downpayment || 0),
      };
      console.log("approveCustomerBooking payload:", payload);

      const fd = new FormData();
      fd.append("method", "approveCustomerBooking");
      fd.append("json", JSON.stringify(payload));

      const res = await axios.post(APIConn, fd);
      console.log("approveCustomerBooking response:", res.data);
      if (res.data?.success) {
        setShowConfirmModal(false);
        setEmailStatus(res.data?.email_status ?? null);
        setShowSuccessModal(true);
      } else {
        alert(`Error: ${res.data?.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error approving booking:", err);
      alert("Something went wrong while approving.");
    } finally {
      setIsProcessing(false);
    }
  };

  const emailStatusMessage = () => {
    switch (emailStatus) {
      case 'sent':
        return `A confirmation email has been sent to the customer.`;
      case 'failed':
        return `Booking approved, but sending the confirmation email failed. Please check server logs.`;
      case 'no_email':
        return `Booking approved. No customer email address was available to send the confirmation.`;
      case 'error':
        return `Booking approved, but an error occurred while sending the email.`;
      case 'skipped':
        return `Booking approved. Email sending was skipped.`;
      default:
        return `The customer will receive a confirmation email with their booking details.`;
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="lg:ml-72 p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-foreground">
          Booking Approval
        </h1>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Customer Receipt</h2>
              <p className="text-xs text-muted-foreground">Your reservation is now confirmed!</p>
            </div>
            <div className="text-muted-foreground">
              {/* <button className="p-2 hover:text-foreground" title="Print">🖨️</button> */}
            </div>
          </div>
        
          {/* Basic info rows */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Guest</span>
              <span className="font-medium text-foreground">{state.customerName || bookingMeta?.customer_name || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Nights</span>
              <span className="font-medium text-foreground">{state.nights || (bookingMeta ? Math.max(0, Math.round((new Date(bookingMeta.booking_checkout_dateandtime) - new Date(bookingMeta.booking_checkin_dateandtime)) / (1000*60*60*24))) : 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Address</span>
              <span className="font-medium text-foreground">{bookingMeta?.customer_address || '—'}</span>
            </div>
          </div>
        
          <div className="my-4 border-t border-border" />
        
          {/* Arrive / Depart section */}
          <div className="grid grid-cols-3 items-center gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Arrive</div>
              <div className="text-lg font-semibold text-foreground">{formatUpperShort(state.checkIn || bookingMeta?.booking_checkin_dateandtime)}</div>
            </div>
            <div className="text-center text-muted-foreground">»»»</div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Depart</div>
              <div className="text-lg font-semibold text-foreground">{formatUpperShort(state.checkOut || bookingMeta?.booking_checkout_dateandtime)}</div>
            </div>
          </div>
        
          <div className="my-4 border-t border-border" />

           {/* Details sections */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
             {/* Personal Details */}
             <div className="space-y-2">
               <div className="text-xs uppercase tracking-wide text-foreground/70">Personal Details</div>
               <div className="rounded-md border border-border p-3 bg-background/40 space-y-2">
                 <div className="flex items-center justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium text-foreground">{state.customerName || bookingMeta?.customer_name || '—'}</span></div>
                 <div className="flex items-center justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium text-foreground">{bookingMeta?.customer_email || '—'}</span></div>
                 <div className="flex items-center justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium text-foreground">{bookingMeta?.customer_phone || '—'}</span></div>
                 <div className="flex items-center justify-between"><span className="text-muted-foreground">Address</span><span className="font-medium text-foreground">{bookingMeta?.customer_address || '—'}</span></div>
                 <div className="flex items-center justify-between"><span className="text-muted-foreground">Guests</span><span className="font-medium text-foreground">{guestCounts.adult} adult{guestCounts.adult === 1 ? '' : 's'}{guestCounts.children > 0 ? `, ${guestCounts.children} child${guestCounts.children === 1 ? '' : 'ren'}` : ''}</span></div>
                 <div className="flex items-center justify-between"><span className="text-muted-foreground">Rooms</span><span className="font-medium text-foreground">{bookingMeta?.room_numbers || '-'}</span></div>
               </div>
             </div>

             {/* Payment Details */}
             <div className="space-y-2">
               <div className="text-xs uppercase tracking-wide text-foreground/70">Payment Details</div>
               <div className="rounded-md border border-border p-3 bg-background/40 space-y-2">
                 <div className="flex items-center justify-between"><span className="text-muted-foreground">Reference</span><span className="font-medium text-foreground">{bookingMeta?.reference_no || '-'}</span></div>
                 <div className="flex items-center justify-between"><span className="text-muted-foreground">Created at</span><span className="font-medium text-foreground">{DateFormatter.formatDate(bookingMeta?.booking_created_at)}</span></div>
                 <div className="flex items-center justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium text-foreground">{currency(effectiveTotals.subtotal)}</span></div>
                 <div className="flex items-center justify-between"><span className="text-muted-foreground">VAT (12%)</span><span className="font-medium text-foreground">{currency(effectiveTotals.vat)}</span></div>
                 <div className="flex items-center justify-between"><span className="text-muted-foreground">Downpayment (50%)</span><span className="font-medium text-blue-600 dark:text-blue-400">{currency(effectiveTotals.downpayment)}</span></div>
                 <div className="flex items-center justify-between"><span className="text-muted-foreground">Balance (50%)</span><span className="font-medium text-green-600 dark:text-green-400">{currency(effectiveTotals.balance)}</span></div>
               </div>
               <div className="text-xs italic text-muted-foreground">{effectiveTotals.source === 'selection' ? 'Totals are based on selected rooms.' : 'Totals reflect booking record amounts (no room selection).'}</div>
             </div>
           </div>
        
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-base font-medium text-foreground">Total</span>
            <span className="text-2xl font-semibold text-green-600 dark:text-green-400">{currency(effectiveTotals.grandTotal)}</span>
          </div>
        
          {/* Submitted Image still inside card */}
          {bookingMeta?.booking_fileName ? (
            <div className="mt-6">
              <img
                src={`${localStorage.url}images/${bookingMeta.booking_fileName}`}
                alt="Submitted by customer"
                className="w-full max-h-56 object-cover rounded border border-border"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded border border-border bg-card hover:bg-muted text-foreground transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleConfirmClick}
            className="px-6 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Confirm Approval"}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmApproval}
        title="Finalize Booking Approval"
        message={`Are you sure you want to approve this booking? This action will finalize the booking for ${state.customerName || 'the customer'} and write the data to the database. This action cannot be undone.`}
        confirmText="Approve Booking"
        cancelText="Cancel"
        type="warning"
        isLoading={isProcessing}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/admin/online");
        }}
        title="Booking Approved Successfully!"
        message={`The booking for ${state.customerName || 'the customer'} has been approved and finalized. ${emailStatusMessage()}`}
        buttonText="Return to Bookings"
      />
    </>
  );
}
