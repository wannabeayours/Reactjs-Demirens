import React, { useEffect, useMemo } from 'react'
import { useState } from 'react';
import axios from 'axios';

// Shad CN
import { toast } from 'sonner';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import DataTable from '@/components/ui/data-table';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input';

const TableResv = ({ filterDate }) => {
  const APIConn = `${localStorage.url}front-desk.php`;

  const [isLoading, setIsLoading] = useState(false);
  const [resvData, setResvData] = useState([]);

  const [searchRef, setSearchRef] = useState('');
  const [customerType, setCutomerType] = useState('All');
  const [statusType, setStatusType] = useState('All');


  const menuItems = {
    1: 'Checked-Out',
    2: 'Approved',
    3: 'Declined'
  }

  // API Connections
  const getBookings = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('method', 'viewReservations');

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

  const insertBookingStatus = async (id, status) => {
    const dataSummary = {
      booking_id: id,
      booking_status_id: Number(status)
    }

    console.log(dataSummary);
    const formData = new FormData();
    formData.append("method", "recordBookingStatus");
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

  // Filters
  const filteredData = useMemo(() => {
    return resvData.filter((row) => {
      const matchReference = 
       searchRef === '' || row.reference_no?.toLowerCase().includes(searchRef.toLowerCase());

      const matchesCustomer =
        customerType === "All" || row.customer_type === customerType;

      const matchesStatus =
        statusType === "All" || row.booking_status_name === statusType;

      return matchesCustomer && matchesStatus && matchReference;
    });
  }, [resvData, customerType, statusType, searchRef]);

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    const [date] = dateTime.split(' ');
    const newDate = new Date(date);

    return newDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    })
  }

  const resetUseState = () => {
    setIsLoading(false);
  }

  const columns = [
    { header: "Customer", accessor: "fullname", sortable: true },
    {
      header: "Customer Type", cell: (row) => (
        <p>{row.customer_type}</p>
      )
    },
    { header: "Status", accessor: "booking_status_name", },
    {
      header: "Downpayment", accessor: (row) => {
        const amount = Number(row?.booking_downpayment ?? 0);
        return (
          <p>
            {amount.toLocaleString('en-PH', {
              style: 'currency',
              currency: 'PHP',
            })}
          </p>
        );
      },
      sortable: true
    },

    { header: "Check in", accessor: (row) => <p>{formatDateTime(row.booking_checkin_dateandtime)}</p> },
    { header: "Check out", accessor: (row) => <p>{formatDateTime(row.booking_checkout_dateandtime)}</p> },
    { header: "Ref #", accessor: "reference_no" },
    {
      header: "Actions", cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger className='border rounded-md p-1'>Edit Status</DropdownMenuTrigger>
          <DropdownMenuContent>
            {
              Object.entries(menuItems).map(([index, item]) => (
                <DropdownMenuItem key={index} onClick={() => insertBookingStatus(row.booking_id, index)}>{item}</DropdownMenuItem>
              ))
            }
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  useEffect(() => {
    getBookings();
  }, [])

  return (
    <>
      <div>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger className="border px-4 py-2 rounded-md shadow-sm hover:bg-gray-100">
                Filter Customer Type
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setCutomerType('All')}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCutomerType('Walk-In')}>Walk-In</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCutomerType('Online')}>Online</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            <DropdownMenu>
              <DropdownMenuTrigger className="border px-4 py-2 rounded-md shadow-sm hover:bg-gray-100">
                Filter Status Type
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusType('All')}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusType('Checked-Out')}>Checked-Out</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusType('Approved')}>Approved</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusType('Decline')}>Decline</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            <Input
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              placeholder="Search Reference No."
              className="w-[200px] border px-3 py-2 rounded-md"
            />
          </div>
        </div>


        <ScrollArea className="h-[calc(100vh-300px)] w-full">
          <DataTable columns={columns} data={filteredData} itemsPerPage={5} autoIndex />
        </ScrollArea>

      </div>
    </>
  )
}

export default TableResv