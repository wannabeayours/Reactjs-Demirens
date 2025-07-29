import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import React, { useEffect } from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import CustomerLayout from '@/components/layout/CustomerHeader';
import { Book } from 'lucide-react';
function CustomerBookingSummary() {
  const [fname, setFname] = useState();
  useEffect(() => {
    const name = localStorage.getItem("fname");
    setFname(name || "WOW");
  }, []);



  return (

    <div className="flex  flex-col ">

      <div className="flex items-center pl-4">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <Book className="w-6 h-6" />
          Booking Summary of {fname}
        </h1>
      </div>
      <div className="flex items-center justify-center flex-col ">
        <Card className={"px-10 mt-20 w-full md:w-1/2  bg-[#34699A] border-none shadow-xl"}>
          <div className="text-white p-2">
            <h1 className="text-lg font-semibold ">Booking Information</h1>
            <h2>Check in date: </h2>
            <h2>Check out date: </h2>

          </div>
        </Card>
        <Card className={"px-10 mt-6 w-full md:w-1/2 bg-transparent border-none "}>

          <div className="text-white" >
            <h1 className="text-lg font-semibold ">Charges:</h1>
            <Table  >
              <TableCaption>Your Current Bill.</TableCaption>
              <TableHeader >
                <TableRow>
                  <TableHead className="text-white" >Date</TableHead>
                  <TableHead className="w-[250px] text-white" >Description</TableHead>
                  <TableHead className="text-white">Quantity</TableHead>
                  <TableHead className="text-white">Price</TableHead>
                  <TableHead className="text-white">Subtotal</TableHead>

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