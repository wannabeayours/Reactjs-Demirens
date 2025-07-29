import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableCaption, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Send } from 'lucide-react'
import React from 'react'
import RequestAmenities from './modals/sheets/RequestAmenities'


function CustomerReqAmenities() {
  return (
    <div className="flex  flex-col ">

      <div className="flex items-center pl-4">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <Send className="w-6 h-6" />
          Request Amenities
        </h1>
      </div>
      <div className="flex items-center justify-center flex-col ">
        <Card className={" px-10  w-1/2 mt-20 bg-transparent shadow-xl "}>
          <div >
          
            <div className="flex justify-end">


              <RequestAmenities />

            </div>

          </div>

          <Table>
            <TableCaption>A list of your requested Amenities.</TableCaption>
            <TableHeader >
              <TableRow>
                <TableHead className="w-[250px] text-white">Amenities</TableHead>
                <TableHead className="text-white">Date</TableHead>
                <TableHead className="text-white">Total</TableHead>
                <TableHead className="text-right text-white">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="text-white">
                <TableCell >Towel, Extra Bed</TableCell>
                <TableCell>2025-04-01</TableCell>
                <TableCell>₱450.00</TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">Pending</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}

export default CustomerReqAmenities