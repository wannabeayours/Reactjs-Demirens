import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'
import DataTable from '@/components/ui/data-table';
import ShowAlert from '@/components/ui/show-alert';
import axios from 'axios';
import { Eye, HistoryIcon, Trash, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';



function CustomerBookingHis() {
  const [history, setHistory] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const getHistory = async () => {
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const CustomerId = localStorage.getItem("userId");
      const jsonData = { "booking_customer_id": CustomerId };
      console.log("jsondata", jsonData)
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

  const handleShowAlert = () => {
    // "This action cannot be undone. It will permanently delete the item and remove it from your list"
    setAlertMessage("Are you sure you want to archive this booking?");
     setShowAlert(true);
     };
     const handleCloseAlert = (status) => {
      if (status === 1) {
       // if gi click ang confirm, execute tanan diri 
     }
      setShowAlert(false);
    };

  const col = [
    { header: 'Check In', accessor: 'booking_checkin_dateandtime', sortable: true, headerClassName:"text-white" },
    { header: 'Check Out', accessor: 'booking_checkout_dateandtime', sortable: true ,headerClassName:"text-white"},
    { header: 'Room Type', accessor: 'roomtype_name', sortable: true ,headerClassName:"text-white"},
    { header: 'Room Number', accessor: 'roomnumber_id', sortable: true,headerClassName:"text-white" },
    {
      header: 'Status',headerClassName:"text-white", cell: (row) => (
        <Badge className={row.booking_status_name === "Approved" ? "bg-green-500" : row.booking_status_name === "Pending" ? "bg-orange-500"  : "bg-red-500"}>
          {row.booking_status_name}
        </Badge>
      )
    },
    {
      header: 'Actions',headerClassName:"text-white",
      cell: (row) => (
        <div className="flex gap-4">
        <Eye className="cursor-pointer hover:text-[#34699A]" />
        <Trash className="cursor-pointer hover:text-red-600"
        onClick={() => handleShowAlert(row)}  />
      </div>
       
      )
      
    },
    



  ]



  useEffect(() => {
    getHistory();
  }, [])

  return (



    <div className="flex  flex-col ">

      <div className="flex items-center pl-4">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <HistoryIcon className="w-6 h-6" />
          Booking History
        </h1>
      </div>




      <Card className={"px-10 mt-20 w-full bg-transparent shadow-xl  "}>

        <div className="text-white">

          <DataTable columns={col} data={history} itemsPerPage={10} />

        </div>
      </Card>
      <ShowAlert open={showAlert} onHide={handleCloseAlert} message={alertMessage} duration={1} />
    </div>

  )
}

export default CustomerBookingHis