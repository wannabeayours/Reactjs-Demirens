import { Card } from '@/components/ui/card';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import ShowAlert from '@/components/ui/show-alert';

function CustomerViewBookings() {
  const [viewBook, setViewBook] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);


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

  const customerCancelBooking = async ()=> {
    try {
        const url = localStorage.getItem('url') + "customer.php";
        const bookingId = localStorage.getItem("bookingId");
        const jsonData = { "booking_id": bookingId};
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
      if (status === 1 ) {
       // if gi click ang confirm, execute tanan diri 
       customerCancelBooking();
     }
      setShowAlert(false);
    };
  

  useEffect(() => {
    customerViewBookings();
    customerCancelBooking();
  }, []);

  return (
    <div className="flex items-center justify-center flex-col">
      <Card className="px-10 mt-10 w-1/2">
        <h2 className="text-lg font-bold">View Bookings Details</h2>

        <div className=" shadow-lg rounded-lg p-6">
          {errorMessage ? (
            <div className=" text-red-500">
              <strong>{errorMessage}</strong>
            </div>
          ) : (
            viewBook.length > 0 ? (
              <div>
                <div className="mb-4">
                  <h2 className="font-semibold">Room Type:</h2>
                  <h2 className="font-semibold">Booking Status: </h2>
                </div>
                <div className="mb-4">
                  <h2 className="font-semibold">Room Number: </h2>
                </div>
                <div className="mb-4">
                  <h2 className="font-semibold">Room Sizes: </h2>
                </div>
                <div className="mb-4">
                  <h2 className="font-semibold">Room Price:</h2>
                </div>
                <div className="mb-4">
                  <h2 className="font-semibold">Room Beds: </h2>
                </div>
                <div className="mb-4">
                  <h2 className="font-semibold">Down Payment: </h2>
                </div>
                <div className="mb-4">
                  <h2 className="font-semibold">Check-in Date: </h2>
                  <h2 className="font-semibold">Check-out Date: </h2>
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
      <ShowAlert open={showAlert} onHide={handleCloseAlert} message={alertMessage} duration={3}/>
    </div>
  );
}

export default CustomerViewBookings;
