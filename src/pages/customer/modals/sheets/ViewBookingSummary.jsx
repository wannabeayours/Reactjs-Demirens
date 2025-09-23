import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import DataTable from '@/components/ui/data-table';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import React, { useEffect, useState } from 'react'
import RequestAmenities from './RequestAmenities';
import { Badge } from '@/components/ui/badge';

function ViewBookingSummary({ getBookingSummary, bookingData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [bookingId, setBookingId] = useState('');
  // const [charges, setCharges] = useState

  const columns = [
    { header: 'Charges category', accessor: 'charges_category_name', sortable: true },
    { header: 'Description', accessor: 'charges_master_name', sortable: true },
    { header: 'Quantity', accessor: 'booking_charges_quantity' },
    { header: 'Price', accessor: 
      (row) => `${row.booking_charges_price === 0 ? "Free" : "₱" + parseFloat(row.booking_charges_price).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      sortable: true },
    { header: 'Total', accessor: 
      (row) => `₱${parseFloat(row.total).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      sortable: true },
      { header: 'Status',
        cell: (row) => (
        <Badge className={row.charges_status_name === "Delivered" ? "bg-green-900" : row.charges_status_name === "Pending" ? "bg-orange-500" : "bg-red-500"}>
          {row.charges_status_name}
        </Badge>)
      },
  ];

  useEffect(() => {
    if (isOpen === true) {
      setData(bookingData);
      setRoomsList(bookingData.roomsList)
      setBookingId(bookingData.booking_id);
      console.log("bookingData", bookingData)
      console.log("RoomsList", bookingData.roomsList)
    }
  }, [bookingData, isOpen])


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>

      <SheetTrigger>
        <Button>View</Button>
      </SheetTrigger>
      <SheetContent className='h-[90vh] border-2 rounded-t-2xl overflow-y-auto' side='bottom' >
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
              
            
            </CardContent>
          </Card>

        </div>
        <div className='grid grid-cols-2 gap-8 mx-3'>
          {roomsList.map((room, index) => (
            <Card key={index} className={"shadow-md"}>
              <CardContent>
                <CardTitle>{room.roomtype_name}</CardTitle>
                <CardDescription>{room.roomtype_description}</CardDescription>
                <p></p>
                <DataTable
                  columns={columns}
                  data={room.charges}
                  hideSearch
                  showNoData={false}
                  headerAction={
                    <div className="mt-3">
                      <RequestAmenities bookingRoomId={room.booking_room_id} bookingId={bookingId} getBookingSummary={getBookingSummary} roomId={room.room_id} />
                    </div>
                  }
                />
              </CardContent>

            </Card>
          ))}
        </div>

      </SheetContent>
    </Sheet>
  )
}

export default ViewBookingSummary