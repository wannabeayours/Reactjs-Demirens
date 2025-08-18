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
      formData.append("method", "approveOnlineCust");
      formData.append(
        "json",
        JSON.stringify({
          booking_id: bookingId,
          admin_id: adminId,
          room_ids: roomIds,
        })
      );

      const response = await axios.post(APIConn, formData);

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

  return (
    <>
      <div>
        <AdminHeader />
      </div>

      <div className="p-6">
        <h1 className="text-xl font-bold mb-4 text-foreground">
          Online Booking Requests
        </h1>

        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted text-muted-foreground">
                <th className="border border-border p-2">Booking ID</th>
                <th className="border border-border p-2">Customer Name</th>
                <th className="border border-border p-2">Rooms</th>
                <th className="border border-border p-2">Stay Dates</th>
                <th className="border border-border p-2">Downpayment</th>
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
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded shadow-sm"
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-4 text-muted-foreground">
                    No booking requests found.
                  </td>
                </tr>
              )}
            </tbody>


          </table>
        </div>
      </div>
    </>
  );
}
