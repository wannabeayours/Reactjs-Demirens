// src/admin/OnlineReqList.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import { useApproval } from "./ApprovalContext";

export default function OnlineReqList() {
  const APIConn = `${localStorage.url}admin.php`;
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { setState } = useApproval();

  const filteredBookings = useMemo(() => {
    if (!searchTerm) return bookings;
    const term = searchTerm.toLowerCase().trim();
    const toStr = (v) => String(v ?? "").toLowerCase();

    return bookings.filter((b) => {
      const customerMatch = toStr(b.customer_name).includes(term);
      const bookingIdMatch = toStr(b.booking_id).includes(term);
      const paymentMethod =
        b.payment_method || b.payment_method_name || b.method || b.payment?.method || "";
      const paymentMatch = toStr(paymentMethod).includes(term);
      const referenceVal =
        b.reference_no || b.referenceNumber || b.payment?.referenceNumber || "";
      const referenceMatch = toStr(referenceVal).includes(term);

      const checkInStr = b.booking_checkin_dateandtime
        ? new Date(b.booking_checkin_dateandtime).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })
        : "";
      const checkOutStr = b.booking_checkout_dateandtime
        ? new Date(b.booking_checkout_dateandtime).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })
        : "";
      const dateMatch = toStr(checkInStr).includes(term) || toStr(checkOutStr).includes(term);

      const roomsMatch = (b.rooms || []).some((r) =>
        [r.roomnumber_id, r.roomtype_name, r.status_name].map(toStr).some((v) => v.includes(term))
      );

      return customerMatch || bookingIdMatch || paymentMatch || referenceMatch || dateMatch || roomsMatch;
    });
  }, [bookings, searchTerm]);

  const fetchBookings = async () => {
    try {
      const formData = new FormData();
      formData.append("method", "reqBookingList");
      const res = await axios.post(APIConn, formData);
      if (res.data) setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const declineBooking = async (bookingId, roomIds) => {
    if (!window.confirm("Decline this booking?")) return;
    try {
      const formData = new FormData();
      formData.append("method", "declineCustomerBooking");
      formData.append(
        "json",
        JSON.stringify({
          booking_id: bookingId,
          admin_id: localStorage.getItem("admin_id") || 1,
          room_ids: roomIds,
        })
      );
      const response = await axios.post(APIConn, formData);
      if (response.data.success) {
        alert("Booking declined successfully!");
        fetchBookings();
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error declining booking:", error);
    }
  };

  const totalRequests = bookings.length;
  const pendingRequests = bookings.filter(
    (b) => b.rooms && b.rooms.some((r) => r.status_name?.toLowerCase() === "pending")
  ).length;
  const approvedRequests = bookings.filter(
    (b) => b.rooms && b.rooms.every((r) => r.status_name?.toLowerCase() === "approved")
  ).length;
  const totalRevenue = bookings.reduce(
    (sum, b) => sum + Number(b.booking_downpayment || 0),
    0
  );

  // → Step 1 entry point
  const goToSelectRooms = (booking) => {
    const checkInISO = booking.booking_checkin_dateandtime
      ? new Date(booking.booking_checkin_dateandtime).toISOString().slice(0, 10)
      : "";
    const checkOutISO = booking.booking_checkout_dateandtime
      ? new Date(booking.booking_checkout_dateandtime).toISOString().slice(0, 10)
      : "";

    const checkIn = new Date(checkInISO);
    const checkOut = new Date(checkOutISO);
    const nights = Math.max(
      0,
      Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    );

    const requestedTypes = Array.from(
      new Map(
        (booking.rooms || []).map((r) => [r.roomtype_name, { name: r.roomtype_name, id: r.roomtype_id }])
      ).values()
    );

    setState((prev) => ({
      ...prev,
      bookingId: booking.booking_id,
      adminId: localStorage.getItem("admin_id") || 1,
      customerName: booking.customer_name,
      checkIn: checkInISO,
      checkOut: checkOutISO,
      nights,
      requestedRoomTypes: requestedTypes,
      requestedRoomCount: (booking.rooms || []).length,
      selectedRooms: [],
      totals: { subtotal: 0, vat: 0, grandTotal: 0 },
    }));

    navigate(`/admin/approve/${booking.booking_id}`);
  };

  return (
    <>
      <div><AdminHeader /></div>

      <div className="p-6">
        <h1 className="text-xl font-bold mb-6 text-foreground">Online Booking Requests</h1>

        <div className="mb-6 flex w-full md:justify-end">
          <div className="w-full md:w-1/3">
            <Input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Total Requests</p>
            <p className="text-2xl font-bold">{totalRequests}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Pending Requests</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingRequests}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Approved Requests</p>
            <p className="text-2xl font-bold text-green-600">{approvedRequests}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">
              ₱{totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="hidden md:block">
          <ScrollArea className="h-[480px] w-full rounded-lg border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted text-muted-foreground">
                    <th className="border border-border p-2 sticky top-0 z-10 bg-card">Reference No.</th>
                    <th className="border border-border p-2 sticky top-0 z-10 bg-card">Customer Name</th>
                    <th className="border border-border p-2 sticky top-0 z-10 bg-card">Rooms Requested</th>
                    <th className="border border-border p-2 sticky top-0 z-10 bg-card">Stay Dates</th>
                    <th className="border border-border p-2 sticky top-0 z-10 bg-card">Downpayment</th>
                    <th className="border border-border p-2 sticky top-0 z-10 bg-card">Payment Method</th>
                    <th className="border border-border p-2 sticky top-0 z-10 bg-card">Status</th>
                    <th className="border border-border p-2 sticky top-0 z-10 bg-card">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <tr key={booking.booking_id} className="hover:bg-muted transition-colors">
                        <td className="border border-border p-2">
                          {booking.reference_no ||
                            booking.referenceNumber ||
                            booking.payment?.referenceNumber ||
                            "-"}
                        </td> 
                        <td className="border border-border p-2">{booking.customer_name}</td>
                        <td className="border border-border p-2">
                          {booking.rooms?.length
                            ? booking.rooms.map((r, index) => (
                              <div key={`${booking.booking_id}-${r.roomtype_id}-${index}`}>
                                {r.roomtype_name}
                              </div>
                            ))
                            : "-"}

                        </td>
                        <td className="border border-border p-2">
                          {new Date(booking.booking_checkin_dateandtime).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                          {" → "}
                          {new Date(booking.booking_checkout_dateandtime).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </td>
                        <td className="border border-border p-2">
                          ₱{Number(booking.booking_downpayment || 0).toLocaleString()}
                        </td>
                        <td className="border border-border p-2">
                          {booking.payment_method ||
                            booking.payment_method_name ||
                            booking.method ||
                            booking.payment?.method ||
                            "-"}
                        </td>

                        <td className="border border-border p-2">
                          {booking.rooms?.length
                            ? booking.rooms.map((r, index) => {
                              const s = (r.status_name || "").toLowerCase();
                              const cls =
                                s === "approved"
                                  ? "bg-green-200 text-green-800"
                                  : s === "rejected"
                                    ? "bg-red-200 text-red-800"
                                    : "bg-yellow-200 text-yellow-800";
                              return (
                                <div
                                  key={`${booking.booking_id}-${r.roomtype_id}-${index}-status`}
                                  className={`${cls} px-2 py-1 rounded inline-block mr-1 mb-1`}
                                >
                                  {r.status_name}
                                </div>
                              );
                            })
                            : "-"}
                        </td>
                        <td className="border border-border p-2 text-center space-x-2">
                          <button
                            onClick={() => goToSelectRooms(booking)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-xl shadow"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              declineBooking(
                                booking.booking_id,
                                booking.rooms ? booking.rooms.map((r) => r.roomnumber_id) : []
                              )
                            }
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-xl shadow"
                          >
                            Decline
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center p-4 text-muted-foreground">
                        No booking requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}