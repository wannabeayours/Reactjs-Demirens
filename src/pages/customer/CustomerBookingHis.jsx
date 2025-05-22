import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'
import DataTable from '@/components/ui/data-table';
import axios from 'axios';
import { Eye } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

function CustomerBookingHis() {
  const [history, setHistory] = useState([]);
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
      setHistory(res.data !== 0 ? res.data : []);

    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);

    }
  }

  const col = [
    { header: 'Check In', accessor: 'booking_checkin_dateandtime', sortable: true },
    { header: 'Check Out', accessor: 'booking_checkout_dateandtime', sortable: true },
    { header: 'Room Type', accessor: 'roomtype_name', sortable: true },
    { header: 'Room Number', accessor: 'roomnumber_id', sortable: true },
    { 
      header: 'Actions', 
      cell: (row) => (
       <Eye />
      )
    },



  ]



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
         
            <DataTable columns={col} data={history} itemsPerPage={10} />
         
        </div>
      </Card>
    </div>
  )
}

export default CustomerBookingHis