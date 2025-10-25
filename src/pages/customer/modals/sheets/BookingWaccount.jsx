import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetFooter, SheetTrigger } from '@/components/ui/sheet'
import React, { useEffect, useRef, useState } from 'react'
import RoomsList from './RoomsList'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BedDouble, Info, MinusIcon, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Label } from '@/components/ui/label'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Stepper } from '@/components/ui/stepper'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import ShowAlert from '@/components/ui/show-alert'
import Moreinfo from './Moreinfo'
import CreditCard from '../CreditCard'

const schema = z.object({
  // Payment type toggle (gcash | bank)
  payType: z.enum(['gcash', 'bank']).default(''),
})

function BookingWaccount({ rooms, selectedRoom, guestNumber: initialGuestNumber, handleClearData, adultNumber, childrenNumber, extraGuestPrice, bedPrice }) {
  const [paymentMethod, setPaymentMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [proofOfPayment, setProofOfPayment] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const fileInputRef = useRef(null)

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method)
    try { form.setValue('payType', method, { shouldValidate: false }) } catch { }
    setSuccess(false)
    setError('')
  }
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleShowAlert = async () => {
    setAlertMessage("All payments are non-refundable. However, bookings may be canceled within 24 hours of confirmation.");
    setShowAlert(true);
  };

  const handleCloseAlert = async (status) => {
    if (status === 1) {
      handleOpenGcash();
    }
    setShowAlert(false);
  };

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      payType: 'gcash',
    },
  })

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 'rooms',
      title: 'Select Rooms',
      description: 'Choose your rooms'
    },
    {
      id: 'confirm',
      title: 'Confirm Booking',
      description: 'Review and confirm'
    }
  ];
  const navigateTo = useNavigate();

  const customerBookingWithAccount = async () => {

    const loading = toast.loading("Processing...");
    const childrenNumber = localStorage.getItem("children");
    const adultNumber = localStorage.getItem("adult");
    const subtotal = selectedRooms.reduce((total, room) => total + (Number(room.roomtype_price) * numberOfNights), 0)
    const extraGuestCharges = selectedRooms.reduce((t, r) => {
      const rk = r.selectionKey || r.room_type;
      const capacity = Number(r.roomtype_capacity) || 0;
      const guests = (adultCounts[rk] || 0) + (childrenCounts[rk] || 0);
      const extraGuests = Math.max(0, guests - capacity);
      return t + extraGuests * extraGuestPrice * numberOfNights;
    }, 0);
    const bedCharges = selectedRooms.reduce((t, r) => {
      const rk = r.selectionKey || r.room_type;
      return t + ((bedCounts[rk] || 0) * bedPrice * numberOfNights);
    }, 0);
    const displayedVat = subtotal - (subtotal / 1.12)
    const totalWithExtras = subtotal + extraGuestCharges + bedCharges;
    const totalAmount = totalWithExtras.toFixed(2)

    const payType = form.getValues('payType');
    if (!payType) {
      toast.error("Please select a payment method");
      return;
    }
    try {

      const bookingDetails = {
        checkIn: `${formatYMD(checkIn)} 14:00:00`,
        checkOut: `${formatYMD(checkOut)} 12:00:00`,
        "downpayment": totalAmount,
        "totalAmount": totalAmount,
        "totalPay": totalAmount,
        "displayedVat": displayedVat.toFixed(2),
        "children": childrenNumber,
        "adult": adultNumber,
        "payment_method_id": payType === 'gcash' ? 1 : 2,
        "numberOfNights": numberOfNights,
      }

      console.log("selected rooms", selectedRooms)
      console.log("adultCounts", adultCounts)
      console.log("childrenCounts", childrenCounts)
      console.log("bedCounts", bedCounts)

      const roomDetails = selectedRooms.map((room) => {
        const rk = room.selectionKey || room.room_type;
        const adultCount = adultCounts[rk] ?? 0;
        const childrenCount = childrenCounts[rk] ?? 0;
        const totalGuests = adultCount + childrenCount;
        return {
          roomTypeId: room.room_type,
          guestCount: totalGuests,
          adultCount,
          childrenCount,
          bedCount: bedCounts[rk] ?? 0,
          extraGuestCharges: extraGuestCharges === 0 ? 0 : 1,
        };
      });

      console.log("roomDetails", roomDetails);
      const jsonData = {
        bookingDetails: bookingDetails,
        roomDetails: roomDetails
      }

      console.log("jsondata", jsonData)
      localStorage.setItem("jsonData", JSON.stringify(jsonData));
      localStorage.setItem('refreshBookings', Date.now().toString());
      localStorage.setItem("hasAccount", 1);
      setTimeout(() => {
        navigateTo('/payment-success');
      }, 500);

    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      toast.dismiss(loading);
    }
  }

  const handleOpenGcash = async () => {
    const loading = toast.loading("Redirecting...");
    try {
      const url = localStorage.getItem("url") + "gcash_api.php";
      const customerId = localStorage.getItem("userId");
      const childrenNumber = localStorage.getItem("children");
      const adultNumber = localStorage.getItem("adult") || 1;
      const subtotal = selectedRooms.reduce((total, room) => total + (Number(room.roomtype_price) * numberOfNights), 0)
      const extraGuestCharges = selectedRooms.reduce((t, r) => {
        const rk = r.selectionKey || r.room_type;
        const capacity = Number(r.roomtype_capacity) || 0;
        const guests = (adultCounts[rk] || 0) + (childrenCounts[rk] || 0);
        const extraGuests = Math.max(0, guests - capacity);
        return t + extraGuests * extraGuestPrice * numberOfNights;
      }, 0);
      const bedCharges = selectedRooms.reduce((t, r) => {
        const rk = r.selectionKey || r.room_type;
        return t + ((bedCounts[rk] || 0) * bedPrice * numberOfNights);
      }, 0);
      const displayedVat = subtotal - (subtotal / 1.12)
      const totalWithExtras = subtotal + extraGuestCharges + bedCharges;
      const totalAmount = totalWithExtras.toFixed(2);
      const payType = form.getValues('payType');

      const checkInWithTime = new Date(checkIn);
      checkInWithTime.setHours(14, 0, 0, 0);

      const bookingDetails = {
        checkIn: `${formatYMD(checkIn)} 14:00:00`,
        checkOut: `${formatYMD(checkOut)} 12:00:00`,
        "downpayment": totalAmount,
        "totalAmount": totalAmount,
        "totalPay": totalAmount,
        "displayedVat": displayedVat.toFixed(2),
        "children": childrenNumber,
        "adult": adultNumber,
        "payment_method_id": payType === 'gcash' ? 1 : 2,
        "numberOfNights": numberOfNights,
      }

      const roomDetails = selectedRooms.map((room) => {
        const rk = room.selectionKey || room.room_type;
        const adultCount = adultCounts[rk] ?? 0;
        const childrenCount = childrenCounts[rk] ?? 0;
        const totalGuests = adultCount + childrenCount;
        return {
          roomTypeId: room.room_type,
          guestCount: totalGuests,
          adultCount,
          childrenCount,
          bedCount: bedCounts[rk] ?? 0,
          extraGuestCharges: extraGuestCharges === 0 ? 0 : 1,
        };
      });

      const jsonData = {
        customerId: customerId,
        bookingDetails: bookingDetails,
        roomDetails: roomDetails
      }

      const formData = new FormData();
      const fullName = localStorage.getItem("fname") + " " + localStorage.getItem("lname");
      formData.append("totalAmount", totalAmount);
      formData.append("hasAccount", 1);
      formData.append("name", fullName);
      formData.append("email", localStorage.getItem("email"));
      formData.append("phone", localStorage.getItem("contactNumber"));
      localStorage.setItem("hasAccount", 1);
      console.log("jsonData", jsonData);
      const res = await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("[gcashBooking] response:", res.data);

      const checkoutUrl = res.data.checkout_url;
      if (checkoutUrl) {
        console.log("jsonData", jsonData);
        localStorage.setItem("jsonData", JSON.stringify(jsonData));
        window.location.href = checkoutUrl;
      } else {
        toast.error("Error: No checkout URL received.");
      }
    } catch (error) {
      console.error("GCash Payment Error:", error);
      toast.error("Something went wrong");
    } finally {
      toast.dismiss(loading);
    }
  };

  const [isAvailable, setIsAvailable] = useState(true);
  const isRoomAvailable = async () => {
    try {
      const url = localStorage.getItem("url") + "customer.php";
      const subtotal = selectedRooms.reduce((total, room) => total + (Number(room.roomtype_price) * numberOfNights), 0)
      const extraGuestCharges = selectedRooms.reduce((t, r) => {
        const rk = r.selectionKey || r.room_type;
        const capacity = Number(r.roomtype_capacity) || 0;
        const guests = (adultCounts[rk] || 0) + (childrenCounts[rk] || 0);
        const extraGuests = Math.max(0, guests - capacity);
        return t + extraGuests * extraGuestPrice * numberOfNights;
      }, 0);
      const bedCharges = selectedRooms.reduce((t, r) => {
        const rk = r.selectionKey || r.room_type;
        return t + ((bedCounts[rk] || 0) * bedPrice * numberOfNights);
      }, 0);
      const displayedVat = subtotal - (subtotal / 1.12)
      const totalWithExtras = subtotal + extraGuestCharges + bedCharges;
      const downPayment = (totalWithExtras * 0.5).toFixed(2)
      const totalAmount = totalWithExtras.toFixed(2)
      const payType = form.getValues('payType');

      const bookingDetails = {
        "checkIn": formatYMD(checkIn),
        "checkOut": formatYMD(checkOut),
        "downpayment": downPayment,
        "totalAmount": totalAmount,
        "totalPay": totalAmount,
        "displayedVat": displayedVat.toFixed(2),
        "children": childrenNumber,
        "adult": adultNumber,
        "numberOfNights": numberOfNights,
      }

      const roomDetails = selectedRooms.map((room) => {
        const rk = room.selectionKey || room.room_type;
        const adultCount = adultCounts[rk] || 0;
        const childrenCount = childrenCounts[rk] || 0;
        const bedCount = bedCounts[rk] || 0;
        console.log(`Room ${room.roomtype_name}: adults=${adultCount}, children=${childrenCount}, beds=${bedCount}`)
        return {
          roomTypeId: room.room_type,
          guestCount: adultCount + childrenCount,
          adultCount: adultCount,
          childrenCount: childrenCount,
          bedCount: bedCount,
        };
      });
      const jsonData = {
        bookingDetails: bookingDetails,
        roomDetails: roomDetails
      }

      const formData = new FormData();
      formData.append("operation", "isRoomAvailable");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("[isRoomAvailable] response:", res.data);
      const code = Number(res?.data);
      if (code !== 1) {
        setIsAvailable(false);
        toast.error("Rooms not available anymore");
        return 0;
      }
      setIsAvailable(true);
      console.log("payType", payType)
      if (payType === 'gcash') {
        console.log("handleShowAlert")
        handleShowAlert();
      }
      return 1;
    } catch (error) {
      toast.error("Something went wrong");
      return 0;
    }
  }

  // ---------------------- Utilities (YMD, timezone-safe) ----------------------
  const pad = (n) => String(n).padStart(2, '0');
  const formatYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseYMD = (s) => {
    if (!s) return null;
    const [y, m, day] = s.split('-').map(Number);
    if (!y || !m || !day) return null;
    const d = new Date(y, m - 1, day);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const getStoredYMDDate = (key, fallbackDaysAhead = 1) => {
    const val = localStorage.getItem(key);
    if (val) {
      const parsed = parseYMD(val);
      if (parsed) return parsed;
    }
    const d = new Date();
    d.setDate(d.getDate() + fallbackDaysAhead);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // ---------------------- Initial values (if you haven't set them earlier) ----------------------
  // (If you already have initialCheckIn/initialCheckOut logic, you can skip these)
  const initialCheckIn = getStoredYMDDate('checkIn', 1); // default tomorrow
  const initialCheckOutCandidate = getStoredYMDDate('checkOut', 2);
  const _minOut = new Date(initialCheckIn); _minOut.setDate(_minOut.getDate() + 1); _minOut.setHours(0, 0, 0, 0);
  const initialCheckOut = (initialCheckOutCandidate && initialCheckOutCandidate.getTime() > _minOut.getTime())
    ? initialCheckOutCandidate
    : _minOut;

  // ---------------------- State ----------------------
  const [allRooms, setAllRooms] = useState([])
  const [selectedRooms, setSelectedRooms] = useState([])
  const [open, setOpen] = useState(false)
  const [checkIn, setCheckIn] = useState(initialCheckIn)
  const [checkOut, setCheckOut] = useState(initialCheckOut)
  const [numberOfNights, setNumberOfNights] = useState(1)
  const [guestCounts, setGuestCounts] = useState({});
  const [adultCounts, setAdultCounts] = useState({});
  const [childrenCounts, setChildrenCounts] = useState({});
  const [bedCounts, setBedCounts] = useState({});


  // recalc nights whenever dates change
  useEffect(() => {
    if (checkIn && checkOut) {
      const inDate = new Date(checkIn); inDate.setHours(0, 0, 0, 0);
      const outDate = new Date(checkOut); outDate.setHours(0, 0, 0, 0);
      const diff = outDate.getTime() - inDate.getTime();
      const days = Math.max(1, diff / (1000 * 60 * 60 * 24));
      setNumberOfNights(days);
    }
  }, [checkIn, checkOut]);

  // When the sheet opens, sync localStorage -> state and add selectedRoom only once
  useEffect(() => {
    if (!open) return;

    // read stored YMD strings (falling back to current state)
    const checkInStr = localStorage.getItem('checkIn') || formatYMD(checkIn || initialCheckIn);
    const checkOutStr = localStorage.getItem('checkOut') || formatYMD(checkOut || initialCheckOut);

    const checkInDate = parseYMD(checkInStr) || initialCheckIn;
    const checkOutDate = parseYMD(checkOutStr) || initialCheckOut;

    // ensure checkOut >= checkIn + 1
    const minOut = new Date(checkInDate); minOut.setDate(minOut.getDate() + 1); minOut.setHours(0, 0, 0, 0);
    const finalOut = checkOutDate.getTime() <= minOut.getTime() ? minOut : checkOutDate;

    setCheckIn(checkInDate);
    setCheckOut(finalOut);
    setAllRooms(rooms);

    // If a selectedRoom was passed in, add it once and init counts for it
    if (selectedRoom) {
      setSelectedRooms(prev => {
        const already = prev.some(r => r.room_type === selectedRoom.roomtype_id);
        if (already) return prev;

        const selectionKey = `${selectedRoom.roomtype_id}-${Date.now()}`;
        const selected = {
          roomtype_name: selectedRoom.roomtype_name,
          roomtype_price: selectedRoom.roomtype_price,
          room_type: selectedRoom.roomtype_id,
          roomtype_description: selectedRoom.roomtype_description,
          roomtype_capacity: selectedRoom.roomtype_capacity,
          roomtype_maxbeds: selectedRoom.roomtype_maxbeds,
          selectionKey: selectionKey,
        };

        const guestNum = parseInt(localStorage.getItem('guestNumber')) || initialGuestNumber || 1;
        const storedAdult = parseInt(localStorage.getItem('adult')) || adultNumber || 1;
        const storedChildren = parseInt(localStorage.getItem('children')) || childrenNumber || 0;

        setGuestCounts(g => ({ ...g, [selectionKey]: Math.min(guestNum, selected.roomtype_capacity || 1) }));
        setAdultCounts(a => ({ ...a, [selectionKey]: Math.min(storedAdult, selected.roomtype_capacity || Number.MAX_SAFE_INTEGER) }));
        setChildrenCounts(c => ({ ...c, [selectionKey]: Math.min(storedChildren, selected.roomtype_capacity || Number.MAX_SAFE_INTEGER) }));
        setBedCounts(b => ({ ...b, [selectionKey]: 0 })); // Initialize with 0 beds

        return [...prev, selected];
      });
    }

    // only run when sheet opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Ensure newly added selectedRooms have initialized counts (safe: only sets when undefined)
  useEffect(() => {
    selectedRooms.forEach(room => {
      const roomKey = room.selectionKey || room.room_type;

      if (guestCounts[roomKey] === undefined) {
        setGuestCounts(prev => ({
          ...prev,
          [roomKey]: Math.min(parseInt(localStorage.getItem('guestNumber')) || 1, room.roomtype_capacity || 1)
        }));
      }

      if (adultCounts[roomKey] === undefined) {
        setAdultCounts(prev => ({
          ...prev,
          [roomKey]: Math.min(Math.max(0, parseInt(localStorage.getItem('adult')) || 1), room.roomtype_capacity || Number.MAX_SAFE_INTEGER)
        }));
      }

      if (childrenCounts[roomKey] === undefined) {
        const storedChildren = parseInt(localStorage.getItem('children')) || 0;
        const currAdults = adultCounts[roomKey] || 0;
        const remaining = Math.max(0, (room.roomtype_capacity || Number.MAX_SAFE_INTEGER) - currAdults);
        setChildrenCounts(prev => ({
          ...prev,
          [roomKey]: Math.min(storedChildren, remaining)
        }));
      }

      if (bedCounts[roomKey] === undefined) {
        setBedCounts(prev => ({
          ...prev,
          [roomKey]: 0 // Initialize with 0 beds
        }));
      }
    });
    // intentionally depend only on selectedRooms (and counts as read) to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRooms]);

  // ---------------------- Handlers ----------------------

  // Preserve scroll position in the Radix ScrollArea viewport during state updates
  const scrollAreaRootRef = useRef(null);
  const preserveScroll = (fn) => {
    const vpSelector = '[data-radix-scroll-area-viewport]';
    const getViewport = () => {
      const root = scrollAreaRootRef.current;
      return root ? root.querySelector(vpSelector) : document.querySelector(vpSelector);
    };

    try {
      const vp = getViewport();
      const prevTop = vp ? vp.scrollTop : null;
      fn();

      const restore = () => {
        const vp2 = getViewport();
        if (vp2 && prevTop != null) {
          vp2.scrollTop = prevTop;
        }
      };

      // Try across multiple ticks to outlast remounts/layout recalculations
      requestAnimationFrame(() => {
        restore();
        requestAnimationFrame(() => {
          restore();
          setTimeout(restore, 0);
        });
      });
    } catch {
      fn();
    }
  };

  const handleCheckInChange = (e) => {
    const newDateStr = e.target.value;
    const newDate = parseYMD(newDateStr);
    if (!newDate) return;
    setCheckIn(newDate);
    localStorage.setItem('checkIn', newDateStr);

    // ensure checkOut is at least next day
    const minOut = new Date(newDate); minOut.setDate(minOut.getDate() + 1); minOut.setHours(0, 0, 0, 0);
    if (!checkOut || new Date(checkOut).getTime() <= newDate.getTime()) {
      setCheckOut(minOut);
      localStorage.setItem('checkOut', formatYMD(minOut));
    } else {
      const currOut = new Date(checkOut);
      if (currOut.getTime() <= newDate.getTime()) {
        setCheckOut(minOut);
        localStorage.setItem('checkOut', formatYMD(minOut));
      }
    }
  };

  const handleCheckOutChange = (e) => {
    const newDateStr = e.target.value;
    const newDate = parseYMD(newDateStr);
    if (!newDate) return;
    const minOut = new Date(checkIn); minOut.setDate(minOut.getDate() + 1); minOut.setHours(0, 0, 0, 0);
    if (newDate.getTime() < minOut.getTime()) {
      toast.error("Check-out must be at least one day after check-in");
      return;
    }
    setCheckOut(newDate);
    localStorage.setItem('checkOut', newDateStr);
  };

  const handleRemoveRoom = (indexRemove) => {
    const roomToRemove = selectedRooms[indexRemove];
    const updated = selectedRooms.filter((_, i) => i !== indexRemove);
    setSelectedRooms(updated);

    if (roomToRemove) {
      setAdultCounts(prev => { const copy = { ...prev }; delete copy[roomToRemove.selectionKey || roomToRemove.room_type]; return copy; });
      setChildrenCounts(prev => { const copy = { ...prev }; delete copy[roomToRemove.selectionKey || roomToRemove.room_type]; return copy; });
      setGuestCounts(prev => { const copy = { ...prev }; delete copy[roomToRemove.selectionKey || roomToRemove.room_type]; return copy; });
      setBedCounts(prev => { const copy = { ...prev }; delete copy[roomToRemove.selectionKey || roomToRemove.room_type]; return copy; });
    }

    if (updated.length === 0) {
      setNumberOfNights(1);
      toast.info("Room selection cleared!");
    } else {
      toast.info("Room removed.");
    }
  };

  // ---------------------- Step Navigation ----------------------
  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (selectedRooms.length === 0) {
        toast.error("Please select at least one room.");
        return;
      }
    } else if (currentStep === 2) {
      // Validate the form using react-hook-form
      const isValid = await form.trigger(["walkinfirstname", "walkinlastname", "email", "contactNumber"]);
      if (!isValid) {
        toast.error("Invalid walk-in customer information.");
        return;
      }
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Booking Summary Component
  const BookingSummary = () => {
    const subtotal = selectedRooms.reduce((t, r) => t + Number(r.roomtype_price) * numberOfNights, 0);
    const extraGuestCharges = selectedRooms.reduce((t, r) => {
      const rk = r.selectionKey || r.room_type;
      const capacity = Number(r.roomtype_capacity) || 0;
      const guests = (adultCounts[rk] || 0) + (childrenCounts[rk] || 0);
      const extraGuests = Math.max(0, guests - capacity);
      return t + extraGuests * extraGuestPrice * numberOfNights;
    }, 0);
    const bedCharges = selectedRooms.reduce((t, r) => {
      const rk = r.selectionKey || r.room_type;
      return t + ((bedCounts[rk] || 0) * bedPrice * numberOfNights);
    }, 0);
    const vat = subtotal - (subtotal / 1.12);
    const total = subtotal + extraGuestCharges + bedCharges;
    const down = total * 0.5;

    return (
      <div className="space-y-4">
        {/* Booking Details */}
        <Card className="bg-white shadow-md">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Check-in:</span>
                <span className="font-medium">{checkIn ? format(checkIn, 'MMM dd, yyyy') : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Check-out:</span>
                <span className="font-medium">{checkOut ? format(checkOut, 'MMM dd, yyyy') : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Nights:</span>
                <span className="font-medium">{numberOfNights} night{numberOfNights !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Guests:</span>
                <span className="font-medium">{selectedRooms.reduce((total, room) => { const rk = room.selectionKey || room.room_type; return total + (adultCounts[rk] || 0) + (childrenCounts[rk] || 0); }, 0)} guest{selectedRooms.reduce((total, room) => { const rk = room.selectionKey || room.room_type; return total + (adultCounts[rk] || 0) + (childrenCounts[rk] || 0); }, 0) !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        {selectedRooms.length > 0 && (
          <Card className="bg-white shadow-md border-2 border-blue-200">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Subtotals:</span>
                  <span>₱{subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {selectedRooms.reduce((total, room) => { const rk = room.selectionKey || room.room_type; return total + Math.max(0, ((adultCounts[rk] || 0) + (childrenCounts[rk] || 0)) - (room.roomtype_capacity || 0)); }, 0) > 0 && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span>{selectedRooms.reduce((total, room) => { const rk = room.selectionKey || room.room_type; return total + Math.max(0, ((adultCounts[rk] || 0) + (childrenCounts[rk] || 0)) - (room.roomtype_capacity || 0)); }, 0)} extra guest{selectedRooms.reduce((total, room) => { const rk = room.selectionKey || room.room_type; return total + Math.max(0, ((adultCounts[rk] || 0) + (childrenCounts[rk] || 0)) - (room.roomtype_capacity || 0)); }, 0) !== 1 ? 's' : ''} × ₱{extraGuestPrice}:</span>
                      <span className='font-bold'>₱{(selectedRooms.reduce((total, room) => { const rk = room.selectionKey || room.room_type; return total + Math.max(0, ((adultCounts[rk] || 0) + (childrenCounts[rk] || 0)) - (room.roomtype_capacity || 0)); }, 0) * extraGuestPrice * numberOfNights).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>× {numberOfNights} night{numberOfNights !== 1 ? 's' : ''}:</span>
                    </div>
                  </>
                )}
                {selectedRooms.reduce((sum, room) => { const rk = room.selectionKey || room.room_type; return sum + (bedCounts[rk] || 0); }, 0) > 0 && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span>{selectedRooms.reduce((sum, room) => { const rk = room.selectionKey || room.room_type; return sum + (bedCounts[rk] || 0); }, 0)} bed{selectedRooms.reduce((sum, room) => { const rk = room.selectionKey || room.room_type; return sum + (bedCounts[rk] || 0); }, 0) !== 1 ? 's' : ''} × ₱{bedPrice}:</span>
                      <span className='font-bold'>₱{(selectedRooms.reduce((sum, room) => { const rk = room.selectionKey || room.room_type; return sum + (bedCounts[rk] || 0); }, 0) * bedPrice * numberOfNights).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>× {numberOfNights} night{numberOfNights !== 1 ? 's' : ''}:</span>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Amount:</span>
                  <span>₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Step components for the booking process
  const RoomSelectionStep = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left side - Room Selection (2/3 width on desktop) */}
      <div className="lg:col-span-2 space-y-4">
        {/* Date Selection - Only in Step 1 */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkin">Check-in Date</Label>
                <input
                  type="date"
                  id="checkin"
                  value={checkIn ? formatYMD(checkIn) : ''}
                  onChange={handleCheckInChange}
                  min={tomorrowStr}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkout">Check-out Date</Label>
                <input
                  type="date"
                  id="checkout"
                  value={checkOut ? formatYMD(checkOut) : ''}
                  onChange={handleCheckOutChange}
                  min={checkIn ? formatYMD(new Date(checkIn.getTime() + 24 * 60 * 60 * 1000)) : tomorrowStr}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {numberOfNights > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                Duration: {numberOfNights} night{numberOfNights !== 1 ? 's' : ''}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Selected Rooms: {selectedRooms.length}
          </div>
          <div>
            <RoomsList
              rooms={allRooms}
              selectedRooms={selectedRooms}
              setSelectedRooms={setSelectedRooms}
            />
          </div>
        </div>

        <Card className="bg-gray-100">
          <div ref={scrollAreaRootRef}>
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div>
                {selectedRooms.length > 0 ? (
                  <div>
                    {selectedRooms.map((room, index) => (
                      <Card
                        key={room.selectionKey || `${room.room_type}-${index}`}
                        className="mb-4"
                      >
                        <CardContent>
                          <div className="flex justify-end">
                            <Trash2
                              className="cursor-pointer text-red-500"
                              onClick={() => handleRemoveRoom(index)}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <div>
                              <h1 className="font-semibold text-2xl font-playfair text-[#113F67]">
                                {room.roomtype_name}
                              </h1>
                              <h1>{room.roomtype_description}</h1>
                              <div className="flex flex-row space-x-2 mt-2 mb-2">
                                <div>
                                  <Moreinfo room={room} />
                                </div>
                                <div>
                                  <Info />
                                </div>
                              </div>
                              <h1 className="flex items-center gap-2 font-semibold text-[#113F67]">
                                <BedDouble size={20} />
                                ₱{" "}
                                {Number(room.roomtype_price).toLocaleString(
                                  "en-PH",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                                /day
                              </h1>

                              {/* Adult/Children selectors */}
                              <div className="mt-4 grid grid-cols-2 gap-4">
                                {/* Adults */}
                                <div className="rounded-2xl border-none p-4">
                                  <div className="flex items-center ">
                                    <Label className="mb-2">Adults</Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="rounded-full"
                                      onClick={() => {
                                        const rk = room.selectionKey || room.room_type;
                                        const current = adultCounts[rk] || 0;
                                        preserveScroll(() => {
                                          setAdultCounts((prev) => ({
                                            ...prev,
                                            [rk]: Math.max(0, current - 1),
                                          }));
                                        });
                                      }}
                                      disabled={(adultCounts[room.selectionKey || room.room_type] || 0) <= 1}
                                    >
                                      <MinusIcon />
                                    </Button>
                                    {(adultCounts[room.selectionKey || room.room_type] || 0)}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="rounded-full"
                                      onClick={() => {
                                        const rk = room.selectionKey || room.room_type;
                                        const capacity = room.roomtype_capacity || 0;
                                        const currAdults = adultCounts[rk] || 0;
                                        const currChildren = childrenCounts[rk] || 0;
                                        const maxBeds = room.roomtype_maxbeds || 0;
                                        const totalGuests = currAdults + currChildren;
                                        const allowedGuests = capacity + maxBeds;
                                        if (totalGuests < allowedGuests) {
                                          preserveScroll(() => {
                                            setAdultCounts((prev) => ({ ...prev, [rk]: currAdults + 1 }));
                                          });
                                        }
                                      }}
                                      disabled={
                                        ((adultCounts[room.selectionKey || room.room_type] || 0) + (childrenCounts[room.selectionKey || room.room_type] || 0)) >=
                                        ((room.roomtype_capacity || 0) + (room.roomtype_maxbeds || 0))
                                      }
                                    >
                                      <Plus />
                                    </Button>
                                  </div>
                                </div>

                                {/* Children */}
                                <div className="rounded-2xl border-none p-4">
                                  <div className="flex items-center">
                                    <Label className="mb-2">Children</Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="rounded-full"
                                      onClick={() => {
                                        const rk = room.selectionKey || room.room_type;
                                        const current = childrenCounts[rk] || 0;
                                        preserveScroll(() => {
                                          setChildrenCounts((prev) => ({
                                            ...prev,
                                            [rk]: Math.max(0, current - 1),
                                          }));
                                        });
                                      }}
                                      disabled={(childrenCounts[room.selectionKey || room.room_type] || 0) <= 0}
                                    >
                                      <MinusIcon />
                                    </Button>
                                    {(childrenCounts[room.selectionKey || room.room_type] || 0)}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="rounded-full"
                                      onClick={() => {
                                        const rk = room.selectionKey || room.room_type;
                                        const capacity = room.roomtype_capacity || 0;
                                        const currAdults = adultCounts[rk] || 0;
                                        const currChildren = childrenCounts[rk] || 0;
                                        const maxBeds = room.roomtype_maxbeds || 0;
                                        const totalGuests = currAdults + currChildren;
                                        const allowedGuests = capacity + maxBeds;
                                        if (totalGuests < allowedGuests) {
                                          preserveScroll(() => {
                                            setChildrenCounts((prev) => ({ ...prev, [rk]: currChildren + 1 }));
                                          });
                                        }
                                      }}
                                      disabled={
                                        ((adultCounts[room.selectionKey || room.room_type] || 0) + (childrenCounts[room.selectionKey || room.room_type] || 0)) >=
                                        ((room.roomtype_capacity || 0) + (room.roomtype_maxbeds || 0))
                                      }
                                    >
                                      <Plus />
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Beds selector */}
                              <div className="mt-4">
                                <div className="rounded-2xl border-none p-4">
                                  <div className="flex items-center">
                                    <Label className="mb-2">Add Beds{" (₱" + bedPrice + " each bed)"}</Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="rounded-full"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        const rk = room.selectionKey || room.room_type;
                                        const current = bedCounts[rk] || 0;
                                        preserveScroll(() => {
                                          setBedCounts((prev) => ({
                                            ...prev,
                                            [rk]: Math.max(0, current - 1),
                                          }));
                                        });
                                      }}
                                      disabled={(bedCounts[room.selectionKey || room.room_type] || 0) <= 0}
                                    >
                                      <MinusIcon />
                                    </Button>
                                    {bedCounts[room.selectionKey || room.room_type] || 0}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="rounded-full"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        const rk = room.selectionKey || room.room_type;
                                        const current = bedCounts[rk] || 0;
                                        const maxBeds = room.roomtype_maxbeds || 1;
                                        if (current < maxBeds) {
                                          preserveScroll(() => {
                                            setBedCounts((prev) => ({
                                              ...prev,
                                              [rk]: current + 1,
                                            }));
                                          });
                                        }
                                      }}
                                      disabled={(bedCounts[room.selectionKey || room.room_type] || 0) >= (room.roomtype_maxbeds || 1)}
                                    >
                                      <Plus />
                                    </Button>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Max beds: {room.roomtype_maxbeds || 1}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-3 text-sm text-gray-700">
                                Total guests:{" "}
                                <span className="font-semibold">
                                  {(adultCounts[room.selectionKey || room.room_type] || 0) +
                                    (childrenCounts[room.selectionKey || room.room_type] || 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No rooms selected yet.</p>
                    <p className="text-sm">Click "Add Room" to get started.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </Card>
      </div>

      {/* Right side - Booking Summary (1/3 width on desktop) */}
      <div className="lg:col-span-1">
        <div className="sticky top-4">
          <BookingSummary />

        </div>
      </div>

    </div>
  );

  const BookingConfirmationStep = () => {
    const subtotal = selectedRooms.reduce((t, r) => {
      const roomPrice = Number(r.roomtype_price) || 0;
      return t + roomPrice * numberOfNights;
    }, 0);

    // ✅ Extra guest charges
    const extraGuestCharges = selectedRooms.reduce((t, r) => {
      const key = r.selectionKey || r.room_type;
      const capacity = Number(r.roomtype_capacity) || 0;
      const guests = (adultCounts[key] || 0) + (childrenCounts[key] || 0);
      const extraGuests = Math.max(0, guests - capacity);
      return t + extraGuests * extraGuestPrice * numberOfNights;
    }, 0);

    // ✅ Bed charges
    const bedCharges = selectedRooms.reduce((t, r) => {
      const key = r.selectionKey || r.room_type;
      const bedCount = bedCounts[key] || 0;
      return t + bedCount * bedPrice * numberOfNights;
    }, 0);

    // ✅ Total (no VAT)
    const total = subtotal + extraGuestCharges + bedCharges;



    return (
      <div className="h-[calc(100vh-350px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScrollArea className="h-[calc(100vh-350px)]">

            {/* Guest Information */}
            <div className='grid grid-cols-1 gap-3 mb-3'>
              {/* Booking Details */}
              <Card className="bg-white shadow-md">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Check-in Date</p>
                      <p className="font-medium">{format(checkIn, 'PPP')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Check-out Date</p>
                      <p className="font-medium">{format(checkOut, 'PPP')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Number of Nights</p>
                      <p className="font-medium">{numberOfNights} night{numberOfNights !== 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Guests</p>
                      <p className="font-medium">{selectedRooms.reduce((total, room) => { const rk = room.selectionKey || room.room_type; return total + (adultCounts[rk] || 0) + (childrenCounts[rk] || 0); }, 0)} guest{selectedRooms.reduce((total, room) => { const rk = room.selectionKey || room.room_type; return total + (adultCounts[rk] || 0) + (childrenCounts[rk] || 0); }, 0) !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Room Details */}
            <Card className="bg-white shadow-md">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Selected Rooms</h3>
                  <Badge variant="secondary">{selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}</Badge>
                </div>

                <div className="space-y-3">
                  {selectedRooms.map((room, index) => (
                    <Card key={index} className="bg-gray-50 border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-lg">{room.roomtype_name}</h4>
                            <p className="text-sm text-gray-600">{room.roomtype_description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₱{room.roomtype_price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p className="text-sm text-gray-600">per night</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex gap-4">
                            <span>Adults: {(adultCounts[room.selectionKey || room.room_type] || 0)}</span>
                            <span>Children: {(childrenCounts[room.selectionKey || room.room_type] || 0)}</span>
                            <span>Extra Beds: {(bedCounts[room.selectionKey || room.room_type] || 0)}</span>
                          </div>
                          <div className="font-medium">
                            {numberOfNights} night{numberOfNights !== 1 ? 's' : ''} × ₱{room.roomtype_price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = ₱{(numberOfNights * room.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ScrollArea>

          <ScrollArea className="h-[calc(100vh-350px)]">

            <Card className="bg-white shadow-md rounded-2xl overflow-hidden mb-3">
              <CardHeader className="bg-gray-50">
                <CardTitle>Select Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...form}>
                  <div className="flex space-x-4 mb-6">
                    <Button
                      variant={paymentMethod === 'gcash' ? 'default' : 'outline'}
                      onClick={() => handlePaymentMethodChange('gcash')}
                      className="flex-1"
                    >
                      GCash
                    </Button>
                    <Button
                      variant={paymentMethod === 'bank' ? 'default' : 'outline'}
                      onClick={() => handlePaymentMethodChange('bank')}
                      className="flex-1"
                    >
                      Paypal
                    </Button>
                  </div>

                  {/* Payment Form */}
                  {paymentMethod === 'gcash' && (
                    <div>
                      <Button onClick={isRoomAvailable} className="w-full">
                        Pay with GCash
                      </Button>
                    </div>
                  )}
                  {paymentMethod === 'bank' && (
                    <CreditCard onSubmit={customerBookingWithAccount} totalAmount={total} isRoomAvailable={isRoomAvailable} />
                  )
                  }
                </Form>
              </CardContent>
              <CardFooter className="bg-gray-50 flex flex-col">
                {error && (
                  <div className="w-full mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm">
                    {error}
                  </div>
                )}
              </CardFooter>
            </Card>
            {/* Payment Summary */}
            <Card className="bg-white shadow-md border-2 border-blue-200">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Subtotals:</span>
                    <span>₱{subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  {selectedRooms.reduce((total, room) => { const rk = room.selectionKey || room.room_type; return total + Math.max(0, ((adultCounts[rk] || 0) + (childrenCounts[rk] || 0)) - (room.roomtype_capacity || 0)); }, 0) > 0 && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span>{selectedRooms.reduce((total, room) => { const rk = room.selectionKey || room.room_type; return total + Math.max(0, ((adultCounts[rk] || 0) + (childrenCounts[rk] || 0)) - (room.roomtype_capacity || 0)); }, 0)} extra guest{selectedRooms.reduce((total, room) => { const rk = room.selectionKey || room.room_type; return total + Math.max(0, ((adultCounts[rk] || 0) + (childrenCounts[rk] || 0)) - (room.roomtype_capacity || 0)); }, 0) !== 1 ? 's' : ''} × ₱{extraGuestPrice}:</span>
                        <span className='font-bold'>₱{(selectedRooms.reduce((total, room) => { const rk = room.selectionKey || room.room_type; return total + Math.max(0, ((adultCounts[rk] || 0) + (childrenCounts[rk] || 0)) - (room.roomtype_capacity || 0)); }, 0) * extraGuestPrice * numberOfNights).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>× {numberOfNights} night{numberOfNights !== 1 ? 's' : ''}:</span>
                      </div>
                    </>
                  )}
                  {selectedRooms.reduce((sum, room) => { const rk = room.selectionKey || room.room_type; return sum + (bedCounts[rk] || 0); }, 0) > 0 && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span>{selectedRooms.reduce((sum, room) => { const rk = room.selectionKey || room.room_type; return sum + (bedCounts[rk] || 0); }, 0)} bed{selectedRooms.reduce((sum, room) => { const rk = room.selectionKey || room.room_type; return sum + (bedCounts[rk] || 0); }, 0) !== 1 ? 's' : ''} × ₱{bedPrice}:</span>
                        <span className='font-bold'>₱{(selectedRooms.reduce((sum, room) => { const rk = room.selectionKey || room.room_type; return sum + (bedCounts[rk] || 0); }, 0) * bedPrice * numberOfNights).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>× {numberOfNights} night{numberOfNights !== 1 ? 's' : ''}:</span>
                      </div>
                    </>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total Amount:</span>
                    <span>₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollArea>
        </div>
      </div>
    );
  };

  // ---------------------- Small helper for input min attr ----------------------
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0, 0, 0, 0);
  const tomorrowStr = formatYMD(tomorrow);


  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#113F67] text-white hover:bg-[#0d2f4f] border-[#113F67]"
        >
          Book Now
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="w-full max-w-none h-screen max-h-screen rounded-t-3xl p-0 flex flex-col"
      >
        {/* HEADER (fixed height) */}
        <div className="px-4 py-4 border-b" style={{ height: 84 }}>
          <div>
            <h2 className="text-2xl font-bold text-[#113F67] mb-1">Book Your Stay</h2>
            <p className="text-gray-600 text-sm">Complete your booking in {steps.length} easy steps</p>
          </div>
        </div>

        {/* SCROLLABLE AREA: use calc to ensure it never overflows the sheet */}
        <div
          className="overflow-y-auto px-4 py-4"
          style={{
            // header 84px + footer 76px (adjust if your footer height changes)
            height: 'calc(100vh - 84px - 76px)',
            WebkitOverflowScrolling: 'touch', // momentum scroll for iOS
          }}
        >
          <div className="mb-6">
            <Stepper steps={steps} currentStep={currentStep} />
          </div>

          <div>
            {currentStep === 1 && <RoomSelectionStep />}
            {currentStep === 2 && <BookingConfirmationStep />}
          </div>
        </div>

        {/* STICKY FOOTER: fixed height 76px (used above in calc) */}
        <SheetFooter
          className="bg-white border-t p-3"
          style={{ height: 76, paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex justify-end items-center gap-3 h-full">
            <div className="text-sm text-gray-500 hidden md:block">
              Step {currentStep} of {steps.length}
            </div>

            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={handleNextStep}
              className="bg-[#113F67] hover:bg-[#0d2f4f] flex items-center gap-2"
              size="sm"
              disabled={currentStep === steps.length}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </SheetFooter>
        <ShowAlert open={showAlert} onHide={handleCloseAlert} message={alertMessage} />

      </SheetContent>

    </Sheet >
  );

}

export default BookingWaccount