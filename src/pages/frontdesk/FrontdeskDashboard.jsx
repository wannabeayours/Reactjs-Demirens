import React from 'react'
import FrontHeader from '@/components/layout/FrontHeader'
import axios from 'axios'
import { useState, useEffect } from 'react'

// ShadCN

import { toast } from 'sonner';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { ScrollArea } from '@radix-ui/react-scroll-area';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { Ellipsis } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


function FrontdeskDashboard() {
  const APIConn = `${localStorage.url}front-desk.php`;

  // For the Booking Table
  const [resvData, setResvData] = useState([]);
  const [selData, setSelData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState(0)

  const bookingStatuses = {
    1: "Approved",
    2: "Pending",
    3: "Cancelled"
  };

  const [modalSettings, setModalSettings] = useState({
    modalMode: '',
    showModal: false
  });

  const editStatus = (reserveData) => {
    setModalSettings({
      modalMode: 'editResv',
      showModal: true
    })
    console.log('Data: ', reserveData);
    setSelData(reserveData);
    setPermission(reserveData.booking_status_id);
  }

  const getBookings = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('method', 'view-reservations');

    try {
      const conn = await axios.post(APIConn, formData);
      if (conn.data) {
        console.log(conn.data)
        setResvData(conn.data !== 0 ? conn.data : 0)
      } else {
        toast('Failed to connect');
      }

    } catch (err) {
      toast('Something went wrong');
      console.log(err)
    } finally {
      resetUseState();
      toast('Done Loading');
    }
  }

  const insertBookingStatus = async () => {
    const dataSummary = {
      booking_id: selData.booking_id,
      booking_status_id: permission
    }

    const formData = new FormData();
    formData.append("method", "record-booking-status");
    formData.append("json", JSON.stringify(dataSummary));
    console.log(formData)

    try {
      const response = await axios.post(APIConn, formData);

      if (response.data.success) {
        toast("Booking status updated successfully");
        // Optionally refetch data:
        getBookings();
        resetUseState();
      } else {
        toast("Failed to update status");
        console.log(response.data);
        resetUseState();
      }
    } catch (err) {
      toast("Error updating status");
      console.error(err);
      resetUseState();
    }
  };


  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    const [date, time] = dateTime.split(' ');
    const newDate = new Date(date);

    return newDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const resetUseState = () => {
    setIsLoading(false);
    setModalSettings({ modalMode: "", showModal: false });
  }

  useEffect(() => {
    getBookings();
  }, [])


  // For adding new bookings


  return (
    <>
      {/* Header and Label */}
      <div className="px-4 py-2">
        <FrontHeader />
        <div className="text-xl font-semibold mt-2">FrontdeskDashboard</div>
      </div>

      {/* Main Layout */}
      <div className="flex gap-4 px-4 py-2">
        {/* Table - 2/3 of the width */}
        <div className="w-2/3">
          <Table>
            <TableCaption className="px-4">A list of your recent invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Walk-in</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Downpayment</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Ref #</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            {/* Scrollable table body */}
            <ScrollArea className="h-[400px] w-full">
              <TableBody>
                {resvData.map((reservations, index) => (
                  <TableRow key={index}>
                    <TableCell>{reservations.booking_id}</TableCell>
                    <TableCell>{reservations.customers_walk_in_id === null ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      {reservations.customers_walk_in_id !== null
                        ? reservations.fullname
                        : reservations.customers_online_username}
                    </TableCell>
                    <TableCell>
                      {reservations.booking_status_name ?? "Pending"}
                    </TableCell>
                    <TableCell>₱{reservations.booking_downpayment}</TableCell>
                    <TableCell>{formatDateTime(reservations.booking_checkin_dateandtime)}</TableCell>
                    <TableCell>{formatDateTime(reservations.booking_checkout_dateandtime)}</TableCell>
                    <TableCell>{reservations.ref_num}</TableCell>
                    <TableCell>
                      <Button className="h-8 px-3 text-sm" onClick={() => editStatus(reservations)}>
                        <Ellipsis />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </ScrollArea>
          </Table>
        </div>

        {/* Card - 1/3 of the width */}
        <div className="w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card Description</CardDescription>
              <CardAction>Card Action</CardAction>
            </CardHeader>
            <CardContent>
              <p>Card Content</p>
            </CardContent>
            <CardFooter>
              <p>Card Footer</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  )
}

export default FrontdeskDashboard