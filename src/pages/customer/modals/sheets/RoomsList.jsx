import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

/**
 * RoomsList
 * Props:
 *  - selectedRooms: array of selected room objects (each must include room_type or roomtype_id)
 *  - setSelectedRooms: setter to update selectedRooms
 */
function RoomsList({ selectedRooms, setSelectedRooms }) {
  const [open, setOpen] = useState(false)
  const [availableRooms, setAvailableRooms] = useState([])
  const fetchedRoomsRef = useRef([]) // cached rooms from backend
  const LS_KEY = 'demiren_room_decrements' // localStorage key

  // --- Utilities ---

  // Build decremented counts from selectedRooms (source of truth)
  const buildDecrementFromSelected = (selRooms) => {
    const map = {}
    if (Array.isArray(selRooms)) {
      selRooms.forEach((s) => {
        // support either room_type or roomtype_id
        const id = s.room_type ?? s.roomtype_id
        if (!id) return
        map[id] = (map[id] || 0) + 1
      })
    }
    return map
  }

  // Save to localStorage
  const saveDecrementsToLS = (map) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(map))
    } catch (e) {
      console.warn('Could not save decrements to localStorage', e)
    }
  }

  // Read from localStorage (fallback)
  const readDecrementsFromLS = () => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) return {}
      return JSON.parse(raw)
    } catch (e) {
      return {}
    }
  }

  // Apply decrements (map) to the fetchedRoomsRef and update availableRooms state
  const applyDecrementsAndSet = (decrementMap) => {
    if (!Array.isArray(fetchedRoomsRef.current)) {
      setAvailableRooms([])
      return
    }

    const adjusted = fetchedRoomsRef.current
      .map((r) => {
        const dec = decrementMap[r.roomtype_id] || 0
        const newCount = Math.max(0, (r.available_count || 0) - dec)
        return { ...r, available_count: newCount }
      })
      .filter((r) => r.available_count > 0)

    setAvailableRooms(adjusted)
  }

  // --- Add a room (user clicked Add Room) ---
  const handleBookedRoom = (room) => {
    // create the selected room object (same shape you used previously)
    const selectionKey = `${room.roomtype_id}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    const selectedObj = {
      roomtype_capacity: room.roomtype_capacity,
      room_type: room.roomtype_id,
      roomtype_price: room.roomtype_price,
      roomtype_description: room.roomtype_description,
      roomtype_name: room.roomtype_name,
      roomtype_maxbeds: room.roomtype_maxbeds,
      selectionKey: selectionKey,
    }

    // Update selectedRooms (parent state)
    setSelectedRooms((prev) => {
      const next = Array.isArray(prev) ? [...prev, selectedObj] : [selectedObj]

      // Rebuild decrements from new selected array and persist
      const decMap = buildDecrementFromSelected(next)
      saveDecrementsToLS(decMap)
      // Update displayed availability immediately
      applyDecrementsAndSet(decMap)

      return next
    })

    setOpen(false)
  }

  // --- fetch available rooms from backend once ---
  const getRooms = async () => {
    try {
      const url = localStorage.getItem('url') + 'customer.php'
      const jsonData = {
        checkIn: localStorage.getItem('checkIn'),
        checkOut: localStorage.getItem('checkOut'),
        guestNumber: 0,
      }

      const formData = new FormData()
      formData.append('operation', 'getAvailableRoomsWithGuests')
      formData.append('json', JSON.stringify(jsonData))

      const response = await axios.post(url, formData)
      const res = response.data
      // Expecting res to be an array or 0
      if (res !== 0 && Array.isArray(res)) {
        const filtered = res.filter((r) => r.status_id === 3)

        // cache the original fetch results (we will always derive display from this)
        fetchedRoomsRef.current = filtered.map((r) => ({
          ...r,
          // ensure available_count exists (defensive)
          available_count: Number(r.available_count || 0),
        }))

        // Use selectedRooms (if any) as source of truth for decrements, else fallback to LS
        const decFromSelected = buildDecrementFromSelected(selectedRooms)
        const dec =
          Object.keys(decFromSelected).length > 0
            ? decFromSelected
            : readDecrementsFromLS()

        // persist back (keeps LS in sync)
        saveDecrementsToLS(dec)
        applyDecrementsAndSet(dec)
      } else {
        fetchedRoomsRef.current = []
        setAvailableRooms([])
      }
    } catch (err) {
      console.error('Error fetching rooms:', err)
      toast.error('Something went wrong fetching rooms')
    }
  }

  // --- On mount: fetch once ---
  useEffect(() => {
    getRooms()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Reapply decrements whenever selectedRooms prop changes ---
  useEffect(() => {
    // rebuild decrement map from selectedRooms (authoritative)
    const decMap = buildDecrementFromSelected(selectedRooms)
    saveDecrementsToLS(decMap)
    applyDecrementsAndSet(decMap)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRooms])

  // --- When sheet opens, ensure display fresh (reapply using cached fetch + LS or selectedRooms) ---
  useEffect(() => {
    if (!open) return
    // prefer selectedRooms as source-of-truth, else LS
    const decFromSelected = buildDecrementFromSelected(selectedRooms)
    const dec = Object.keys(decFromSelected).length > 0 ? decFromSelected : readDecrementsFromLS()
    applyDecrementsAndSet(dec)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // --- Render ---
  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button>Add Room</Button>
        </SheetTrigger>

        <SheetContent side="bottom" className="rounded-t-3xl bg-blue-50">
          <ScrollArea className="md:h-[calc(100vh-200px)] h-[100vh]">
            {availableRooms.length > 0 ? (
              availableRooms.map((rooms, index) => (
                <div key={rooms.roomtype_id ?? index}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
                    {/* Images */}
                    <div className="flex justify-center">
                      {rooms.images && rooms.images.length > 0 ? (
                        <Carousel className="w-full max-w-xs">
                          <CarouselContent>
                            {rooms.images.map((room, idx) => (
                              <CarouselItem key={idx}>
                                <div className="p-1">
                                  <Card>
                                    <CardContent className="flex aspect-square items-center justify-center p-4">
                                      <div className="w-full h-80 overflow-hidden">
                                        <img
                                          src={
                                            localStorage.getItem('url') +
                                            'images/' +
                                            room.imagesroommaster_filename
                                          }
                                          alt={`Room ${idx + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="ml-4" />
                          <CarouselNext className="mr-4" />
                        </Carousel>
                      ) : (
                        <Card>
                          <CardContent className="flex aspect-square items-center justify-center p-4">
                            <p className="text-center">No image available</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <h1 className="font-semibold text-2xl">{rooms.roomtype_name}</h1>
                      <h1>{rooms.roomtype_description}</h1>
                      <h1 className="font-semibold text-blue-500">
                        ₱ {rooms.roomtype_price}
                      </h1>
                      <h1 className="text-sm text-gray-500">
                        {rooms.available_count} available
                      </h1>
                    </div>

                    {/* Add */}
                    <div className="relative h-full">
                      <Button
                        className="absolute bottom-0 right-0 m-4"
                        onClick={() => handleBookedRoom(rooms)}
                        disabled={rooms.available_count <= 0}
                      >
                        Add Room
                      </Button>
                    </div>
                  </div>
                  <Separator className="my-4" />
                </div>
              ))
            ) : (
              <div className="text-center p-4">
                <p className="text-sm text-muted-foreground">No available rooms</p>
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default RoomsList
