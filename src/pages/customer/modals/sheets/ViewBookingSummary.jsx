import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import DataTable from '@/components/ui/data-table';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import React, { useEffect, useState } from 'react'
import RequestAmenities from './RequestAmenities';
import { Badge } from '@/components/ui/badge';
import ShowAlert from '@/components/ui/show-alert';
import axios from 'axios';
import { toast } from 'sonner';
import { Eye, Calendar, Clock, MapPin, Users, Receipt, CheckCircle2, XCircle } from 'lucide-react';

function ViewBookingSummary({ getBookingSummary, bookingData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [bookingId, setBookingId] = useState('');
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [bookingChargesId, setBookingChargesId] = useState('');
  const handleShowAlert = (bookingChargesId) => {
    setBookingChargesId(bookingChargesId);
    console.log("bookingChargesId", bookingChargesId)
    setAlertMessage("Are you sure you want to cancel this request?");
    setShowAlert(true);
  };
  const handleCloseAlert = (status) => {
    if (status === 1) {
      cancelReqAmenities();
    }
    setShowAlert(false);
  };

  const columns = [
    {
      header: 'Category',
      accessor: 'charges_category_name',
      className: 'font-medium'
    },
    {
      header: 'Description',
      accessor: 'charges_master_name'
    },
    {
      header: 'Qty',
      accessor: 'booking_charges_quantity',
      className: 'text-center'
    },
    {
      header: 'Price',
      accessor: (row) => `${row.booking_charges_price === 0 ? "Free" : "₱" + parseFloat(row.booking_charges_price).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      className: 'text-right'
    },
    {
      header: 'Total',
      accessor: (row) => `₱${parseFloat(row.total).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      className: 'text-right font-semibold'
    },
    {
      header: 'Status',
      cell: (row) => (
        <div className="flex items-center justify-center">
          <Badge className={`flex items-center gap-1 ${row.charges_status_name === "Delivered"
            ? "bg-green-100 text-green-700"
            : row.charges_status_name === "Pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-700"
            }`}>
            {row.charges_status_name === "Delivered" && <CheckCircle2 className="h-3 w-3" />}
            {row.charges_status_name === "Pending" && <Clock className="h-3 w-3" />}
            {row.charges_status_name !== "Delivered" && row.charges_status_name !== "Pending" && <XCircle className="h-3 w-3" />}
            {row.charges_status_name}
          </Badge>
        </div>
      )
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className='flex justify-center items-center'>
          <Button
            disabled={row.charges_status_name !== "Pending"}
            variant={"destructive"}
            size="sm"
            onClick={() => handleShowAlert(row.booking_charges_id)}
            className="text-xs"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        </div>
      )
    }
  ];

  const cancelReqAmenities = async () => {
    try {
      const url = localStorage.getItem("url") + "customer.php";
      const jsonData = { bookingChargesId: bookingChargesId }
      const formData = new FormData();
      formData.append("json", JSON.stringify(jsonData));
      formData.append("operation", "cancelReqAmenities");
      const res = await axios.post(url, formData);
      console.log("res", res)
      if (res.data === -1) {
        toast.error("Cancellation period has expired. Please contact the front desk for assistance.");
      } else if (res.data === 1) {
        getBookingSummary();
        toast.success("Request cancelled successfully");
      }
    } catch (error) {
      toast.error("Error cancelling request");
      console.log("Error cancelling request", error);
    }
  }

  useEffect(() => {
    if (isOpen === true) {
      const bookingList = bookingData.roomsList;
      setData(bookingData);
      setRoomsList(bookingList);
      setBookingId(bookingData.booking_id);
      console.log("bookingData", bookingData)
      console.log("RoomsList", bookingList)
      console.log("isAddBed", bookingList.isAddBed)
    }
  }, [bookingData, isOpen])


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </Button>
      </SheetTrigger>
      <SheetContent className='w-full h-[90vh] rounded-t-lg overflow-y-auto bg-gray-50' side='bottom'>

        <SheetHeader className="pb-4 border-b mb-6">
          <SheetTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            Booking Summary
          </SheetTitle>
          <p className="text-gray-600 text-sm">Review your booking details and manage requests</p>
        </SheetHeader>

        {/* Booking Info */}
        <div className="flex justify-center items-center mb-6">
          <Card className="w-full max-w-lg shadow-sm border">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <div>
                    <Label className="text-xs text-gray-500 uppercase">Check In</Label>
                    <p className="font-medium text-gray-900">{data.booking_checkin_dateandtime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <Clock className="h-4 w-4 text-red-600" />
                  <div>
                    <Label className="text-xs text-gray-500 uppercase">Check Out</Label>
                    <p className="font-medium text-gray-900">{data.booking_checkout_dateandtime}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rooms */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mx-4'>
          {roomsList.map((room, index) => (
            <Card key={index} className="shadow-sm border hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {/* Room Header */}
                <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {room.roomtype_name}
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm">
                      {room.roomtype_description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded text-xs text-blue-700">
                    <Users className="h-3 w-3" />
                    Room {index + 1}
                  </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-lg border overflow-hidden">
                  <DataTable
                    columns={columns}
                    data={room.charges}
                    hideSearch
                    showNoData={false}
                    className="text-sm"
                    headerAction={
                      <div className="p-3 bg-gray-50 border-t">
                        <h4 className="text-sm font-medium text-gray-800 mb-2">
                          Request Additional Services
                        </h4>
                        <RequestAmenities
                          bookingRoomId={room.booking_room_id}
                          bookingId={bookingId}
                          getBookingSummary={getBookingSummary}
                          roomId={room.room_id}
                          isAddBed={room.isAddBed === 1 ? true : false}
                        />
                      </div>
                    }
                  />
                </div>

                {/* Room Total */}
                {room.charges && room.charges.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Room Total:</span>
                      <span className="font-semibold text-blue-700">
                        ₱{room.charges.reduce((total, charge) => total + parseFloat(charge.total || 0), 0).toLocaleString('en-PH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                )}
                {/* <div>
                  <div>
                    <Button>
                      Pay Cash
                    </Button>
                  </div>
                   <div>
                    <Button>
                      Pay Online
                    </Button>
                  </div>

                </div> */}

              </CardContent>
            </Card>
          ))}
        </div>

        <ShowAlert
          open={showAlert}
          onHide={handleCloseAlert}
          message={alertMessage}
        />
      </SheetContent>
    </Sheet>
  )
}

export default ViewBookingSummary