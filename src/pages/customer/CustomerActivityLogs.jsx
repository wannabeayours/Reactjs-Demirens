import { Card, CardContent } from '@/components/ui/card'
import DataTable from '@/components/ui/data-table'
import axios from 'axios'
import { History } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

export const CustomerActivityLogs = () => {

 const [data, setData] = useState([]);

 const columns = [
  { header: 'Action Type', accessor: 'action_type' },
  { header: 'Action Category', accessor: 'action_category' },
  { header: 'Action Description', accessor: 'action_description' },
  { header: 'Date', accessor: 'created_at' },
 ]

 const getCustomerLogs = async () => {
  try {
   const url = localStorage.getItem("url") + "customer.php";
   const customerId = localStorage.getItem("userId");
   const jsonData = { customerId: customerId };
   const formData = new FormData();
   formData.append("operation", "getCustomerLogs");
   formData.append("json", JSON.stringify(jsonData));
   const res = await axios.post(url, formData);
   console.log("res", res);
   setData(res.data !== 0 ? res.data : []);
  } catch (error) {
   console.log(error);
   toast.error("Network Error");
  }
 }

 useEffect(() => {
  getCustomerLogs();
 }, []);

 return (
  <div className="flex flex-col w-full max-w-[1200px] mx-auto px-4 sm:px-6">
   <div className="flex items-center justify-between py-4 mb-2 border-b border-gray-200">
    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-2 text-[#113f67]">
     <History className="w-5 h-5 sm:w-6 sm:h-6" />
     Activity Logs
    </h1>
    <div className="flex items-center gap-4">
     <div className="text-sm sm:text-base text-gray-500 hidden sm:block">
      View your activity logs here
     </div>
    </div>
   </div>
   <Card>
    <CardContent>
     <DataTable columns={columns} data={data} itemsPerPage={5} autoIndex />
    </CardContent>
   </Card>
  </div>
 )
}
