
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import React from 'react'

function RoomsList() {
 return (
  <>
   <Sheet>
    <SheetTrigger asChild>
     <Button>Add Room</Button>
    </SheetTrigger>
    <SheetContent side="bottom">
     <h1>Rooms List</h1>
    </SheetContent>
   </Sheet>
  </>
 )
}

export default RoomsList