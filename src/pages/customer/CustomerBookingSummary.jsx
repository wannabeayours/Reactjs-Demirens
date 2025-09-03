import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import React, { useEffect } from 'react'
import { useState } from 'react'
import { Book, SmileIcon } from 'lucide-react';
import RequestAmenities from './modals/sheets/RequestAmenities';
import { toast } from 'sonner';
import axios from 'axios';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import ViewBookingSummary from './modals/sheets/ViewBookingSummary';


function CustomerBookingSummary() {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [data, setData] = useState([]);


  useEffect(() => {
    const fname = localStorage.getItem("fname");
    const lname = localStorage.getItem("lname");
    setFname(fname);
    setLname(lname);
  }, []);


  const getBookingSummary = async () => {
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const CustomerId = localStorage.getItem("userId");
      const jsonData = { booking_customer_id: CustomerId };
      const formData = new FormData();
      formData.append("operation", "getBookingSummary");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      setData(res.data);
      console.log("res ni booking summary", res);
    } catch (error) {
      toast.error("Network Error");
      console.log(error);

    }
  }

  useEffect(() => {
    getBookingSummary();
  }, [])




  return (

    <div className="flex  flex-col ">

      <div className="flex items-center pl-4">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <Book className="w-6 h-6" />
          Booking Summary of {fname} {lname}
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {data.length === 0 ? (
         <div className="col-span-full flex flex-row items-center justify-center text-center h-96 gap-2">
         <SmileIcon className="w-10 h-10" />
         <strong>No booking summary available</strong>
       </div>
        ) : (
          data.map((element, index) => (
            <div key={index}>
              <Card>
                <CardContent>
                  <CardTitle className="text-2xl">Booking #{index + 1}</CardTitle>
                  <div className="flex items-center justify-between">
                    <Label>Check in :</Label>
                    {element.booking_checkin_dateandtime}
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Check out :</Label>
                    {element.booking_checkout_dateandtime}
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Guests :</Label>
                    {element.guests_amnt}
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Booking Total Amount :</Label>
                    ₱{element.booking_totalAmount}
                  </div>

                </CardContent>
                <CardFooter className="flex justify-end">
                  <ViewBookingSummary bookingData = {element}/>
                </CardFooter>
              </Card>

            </div>
          ))
        )}


      </div>

    </div>

  )
}

export default CustomerBookingSummary