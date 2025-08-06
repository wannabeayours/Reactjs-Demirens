import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight } from 'lucide-react'

const images = [
 "/assets/images/img1.jpg",
 "/assets/images/img2.jpg",
 "/assets/images/img3.jpg",
 "/assets/images/img4.jpg",
 "/assets/images/img5.jpg",
]
function RoomDialogs() {
 const [startIndex, setStartIndex] = useState(0)
 const [open, setOpen] = useState(false)
 const [currentIndex, setCurrentIndex] = useState(null)

 const handleNextSet = () => {
  if (startIndex + 3 < images.length) {
   setStartIndex(startIndex + 1)
  }
 }

 const handlePrevSet = () => {
  if (startIndex > 0) {
   setStartIndex(startIndex - 1)
  }
 }

 const handleDialogNext = () => {
  if (currentIndex < images.length - 1) {
   setCurrentIndex(currentIndex + 1)
  }
 }

 const handleDialogPrev = () => {
  if (currentIndex > 0) {
   setCurrentIndex(currentIndex - 1)
  }
 }

 return (
  <div className="relative w-[71%] mx-auto mb-10 mt-10">
   {/* Image Grid */}
   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[40vh] overflow-hidden">
    {images.slice(startIndex, startIndex + 3).map((img, i) => {
     const actualIndex = startIndex + i
     return (
      <Dialog key={actualIndex} open={open} onOpenChange={setOpen}>
       <DialogTrigger asChild>
        <img
         src={img}
         alt={`Room Image ${actualIndex + 1}`}
         onClick={() => {
          setOpen(true)
          setCurrentIndex(actualIndex)
         }}
         className="w-full h-full object-cover cursor-pointer rounded-lg hover:scale-105 transition"
        />
       </DialogTrigger>
       <DialogContent className="max-w-4xl w-full bg-transparent border-none p-0">
        <div className="relative">
         <img
          src={images[currentIndex]}
          alt="Preview"
          className="w-full h-auto rounded-lg object-contain max-h-[80vh]"
         />
         {/* Inside Dialog Arrows */}
         <button
          onClick={handleDialogPrev}
          disabled={currentIndex <= 0}
          className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/80 disabled:opacity-30"
         >
          <ChevronLeft size={28} />
         </button>
         <button
          onClick={handleDialogNext}
          disabled={currentIndex >= images.length - 1}
          className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/80 disabled:opacity-30"
         >
          <ChevronRight size={28} />
         </button>
        </div>
       </DialogContent>
      </Dialog>
     )
    })}
   </div>

   {/* Gallery Scroll Arrows */}
   <button
    onClick={handlePrevSet}
    disabled={startIndex === 0}
    className="absolute top-1/2 left-[-2rem] -translate-y-1/2 text-gray-500 hover:text-black disabled:opacity-30"
   >
    <ChevronLeft size={32} />
   </button>

   <button
    onClick={handleNextSet}
    disabled={startIndex + 3 >= images.length}
    className="absolute top-1/2 right-[-2rem] -translate-y-1/2 text-gray-500 hover:text-black disabled:opacity-30"
   >
    <ChevronRight size={32} />
   </button>
  </div>
 )
}

export default RoomDialogs