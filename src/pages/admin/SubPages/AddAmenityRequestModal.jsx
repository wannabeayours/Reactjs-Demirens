import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
// Progress removed in favor of custom step indicator
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { 
  Plus,
  Trash2,
  Minus,
  Package,
  User,
  Mail,
  Phone,
  CheckCircle,
  ArrowRight,
  Building,
  ChevronsUpDown,
  Check
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

function AddAmenityRequestModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  notificationRefreshTrigger,
  setNotificationRefreshTrigger,
  selectedBookingRoomFromNavigation,
  selectedBookingRoomsFromNavigation,
  selectedAmenitiesFromNavigation // NEW: amenities returned from AmenitySelection
}) {
  // Modal state
  const [availableCharges, setAvailableCharges] = useState([]);
  const [selectedBookingRoom, setSelectedBookingRoom] = useState(null);
  const [selectedBookingRooms, setSelectedBookingRooms] = useState([]);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [currentAmenity, setCurrentAmenity] = useState({
    charges_master_id: '',
    booking_charges_price: '',
    booking_charges_quantity: '1'
  });
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [booking_charge_status, setBookingChargeStatus] = useState(2); // Default to Approved (2)
  const [loadingAddAmenity, setLoadingAddAmenity] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [openAmenity, setOpenAmenity] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categoryOptions = useMemo(() => {
    const set = new Set((availableCharges || []).map((c) => c.charges_category_name).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [availableCharges]);

  const filteredCharges = useMemo(
    () => (availableCharges || []).filter((c) => selectedCategory === 'all' || c.charges_category_name === selectedCategory),
    [availableCharges, selectedCategory]
  );

  const navigate = useNavigate();
  const APIConn = `${localStorage.url}admin.php`;

  // NEW: Navigate to AmenitySelection with current room selection
  const handleNavigateToAmenitySelection = () => {
    navigate('/admin/amenityselection', {
      state: {
        selectedBookingRoom,
        selectedBookingRooms,
      },
    });
  };

  const fetchAvailableCharges = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append('method', 'get_available_charges');
      
      console.log('💳 Fetching available charges from:', APIConn);
      const response = await axios.post(APIConn, formData);
      console.log('📋 Available charges API response:', response.data);
      console.log('📊 Number of charges received:', response.data?.length || 0);
      
      setAvailableCharges(response.data || []);
      console.log('✅ Available charges set successfully');
    } catch (error) {
      console.error('❌ Error fetching available charges:', error);
      console.error('📝 Error response:', error.response?.data);
      console.error('📝 Error status:', error.response?.status);
      toast.error('Failed to fetch available charges');
      setAvailableCharges([]);
    }
  }, [APIConn]);

  const handleChargeSelect = (chargeId) => {
    const charge = availableCharges.find(c => c.charges_master_id === parseInt(chargeId));
    setSelectedCharge(charge);
    setCurrentAmenity(prev => ({
      ...prev,
      charges_master_id: chargeId,
      booking_charges_price: charge ? charge.charges_master_price.toString() : ''
    }));
  };

  const handleNavigateToBookingRoomSelection = () => {
    navigate('/admin/bookingroomselection', { state: { origin: 'requestedamenities' } });
  };

  const addAmenityToList = () => {
    if (!currentAmenity.charges_master_id) {
      toast.error('Please select an amenity');
      return;
    }

    // Ensure defaults when inputs are removed
    const ensuredAmenity = {
      ...currentAmenity,
      booking_charges_price:
        currentAmenity.booking_charges_price !== ''
          ? currentAmenity.booking_charges_price
          : (selectedCharge?.charges_master_price?.toString() || ''),
      booking_charges_quantity:
        currentAmenity.booking_charges_quantity !== ''
          ? currentAmenity.booking_charges_quantity
          : '1',
    };

    // Check if this amenity is already in the list
    const existingIndex = amenitiesList.findIndex(item => item.charges_master_id === ensuredAmenity.charges_master_id);
    
    if (existingIndex !== -1) {
      // Update quantity if amenity already exists
      const updatedList = [...amenitiesList];
      const currentQty = parseInt(ensuredAmenity.booking_charges_quantity) || 0;
      const existingQty = parseInt(updatedList[existingIndex].booking_charges_quantity) || 0;
      updatedList[existingIndex].booking_charges_quantity = (currentQty + existingQty).toString();
      setAmenitiesList(updatedList);
      toast.success('Quantity updated for existing amenity');
    } else {
      // Add new amenity to list
      const newAmenity = {
        ...ensuredAmenity,
        id: Date.now(), // Temporary ID for React key
        charges_master_name: selectedCharge?.charges_master_name || '',
        charges_category_name: selectedCharge?.charges_category_name || ''
      };
      setAmenitiesList(prev => [...prev, newAmenity]);
      toast.success('Amenity added to list');
    }

    // Reset current amenity form
    setCurrentAmenity({
      charges_master_id: '',
      booking_charges_price: '',
      booking_charges_quantity: '1'
    });
    setSelectedCharge(null);
  };

  const removeAmenityFromList = (amenityId) => {
    setAmenitiesList(prev => prev.filter(item => item.id !== amenityId));
    toast.success('Amenity removed from list');
  };

  const updateAmenityQuantity = (amenityId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setAmenitiesList(prev => prev.map(item => 
      item.id === amenityId 
        ? { ...item, booking_charges_quantity: newQuantity.toString() }
        : item
    ));
  };

  const handleAddAmenity = async () => {
    const rooms = (selectedBookingRooms && selectedBookingRooms.length > 0)
      ? selectedBookingRooms
      : (selectedBookingRoom ? [selectedBookingRoom] : []);

    if (rooms.length === 0 || amenitiesList.length === 0) {
      toast.error('Please select at least one booking room and add at least one amenity');
      return;
    }

    setLoadingAddAmenity(true);
    try {
      const makeRequest = async (booking_room_id) => {
        const requestData = {
          booking_room_id,
          amenities: amenitiesList.map(amenity => ({
            charges_master_id: amenity.charges_master_id,
            booking_charges_price: parseFloat(amenity.booking_charges_price) || 0,
            booking_charges_quantity: parseInt(amenity.booking_charges_quantity) || 1
          })),
          booking_charge_status: booking_charge_status
        };

        const formData = new FormData();
        formData.append('method', 'add_amenity_request');
        formData.append('json', JSON.stringify(requestData));

        console.log('📤 Sending request data:', requestData);
        const response = await axios.post(APIConn, formData);
        console.log('📡 Add amenity response:', response.data);
        console.log('📡 Response status:', response.status);

        if (typeof response.data === 'object' && response.data !== null) {
          return response.data.success !== false;
        }
        try {
          const parsed = JSON.parse(response.data);
          return parsed.success !== false;
        } catch (_e) {
          return response.data === '1' || response.data === 1;
        }
      };

      if (rooms.length === 1) {
        const success = await makeRequest(rooms[0].booking_room_id);
        if (success) {
          toast.success('Amenity requests added successfully!');
          onClose();
          resetAmenityForm();
          if (onSuccess) onSuccess();
          setNotificationRefreshTrigger(prev => prev + 1);
        } else {
          toast.error('Failed to add amenity requests');
        }
      } else {
        const results = await Promise.allSettled(rooms.map(r => makeRequest(r.booking_room_id)));
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
        const failCount = rooms.length - successCount;

        if (successCount > 0) {
          toast.success(`Added amenities to ${successCount}/${rooms.length} rooms`);
          onClose();
          resetAmenityForm();
          if (onSuccess) onSuccess();
          setNotificationRefreshTrigger(prev => prev + 1);
        }
        if (failCount > 0) {
          toast.error(`${failCount} room(s) failed to update`);
        }
      }
    } catch (error) {
      console.error('❌ Error adding amenity requests:', error);
      console.error('📝 Error response:', error.response?.data);
      console.error('📝 Error status:', error.response?.status);
      toast.error('Failed to add amenity requests');
    } finally {
      setLoadingAddAmenity(false);
      console.log('🏁 handleAddAmenity completed');
    }
  };

  const resetAmenityForm = () => {
    setCurrentAmenity({
      charges_master_id: '',
      booking_charges_price: '',
      booking_charges_quantity: '1'
    });
    setSelectedCharge(null);
    setSelectedBookingRoom(null);
    setSelectedBookingRooms([]);
    setAmenitiesList([]);
    setBookingChargeStatus(2); // Reset to Approved
  };

  const calculateGrandTotal = () => {
    return amenitiesList.reduce((total, amenity) => {
      const price = parseFloat(amenity.booking_charges_price) || 0;
      const quantity = parseInt(amenity.booking_charges_quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };


  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '₱0.00';
    }
    
    try {
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return '₱0.00';
    }
  };



  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableCharges();
    }
  }, [isOpen, fetchAvailableCharges]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetAmenityForm();
      setCurrentStep(1);
    }
  }, [isOpen]);

  // Handle selected booking room from navigation
  useEffect(() => {
    if (selectedBookingRoomsFromNavigation && selectedBookingRoomsFromNavigation.length > 0) {
      // Handle multiple rooms selection without auto-advancing step
      setSelectedBookingRooms(selectedBookingRoomsFromNavigation);
      setSelectedBookingRoom(selectedBookingRoomsFromNavigation[0]); // Set first room as primary
      console.log('🏨 Multiple rooms selected from navigation:', selectedBookingRoomsFromNavigation);
    } else if (selectedBookingRoomFromNavigation) {
      // Handle single room selection (backward compatibility) without auto-advancing step
      setSelectedBookingRoom(selectedBookingRoomFromNavigation);
      setSelectedBookingRooms([selectedBookingRoomFromNavigation]);
      console.log('🏨 Single room selected from navigation:', selectedBookingRoomFromNavigation);
    }
  }, [selectedBookingRoomFromNavigation, selectedBookingRoomsFromNavigation]);

  // When returning from AmenitySelection, merge selected amenities into the list
  useEffect(() => {
    if (Array.isArray(selectedAmenitiesFromNavigation) && selectedAmenitiesFromNavigation.length > 0) {
      setAmenitiesList((prev) => {
        const updated = [...prev];
        selectedAmenitiesFromNavigation.forEach((item) => {
          const cmid = item?.charges_master_id ?? item?.id;
          if (!cmid) return;
          const idx = updated.findIndex((a) => String(a.charges_master_id) === String(cmid));
          if (idx !== -1) {
            // Keep existing quantity unchanged; ensure at least 1
            const existingQty = parseInt(updated[idx].booking_charges_quantity) || 0;
            updated[idx] = {
              ...updated[idx],
              booking_charges_quantity: String(Math.max(existingQty, 1)),
            };
          } else {
            // Add as new item with default quantity 1
            updated.push({
              id: `sel-${cmid}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              charges_master_id: cmid,
              booking_charges_price: String(item?.charges_master_price ?? item?.booking_charges_price ?? 0),
              booking_charges_quantity: '1',
              charges_master_name: item?.charges_master_name ?? '',
              charges_category_name: item?.charges_category_name ?? '',
            });
          }
        });
        return updated;
      });
      setCurrentStep(2);
    }
  }, [selectedAmenitiesFromNavigation]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw] w-[95vw] lg:w-[90vw] xl:w-[85vw] max-h-[90vh] h-[90vh] overflow-y-auto p-6 m-0 rounded-xl shadow-2xl border-0 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Plus className="h-6 w-6 text-white" />
            </div>
            Add Amenity Requests
            {selectedBookingRooms.length > 1 && (
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1">
                <Building className="h-3 w-3 mr-1" />
                {selectedBookingRooms.length} Rooms
              </Badge>
            )}
            <div className="ml-auto">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                Auto-Approved
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Step {currentStep} of 3</div>
            <div className="flex gap-2">
              {currentStep === 1 && (
                <Button onClick={() => setCurrentStep(2)} disabled={selectedBookingRooms.length === 0 && !selectedBookingRoom}>Next: Choose Amenities</Button>
              )}
              {currentStep === 2 && (
                <>
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>Back: Choose Rooms</Button>
                  <Button onClick={() => setCurrentStep(3)} disabled={amenitiesList.length === 0 || ((selectedBookingRooms.length === 0) && !selectedBookingRoom)}>Next: Review</Button>
                </>
              )}
              {currentStep === 3 && (
                <Button variant="outline" onClick={() => setCurrentStep(2)}>Back: Choose Amenities</Button>
              )}
             </div>
           </div>
   {/* Step Indicator — small, discrete dots with connecting line */}
   <div className="mt-2 flex justify-center">
     <div className="relative px-2 mx-auto max-w-[520px] w-full">
       {/* background line */}
       <div className="absolute left-2 right-2 top-3 h-[2px] rounded-full bg-muted" />
       {/* progress line */}
       <div
         className={`absolute left-2 top-3 h-[2px] rounded-full bg-primary transition-all duration-300`}
         style={{ width: currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%' }}
       />
       {/* step nodes */}
       <div className="relative flex justify-between">
         {/* Step 1 */}
         <div className="flex flex-col items-center">
           <div
             className={
               `flex items-center justify-center h-6 w-6 rounded-full border-2 ` +
               (currentStep > 1
                 ? 'border-primary bg-primary text-primary-foreground'
                 : 'border-primary bg-white text-primary')
             }
           >
             {currentStep > 1 ? (
               <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
             ) : (
               <span className="block h-2 w-2 rounded-full bg-primary" />
             )}
           </div>
           <span className="mt-2 text-xs text-muted-foreground">Choose Rooms</span>
         </div>
         {/* Step 2 */}
         <div className="flex flex-col items-center">
           <div
             className={
               `flex items-center justify-center h-6 w-6 rounded-full border-2 ` +
               (currentStep > 2
                 ? 'border-primary bg-primary text-primary-foreground'
                 : currentStep === 2
                   ? 'border-primary bg-white text-primary'
                   : 'border-muted-foreground/40 bg-white text-muted-foreground')
             }
           >
             {currentStep > 2 ? (
               <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
             ) : currentStep === 2 ? (
               <span className="block h-2 w-2 rounded-full bg-primary" />
             ) : null}
           </div>
           <span className="mt-2 text-xs text-muted-foreground">Choose Amenities</span>
         </div>
         {/* Step 3 */}
         <div className="flex flex-col items-center">
           <div
             className={
               `flex items-center justify-center h-6 w-6 rounded-full border-2 ` +
               (currentStep === 3
                 ? 'border-primary bg-white text-primary'
                 : 'border-muted-foreground/40 bg-white text-muted-foreground')
             }
           >
             {currentStep === 3 ? (
               <span className="block h-2 w-2 rounded-full bg-primary" />
             ) : null}
           </div>
           <span className="mt-2 text-xs text-muted-foreground">Review & Submit</span>
         </div>
       </div>
     </div>
   </div>
         </div>

         {/* Booking Selection Card - Full Width at Top */}
         {currentStep === 1 && (
         <div className="mb-6">
           <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-md">
                    <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Select Booking Room
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Selected Booking Room{selectedBookingRooms.length > 1 ? 's' : ''} *
                  </Label>
                  {selectedBookingRooms.length === 0 ? (
                    <Button
                      onClick={handleNavigateToBookingRoomSelection}
                      variant="outline"
                      className="w-full h-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 transition-all duration-200"
                    >
                      <Building className="h-4 w-4 mr-2" />
                      Choose booking room{selectedBookingRooms.length > 1 ? 's' : ''}...
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      {/* Multiple rooms indicator */}
                      {selectedBookingRooms.length > 1 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                              {selectedBookingRooms.length} rooms selected
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Display all selected rooms */}
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedBookingRooms.map((room, index) => (
                          <div key={room.booking_room_id} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <span className="text-sm font-medium text-green-800 dark:text-green-300">
                                  Room #{room.roomnumber_id} • {room.roomtype_name}
                                </span>
                                {selectedBookingRooms.length > 1 && (
                                  <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400 border-green-600 dark:border-green-400">{index + 1}</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleNavigateToBookingRoomSelection}
                        className="w-full text-xs h-8"
                      >
                        Change Selection
                      </Button>
                    </div>
                  )}
                </div>
                
                {selectedBookingRoom && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-4 rounded-lg">
                    <div className="space-y-3">
                      {/* Customer info header with multiple rooms indicator */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-base text-gray-900 dark:text-white">{selectedBookingRoom.customer_name}</span>
                        </div>
                        {selectedBookingRooms.length > 1 && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                            {selectedBookingRooms.length} rooms
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{selectedBookingRoom.customers_email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{selectedBookingRoom.customers_phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{selectedBookingRoom.booking_status_name}</span>
                      </div>
                      
                      {/* Show primary room info */}
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Primary: Room #{selectedBookingRoom.roomnumber_id} • {selectedBookingRoom.roomtype_name}
                        </span>
                      </div>
                      
                      {/* Show all room numbers if multiple rooms */}
                      {selectedBookingRooms.length > 1 && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            All rooms: {selectedBookingRooms.map(room => `#${room.roomnumber_id}`).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
           </Card>
        </div>
        )}

        {currentStep === 2 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column - Select amenities via navigation (replacing Add Amenity card) */}
          <div className="xl:col-span-1 space-y-4">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-md">
                    <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  Choose Amenities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select one or more amenities</Label>
                  <Button
                    onClick={handleNavigateToAmenitySelection}
                    className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 dark:from-purple-700 dark:to-pink-700 dark:hover:from-purple-600 dark:hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Select Amenities
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <p className="text-xs text-muted-foreground">Uses a paginated table with checkboxes; confirm to return here.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Selected Amenities */}
          <div className="xl:col-span-1 space-y-4">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-t-lg">
                <CardTitle className="text-lg flex items-center justify-between text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900 rounded-md">
                      <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span>Selected Amenities</span>
                  </div>
                  <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs px-2 py-1 border-indigo-600 dark:border-indigo-400">
                    {amenitiesList.length} item{amenitiesList.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {amenitiesList.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="font-medium text-base mb-2 text-gray-700 dark:text-gray-300">No amenities added yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Select a booking and add amenities to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {amenitiesList.map((amenity) => (
                      <div key={amenity.id} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-gray-200 dark:border-gray-600">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="font-medium text-base text-gray-900 dark:text-white">{amenity.charges_master_name}</p>
                                <Badge variant="outline" className="mt-1 text-xs px-2 py-1 text-gray-700 dark:text-gray-300 border-gray-400 dark:border-gray-500">
                                  {amenity.charges_category_name}
                                </Badge>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg text-gray-900 dark:text-white">
                                  {formatCurrency((parseFloat(amenity.booking_charges_price) || 0) * (parseInt(amenity.booking_charges_quantity) || 0))}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatCurrency(parseFloat(amenity.booking_charges_price) || 0)} each
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-300">Quantity:</span>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateAmenityQuantity(amenity.id, (parseInt(amenity.booking_charges_quantity) || 0) - 1)}
                                  disabled={(parseInt(amenity.booking_charges_quantity) || 0) <= 1}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-medium text-sm text-gray-900 dark:text-white">{parseInt(amenity.booking_charges_quantity) || 0}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateAmenityQuantity(amenity.id, (parseInt(amenity.booking_charges_quantity) || 0) + 1)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeAmenityFromList(amenity.id)}
                            className="ml-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Grand Total */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700 p-4 rounded-lg shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-medium text-gray-900 dark:text-white">Grand Total:</span>
                        <span className="text-xl font-bold text-[#113f67] dark:text-blue-400">
                          {formatCurrency(calculateGrandTotal())}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        Total for {amenitiesList.length} amenit{amenitiesList.length !== 1 ? 'ies' : 'y'}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        )}

        {currentStep === 3 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-lg">
                <CardTitle className="text-lg flex items-center justify-between text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-md">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>Review Rooms & Guest</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setCurrentStep(1)}>
                    Edit Rooms
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedBookingRoom && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-base text-gray-900 dark:text-white">{selectedBookingRoom.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{selectedBookingRoom.customers_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{selectedBookingRoom.customers_phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{selectedBookingRoom.booking_status_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Primary: Room #{selectedBookingRoom.roomnumber_id} • {selectedBookingRoom.roomtype_name}
                      </span>
                    </div>
                  </div>
                )}
                {selectedBookingRooms.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedBookingRooms.map((room, idx) => (
                      <div key={room.booking_room_id} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Room #{room.roomnumber_id} • {room.roomtype_name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">{idx + 1}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-t-lg">
                <CardTitle className="text-lg flex items-center justify-between text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900 rounded-md">
                      <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span>Review Amenities</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setCurrentStep(2)}>
                    Edit Amenities
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {amenitiesList.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="font-medium text-base mb-2 text-gray-700 dark:text-gray-300">No amenities added yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Go back to add amenities</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {amenitiesList.map((amenity) => (
                      <div key={amenity.id} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-base text-gray-900 dark:text-white">{amenity.charges_master_name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">{amenity.charges_category_name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                              Qty: {parseInt(amenity.booking_charges_quantity) || 0} × {formatCurrency(parseFloat(amenity.booking_charges_price) || 0)} each
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-900 dark:text-white">
                              {formatCurrency((parseFloat(amenity.booking_charges_price) || 0) * (parseInt(amenity.booking_charges_quantity) || 0))}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700 p-4 rounded-lg shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-medium text-gray-900 dark:text-white">Grand Total:</span>
                        <span className="text-xl font-bold text-[#113f67] dark:text-blue-400">
                          {formatCurrency(calculateGrandTotal())}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        Total for {amenitiesList.length} amenit{amenitiesList.length !== 1 ? 'ies' : 'y'}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        {currentStep === 2 && (
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 -mx-6 px-6 py-4 rounded-b-xl">
            <Button 
              variant="outline" 
              onClick={() => {
                onClose();
                resetAmenityForm();
              }}
              className="min-w-[120px] h-11 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setCurrentStep(3)}
              disabled={amenitiesList.length === 0 || ((selectedBookingRooms.length === 0) && !selectedBookingRoom)}
              className="bg-gradient-to-r from-[#113f67] to-blue-700 hover:from-[#0d2a4a] hover:to-blue-800 dark:from-blue-700 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-500 text-white min-w-[160px] h-11 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Next: Review
            </Button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="flex justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 -mx-6 px-6 py-4 rounded-b-xl">
            <Button 
              variant="outline" 
              onClick={() => {
                onClose();
                resetAmenityForm();
              }}
              className="min-w-[120px] h-11 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              Cancel
            </Button>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="min-w-[180px] h-11 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                Back: Choose Amenities
              </Button>
              <Button
                onClick={handleAddAmenity}
                disabled={loadingAddAmenity || amenitiesList.length === 0 || ((selectedBookingRooms.length === 0) && !selectedBookingRoom)}
                className="bg-gradient-to-r from-[#113f67] to-blue-700 hover:from-[#0d2a4a] hover:to-blue-800 dark:from-blue-700 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-500 text-white min-w-[180px] h-11 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loadingAddAmenity ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Confirming...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Confirm & Add
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AddAmenityRequestModal;
