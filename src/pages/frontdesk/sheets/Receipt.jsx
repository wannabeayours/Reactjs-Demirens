import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useMemo } from 'react';
import {
 Sheet,
 SheetContent,
 SheetDescription,
 SheetHeader,
 SheetTitle,
 SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button';

const Receipt = () => {
 const [personDetails, setPersonDetails] = useState([]);
 const [chosenRooms, setChosenRooms] = useState([]);


 const submitWalkIn = async () => {
  console.log('Personal: ', personDetails);
  console.log('Room List: ', chosenRooms);
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

 useEffect(() => {
  const personalDetails = localStorage.getItem('personalDetails');
  const roomList = localStorage.getItem('roomList');

  setPersonDetails(personalDetails);
  setChosenRooms(roomList);


  localStorage.removeItem('personalDetails');
  localStorage.removeItem('roomList');
 }, [])
 return (
  <>
   <div>
    <Sheet>
     <SheetTrigger asChild className='bg-blue-500 btn'>
      <Button>
       Show Receipt
      </Button>
     </SheetTrigger>
     <SheetContent>
      <SheetHeader>
       <SheetTitle>Are you absolutely sure?</SheetTitle>
       <SheetDescription>

        <Button onClick={() => submitWalkIn()}>Show Details</Button>

       </SheetDescription>
      </SheetHeader>
     </SheetContent>
    </Sheet>
   </div>
  </>
 )
}

export default Receipt
