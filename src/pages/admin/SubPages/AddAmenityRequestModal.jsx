import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Building
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
  selectedBookingRoomsFromNavigation 
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

  const navigate = useNavigate();
  const APIConn = `${localStorage.url}admin.php`;

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
    if (!selectedBookingRoom || amenitiesList.length === 0) {
      toast.error('Please select a booking room and add at least one amenity');
      return;
    }

    setLoadingAddAmenity(true);
    try {
      const requestData = {
        booking_room_id: selectedBookingRoom.booking_room_id,
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
      
      // Handle different response formats
      let result;
      
      // Check if response.data is already an object
      if (typeof response.data === 'object' && response.data !== null) {
        console.log('📝 Response is already an object:', response.data);
        result = response.data;
      } else {
        // Try to parse as JSON string
        try {
          result = JSON.parse(response.data);
        } catch (parseError) {
          // If parsing fails, treat as string response
          console.log('📝 Response is not JSON, treating as string:', response.data);
          if (response.data === '1' || response.data === 1) {
            result = { success: true, message: 'Amenity requests added successfully!' };
          } else {
            result = { success: false, message: response.data || 'Failed to add amenity requests' };
          }
        }
      }
      
      console.log('📊 Processed result:', result);
      
      if (result.success) {
        const successMessage = typeof result.message === 'string' ? result.message : 'Amenity requests added successfully!';
        toast.success(successMessage);
        onClose();
        resetAmenityForm();
        if (onSuccess) onSuccess();
        // Trigger notification refresh
        setNotificationRefreshTrigger(prev => prev + 1);
      } else {
        const errorMessage = typeof result.message === 'string' ? result.message : 'Failed to add amenity requests';
        toast.error(errorMessage);
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
    }
  }, [isOpen]);

  // Handle selected booking room from navigation
  useEffect(() => {
    if (selectedBookingRoomsFromNavigation && selectedBookingRoomsFromNavigation.length > 0) {
      // Handle multiple rooms selection
      setSelectedBookingRooms(selectedBookingRoomsFromNavigation);
      setSelectedBookingRoom(selectedBookingRoomsFromNavigation[0]); // Set first room as primary
      console.log('🏨 Multiple rooms selected from navigation:', selectedBookingRoomsFromNavigation);
    } else if (selectedBookingRoomFromNavigation) {
      // Handle single room selection (backward compatibility)
      setSelectedBookingRoom(selectedBookingRoomFromNavigation);
      setSelectedBookingRooms([selectedBookingRoomFromNavigation]);
      console.log('🏨 Single room selected from navigation:', selectedBookingRoomFromNavigation);
    }
  }, [selectedBookingRoomFromNavigation, selectedBookingRoomsFromNavigation]);

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

        {/* Booking Selection Card - Full Width at Top */}
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
                                 <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400 border-green-600 dark:border-green-400">
                                   {index + 1}
                                 </Badge>
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column - Add Amenity */}
          <div className="xl:col-span-1 space-y-4">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-md">
                    <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  Add Amenity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Charge Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Amenity *
                  </Label>
                  <Select value={currentAmenity.charges_master_id} onValueChange={handleChargeSelect}>
                    <SelectTrigger className="h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select an amenity..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCharges.map((charge) => (
                        <SelectItem key={charge.charges_master_id} value={charge.charges_master_id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-white">{charge.charges_master_name}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {charge.charges_category_name} • {formatCurrency(charge.charges_master_price)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedCharge && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700 shadow-sm">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{selectedCharge.charges_master_name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selectedCharge.charges_master_description}</p>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-blue-600 dark:text-blue-400 text-xs px-2 py-1 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20">
                            {selectedCharge.charges_category_name}
                          </Badge>
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(selectedCharge.charges_master_price)} each
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Inputs removed: Price per Unit and Quantity now adjusted in Selected Amenities */}

                {/* Preview Total */}
                {currentAmenity.booking_charges_price && currentAmenity.booking_charges_quantity && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-800 dark:text-green-300">Line Total:</span>
                      <span className="text-lg font-bold text-green-700 dark:text-green-400">
                        {formatCurrency((parseFloat(currentAmenity.booking_charges_price) || 0) * (parseInt(currentAmenity.booking_charges_quantity) || 0))}
                      </span>
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {currentAmenity.booking_charges_quantity} × {formatCurrency(parseFloat(currentAmenity.booking_charges_price) || 0)}
                    </div>
                  </div>
                )}

                {/* Add to List Button */}
                        <Button 
                          onClick={addAmenityToList}
                          disabled={!currentAmenity.charges_master_id}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 dark:from-purple-700 dark:to-pink-700 dark:hover:from-purple-600 dark:hover:to-pink-600 text-white h-10 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to List
                        </Button>
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
                      <div key={amenity.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-gray-200 dark:border-gray-600">
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

        {/* Action Buttons */}
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
             onClick={handleAddAmenity}
             disabled={loadingAddAmenity || !selectedBookingRoom || amenitiesList.length === 0}
             className="bg-gradient-to-r from-[#113f67] to-blue-700 hover:from-[#0d2a4a] hover:to-blue-800 dark:from-blue-700 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-500 text-white min-w-[180px] h-11 shadow-lg hover:shadow-xl transition-all duration-200"
           >
            {loadingAddAmenity ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding {amenitiesList.length} Amenit{amenitiesList.length !== 1 ? 'ies' : 'y'} to {selectedBookingRooms.length} Room{selectedBookingRooms.length > 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add {amenitiesList.length} Amenit{amenitiesList.length !== 1 ? 'ies' : 'y'} to {selectedBookingRooms.length} Room{selectedBookingRooms.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddAmenityRequestModal;
