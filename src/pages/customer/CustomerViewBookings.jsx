import { Card } from '@/components/ui/card';
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import ShowAlert from '@/components/ui/show-alert';
import { Badge } from '@/components/ui/badge';

function CustomerViewBookings() {
  const [viewBook, setViewBook] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [currentbookings, setCurrentbookings] = useState([]);


  const customerViewBookings = async () => {
    try {
      const url = localStorage.getItem('url') + 'customer.php';
      const bookingCustomerId = localStorage.getItem('userId');
      console.log('Using Customer ID:', bookingCustomerId);
      const jsonData = { "booking_customer_id": bookingCustomerId };
      const formData = new FormData();
      formData.append('operation', 'customerViewBookings');
      formData.append('json', JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log('woaaah res ni vack to vack:', res);

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

  const customerCurrentBookings = async () => {
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const CustomerId = localStorage.getItem("userId");
      const jsonData = { "booking_customer_id": CustomerId };
      const formData = new FormData();
      formData.append("operation", "customerCurrentBookingsWithAccount");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      setCurrentbookings(res.data !== 0 ? res.data : []);
      console.log("view bookings:", res);
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);

    }
  }

  const customerCancelBooking = async () => {
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const bookingId = localStorage.getItem("bookingId");
      const jsonData = { "booking_id": bookingId };
      const formData = new FormData();
      formData.append("json", JSON.stringify(jsonData));
      formData.append("operation", "customerCancelBooking")
      const res = await axios.post(url, formData)
      console.log("Submit", res);
      customerViewBookings();


    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);

    }
  }

  const handleShowAlert = () => {
    // "This action cannot be undone. It will permanently delete the item and remove it from your list"
    setAlertMessage("Are you sure you want to cancel your booking?");
    setShowAlert(true);
  };
  const handleCloseAlert = (status) => {
    if (status === 1) {
      // if gi click ang confirm, execute tanan diri 
      customerCancelBooking();
    }
    setShowAlert(false);
  };


  useEffect(() => {
    customerViewBookings();
    customerCurrentBookings();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ">
      {currentbookings.map((item, index) => (
        <div key={index}>
          <Card className="px-10 mt-10 ">


            <div className=" shadow-lg rounded-lg p-6 ">
              {errorMessage ? (
                <div className=" text-red-500">
                  <strong>{errorMessage}</strong>
                </div>
              ) : (
                viewBook.length > 0 ? (
                  <div>
                    <div>
                      <Card className="mb-4 bg-[#769FCD] p-5">
                        <div className="flex justify-between items-center w-full">
                          <h2 className="text-lg font-semibold">{item.roomtype_name}</h2>
                          <h2 className="font-semibold"><Badge variant="secondary">Pending</Badge></h2>
                        </div>
                      </Card>
                    </div>

                    <div className="mb-4">
                      <h2 className="font-semibold">Room Number: {item.roomnumber_id}</h2>
                    </div>
                    <div className="mb-4">
                      <h2 className="font-semibold">Room Sizes: {item.room_sizes} </h2>
                    </div>
                    <div className="mb-4">
                      <h2 className="font-semibold">Room Price:</h2>
                    </div>
                    <div className="mb-4">
                      <h2 className="font-semibold">Room Beds: {item.room_beds} Beds</h2>
                    </div>
                    <div className="mb-4">
                      <h2 className="font-semibold">Down Payment: ₱ {item.booking_downpayment} </h2>
                    </div>
                    <div className="mb-4">
                      <h2 className="font-semibold">Check-in Date: {item.booking_checkin_dateandtime} </h2>
                      <h2 className="font-semibold">Check-out Date: {item.booking_checkout_dateandtime}</h2>
                    </div>
                    <div className="mt-6">
                      <Button variant="outline" onClick={handleShowAlert}>Cancel Booking</Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-600">No booking details available</div>
                )
              )}
            </div>
          </Card>
        </div>
      ))}

      <ShowAlert open={showAlert} onHide={handleCloseAlert} message={alertMessage} duration={3} />
    </div>
  );
}

export default CustomerViewBookings;
