// src/admin/approval/ApprovalReceipt.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AdminHeader from "../components/AdminHeader";
import { useApproval } from "./ApprovalContext";

const currency = (n) => `₱${Number(n || 0).toLocaleString()}`;

export default function ApprovalReceipt() {
  const APIConn = `${localStorage.url}admin.php`;
  const navigate = useNavigate();
  const { bookingId: bookingIdParam } = useParams();
  const { state, setState } = useApproval();

  const bookingId = state.bookingId || Number(bookingIdParam);
  const nights = state.nights || 0;

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

  // store totals (so you can access them later if needed)
  useState(() => {
    setState((prev) => ({
      ...prev,
      totals: { subtotal, vat, grandTotal },
    }));
  }, [subtotal, vat, grandTotal, setState]);

  const confirmApproval = async () => {
    if (!bookingId || !state.adminId || !state.selectedRooms?.length) {
      alert("Missing data to confirm approval.");
      console.log(bookingId);
      console.log(state.adminId);
      console.log(state.selectedRooms?.length);
      return;
    }

    if (!window.confirm("Finalize approval and write to database?")) return;

    try {
      const fd = new FormData();
      fd.append("method", "approveCustomerBooking");
      fd.append(
        "json",
        JSON.stringify({
          booking_id: bookingId,
          admin_id: state.adminId,
          room_ids: state.selectedRooms.map((r) => r.id),
        })
      );

      console.log("Booking Id: ", bookingId);
      console.log("Admin Id: ", state.adminId);
      console.log("Rooms: ", state.selectedRooms.map((r) => r.id));

      const res = await axios.post(APIConn, fd);
      if (res.data?.success) {
        alert("Booking approved successfully!");
        navigate("/admin/online");
      } else {
        alert(`Error: ${res.data?.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error approving booking:", err);
      alert("Something went wrong while approving.");
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="p-6 max-w-4xl mx-auto">
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
                <th className="p-3 text-left">Room</th>
                <th className="p-3 text-right">Nightly Price</th>
                <th className="p-3 text-right">Nights</th>
                <th className="p-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((li, idx) => (
                <tr key={`${li.id}-${idx}`} className="border-t border-border">
                  <td className="p-3">
                    {li.roomtype_name} — Room #{li.id}
                  </td>
                  <td className="p-3 text-right">{currency(li.price)}</td>
                  <td className="p-3 text-right">{li.nights}</td>
                  <td className="p-3 text-right">{currency(li.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-border">
              <tr>
                <td colSpan={3} className="p-3 text-right font-medium">
                  Subtotal
                </td>
                <td className="p-3 text-right">{currency(subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="p-3 text-right font-medium">
                  VAT (12%)
                </td>
                <td className="p-3 text-right">{currency(vat)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="p-3 text-right font-bold">
                  Grand Total
                </td>
                <td className="p-3 text-right font-bold">{currency(grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded border border-border bg-card hover:bg-muted"
          >
            Back
          </button>
          <button
            onClick={confirmApproval}
            className="px-6 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Confirm Approval
          </button>
        </div>
      </div>
    </>
  );
}
