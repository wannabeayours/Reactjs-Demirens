import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

function CustomerRooms() {
  return (
    <div>

      <section className="flex items-center justify-center h-screen bg-gray-100">
        <h1 className="text-4xl font-bold">Rooms</h1>
      </section>


      <section className="flex items-center justify-center py-20 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 w-full ">
          <div className="mb-4 ">
            <Card>
              <CardHeader>
                <CardTitle>Room 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Room 1 Description</p>
              </CardContent>
            </Card>
          </div>
          <div className="mb-4 ">
            <Card>
            <CardHeader>
                <CardTitle>Room 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Room 1 Description</p>
              </CardContent>
            </Card>
          </div>
          <div className="mb-4 ">
            <Card>
            <CardHeader>
                <CardTitle>Room 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Room 1 Description</p>
              </CardContent>
            </Card>
          </div>
          <div className="mb-4 ">
            <Card>
            <CardHeader>
                <CardTitle>Room 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Room 1 Description</p>
              </CardContent>
            </Card>
          </div>
          <div className="mb-4 ">
            <Card>
            <CardHeader>
                <CardTitle>Room 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Room 1 Description</p>
              </CardContent>
            </Card>
          </div>
          <div className="mb-4 ">
            <Card>
            <CardHeader>
                <CardTitle>Room 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Room 1 Description</p>
              </CardContent>
            </Card>
          </div>
          <div className="mb-4 ">
            <Card>
            <CardHeader>
                <CardTitle>Room 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Room 1 Description</p>
              </CardContent>
            </Card>
          </div>
          <div className="mb-4 ">
            <Card>
            <CardHeader>
                <CardTitle>Room 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Room 1 Description</p>
              </CardContent>
            </Card>
          </div>
        </div>




      </section>
    </div>
  )
}

export default CustomerRooms