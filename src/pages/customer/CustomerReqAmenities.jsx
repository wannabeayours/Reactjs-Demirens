import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableCaption, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Send, Package } from 'lucide-react'
import React, { useState } from 'react'
import RequestAmenities from './modals/sheets/RequestAmenities'


function CustomerReqAmenities() {
  // State to track if there are any amenity requests (for demo purposes)
  const [hasAmenityRequests, setHasAmenityRequests] = useState(true);

  return (
    <div className="flex flex-col w-full max-w-[1200px] mx-auto px-4 sm:px-6">

      <div className="flex items-center justify-between py-4 mb-2 border-b border-gray-200">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-2 text-[#113f67]">
          <Send className="w-5 h-5 sm:w-6 sm:h-6" />
          Request Amenities
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-sm sm:text-base text-gray-500 hidden sm:block">
            Manage your amenity requests
          </div>
          <RequestAmenities />
        </div>
      </div>
      <div className="flex items-center justify-center flex-col w-full">
        <Card className={"px-4 sm:px-6 md:px-10 py-6 mt-8 sm:mt-10 w-full bg-white rounded-lg border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300"}>
          <div className="mb-6 pb-2 border-b border-gray-100">
            <h2 className="text-lg sm:text-xl font-medium text-gray-800">Requested Amenities</h2>
          </div>
          {/* <div >

            <div className="flex justify-end">


              <RequestAmenities />

            </div>

          </div> */}

          {hasAmenityRequests ? (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption className="text-sm sm:text-base text-gray-500 mt-4">A list of your requested amenities.</TableCaption>
                <TableHeader>
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="w-[200px] sm:w-[250px] py-3 text-sm sm:text-base font-medium text-gray-700">Amenities</TableHead>
                    <TableHead className="py-3 text-sm sm:text-base font-medium text-gray-700">Date</TableHead>
                    <TableHead className="py-3 text-sm sm:text-base font-medium text-gray-700">Total</TableHead>
                    <TableHead className="text-right py-3 text-sm sm:text-base font-medium text-gray-700">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-gray-50">
                    <TableCell className="py-4 text-sm sm:text-base font-medium text-gray-900">Towel</TableCell>
                    <TableCell className="py-4 text-sm sm:text-base text-gray-700">2025-04-01</TableCell>
                    <TableCell className="py-4 text-sm sm:text-base text-gray-700">₱450.00</TableCell>
                    <TableCell className="text-right py-4">
                      <Badge variant="secondary" className="text-xs sm:text-sm px-2 py-1 bg-amber-100 text-amber-800 hover:bg-amber-200">Pending</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-gray-50">
                    <TableCell className="py-4 text-sm sm:text-base font-medium text-gray-900">Extra Bed</TableCell>
                    <TableCell className="py-4 text-sm sm:text-base text-gray-700">2025-04-01</TableCell>
                    <TableCell className="py-4 text-sm sm:text-base text-gray-700">₱500.00</TableCell>
                    <TableCell className="text-right py-4">
                      <Badge variant="secondary" className="text-xs sm:text-sm px-2 py-1 bg-amber-100 text-amber-800 hover:bg-amber-200">Pending</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Package className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg sm:text-xl font-medium text-gray-700 mb-2">No Amenity Requests</h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-md">
                You haven't requested any amenities yet. Use the request button to add amenities to your booking.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default CustomerReqAmenities