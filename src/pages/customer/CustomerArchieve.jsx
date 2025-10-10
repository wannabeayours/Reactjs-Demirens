import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card'
import DataTable from '@/components/ui/data-table'
import ShowAlert from '@/components/ui/show-alert';
import axios from 'axios';
import { Archive, ArchiveIcon, ArchiveRestore } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { SelectedBooking } from './modals/SelectedBooking';

function CustomerArchieve() {
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [archivedBookings, setArchivedBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);


  const getArchivedBookings = async () => {
    try {
      const url = localStorage.getItem("url") + "customer.php";
      const customerId = localStorage.getItem("userId");
      const jsonData = { booking_customer_id: customerId }
      console.log("jsonData", jsonData);
      const formData = new FormData();
      formData.append("operation", "getArchivedBookings");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res", res);
      if (res.data !== 0) {
        setArchivedBookings(res.data);

      }
      else {
        setArchivedBookings([]);
      }

    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);

    }
  }

  const restoreBooking = async () => {
    try {
      const url = localStorage.getItem("url") + "customer.php";
      const jsonData = { bookingId: selectedBookingId }
      const formData = new FormData();
      formData.append("operation", "unarchiveBooking");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res", res);
      if (res.data === 1) {
        toast.success("Booking restored successfully");
        getArchivedBookings();
      }
      else {
        toast.error("Booking restored unsuccessful");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);

    }
  }
  const col = [
    {
      header: 'Check In',
      accessor: 'booking_checkin_dateandtime',
      sortable: true,
      headerClassName: "text-[#113f67] font-medium text-sm sm:text-base",
      cellClassName: "py-2 text-xs sm:text-sm"
    },
    {
      header: 'Check Out',
      accessor: 'booking_checkout_dateandtime',
      sortable: true,
      headerClassName: "text-[#113f67] font-medium text-sm sm:text-base",
      cellClassName: "py-2 text-xs sm:text-sm"
    },
    {
      header: 'Total Payment',
      accessor: 'booking_total',
      sortable: true,
      headerClassName: "text-[#113f67] font-medium text-sm sm:text-base",
      cellClassName: "py-2 text-xs sm:text-sm font-medium",
      cell: (row) => (
        <span>₱{parseFloat(row.booking_total).toLocaleString('en-PH', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}</span>
      )
    },
    {
      header: 'Status',
      headerClassName: "text-[#113f67] font-medium text-sm sm:text-base",
      cellClassName: "py-2",
      cell: (row) => (
        <Badge
          size="sm"
          className={
            row.booking_status === "Approved"
              ? "bg-green-500 text-xs sm:text-sm px-2 py-1"
              : row.booking_status === "Cancelled"
                ? "bg-gray-500 text-xs sm:text-sm px-2 py-1"
                : row.booking_status === "Checked-Out"
                  ? "bg-secondary text-black text-xs sm:text-sm px-2 py-1"
                  : "bg-red-500 text-xs sm:text-sm px-2 py-1"
          }
        >
          {row.booking_status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      headerClassName: "text-[#113f67] font-medium text-sm sm:text-base",
      cellClassName: "py-2",
      cell: (row) => (
        <div className="flex gap-2 sm:gap-4 justify-start">
          <SelectedBooking selectedData={row} />
          <ArchiveRestore className="cursor-pointer hover:text-[#34699A] text-black w-4 h-4 sm:w-5 sm:h-5"
            onClick={() => handleShowAlert(row)} />
        </div>
      )
    },
  ]


  const handleShowAlert = (data) => {
    console.log("data", data);
    setSelectedBookingId(data.booking_id);
    // "This action cannot be undone. It will permanently delete the item and remove it from your list"
    setAlertMessage("Are you sure you want to restore this booking?");
    setShowAlert(true);
  };
  const handleCloseAlert = (status) => {
    if (status === 1) {
      restoreBooking();
    }
    setShowAlert(false);
  };

  useEffect(() => {
    getArchivedBookings();
  }, []);


  return (
    <div className="flex flex-col w-full max-w-[1200px] mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between py-4 mb-2 border-b border-gray-200">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-2 text-[#113f67]">
          <ArchiveIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          Archive
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-sm sm:text-base text-gray-500 hidden sm:block">
            Manage your Booking Archive
          </div>
        </div>
      </div>





      <Card className={"px-4 sm:px-6 md:px-10 mt-8 sm:mt-12 md:mt-16 w-full bg-white rounded-lg border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300"}>
        <div className="overflow-x-auto py-4">
          <div className="mb-4 text-lg font-medium text-[#113f67]">Archived Booking Records</div>
          {archivedBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Archive className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm sm:text-base">No archived bookings found</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">Archived bookings will appear here</p>
            </div>
          ) : (
            <DataTable columns={col} data={archivedBookings} itemsPerPage={10} />
          )}

        </div>
      </Card>
      <ShowAlert open={showAlert} onHide={handleCloseAlert} message={alertMessage} duration={1} />
    </div>

  )
}

export default CustomerArchieve