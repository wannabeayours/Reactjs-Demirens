import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'
import DataTable from '@/components/ui/data-table';
import ShowAlert from '@/components/ui/show-alert';
import axios from 'axios';
import { ArchiveIcon, Book, Eye, HistoryIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { SelectedBooking } from './modals/SelectedBooking';
// import { useIsMobile } from '../../../hooks/use-mobile';


function CustomerBookingHis() {
  const [history, setHistory] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(0);
  // const isMobile = useIsMobile();




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
      if (res.data !== 0) {
        setHistory(res.data);
      }
      else {
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
    {
      header: 'Check In',
      accessor: 'booking_checkin_dateandtime',
      sortable: true,
      headerClassName: "text-black",
      hiddenOnMobile: false,
      cell: (row) => {
        const date = new Date(row.booking_checkin_dateandtime);
        return <span className="whitespace-nowrap">{date.toLocaleDateString()}</span>;
      }
    },
    {
      header: 'Check Out',
      accessor: 'booking_checkout_dateandtime',
      sortable: true,
      headerClassName: "text-black",
      hiddenOnMobile: false,
      cell: (row) => {
        const date = new Date(row.booking_checkout_dateandtime);
        return <span className="whitespace-nowrap">{date.toLocaleDateString()}</span>;
      }
    },
    {
      header: 'Total',
      accessor: 'booking_total',
      sortable: true,
      
      headerClassName: "text-black",
      cell: (row) => (
        <span>₱{parseFloat(row.booking_total).toLocaleString('en-PH', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}</span>
      )
    },
    {
      header: 'Status',
      headerClassName: "text-black",
      cell: (row) => (
        <Badge
          className={
            row.booking_status === "Approved"
              ? "bg-green-500"
              : row.booking_status === "Pending"
                ? "bg-orange-500"
                : row.booking_status === "Cancelled"
                  ? "bg-gray-500"
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
      header: 'Actions',
      headerClassName: "text-black",
      cell: (row) => (
        <div className="flex gap-2 md:gap-4 justify-start">
          <SelectedBooking selectedData={row} />
          <ArchiveIcon
            className="cursor-pointer hover:text-red-600 w-5 h-5"
            onClick={() => handleShowAlert(row)}
          />
        </div>
      )
    },
  ]



  useEffect(() => {
    getHistory();
  }, [])

  return (
    <div className="flex flex-col w-full max-w-[1200px] mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between py-4 mb-2 border-b border-gray-200">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-2 text-[#113f67]">
          <Book className="w-5 h-5 sm:w-6 sm:h-6" />
          Booking Management
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-sm sm:text-base text-gray-500 hidden sm:block">
            Manage your Booking History
          </div>
        </div>
      </div>
      
      <Card className={"px-4 sm:px-6 md:px-10 mt-8 sm:mt-12 md:mt-16 w-full bg-white rounded-lg border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300"}>
        <div className="text-black overflow-x-auto w-full">
          <DataTable
            columns={col}
            data={history}
            // itemsPerPage={isMobile ? 5 : 10} 
            // hideSearch={isMobile}
            showNoData={true}
          />
        </div>
      </Card>
      <ShowAlert open={showAlert} onHide={handleCloseAlert} message={alertMessage} duration={1} />
    </div>

  )
}

export default CustomerBookingHis