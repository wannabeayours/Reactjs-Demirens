import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'
import DataTable from '@/components/ui/data-table';
import ShowAlert from '@/components/ui/show-alert';
import axios from 'axios';
import { ArchiveIcon, Eye, HistoryIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { SelectedBooking } from './modals/SelectedBooking';


function CustomerBookingHis() {
  const [history, setHistory] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(0);




  const archivedBooking = async () => {
    try {
      const url = localStorage.getItem("url") + "customer.php";
      const jsonData = { bookingId: selectedBookingId }
      const formData = new FormData();
      formData.append("operation", "archiveBooking");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res", res);
      if (res.data === 1) {
        toast.success("Booking archived successfully");
        getHistory();
      }
      else {
        toast.error("Booking archived unsuccessful");
      }

    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  }


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
      if(res.data !== 0){
        setHistory(res.data);
      }
      else{
        setHistory([]);
      }
      

    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);

    }
  }

  const handleShowAlert = (data) => {
    console.log("data", data);
    setSelectedBookingId(data.booking_id);
    setAlertMessage("Are you sure you want to archive this booking?");
    setShowAlert(true);
  };
  const handleCloseAlert = (status) => {
    if (status === 1) {
      archivedBooking()
    }
    setShowAlert(false);
  };

  const col = [
    { header: 'Check In', accessor: 'booking_checkin_dateandtime', sortable: true, headerClassName: "text-black" },
    { header: 'Check Out', accessor: 'booking_checkout_dateandtime', sortable: true, headerClassName: "text-black" },
    { header: 'Total Payment', accessor: 'booking_total', sortable: true, headerClassName: "text-black" },
    {
      header: 'Status',
      headerClassName: "text-black",
      cell: (row) => (
        <Badge
          className={
            row.booking_status === "Approved"
              ? "bg-green-500"
              : row.booking_status === "Cancelled"
                ? "bg-orange-500"
                : row.booking_status === "Checked-Out"
                  ? "bg-secondary text-black"
                  : "bg-red-500"
          }
        >
          {row.booking_status}
        </Badge>
      )
    },
    {
      header: 'Actions', headerClassName: "text-black",
      cell: (row) => (
        <div className="flex gap-4">
          <SelectedBooking selectedData={row} />
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