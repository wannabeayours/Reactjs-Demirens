import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Bath, BedDouble, BedDoubleIcon, Send, ToiletIcon } from 'lucide-react'
import React, { useState } from 'react'

const amenities = [
 "Extra Bed",
 "Extra Pillow",
 "Extra Bed",
 "Extra Pillow",
 "Extra Bed",
 "Extra Pillow",
 "Extra Bed",
 "Extra Pillow",
];

function RequestAmenities() {
 const [open, setOpen] = useState(false)
 return (
  //wala pani nahuman kay layo kayong gap sa checkbox and everything og wapasay backend ani
  //sa current booking pud mangutana sa dayun if katong "currentbooking" sa php kay mao banang sa booking summary
  <>

   <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger asChild>
     <Button className="bg-[#FDF5AA] hover:bg-yellow-600">
      <Send className="mr-2 text-black" />
      <h1 className=" text-black">Request Amenities</h1>
     </Button>
    </SheetTrigger>

    <SheetContent side="right" className="rounded-2xl bg-[#34699A] border-none">
     <SheetHeader>
      <SheetTitle className="text-white">Request Amenities</SheetTitle>
     </SheetHeader>

     <div className="mt-4 px-4">


      {/* Aligned checkbox + icon + label */}
      <div className="flex flex-col gap-10 text-white">
       {amenities.map((item, index) => (
        <div key={index} className="grid grid-cols-[auto_auto_1fr] items-center gap-3">
         <Input type="checkbox" className="w-5 h-5 accent-[#FDF5AA] rounded-full"  />
         <BedDouble className="w-5 h-5" />
         <span className="text-sm">{item}</span>
        </div>
       ))}
      </div>

      {/* Large remarks input */}
      <textarea
       placeholder="Add notes here..."
       className="mt-6 w-full h-24 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FDF5AA]"
      />

      <Button className="w-full mt-4 bg-[#FDF5AA] hover:bg-yellow-600 text-black font-semibold">
       Submit Request
      </Button>
     </div>
    </SheetContent>
   </Sheet>
  </>
 )
}

export default RequestAmenities