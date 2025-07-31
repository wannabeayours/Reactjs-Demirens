import { Card } from '@/components/ui/card'
import DataTable from '@/components/ui/data-table'
import ShowAlert from '@/components/ui/show-alert';
import { Archive, ArchiveRestore } from 'lucide-react'
import React, { useState } from 'react'

function CustomerArchieve() {
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const fakeArchivedBookings = [
    {
      booking_id: 1,
      booking_checkin_dateandtime: "2025-07-01 14:00",
      booking_checkout_dateandtime: "2025-07-03 12:00"
    },
    {
      booking_id: 2,
      booking_checkin_dateandtime: "2025-07-10 13:00",
      booking_checkout_dateandtime: "2025-07-12 11:00"
    }
  ];

  const col = [
    { header: 'Check In', accessor: 'booking_checkin_dateandtime', sortable: true, headerClassName:"text-white" },
    { header: 'Check Out', accessor: 'booking_checkout_dateandtime', sortable: true , headerClassName:"text-white"},


    {
      header: 'Actions', headerClassName:"text-white",
      cell: (row) => (
        <div className="flex gap-4">
          <ArchiveRestore className="cursor-pointer hover:text-[#34699A]"
            onClick={() => handleShowAlert(row)} />

        </div>

      )

    },



  ]

  const handleShowAlert = () => {
    // "This action cannot be undone. It will permanently delete the item and remove it from your list"
    setAlertMessage("Are you sure you want to restore this booking?");
    setShowAlert(true);
  };
  const handleCloseAlert = (status) => {
    if (status === 1) {
      // if gi click ang confirm, execute tanan diri 
    }
    setShowAlert(false);
  };
  return (
    <div className="flex  flex-col ">

      <div className="flex items-center pl-4">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <Archive className="w-6 h-6" />
          Archive
        </h1>
      </div>




      <Card className={"px-10 mt-20 w-full bg-transparent shadow-xl  "}>
        <div className="text-white">

          <DataTable columns={col} data={fakeArchivedBookings} itemsPerPage={10} />

        </div>
      </Card>
      <ShowAlert open={showAlert} onHide={handleCloseAlert} message={alertMessage} duration={1} />
    </div>

  )
}

export default CustomerArchieve