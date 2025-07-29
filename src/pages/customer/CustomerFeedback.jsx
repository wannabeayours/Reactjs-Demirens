import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'
import React, { useState } from 'react'
import {
 Form,
 FormField,
 FormItem,
 FormLabel,
 FormControl,
 FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

const schema = z.object({
 review: z.string().min(1, { message: "NNOOO" }),
 hospitality: z.number().min(1, { message: "NNOOO" }),
 cleanliness: z.number().min(1, { message: "NNOOO" }),
 behavior: z.number().min(1, { message: "NNOOO" }),
 facilities: z.number().min(1, { message: "NNOOO" }),
 food: z.number().min(1, { message: "NNOOO" }),

})

function CustomerFeedback() {
 const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: {
   review: "",
   hospitality: 0,
   cleanliness: 0,
   behavior: 0,
   facilities: 0,
   food: 0,
  },
 })
 const onSubmit = async (values) => {

  try {
   const url = localStorage.getItem('url') + "customer.php";
   const CustomerId = localStorage.getItem("userId");
   const jsonData = {
    "customers_id" : CustomerId,
    "customersreviews": values.review,
    "customersreviews_hospitality_rate": values.hospitality,
    "customersreviews_behavior_rate": values.behavior,
    "customersreviews_facilities_rate": values.facilities,
    "customersreviews_cleanliness_rate" : values.cleanliness,
    "customersreviews_foods_rate" : values.food,
   }
   const formData = new FormData();
   formData.append("operation", "customerFeedBack");
   formData.append("json", JSON.stringify(jsonData));
   const res = await axios.post(url, formData); 
   console.log("res ni onSubmit", res);
   if(res.data === 1){
    toast.success("Feedback submitted successfully wowowowoowoowo");
   }
  } catch (error) {
   toast.error("Something went wrong");
   console.error(error);
  }
 }


 return (
  <div className="flex items-center justify-center flex-col ">
   <Card className={"px-10 mt-20 w-full md:w-1/2 bg-transparent"}>

    <CardContent>

     <div>
      <h1 className="text-lg font-bold flex justify-center underline mb-4">Rate your Experience with us!</h1>
      <Form {...form}>
       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
         control={form.control}
         name="review"
         render={({ field }) => (
          <FormItem>

           <FormControl>
            <Textarea rows={6} placeholder="Share your Experience with us!" {...field} />
           </FormControl>
           <FormMessage />
          </FormItem>
         )}
        />
        <FormField
         control={form.control}
         name="hospitality"
         render={({ field }) => (
          <FormItem>
           <FormControl>
            <div className='flex items-center space-x-2'>
             <FormLabel className="flex items-center text-md font-normal"><span>🤝</span>Hospitality:</FormLabel>
             <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((starValue) => (
               <Star
                key={starValue}
                className={cn(
                 "h-6 w-6 cursor-pointer transition-colors",
                 starValue <= field.value ? "fill-yellow-400 stroke-yellow-400" : "stroke-gray-400"
                )}
                onClick={() => field.onChange(starValue)}
               />
              ))}
             </div>
            </div>
           </FormControl>
           <FormMessage />
          </FormItem>
         )}
        />
        <FormField
         control={form.control}
         name="cleanliness"
         render={({ field }) => (
          <FormItem>
           <FormControl>
            <div className='flex items-center space-x-2'>
             <FormLabel className="flex items-center text-md font-normal"><span>🧹</span>Cleanliness:</FormLabel>
             <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((starValue) => (
               <Star
                key={starValue}
                className={cn(
                 "h-6 w-6 cursor-pointer transition-colors",
                 starValue <= field.value ? "fill-yellow-400 stroke-yellow-400" : "stroke-gray-400"
                )}
                onClick={() => field.onChange(starValue)}
               />
              ))}
             </div>
            </div>
           </FormControl>
           <FormMessage />
          </FormItem>
         )}
        />
        <FormField
         control={form.control}
         name="behavior"
         render={({ field }) => (
          <FormItem>
           <FormControl>
            <div className='flex items-center space-x-2'>
             <FormLabel className="flex items-center text-md font-normal"><span>😊</span>Behavior:</FormLabel>
             <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((starValue) => (
               <Star
                key={starValue}
                className={cn(
                 "h-6 w-6 cursor-pointer transition-colors",
                 starValue <= field.value ? "fill-yellow-400 stroke-yellow-400" : "stroke-gray-400"
                )}
                onClick={() => field.onChange(starValue)}
               />
              ))}
             </div>
            </div>
           </FormControl>
           <FormMessage />
          </FormItem>
         )}
        />
        <FormField
         control={form.control}
         name="facilities"
         render={({ field }) => (
          <FormItem>
           <FormControl>
            <div className='flex items-center space-x-2'>
             <FormLabel className="flex items-center text-md font-normal"><span>🏢</span>Facilities:</FormLabel>
             <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((starValue) => (
               <Star
                key={starValue}
                className={cn(
                 "h-6 w-6 cursor-pointer transition-colors",
                 starValue <= field.value ? "fill-yellow-400 stroke-yellow-400" : "stroke-gray-400"
                )}
                onClick={() => field.onChange(starValue)}
               />
              ))}
             </div>
            </div>
           </FormControl>
           <FormMessage />
          </FormItem>
         )}
        />
        <FormField
         control={form.control}
         name="food"
         render={({ field }) => (
          <FormItem>
           <FormControl>
            <div className='flex items-center space-x-2'>
             <FormLabel className="flex items-center text-md font-normal"><span>🍽️</span>Food:</FormLabel>
             <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((starValue) => (
               <Star
                key={starValue}
                className={cn(
                 "h-6 w-6 cursor-pointer transition-colors",
                 starValue <= field.value ? "fill-yellow-400 stroke-yellow-400" : "stroke-gray-400"
                )}
                onClick={() => field.onChange(starValue)}
               />
              ))}
             </div>
            </div>
           </FormControl>
           <FormMessage />
          </FormItem>
         )}
        />
        <Button type="submit">Submit</Button>

       </form>
      </Form>
     </div>


    </CardContent>

   </Card>
  </div>
 )
}

export default CustomerFeedback