import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DataTable from '@/components/ui/data-table';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import React, { useEffect, useState } from 'react'

function ViewBookingSummary({ bookingData }) {
 const [isOpen, setIsOpen] = useState(false);
 const [data, setData] = useState([]);
 const [roomsList, setRoomsList]= useState([]);
 // const [charges, setCharges] = useState

 const columns = [
  { header: 'Room Type', accessor: 'roomtype_name', sortable: true },
  { header: 'Description', accessor: (row) => row.charges.charges_master_name },
 
];

 useEffect(() => {
  if (isOpen === true) {
   setData(bookingData);
   setRoomsList(bookingData.roomsList)
   console.log("bookingData", bookingData)
  }
 }, [bookingData, isOpen])


 return (
  <Sheet open={isOpen} onOpenChange={setIsOpen}>

   <SheetTrigger>
    <Button>View</Button>
   </SheetTrigger>
   <SheetContent className='h-[90vh] border-2 rounded-t-2xl' side='bottom' >
    <div className="flex justify-center items-center">
     <Card className="mt-10 mx-5 md:w-1/3 shadow-lg">
      <CardContent >
       <div className="flex items-center justify-between">
        <Label>Check in :</Label>
        {data.booking_checkin_dateandtime}
       </div>
       <div className="flex items-center justify-between">
        <Label>Check out :</Label>
        {data.booking_checkout_dateandtime}
       </div>
       <div className="flex items-center justify-between">
        <Label>Guests :</Label>
        {data.guests_amnt}
       </div>
       <div className="flex items-center justify-between">
        <Label>Booking Total Amount :</Label>
        ₱{data.booking_totalAmount}
       </div>
      </CardContent>
     </Card>

    </div>
    <DataTable columns={columns} data={roomsList} itemsPerPage={5} />

   </SheetContent>
  </Sheet>
 )
}

export default ViewBookingSummary