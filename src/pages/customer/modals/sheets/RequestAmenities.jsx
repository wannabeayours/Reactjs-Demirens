import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Bath, BedDouble, BedDoubleIcon, Send, ToiletIcon } from 'lucide-react'
import React, { useState } from 'react'

function RequestAmenities() {
 const [open, setOpen] = useState(false)
 return (
  //wala pani nahuman kay layo kayong gap sa checkbox and everything og wapasay backend ani
  //sa current booking pud mangutana sa dayun if katong "currentbooking" sa php kay mao banang sa booking summary
  <>

   <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger asChild>
     <Button className="w-full">
      <Send className="mr-2" />
      Request Amenities
     </Button>
    </SheetTrigger>

    <SheetContent side="bottom">
     <SheetHeader>
      <SheetTitle>Request Amenities</SheetTitle>
     </SheetHeader>

     <div className="mt-4 px-4">
      <Card className="shadow-lg">
       <CardContent className="p-6">
        {/* Grid with 2 columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
         <Label className="flex items-center space-x-2">
          <Input type="checkbox" className="text-green-600" />
          <BedDouble className="w-5 h-5" />
          <span>Extra Bed</span>
         </Label>

         <Label className="flex items-center space-x-2">
          <Input type="checkbox" className="text-green-600" />
          <BedDouble className="w-5 h-5" />
          <span>Extra Pillow</span>
         </Label>

         <Label className="flex items-center space-x-2">
          <Input type="checkbox" className="text-green-600" />
          <BedDouble className="w-5 h-5" />
          <span>Extra Bed</span>
         </Label>

         <Label className="flex items-center space-x-2">
          <Input type="checkbox" className="text-green-600" />
          <BedDouble className="w-5 h-5" />
          <span>Extra Pillow</span>
         </Label>

         <Label className="flex items-center space-x-2">
          <Input type="checkbox" className="text-green-600" />
          <BedDouble className="w-5 h-5" />
          <span>Extra Bed</span>
         </Label>

         <Label className="flex items-center space-x-2">
          <Input type="checkbox" className="text-green-600" />
          <BedDouble className="w-5 h-5" />
          <span>Extra Pillow</span>
         </Label>

         <Label className="flex items-center space-x-2">
          <Input type="checkbox" className="text-green-600" />
          <BedDouble className="w-5 h-5" />
          <span>Extra Bed</span>
         </Label>

         <Label className="flex items-center space-x-2">
          <Input type="checkbox" className="text-green-600" />
          <BedDouble className="w-5 h-5" />
          <span>Extra Pillow</span>
         </Label>
        </div>

        <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
         Submit Request
        </Button>
       </CardContent>
      </Card>
     </div>
    </SheetContent>
   </Sheet>
  </>
 )
}

export default RequestAmenities