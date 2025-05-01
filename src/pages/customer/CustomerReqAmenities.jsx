import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Table, TableBody, TableCell, TableCaption, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { Send } from 'lucide-react'
import React from 'react'


function CustomerReqAmenities() {
  return (
    <div className="flex items-center justify-center flex-col">
      <Card className={" px-10 mt-10 w-1/2"}>
      <div>
        <div>
        <h3 className=" mb-4 text-lg font-bold">Requested Amenities</h3>
        </div>
        <div className="flex justify-end">
        <Button> 
          <Send/>
          Request Amenities
        </Button>
        </div>

      </div>
      
        <Table>
          <TableCaption>A list of your requested Amenities.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Amenities</TableHead>
              <TableHead >Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
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
  )
}

export default CustomerReqAmenities