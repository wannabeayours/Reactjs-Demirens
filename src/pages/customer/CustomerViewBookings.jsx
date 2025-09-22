import { Card } from '@/components/ui/card';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import ShowAlert from '@/components/ui/show-alert';
import { Badge } from '@/components/ui/badge';
import { Book, BookA, BookOpenCheckIcon, SmileIcon, Trash2, X } from 'lucide-react';

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
    <div className="flex flex-col w-full max-w-[1200px] mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between py-4 mb-2 border-b border-gray-200">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-2 text-[#113f67]">
          <Book className="w-5 h-5 sm:w-6 sm:h-6" />
          View Bookings
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-sm sm:text-base text-gray-500 hidden sm:block">
            View your booking here
          </div>
        </div>
      </div>
      {/* <div className="w-full grid grid-cols-1 gap-2 md:gap-3 mt-10">
        {errorMessage ? (
          <div className="col-span-full flex flex-row items-center justify-center text-center h-64 sm:h-96 gap-2 p-4">
            <SmileIcon className="w-8 h-8 sm:w-10 sm:h-10" />
            <strong className="text-sm sm:text-base">{errorMessage}</strong>
          </div>
        ) : viewBook.length === 0 ? (
          <div className="col-span-full text-center text-black p-4 h-32 flex items-center justify-center">
            <span className="text-sm sm:text-base">No booking details available</span>
          </div> */}
      <Card className={"px-4 sm:px-6 md:px-10 mt-8 sm:mt-12 md:mt-16 w-full bg-white rounded-lg border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300"}>
        <div className="overflow-x-auto py-4">
          <div className="mb-4 text-lg font-medium text-[#113f67]">View your bookings here</div>
          {viewBook.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <BookOpenCheckIcon className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm sm:text-base">No bookings found</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">Bookings will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 items-stretch w-full">
              {viewBook.map((item, index) => (
                <Card
                  key={index}
                  className="px-2 sm:px-3 md:px-4 py-2 shadow-md flex flex-col">
                  {/* Card Header */}
                  <div className="flex flex-wrap justify-between items-center w-full text-black mb-1">
                    <h2 className="text-lg sm:text-xl font-bold text-[#113F67] break-words">
                      Booking #{item.booking_id}
                    </h2>
                    <Badge className="text-xs sm:text-sm font-semibold text-white bg-orange-500 mt-1 sm:mt-0">
                      Pending
                    </Badge>
                  </div>

                  {/* Booking Info */}
                  <div className="mb-1 flex flex-wrap justify-between text-black">
                    <span className="font-semibold min-w-[80px] text-xs sm:text-sm">Check-in:</span>
                    <span className="text-right break-words text-xs sm:text-sm">{item.booking_checkin_dateandtime}</span>
                  </div>
                  <div className="mb-1 flex flex-wrap justify-between text-black">
                    <span className="font-semibold min-w-[80px] text-xs sm:text-sm">Check-out:</span>
                    <span className="text-right break-words text-xs sm:text-sm">{item.booking_checkout_dateandtime}</span>
                  </div>
                  <div className="mb-1 flex flex-wrap justify-between text-black">
                    <span className="font-semibold min-w-[80px] text-xs sm:text-sm">Down Payment:</span>
                    <span className="text-right text-xs sm:text-sm">₱ {item.booking_downpayment}</span>
                  </div>
                  <div className="mb-2 flex flex-wrap justify-between text-black">
                    <span className="font-semibold min-w-[80px] text-xs sm:text-sm">Total Payment:</span>
                    <span className="text-right text-xs sm:text-sm">₱ {item.booking_totalAmount}</span>
                  </div>

                  {/* Rooms List */}
                  <div className="mt-2 flex-1">
                    <h3 className="text-sm font-semibold mb-1 text-[#113F67]">
                      Rooms:
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {item.roomsList.map((room, roomIndex) => (
                        <div
                          key={roomIndex}
                          className="border rounded-lg p-2 bg-gray-50 shadow-sm relative"
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
                            className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </button>

                          <h4 className="text-sm font-semibold text-gray-800 pr-5">
                            {room.roomtype_name}
                          </h4>
                          <p className="text-xs text-gray-600 mb-1 line-clamp-1">
                            {room.roomtype_description}
                          </p>
                          <div className="grid grid-cols-2 gap-1 text-xs text-black">
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
                  <div className="mt-2">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg group"
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
      </Card>
    </div>



  );
}


export default CustomerViewBookings;
