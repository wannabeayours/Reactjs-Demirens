import React, { useState } from 'react'
import {
 Sheet,
 SheetContent,
 SheetDescription,
 SheetHeader,
 SheetTitle,
 SheetTrigger,
} from "@/components/ui/sheet"
import { X } from 'lucide-react';

const FilterTags = () => {
 const [tags, setTags] = useState([]);

 return (
  <>
   <Sheet>
    <SheetTrigger className='bg-blue-500 text-black px-2 py-1 rounded'>Filter Tags</SheetTrigger>
    <SheetContent>
     <SheetHeader>
      <SheetTitle>Tags</SheetTitle>
      <SheetDescription>
       <div className='mt-4'>

        <span className='inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-sm rounded-full'>
         <p>Tag</p>
         <X 
         className='h-4 w-4 cursor-pointer text-red-500'
         onClick={() => console.log('remove tag')}/>
        </span>

       </div>
      </SheetDescription>
     </SheetHeader>
    </SheetContent>
   </Sheet>
  </>
 )
}

export default FilterTags
