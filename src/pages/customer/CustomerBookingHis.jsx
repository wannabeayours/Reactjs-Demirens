import { Card } from '@/components/ui/card'
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

function CustomerBookingHis() {
  const [ history, setHistory ] = useState([]);
  const getHistory = async () => {
    try {
      const url = localStorage.getItem('url') + "customer.php"; 
      const CustomerId = localStorage.getItem("userId");
      const jsonData = { "booking_customer_id": CustomerId };
      const formData = new FormData();
      formData.append("operation", "customerViewBookings");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("noOOo", res);
      setHistory(res.data);
    
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
      
    }
  }

  useEffect(() => {
    getHistory();
  }, [])

  return (
    <div className="flex items-center justify-center flex-col">
      <Card className={"px-10 mt-10 w-full "}>
        <div>
          <h1 className="text-lg font-bold">Booking History</h1>

        </div>
        <div>
          <h1> 
            wow
          </h1>
        </div>
      </Card>
    </div>
  )
}

export default CustomerBookingHis