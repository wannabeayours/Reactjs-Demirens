import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import React, { useEffect } from 'react'
import { useState } from 'react'


import { Book } from 'lucide-react';
import RequestAmenities from './modals/sheets/RequestAmenities';
function CustomerBookingSummary() {
  const [fname, setFname] = useState();
  const [lname, setLname] = useState();
  useEffect(() => {
    const fname = localStorage.getItem("fname");
    const lname = localStorage.getItem("lname");
    setFname(fname || "WOW");
    setLname(lname || "WOW");
  }, []);



  return (

    <div className="flex  flex-col ">

      <div className="flex items-center pl-4">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <Book className="w-6 h-6" />
          Booking Summary of {fname} {lname}
        </h1>
      </div>
      <div className="flex items-center justify-center flex-col ">
        <Card className={"px-10 mt-20 w-full md:w-1/2  shadow-xl"}>
          <div className="text-black p-2">
            <h1 className="text-lg font-semibold ">Booking Information</h1>
            <h2>Room Type: </h2>
            <h2>Check in date: </h2>
            <h2>Check out date: </h2>

          </div>
          <div >

            <div className="flex justify-end">


              <RequestAmenities />

            </div>

          </div>
        </Card>
        <Card className={"px-10 mt-6 w-full md:w-1/2 bg-transparent border-none "}>

          <div className="text-black" >
            <h1 className="text-lg font-semibold ">Charges:</h1>
            <Table  >
              <TableCaption>Your Current Bill.</TableCaption>
              <TableHeader >
                <TableRow>
                  <TableHead className="text-black" >Date</TableHead>
                  <TableHead className="text-black" >Room Type</TableHead>
                  <TableHead className="w-[250px] text-black" >Description</TableHead>
                  <TableHead className="text-black">Quantity</TableHead>
                  <TableHead className="text-black">Price</TableHead>
                  <TableHead className="text-black">Subtotal</TableHead>

                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>

                </TableRow>
              </TableBody>
            </Table>

          </div>
        </Card>
      </div>

    </div>

  )
}

export default CustomerBookingSummary