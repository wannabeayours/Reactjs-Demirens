// src/admin/approval/ApprovalReceipt.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AdminHeader from "../components/AdminHeader";
import { useApproval } from "./ApprovalContext";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import SuccessModal from "../../../components/ui/SuccessModal";
import { NumberFormatter } from '../Function_Files/NumberFormatter';

const currency = (n) => NumberFormatter.formatCurrency(n);

export default function ApprovalReceipt() {
  const APIConn = `${localStorage.url}admin.php`;
  const navigate = useNavigate();
  const { bookingId: bookingIdParam } = useParams();
  const { state, setState } = useApproval();

  const bookingId = state.bookingId || Number(bookingIdParam);
  const nights = state.nights || 0;

  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  // store totals (so you can access them later if needed)
  useState(() => {
    setState((prev) => ({
      ...prev,
      totals: { subtotal, vat, grandTotal, downpayment },
    }));
  }, [subtotal, vat, grandTotal, downpayment, setState]);

  const handleConfirmClick = () => {
    if (!bookingId || !state.adminId || !state.selectedRooms?.length) {
      alert("Missing data to confirm approval.");
      console.log(bookingId);
      console.log(state.adminId);
      console.log(state.selectedRooms?.length);
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmApproval = async () => {
    setIsProcessing(true);
    try {
      const fd = new FormData();
      fd.append("method", "approveCustomerBooking");
      fd.append(
        "json",
        JSON.stringify({
          booking_id: bookingId,
          admin_id: state.adminId,
          room_ids: state.selectedRooms.map((r) => r.id),
          booking_totalAmount: grandTotal,
          booking_downpayment: downpayment,
        })
      );

      console.log("Booking Id: ", bookingId);
      console.log("Admin Id: ", state.adminId);
      console.log("Rooms: ", state.selectedRooms.map((r) => r.id));
      console.log("Total Amount: ", grandTotal);
      console.log("Downpayment: ", downpayment);

      const res = await axios.post(APIConn, fd);
      if (res.data?.success) {
        setShowConfirmModal(false);
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

  return (
    <>
      <AdminHeader />
      <div className="lg:ml-72 p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-foreground">
          Approve Booking #{bookingId} — Step 2: Receipt
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Customer: <span className="font-medium">{state.customerName || "-"}</span> • Dates:{" "}
          <span className="font-medium">{state.checkIn}</span> →{" "}
          <span className="font-medium">{state.checkOut}</span> • Nights:{" "}
          <span className="font-medium">{nights}</span>
        </p>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left text-foreground">Room</th>
                <th className="p-3 text-right text-foreground">Nightly Price</th>
                <th className="p-3 text-right text-foreground">Nights</th>
                <th className="p-3 text-right text-foreground">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((li, idx) => (
                <tr key={`${li.id}-${idx}`} className="border-t border-border">
                  <td className="p-3 text-foreground">
                    {li.roomtype_name} — Room #{li.id}
                  </td>
                  <td className="p-3 text-right text-foreground">{currency(li.price)}</td>
                  <td className="p-3 text-right text-foreground">{li.nights}</td>
                  <td className="p-3 text-right text-foreground">{currency(li.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-border">
              <tr>
                <td colSpan={3} className="p-3 text-right font-medium text-foreground">
                  Subtotal
                </td>
                <td className="p-3 text-right text-foreground">{currency(subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="p-3 text-right font-medium text-foreground">
                  VAT (12%)
                </td>
                <td className="p-3 text-right text-foreground">{currency(vat)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="p-3 text-right font-bold text-foreground">
                  Grand Total
                </td>
                <td className="p-3 text-right font-bold text-foreground">{currency(grandTotal)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="p-3 text-right font-medium text-foreground">
                  Downpayment (50%)
                </td>
                <td className="p-3 text-right font-medium text-blue-600 dark:text-blue-400">{currency(downpayment)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="p-3 text-right font-medium text-foreground">
                  Balance (50%)
                </td>
                <td className="p-3 text-right font-medium text-green-600 dark:text-green-400">{currency(grandTotal - downpayment)}</td>
              </tr>
            </tfoot>
          </table>
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
        message={`The booking for ${state.customerName || 'the customer'} has been approved and finalized. The customer will receive a confirmation email with their booking details.`}
        buttonText="Return to Bookings"
      />
    </>
  );
}
