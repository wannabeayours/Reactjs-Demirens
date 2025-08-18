import { Card } from '@/components/ui/card';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import ShowAlert from '@/components/ui/show-alert';
import { Badge } from '@/components/ui/badge';
import { Book, SmileIcon, Trash2, X } from 'lucide-react';

function CustomerViewBookings() {
  const [viewBook, setViewBook] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedRoomData, setSelectedRoomData] = useState(null); // For remove room

  const customerViewBookings = async () => {
    try {
      const url = localStorage.getItem('url') + 'customer.php';
      const bookingCustomerId = localStorage.getItem('userId');
      const jsonData = { booking_customer_id: bookingCustomerId };
      const formData = new FormData();
      formData.append('operation', 'customerViewBookings');
      formData.append('json', JSON.stringify(jsonData));

      const res = await axios.post(url, formData);
      console.log("Bookings response:", res.data);

      if (res.data.length === 0) {
        setErrorMessage('No booking details, book first!');
        setViewBook([]);
      } else {
        setErrorMessage('');
        setViewBook(res.data);
      }
    } catch (error) {
      setErrorMessage('Something went wrong');
      console.error(error);
    }
  };

  const customerCancelBooking = async (bookingId) => {
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const jsonData = { booking_id: bookingId };
      const formData = new FormData();
      formData.append("json", JSON.stringify(jsonData));
      formData.append("operation", "customerCancelBooking");
      const res = await axios.post(url, formData);
      if (res.data === 1) {
        customerViewBookings();
        toast.success('Booking cancelled!');
      } else {
        toast.error('Failed to cancel booking.');
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  };

  const removeBookingRoom = async (bookingId, roomId) => {
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const jsonData = { bookingId: bookingId, bookingRoomId: roomId };
      const formData = new FormData();
      formData.append("json", JSON.stringify(jsonData));
      formData.append("operation", "removeBookingRoom");
      const res = await axios.post(url, formData);
      if (res.data === 1) {
        customerViewBookings();
        toast.success('Room removed!');
      } else {
        toast.error('Failed to remove room.');
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  }


  const handleShowAlert = (bookingId) => {
    setAlertMessage("Are you sure you want to cancel your booking?");
    setSelectedBookingId(bookingId);
    setSelectedRoomData(null); // Not removing a room in this case
    setShowAlert(true);
  };

  const handleShowRemoveRoomAlert = (bookingId, roomId, roomsCount) => {
    if (roomsCount.roomsList.length === 1) {
      toast.error("You cannot remove the last room from this booking.");
      return;
    }
    setAlertMessage("Are you sure you want to remove this room?");
    setSelectedBookingId(bookingId);
    setSelectedRoomData({ roomId });
    setShowAlert(true);
  };


  const handleCloseAlert = (status) => {
    if (status === 1) {
      if (selectedRoomData) {
        // Removing a room
        removeBookingRoom(selectedBookingId, selectedRoomData.roomId);
      } else {
        // Cancelling booking
        customerCancelBooking(selectedBookingId);
      }
    }
    setShowAlert(false);
  };

  useEffect(() => {
    customerViewBookings();
  }, []);

  return (
    <div className="flex  flex-col ">

      <div className="">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <Book className="w-6 h-6" />
          View Bookings
        </h1>
      </div>
      <div className={`grid grid-cols-1 ${viewBook.length === 1 ? "md:grid-cols-1 xl:w-1/2" : "md:grid-cols-1"} gap-3`}>
        {errorMessage ? (
          <div className="col-span-full flex flex-row items-center justify-center text-center h-96 gap-2">
            <SmileIcon className="w-10 h-10" />
            <strong>{errorMessage}</strong>
          </div>
        ) : viewBook.length === 0 ? (
          <div className="col-span-full text-center text-black">
            No booking details available
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 ${viewBook.length === 1
              ? "md:grid-cols-1"
              : "md:grid-cols-2"
              } gap-3 items-stretch`}
          >
            {viewBook.map((item, index) => (
              <Card
                key={index}
                className="px-10 mt-10 shadow-xl flex flex-col h-full"
              >
                {/* Card Header */}
                <div className="flex justify-between items-center w-full text-black mb-4">
                  <h2 className="text-2xl font-bold text-[#113F67]">
                    Booking #{item.booking_id}
                  </h2>
                  <Badge className="text-md font-semibold text-white bg-orange-500">
                    Pending
                  </Badge>
                </div>

                {/* Booking Info */}
                <div className="mb-2 flex justify-between text-black">
                  <span className="font-semibold">Check-in:</span>
                  <span>{item.booking_checkin_dateandtime}</span>
                </div>
                <div className="mb-4 flex justify-between text-black">
                  <span className="font-semibold">Check-out:</span>
                  <span>{item.booking_checkout_dateandtime}</span>
                </div>
                <div className="mb-4 flex justify-between text-black">
                  <span className="font-semibold">Down Payment:</span>
                  <span>₱ {item.booking_downpayment}</span>
                </div>
                <div className="mb-4 flex justify-between text-black">
                  <span className="font-semibold">Total Payment:</span>
                  <span>₱ {item.booking_totalAmount}</span>
                </div>

                {/* Rooms List */}
                <div className="mt-6 flex-1">
                  <h3 className="text-lg font-semibold mb-2 text-[#113F67]">
                    Rooms:
                  </h3>
                  <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                    {item.roomsList.map((room, roomIndex) => (
                      <div
                        key={roomIndex}
                        className="border rounded-lg p-4 bg-gray-50 shadow-sm relative"
                      >
                        {/* Delete button */}
                        <button
                          onClick={() =>
                            handleShowRemoveRoomAlert(
                              item.booking_id,
                              room.booking_room_id,
                              item
                            )
                          }
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>

                        <h4 className="text-xl font-semibold text-gray-800">
                          {room.roomtype_name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {room.roomtype_description}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm text-black">
                          <span><strong>Room Number:</strong> {room.roomnumber_id}</span>
                          <span><strong>Floor:</strong> {room.roomfloor}</span>
                          <span><strong>Size:</strong> {room.room_sizes}</span>
                          <span><strong>Beds:</strong> {room.room_beds}</span>
                          <span><strong>Capacity:</strong> {room.max_capacity}</span>
                          <span><strong>Price:</strong> ₱ {room.roomtype_price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cancel Button */}
                <div className="mt-6">
                  <Button
                    className="w-full"
                    onClick={() => handleShowAlert(item.booking_id)}
                  >
                    Cancel Booking
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <ShowAlert open={showAlert} onHide={handleCloseAlert} message={alertMessage} duration={1} />
      </div>
    </div>


  );
}


export default CustomerViewBookings;
