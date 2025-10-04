// src/admin/OnlineReqList.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import { useApproval } from "./ApprovalContext";
import { DateFormatter } from '../Function_Files/DateFormatter';
import { NumberFormatter } from '../Function_Files/NumberFormatter';

export default function OnlineReqList() {
  const APIConn = `${localStorage.url}admin.php`;
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { setState } = useApproval();

  useEffect(() => {
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
    fetchBookings();
  }, [APIConn]);

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
        // Refresh bookings after decline
        const formData = new FormData();
        formData.append("method", "reqBookingList");
        const res = await axios.post(APIConn, formData);
        if (res.data) setBookings(res.data);
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error declining booking:", error);
    }
  };

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
      <AdminHeader />
      <div className="lg:ml-72 p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Online Booking Requests</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and process customer booking requests</p>
          </div>
          
          <div className="p-6">
            <div className="mb-6 flex w-full md:justify-between items-center">
              <div className="w-full md:w-1/3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                  </div>
                  <Input
                    type="search"
                    placeholder="Search bookings..."
                    className="pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <ScrollArea className="h-[480px] w-full">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700 text-left">
                        <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Reference No.</th>
                        <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Customer Name</th>
                        <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Customer Type</th>
                        <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Room Types</th>
                        <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Stay Dates</th>
                        <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Downpayment</th>
                        <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking) => (
                          <tr key={booking.booking_id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <td className="px-4 py-3 text-gray-900 dark:text-white">
                              {booking.reference_no || "-"}
                            </td>
                            <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                              {booking.customer_name}
                            </td>
                            <td className="px-4 py-3 text-gray-900 dark:text-white">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                Online
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-900 dark:text-white">
                              {booking.rooms?.length
                                ? booking.rooms.map((r, index) => (
                                    <div key={`${booking.booking_id}-${r.roomtype_id}-${index}`} className="mb-1 last:mb-0">
                                      {r.roomtype_name}
                                    </div>
                                  ))
                                : "-"}
                            </td>
                            <td className="px-4 py-3 text-gray-900 dark:text-white">
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {DateFormatter.formatDateOnly(booking.booking_checkin_dateandtime)}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                                  to {DateFormatter.formatDateOnly(booking.booking_checkout_dateandtime)}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                              {NumberFormatter.formatCurrency(booking.booking_downpayment || 0)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => goToSelectRooms(booking)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors"
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
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors"
                                >
                                  Decline
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            <div className="flex flex-col items-center">
                              <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              <p className="text-lg font-medium">No booking requests found</p>
                              <p className="text-sm mt-1">There are currently no online booking requests to display</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}