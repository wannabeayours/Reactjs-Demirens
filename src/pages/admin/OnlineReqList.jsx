import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from "./components/AdminHeader";

export default function OnlineReqList() {
  const APIConn = `${localStorage.url}admin.php`;
  const [bookings, setBookings] = useState([]);
  const adminId = localStorage.getItem("admin_id");

  const fetchBookings = async () => {
    try {
      const formData = new FormData();
      formData.append("method", "reqBookingList");

      const response = await axios.post(APIConn, formData);
      if (response.data) {
        console.log(response.data)
        setBookings(response.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const approveBooking = async (bookingId, roomIds) => {
    if (!window.confirm("Approve this booking?")) return;

    try {
      const formData = new FormData();
      formData.append("method", "approveCustomerBooking");
      formData.append(
        "json",
        JSON.stringify({
          booking_id: bookingId,
          admin_id: adminId,
          room_ids: roomIds,
        })
      );

      console.log(formData);
      const response = await axios.post(APIConn, formData);
      console.log("Approve booking response:", response?.data ?? response);

      if (response.data.success) {
        alert("Booking approved successfully!");
        fetchBookings();
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error approving booking:", error);
    }
  };

  const declineBooking = async (bookingId, roomIds) => {
    if (!window.confirm("Decline this booking?")) return;

    try {
      const formData = new FormData();
      formData.append("method", "declineCustomerBooking");
      formData.append(
        "json",
        JSON.stringify({
          booking_id: bookingId,
          admin_id: adminId,
          room_ids: roomIds,
        })
      );

      console.log(formData)
      const response = await axios.post(APIConn, formData);
      console.log("Decline booking response:", response?.data ?? response);

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

  // Calculate statistics for the cards
  const totalRequests = bookings.length;
  const pendingRequests = bookings.filter(booking => 
    booking.rooms && booking.rooms.some(room => 
      room.status_name?.toLowerCase() === 'pending'
    )
  ).length;
  const approvedRequests = bookings.filter(booking => 
    booking.rooms && booking.rooms.every(room => 
      room.status_name?.toLowerCase() === 'approved'
    )
  ).length;
  const totalRevenue = bookings.reduce((total, booking) => {
    return total + Number(booking.booking_downpayment || 0);
  }, 0);

  return (
    <>
      <div>
        <AdminHeader />
      </div>

      <div className="p-6">
        <h1 className="text-xl font-bold mb-6 text-foreground">
          Online Booking Requests
        </h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Requests Card */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold text-foreground">{totalRequests}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pending Requests Card */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingRequests}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Approved Requests Card */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved Requests</p>
                <p className="text-2xl font-bold text-green-600">{approvedRequests}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">₱{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop / Tablet Table */}
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm hidden md:block">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted text-muted-foreground">
                <th className="border border-border p-2">Booking ID</th>
                <th className="border border-border p-2">Customer Name</th>
                <th className="border border-border p-2">Rooms</th>
                <th className="border border-border p-2">Stay Dates</th>
                <th className="border border-border p-2">Downpayment</th>
                <th className="border border-border p-2">Payment Method</th>
                <th className="border border-border p-2">Reference No.</th>
                <th className="border border-border p-2">Status</th>
                <th className="border border-border p-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr key={booking.booking_id} className="hover:bg-muted transition-colors">
                    {/* Booking ID */}
                    <td className="border border-border p-2">{booking.booking_id}</td>

                    {/* Customer Name */}
                    <td className="border border-border p-2">{booking.customer_name}</td>

                    {/* Rooms */}
                    <td className="border border-border p-2">
                      {booking.rooms && booking.rooms.length > 0
                        ? booking.rooms.map((room) => (
                          <div key={room.roomnumber_id}>
                            {room.roomnumber_id} ({room.roomtype_name})
                          </div>
                        ))
                        : "-"}
                    </td>

                    {/* Stay Dates */}
                    <td className="border border-border p-2">
                      {new Date(booking.booking_checkin_dateandtime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(booking.booking_checkout_dateandtime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Downpayment */}
                    <td className="border border-border p-2">
                      ₱{Number(booking.booking_downpayment || 0).toLocaleString()}
                    </td>

                    {/* Payment Method */}
                    <td className="border border-border p-2">
                      {booking.payment_method ||
                        booking.payment_method_name ||
                        booking.method ||
                        booking.payment?.method ||
                        "-"}
                    </td>

                    {/* Reference Number */}
                    <td className="border border-border p-2">
                      {booking.reference_no ||
                        booking.referenceNumber ||
                        booking.payment?.referenceNumber ||
                        "-"}
                    </td>

                    {/* Status */}
                    <td className="border border-border p-2">
                      {booking.rooms && booking.rooms.length > 0
                        ? booking.rooms.map((room) => {
                          let statusClass = "";
                          switch (room.status_name.toLowerCase()) {
                            case "pending":
                              statusClass = "bg-yellow-200 text-yellow-800 px-2 py-1 rounded inline-block";
                              break;
                            case "approved":
                              statusClass = "bg-green-200 text-green-800 px-2 py-1 rounded inline-block";
                              break;
                            case "rejected":
                              statusClass = "bg-red-200 text-red-800 px-2 py-1 rounded inline-block";
                              break;
                            default:
                              statusClass = "bg-gray-200 text-gray-800 px-2 py-1 rounded inline-block";
                          }
                          return (
                            <div key={room.roomnumber_id} className={statusClass}>
                              {room.status_name}
                            </div>
                          );
                        })
                        : "-"}
                    </td>

                    {/* Action */}
                    <td className="border border-border p-2 text-center">
                      <button
                        onClick={() =>
                          approveBooking(
                            booking.booking_id,
                            booking.rooms ? booking.rooms.map((r) => r.roomnumber_id) : []
                          )
                        }
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded shadow-sm mr-2"
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
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm"
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

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div key={booking.booking_id} className="bg-card border border-border rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Booking ID</div>
                    <div className="text-base font-semibold text-foreground">{booking.booking_id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Customer</div>
                    <div className="text-sm font-medium text-foreground">{booking.customer_name}</div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Rooms</div>
                    <div className="text-sm text-foreground">
                      {booking.rooms && booking.rooms.length > 0
                        ? booking.rooms.map((room) => (
                            <div key={room.roomnumber_id}>
                              {room.roomnumber_id} ({room.roomtype_name})
                            </div>
                          ))
                        : "-"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Stay Dates</div>
                    <div className="text-sm text-foreground">
                      {new Date(booking.booking_checkin_dateandtime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {" - "}
                      {new Date(booking.booking_checkout_dateandtime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Downpayment</div>
                      <div className="text-sm font-medium text-foreground">₱{Number(booking.booking_downpayment || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Payment Method</div>
                      <div className="text-sm text-foreground">
                        {booking.payment_method ||
                          booking.payment_method_name ||
                          booking.method ||
                          booking.payment?.method ||
                          "-"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Reference No.</div>
                    <div className="text-sm text-foreground">
                      {booking.reference_no ||
                        booking.referenceNumber ||
                        booking.payment?.referenceNumber ||
                        "-"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {booking.rooms && booking.rooms.length > 0
                        ? booking.rooms.map((room) => {
                            let statusClass = "";
                            switch (room.status_name.toLowerCase()) {
                              case "pending":
                                statusClass = "bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded text-xs";
                                break;
                              case "approved":
                                statusClass = "bg-green-200 text-green-800 px-2 py-0.5 rounded text-xs";
                                break;
                              case "rejected":
                                statusClass = "bg-red-200 text-red-800 px-2 py-0.5 rounded text-xs";
                                break;
                              default:
                                statusClass = "bg-gray-200 text-gray-800 px-2 py-0.5 rounded text-xs";
                            }
                            return (
                              <span key={room.roomnumber_id} className={statusClass}>
                                {room.status_name}
                              </span>
                            );
                          })
                        : "-"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() =>
                      approveBooking(
                        booking.booking_id,
                        booking.rooms ? booking.rooms.map((r) => r.roomnumber_id) : []
                      )
                    }
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded shadow-sm"
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
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded shadow-sm"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-4 text-muted-foreground border border-border bg-card rounded-lg">
              No booking requests found.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
