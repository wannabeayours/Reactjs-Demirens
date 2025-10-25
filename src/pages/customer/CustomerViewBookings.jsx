import { Card } from '@/components/ui/card';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import ShowAlert from '@/components/ui/show-alert';
import { Book, BookOpenCheckIcon, Trash2 } from 'lucide-react';

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
      console.log('Bookings response:', res.data);

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
      const url = localStorage.getItem('url') + 'customer.php';
      const jsonData = { booking_id: bookingId };
      const formData = new FormData();
      formData.append('json', JSON.stringify(jsonData));
      formData.append('operation', 'customerCancelBooking');
      const res = await axios.post(url, formData);
      console.log('res', res.data);
      if (res.data === -1) {
        toast.error(
          'Booking cannot be cancelled because it was made more than 24 hours ago and it is non-refundable.'
        );
      } else if (res.data === 1) {
        customerViewBookings();
        toast.success('Booking cancelled!');
      } else {
        toast.error('Failed to cancel booking.');
      }
    } catch (error) {
      toast.error('Something went wrong');
      console.error(error);
    }
  };

  const removeBookingRoom = async (bookingId, roomId) => {
    try {
      const url = localStorage.getItem('url') + 'customer.php';
      const jsonData = { bookingId: bookingId, bookingRoomId: roomId };
      const formData = new FormData();
      formData.append('json', JSON.stringify(jsonData));
      formData.append('operation', 'removeBookingRoom');
      const res = await axios.post(url, formData);
      if (res.data === 1) {
        customerViewBookings();
        toast.success('Room removed!');
      } else {
        toast.error('Failed to remove room.');
      }
    } catch (error) {
      toast.error('Something went wrong');
      console.error(error);
    }
  };

  const handleShowAlert = (bookingId) => {
    setAlertMessage('Are you sure you want to cancel your booking?');
    setSelectedBookingId(bookingId);
    setSelectedRoomData(null);
    setShowAlert(true);
  };

  const handleShowRemoveRoomAlert = (bookingId, roomId, roomsCount) => {
    if (roomsCount.roomsList.length === 1) {
      toast.error('You cannot remove the last room from this booking.');
      return;
    }
    setAlertMessage('Are you sure you want to remove this room?');
    setSelectedBookingId(bookingId);
    setSelectedRoomData({ roomId });
    setShowAlert(true);
  };

  const handleCloseAlert = (status) => {
    if (status === 1) {
      if (selectedRoomData) {
        removeBookingRoom(selectedBookingId, selectedRoomData.roomId);
      } else {
        customerCancelBooking(selectedBookingId);
      }
    }
    setShowAlert(false);
  };

  useEffect(() => {
    customerViewBookings();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/50">
      <div className="absolute inset-x-0 top-0 h-24 sm:h-32 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-teal-500/10 blur-2xl pointer-events-none" />

      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/70 border-b">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 text-[#113f67]">
              <Book className="w-5 h-5 sm:w-6 sm:h-6" />
              Your Bookings
            </h1>
            <span className="hidden sm:inline text-sm text-gray-500">Review and manage your bookings</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur rounded-xl border border-gray-100 shadow-sm">
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#113f67] via-[#226597] to-[#2980b9]" />
          <div className="p-4 sm:p-6">
            <div className="mb-4 text-sm sm:text-base font-medium text-[#113f67]">View your bookings here</div>

            {viewBook.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <BookOpenCheckIcon className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-gray-600 text-sm sm:text-base">No bookings found</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">Bookings will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 items-stretch w-full">
                {viewBook.map((item, index) => (
                  <Card key={index} className="group relative overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#113f67] via-[#226597] to-[#2980b9]" />

                    <div className="px-3 sm:px-4 pt-3 pb-2">
                      <div className="flex flex-wrap justify-between items-center w-full text-black">
                        <h2 className="text-base sm:text-lg font-bold text-[#113F67] break-words">Booking #{item.booking_id}</h2>
                      </div>
                    </div>

                    <div className="px-3 sm:px-4 space-y-1 text-xs sm:text-sm text-black">
                      <div className="flex flex-wrap justify-between">
                        <span className="font-semibold min-w-[90px]">Check-in:</span>
                        <span className="text-right break-words">{item.booking_checkin_dateandtime}</span>
                      </div>
                      <div className="flex flex-wrap justify-between">
                        <span className="font-semibold min-w-[90px]">Check-out:</span>
                        <span className="text-right break-words">{item.booking_checkout_dateandtime}</span>
                      </div>
                      <div className="flex flex-wrap justify-between">
                        <span className="font-semibold min-w-[90px]">Payment Method:</span>
                        <span className="text-right break-words">{item.payment_method_name}</span>
                      </div>
                      <div className="flex flex-wrap justify-between">
                        <span className="font-semibold min-w-[90px]">Total Payment:</span>
                        <span className="text-right">₱ {item.booking_totalAmount}</span>
                      </div>
                    </div>

                    <div className="px-3 sm:px-4 mt-3 flex-1">
                      <h3 className="text-xs sm:text-sm font-semibold mb-1 text-[#113F67]">Rooms</h3>
                      <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto pr-1">
                        {item.roomsList.map((room, roomIndex) => (
                          <div key={roomIndex} className="border rounded-lg p-2 bg-gray-50 shadow-sm relative">
                            <button
                              onClick={() => handleShowRemoveRoomAlert(item.booking_id, room.booking_room_id, item)}
                              className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </button>
                            <h4 className="text-sm font-semibold text-gray-800 pr-5">{room.roomtype_name}</h4>
                            <p className="text-xs text-gray-600 mb-1 line-clamp-1">{room.roomtype_description}</p>
                            <div className="grid grid-cols-2 gap-1 text-xs text-black">
                              <span>
                                <strong>Size:</strong> {room.room_sizes}
                              </span>
                              <span>
                                <strong>Beds:</strong> {room.room_beds}
                              </span>
                              <span>
                                <strong>Capacity:</strong> {room.max_capacity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="px-3 sm:px-4 pb-3 mt-2">
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
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
      </main>
    </div>
  );
}

export default CustomerViewBookings;
