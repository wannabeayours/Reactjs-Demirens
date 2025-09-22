import React from 'react';
import { X, Filter } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const AdvancedFiltersSheet = ({ open, onOpenChange, onApplyFilters }) => {
  const [roomStatus, setRoomStatus] = React.useState("");
  const [roomType, setRoomType] = React.useState("");
  const [priceRange, setPriceRange] = React.useState([0, 5000]);
  const [selectedFloors, setSelectedFloors] = React.useState([]);

  // Sample room statuses
  const roomStatuses = ["All", "Vacant", "Occupied", "Under-Maintenance", "Dirty"];
  
  // Sample room types
  const roomTypes = ["All", "Single Room", "Double Room", "Standard Twin Room", "Deluxe Room", "Suite"];
  
  // Sample floors
  const floors = [1, 2, 3, 4, 5];

  const handleFloorChange = (floor) => {
    setSelectedFloors((prev) => {
      if (prev.includes(floor)) {
        return prev.filter((f) => f !== floor);
      } else {
        return [...prev, floor];
      }
    });
  };

  const handleApply = () => {
    onApplyFilters({
      roomStatus,
      roomType,
      priceRange,
      selectedFloors,
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setRoomStatus("");
    setRoomType("");
    setPriceRange([0, 5000]);
    setSelectedFloors([]);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:max-w-md p-0 overflow-y-auto">
        <div className="p-6 bg-blue-50 dark:bg-blue-950 sticky top-0 z-10">
          <SheetHeader className="mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <SheetTitle className="text-blue-800 dark:text-blue-300">Advanced Filters</SheetTitle>
              </div>
              <SheetClose className="rounded-full p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
                <X className="h-4 w-4" />
              </SheetClose>
            </div>
            <SheetDescription className="text-blue-700 dark:text-blue-400">
              Filter rooms by status, type, price, and floor
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Room Status Filter */}
          <div className="space-y-3">
            <Label htmlFor="room-status" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Room Status
            </Label>
            <Select value={roomStatus} onValueChange={setRoomStatus}>
              <SelectTrigger id="room-status" className="w-full border-gray-300 dark:border-gray-600 focus:ring-blue-500">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {roomStatuses.map((status) => (
                  <SelectItem key={status} value={status.toLowerCase()}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="my-4" />

          {/* Room Type Filter */}
          <div className="space-y-3">
            <Label htmlFor="room-type" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Room Type
            </Label>
            <Select value={roomType} onValueChange={setRoomType}>
              <SelectTrigger id="room-type" className="w-full border-gray-300 dark:border-gray-600 focus:ring-blue-500">
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="my-4" />

          {/* Price Range Filter */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Price Range</Label>
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900 px-3 py-1 rounded-full">
                ₱{priceRange[0].toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} - ₱{priceRange[1].toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
            </div>
            <Slider
              defaultValue={[0, 5000]}
              max={5000}
              step={100}
              value={priceRange}
              onValueChange={setPriceRange}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
              <span>₱0</span>
              <span>₱5,000</span>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Floor Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Floor</Label>
            <div className="grid grid-cols-5 gap-3">
              {floors.map((floor) => (
                <div 
                  key={floor} 
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 cursor-pointer transition-all
                    ${selectedFloors.includes(floor) 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400' 
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'}`}
                  onClick={() => handleFloorChange(floor)}
                >
                  <span className={`text-lg font-semibold ${selectedFloors.includes(floor) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {floor}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky bottom-0 flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="flex-1 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Reset
          </Button>
          <Button 
            onClick={handleApply}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdvancedFiltersSheet;