import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'
import DataTable from '@/components/ui/data-table';
import ShowAlert from '@/components/ui/show-alert';
import axios from 'axios';
import { ArchiveIcon, Eye, HistoryIcon, Trash } from 'lucide-react';
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
      formData.append("operation", "getBookingHistory");
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
    { header: 'Check In', accessor: 'booking_checkin_dateandtime', sortable: true, headerClassName: "text-black" },
    { header: 'Check Out', accessor: 'booking_checkout_dateandtime', sortable: true, headerClassName: "text-black" },
    { header: 'Room Type', accessor: 'roomtype_name', sortable: true, headerClassName: "text-black" },
    { header: 'Room Number', accessor: (row) => row.roomnumber_id ?? 'N/A', sortable: true, headerClassName: "text-black" },
    {
      header: 'Status',
      headerClassName: "text-black",
      cell: (row) => (
        <Badge
          className={
            row.booking_status_name === "Approved"
              ? "bg-green-500"
              : row.booking_status_name === "Cancelled"
              ? "bg-orange-500"
              : row.booking_status_name === "Checked-Out"
              ? "bg-secondary text-black"
              : "bg-red-500"
          }
        >
          {row.booking_status_name}
        </Badge>
      )
    
    },
    {
      header: 'Actions', headerClassName: "text-black",
      cell: (row) => (
        <div className="flex gap-4">
          <Eye className="cursor-pointer hover:text-[#34699A]" />
          <ArchiveIcon className="cursor-pointer hover:text-red-600"
            onClick={() => handleShowAlert(row)} />
        </div>

      )

    },




  ]



  useEffect(() => {
    getHistory();
  }, [])

  return (



    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center pl-2 sm:pl-4">
        <h1 className="text-2xl sm:text-4xl font-bold flex items-center gap-1 sm:gap-2">
          <HistoryIcon className="w-6 h-6" />
          Booking Management
        </h1>
      </div>




      <Card className="px-4 sm:px-10 mt-10 sm:mt-20 w-full bg-transparent shadow-xl">
        <div className="text-black overflow-x-auto">

          <DataTable columns={col} data={history} itemsPerPage={10} />

        </div>
      </Card>
      <ShowAlert open={showAlert} onHide={handleCloseAlert} message={alertMessage} duration={1} />
    </div>

  )
}

export default CustomerBookingHis