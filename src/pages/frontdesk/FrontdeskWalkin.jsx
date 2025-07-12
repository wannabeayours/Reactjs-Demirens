"use client"
import React, { useEffect } from 'react'
import FrontHeader from '@/components/layout/FrontHeader'
import { useState } from 'react'
import axios from 'axios'

// Page
import ChooseRooms from './sheets/ChooseRooms'

// ShadCN
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import DatePicker from '@/components/ui/date-picker'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


const walkin_Scema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().min(),
  phone_no: z.string().min(),

  downPay: z.string().transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: "Downpayment must be a valid number and not negative",
    }),
  checkIn: z.string(),
  checkOut: z.string()
})

function FrontdeskWalkin({ }) {
  const APIConn = `${localStorage.url}front-desk.php`;

  const [isLoading, setIsLoading] = useState(false);
  const [roomsList, setRoomsList] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);

  const customerInfo = useForm({
    resolver: zodResolver(walkin_Scema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_no: "",

      downPay: 0,
      checkIn: "",
      checkOut: "",
    }
  })

  const submitWalkIn = async (values) => {
    console.log(values);
    // setIsLoading(true);
    // const jsonData = {
    //   customers_walk_in_fname,
    //   customers_walk_in_lname,
    //   customers_walk_in_email,
    //   customers_walk_in_phone_number,

    //   booking_downpayment,
    //   booking_checkin_dateandtime,
    //   booking_checkout_dateandtime,

    //   booking_id,
    //   roomtype_id
    // }
    // const addCustForm = new FormData();
    // addCustForm.append('method', 'customer-walkIn');
    // addCustForm.append('json', JSON.stringify(jsonData));

    // console.log(addCustForm);
    // try {
    //   const conn = await axios.post(APIConn, addCustForm);
    //   if (conn.data) {
    //     toast('Successfully Added Walk-In');
    //   }
    // } catch (err) {
    //   toast('Failed to Add Customer');
    // } finally {
    //   setIsLoading(true);
    // }
  }

  

  return (
    <>
      <div className="px-4 py-2">
        <FrontHeader />
        <div className="text-xl font-semibold mt-2">FrontDeskWalkin Page</div>
      </div>

      {/* Main Form Layout */}
      <div className="px-4 py-2">
        <Form {...customerInfo}>
          <form
            onSubmit={customerInfo.handleSubmit(submitWalkIn)}
            className="grid grid-cols-2 gap-8"
          >
            {/* Column 1: Personal Details + Booking Details */}
            <div className="space-y-8">
              {/* Personal Details */}
              <div className="space-y-4">
                <p className="font-bold text-lg">Personal Details</p>
                <FormField
                  control={customerInfo.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={customerInfo.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={customerInfo.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="example@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={customerInfo.control}
                  name="phone_no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="09XXXXXXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Booking Details */}
              <div className="space-y-4">
                <p className="font-bold text-lg">Booking Details</p>
                <FormField
                  control={customerInfo.control}
                  name="downPay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Downpayment</FormLabel>
                      <FormControl>
                        <Input placeholder="₱0.00" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={customerInfo.control}
                  name="checkIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DatePicker
                          form={customerInfo}
                          name={field.name}
                          label="Check-In"
                          pastAllowed={false}
                          futureAllowed={true}
                          withTime={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={customerInfo.control}
                  name="checkOut"
                  render={({ field }) => (
                    <FormItem>
                      <DatePicker
                        form={customerInfo}
                        name={field.name}
                        label="Check-Out"
                        pastAllowed={false}
                        futureAllowed={true}
                        withTime={true}
                      />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Column 2: Just the Add Room Button */}
            <div className="flex items-start justify-center pt-8 w-full">
              <div className="w-full max-w-sm">
                {/* Might change the card into div *Remember* */}
                <Card>
                  <CardHeader>
                    <CardTitle>Room Summary</CardTitle>
                    <CardDescription>Quick view of added room(s)</CardDescription>
                    <CardAction>Card Action</CardAction>
                  </CardHeader>
                  <CardContent>
                    <p>Room details or content here...</p>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <ChooseRooms />
                  </CardFooter>
                </Card>
              </div>
            </div>


          </form>
        </Form>
      </div >
    </>

  )
}

export default FrontdeskWalkin