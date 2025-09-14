import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import React, { useEffect } from 'react'
import { useState } from 'react'
import { Book, Calendar, Users, DollarSign, SmileIcon, Clock } from 'lucide-react';
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

    <div className="flex flex-col w-full max-w-[1200px] mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between py-4 mb-2 border-b border-gray-200">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-2 text-[#113f67]">
          <Book className="w-5 h-5 sm:w-6 sm:h-6" />
          Booking Summary
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-sm sm:text-base text-gray-500 hidden sm:block">
            Manage your Booking Summary
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-3 px-2 sm:px-3 md:px-4">
        {data.length === 0 ? (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-row items-center justify-center text-center h-64 sm:h-80 gap-2 p-4 bg-[#f0f4f8] rounded-lg border border-[#d0e1f9]">
            <SmileIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#226597]" />
            <strong className="text-[#113f67] text-sm sm:text-base">No booking summary available</strong>
          </div>
        ) : (
          data.map((element, index) => (
            <div key={index}>
              <Card className="mt-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 rounded-lg overflow-hidden hover:border-[#226597]/30 hover:scale-[1.01]">
                <div className="bg-gradient-to-r from-[#113f67] to-[#226597] h-2"></div>
                <CardContent>
                  <CardTitle className="text-xl sm:text-2xl  text-[#113f67]">Booking #{index + 1}</CardTitle>
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between text-sm sm:text-base">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#113f67]" />
                        <Label className="font-medium text-gray-600">Check in:</Label>
                      </div>
                      <span className="text-right text-gray-800 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        {element.booking_checkin_dateandtime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm sm:text-base">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#113f67]" />
                        <Label className="font-medium text-gray-600">Check out:</Label>
                      </div>
                      <span className="text-right text-gray-800 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        {element.booking_checkout_dateandtime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm sm:text-base">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#113f67]" />
                        <Label className="font-medium text-gray-600">Guests:</Label>
                      </div>
                      <span className="text-right text-gray-800 font-medium">{element.guests_amnt}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm sm:text-base pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">

                        <Label className="font-medium text-gray-700">Total:</Label>
                      </div>
                      <span className="text-right font-bold text-[#113f67]">  ₱{Number(element.booking_totalAmount).toFixed(2)}</span>
                    </div>
                    <ViewBookingSummary getBookingSummary={getBookingSummary} bookingData={element} />

                  </div>
                </CardContent>
              </Card>

            </div>
          ))
        )}


      </div>

    </div >



  )
}

export default CustomerBookingSummary