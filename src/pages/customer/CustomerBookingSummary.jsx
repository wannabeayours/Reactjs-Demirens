import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import React, { useEffect } from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
function CustomerBookingSummary() {
  const [fname, setFname] = useState();
  useEffect(() => {
    const name = localStorage.getItem("fname");
    setFname(name || "WOW");
  }, []);



  return (
    <div className="flex items-center justify-center flex-col pt-14">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-semibold">Welcome, {fname}!</h1>
        <h3>Heres your current bill as of date</h3>
      </div>
      {/* <div className="w-6/12 flex justify-end ">
            <Button>Book Room</Button>
          </div> */}

     

          <Card className={"px-10 mt-10 w-full md:w-1/2 "}>
            <div>
              <h1 className="text-lg font-semibold ">Booking Information</h1>
              <h2>Check in date: </h2>
              <h2>Check out date: </h2>

            </div>
            <div>
              <h1 className="text-lg font-semibold ">Charges:</h1>
              <Table>
                <TableCaption>Your Current Bill.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead >Date</TableHead>
                    <TableHead className="w-[250px]" >Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Subtotal</TableHead>

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
  )
}

export default CustomerBookingSummary