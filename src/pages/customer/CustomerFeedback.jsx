import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import React, { useState } from 'react'

function CustomerFeedback() {

 return (
  <div className="flex items-center justify-center flex-col ">
   <Card className={"px-10 mt-10 w-full md:w-1/2"}>

    <CardContent>

     <div>
      <h1 className="text-lg font-bold flex justify-center underline">Rate your Experience with us!</h1>
     </div>
     <div className="p-3">
      <div className='p-4'>
       <textarea
        placeholder="Share your experience with us"
        rows={6}
        className="w-full mt-4 p-4 border border-gray-300 rounded-xl shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-green-600 resize-none bg-transparent"
       />
      </div>
      <div className="mt-4">
       <p> <span>🤝</span>Hospitality: </p>
      </div>
      <div className="mt-4">
       <p> <span>🧹</span>Cleanliness: </p>
      </div>
      <div className="mt-4">
       <p><span>😊</span>Behavior: </p>
      </div>
      <div className="mt-4">
       <p><span>🏢</span>Facilities: </p>
      </div>
      <div className="mt-4">
       <p><span>🍽️</span>Food: </p>
      </div>
     </div>

    </CardContent>
    <Button>Submit</Button>
   </Card>
  </div>
 )
}

export default CustomerFeedback