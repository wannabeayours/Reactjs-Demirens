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
  walkinfirstname: z.string().min(1, { message: "First name is required" }),
  walkinlastname: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  // PH contact number: exactly 11 numeric digits
  contactNumber: z
    .string()
    .regex(/^\d{11}$/, { message: "Contact number must be exactly 11 digits" }),
  // Payment type toggle (gcash | bank)
  payType: z.enum(['gcash', 'bank']).default(''),
})

function BookingNoaccount({ rooms, selectedRoom, guestNumber: initialGuestNumber, handleClearData, adultNumber, childrenNumber }) {
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
      walkinfirstname: "",
      walkinlastname: "",
      email: "",
      contactNumber: "",
      // Payment defaults
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
      id: 'info',
      title: 'Guest Information',
      description: 'Enter your details'
    },
    {
      id: 'confirm',
      title: 'Confirm Booking',
      description: 'Review and confirm'
    }
  ];
  const navigateTo = useNavigate();

  const customerBookingNoAccount = async () => {

    const loading = toast.loading("Processing...");
    const childrenNumber = localStorage.getItem("children");
    const adultNumber = localStorage.getItem("adult");
    const subtotal = selectedRooms.reduce((total, room) => total + (Number(room.roomtype_price) * numberOfNights), 0)
    const extraBedCharges = selectedRooms.reduce((t, r) => {
      const roomTypeId = r.room_type;
      const capacity = r.roomtype_capacity || 0;
      const maxExtra = r.roomtype_maxbeds || 0;
      const guests = (adultCounts[roomTypeId] || 0) + (childrenCounts[roomTypeId] || 0);
      const over = Math.max(0, guests - capacity);
      const extraGuests = Math.min(over, maxExtra);
      return t + extraGuests * 420 * numberOfNights;
    }, 0);
    const displayedVat = subtotal - (subtotal / 1.12)
    const totalWithBeds = subtotal + extraBedCharges;
    const totalAmount = totalWithBeds.toFixed(2)

    const payType = form.getValues('payType');
    if (!payType) {
      toast.error("Please select a payment method");
      return;
    }
    const formValues = form.getValues();
    const { walkinfirstname, walkinlastname, email, contactNumber } = formValues;
    try {
      const url = localStorage.getItem('url') + "customer.php";

      const bookingDetails = {
        "checkIn": formatYMD(checkIn),
        "checkOut": formatYMD(checkOut),
        "downpayment": totalAmount,
        "totalAmount": totalAmount,
        "totalPay": totalAmount,
        "displayedVat": displayedVat.toFixed(2),
        "children": childrenNumber,
        "adult": adultNumber,
        "payment_method_id": payType === 'gcash' ? 1 : 2,
      }

      console.log("selected rooms", selectedRooms)
      console.log("adultCounts", adultCounts)
      console.log("childrenCounts", childrenCounts)
      console.log("bedCounts", bedCounts)

      const roomDetails = selectedRooms.map((room) => {
        const roomTypeId = room.room_type;
        const adultCount = adultCounts[roomTypeId] || 0;
        const childrenCount = childrenCounts[roomTypeId] || 0;
        const capacity = room.roomtype_capacity || 0;
        const maxExtra = room.roomtype_maxbeds || 0;
        const totalGuests = adultCount + childrenCount;
        const over = Math.max(0, totalGuests - capacity);
        const extraGuests = Math.min(over, maxExtra);
        console.log(`Room ${room.roomtype_name}: adults=${adultCount}, children=${childrenCount}, extraGuests=${extraGuests}`)
        return {
          roomTypeId: roomTypeId,
          guestCount: totalGuests,
          adultCount: adultCount,
          childrenCount: childrenCount,
          bedCount: extraGuests, // send extra guests count as bedCount for backend
        };
      });

      console.log("roomDetails", roomDetails);
      const jsonData = {
        walkinfirstname: walkinfirstname,
        walkinlastname: walkinlastname,
        email: email,
        contactNumber: contactNumber,
        bookingDetails: bookingDetails,
        roomDetails: roomDetails
      }

      console.log("jsondata", jsonData)
      localStorage.setItem("jsonData", JSON.stringify(jsonData));
      localStorage.setItem('refreshBookings', Date.now().toString());
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
      const childrenNumber = localStorage.getItem("children");
      const adultNumber = localStorage.getItem("adult");
      const subtotal = selectedRooms.reduce((total, room) => total + (Number(room.roomtype_price) * numberOfNights), 0)
      const extraBedCharges = selectedRooms.reduce((t, r) => {
        const roomTypeId = r.room_type;
        const capacity = r.roomtype_capacity || 0;
        const maxExtra = r.roomtype_maxbeds || 0;
        const guests = (adultCounts[roomTypeId] || 0) + (childrenCounts[roomTypeId] || 0);
        const over = Math.max(0, guests - capacity);
        const extraGuests = Math.min(over, maxExtra);
        return t + extraGuests * 420 * numberOfNights;
      }, 0);
      const displayedVat = subtotal - (subtotal / 1.12)
      const totalWithBeds = subtotal + extraBedCharges;
      const downPayment = (totalWithBeds * 0.5).toFixed(2)
      const totalAmount = totalWithBeds.toFixed(2)
      const payType = form.getValues('payType');
      const formValues = form.getValues();
      const { walkinfirstname, walkinlastname, email, contactNumber } = formValues;

      const checkInWithTime = new Date(checkIn);
      checkInWithTime.setHours(14, 0, 0, 0);

      const bookingDetails = {
        "checkIn": formatYMD(checkInWithTime),
        "checkOut": formatYMD(checkOut),
        "downpayment": totalAmount,
        "totalAmount": totalAmount,
        "totalPay": totalAmount,
        "displayedVat": displayedVat.toFixed(2),
        "children": childrenNumber,
        "adult": adultNumber,
        "payment_method_id": payType === 'gcash' ? 1 : 2,
      }

      const roomDetails = selectedRooms.map((room) => {
        const roomTypeId = room.room_type;
        const adultCount = adultCounts[roomTypeId] || 0;
        const childrenCount = childrenCounts[roomTypeId] || 0;
        const capacity = room.roomtype_capacity || 0;
        const maxExtra = room.roomtype_maxbeds || 0;
        const totalGuests = adultCount + childrenCount;
        const over = Math.max(0, totalGuests - capacity);
        const extraGuests = Math.min(over, maxExtra);
        console.log(`Room ${room.roomtype_name}: adults=${adultCount}, children=${childrenCount}, extraGuests=${extraGuests}`)
        return {
          roomTypeId: roomTypeId,
          guestCount: totalGuests,
          adultCount: adultCount,
          childrenCount: childrenCount,
          bedCount: extraGuests,
        };
      });

      const jsonData = {
        walkinfirstname: walkinfirstname,
        walkinlastname: walkinlastname,
        email: email,
        contactNumber: contactNumber,
        bookingDetails: bookingDetails,
        roomDetails: roomDetails
      }

      const formData = new FormData();
      formData.append("totalAmount", totalAmount);
      formData.append("hasAccount", 0);
      formData.append("name", walkinfirstname + " " + walkinlastname);
      formData.append("email", email);
      formData.append("phone", contactNumber);
      localStorage.setItem("hasAccount", "0");
      const res = await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("[gcashBooking] response:", res.data);

      const checkoutUrl = res.data.checkout_url;
      if (checkoutUrl) {
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
      const extraBedCharges = selectedRooms.reduce((t, r) => {
        const roomTypeId = r.room_type;
        const capacity = r.roomtype_capacity || 0;
        const maxExtra = r.roomtype_maxbeds || 0;
        const guests = (adultCounts[roomTypeId] || 0) + (childrenCounts[roomTypeId] || 0);
        const over = Math.max(0, guests - capacity);
        const extraGuests = Math.min(over, maxExtra);
        return t + extraGuests * 420 * numberOfNights;
      }, 0);
      const displayedVat = subtotal - (subtotal / 1.12)
      const totalWithBeds = subtotal + extraBedCharges;
      const downPayment = (totalWithBeds * 0.5).toFixed(2)
      const totalAmount = totalWithBeds.toFixed(2)
      const payType = form.getValues('payType');

      const bookingDetails = {
        "checkIn": formatYMD(checkIn),
        "checkOut": formatYMD(checkOut),
        "downpayment": totalAmount,
        "totalAmount": totalAmount,
        "totalPay": totalAmount,
        "displayedVat": displayedVat.toFixed(2),
        "children": childrenNumber,
        "adult": adultNumber,
      }

      const roomDetails = selectedRooms.map((room) => {
        const roomTypeId = room.room_type;
        const adultCount = adultCounts[roomTypeId] || 0;
        const childrenCount = childrenCounts[roomTypeId] || 0;
        const capacity = room.roomtype_capacity || 0;
        const maxExtra = room.roomtype_maxbeds || 0;
        const totalGuests = adultCount + childrenCount;
        const over = Math.max(0, totalGuests - capacity);
        const extraGuests = Math.min(over, maxExtra);
        console.log(`Room ${room.roomtype_name}: adults=${adultCount}, children=${childrenCount}, extraGuests=${extraGuests}`)
        return {
          roomTypeId: roomTypeId,
          guestCount: totalGuests,
          adultCount: adultCount,
          childrenCount: childrenCount,
          bedCount: extraGuests,
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
      if (payType === 'gcash') {
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

        const selected = {
          roomtype_name: selectedRoom.roomtype_name,
          roomtype_price: selectedRoom.roomtype_price,
          room_type: selectedRoom.roomtype_id,
          roomtype_description: selectedRoom.roomtype_description,
          roomtype_capacity: selectedRoom.roomtype_capacity,
          roomtype_maxbeds: selectedRoom.roomtype_maxbeds,
        };

        const guestNum = parseInt(localStorage.getItem('guestNumber')) || initialGuestNumber || 1;
        const storedAdult = parseInt(localStorage.getItem('adult')) || adultNumber || 1;
        const storedChildren = parseInt(localStorage.getItem('children')) || childrenNumber || 0;
        const roomTypeId = selected.room_type;

        const maxGuestsInit = (selected.roomtype_capacity || 0) + (selected.roomtype_maxbeds || 0);
        setGuestCounts(g => ({ ...g, [roomTypeId]: Math.min(guestNum, maxGuestsInit || 1) }));
        setAdultCounts(a => ({ ...a, [roomTypeId]: Math.min(storedAdult, maxGuestsInit || Number.MAX_SAFE_INTEGER) }));
        setChildrenCounts(c => ({ ...c, [roomTypeId]: Math.min(storedChildren, Math.max(0, (maxGuestsInit || Number.MAX_SAFE_INTEGER) - (storedAdult || 0))) }));
        setBedCounts(b => ({ ...b, [roomTypeId]: 0 })); // Initialize with 0 beds

        return [...prev, selected];
      });
    }

    // only run when sheet opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Ensure newly added selectedRooms have initialized counts (safe: only sets when undefined)
  useEffect(() => {
    selectedRooms.forEach(room => {
      const roomTypeId = room.room_type;

      if (guestCounts[roomTypeId] === undefined) {
        const maxGuests = (room.roomtype_capacity || 0) + (room.roomtype_maxbeds || 0);
        setGuestCounts(prev => ({
          ...prev,
          [roomTypeId]: Math.min(parseInt(localStorage.getItem('guestNumber')) || 1, maxGuests || 1)
        }));
      }

      if (adultCounts[roomTypeId] === undefined) {
        const maxGuests = (room.roomtype_capacity || 0) + (room.roomtype_maxbeds || 0);
        setAdultCounts(prev => ({
          ...prev,
          [roomTypeId]: Math.min(Math.max(0, parseInt(localStorage.getItem('adult')) || 1), maxGuests || Number.MAX_SAFE_INTEGER)
        }));
      }

      if (childrenCounts[roomTypeId] === undefined) {
        const storedChildren = parseInt(localStorage.getItem('children')) || 0;
        const currAdults = adultCounts[roomTypeId] || 0;
        const maxGuests = (room.roomtype_capacity || 0) + (room.roomtype_maxbeds || 0);
        const remaining = Math.max(0, (maxGuests || Number.MAX_SAFE_INTEGER) - currAdults);
        setChildrenCounts(prev => ({
          ...prev,
          [roomTypeId]: Math.min(storedChildren, remaining)
        }));
      }

      if (bedCounts[roomTypeId] === undefined) {
        setBedCounts(prev => ({
          ...prev,
          [roomTypeId]: 0 // Initialize with 0 beds
        }));
      }
    });
    // intentionally depend only on selectedRooms (and counts as read) to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRooms]);

  // ---------------------- Handlers ----------------------

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
      setAdultCounts(prev => { const copy = { ...prev }; delete copy[roomToRemove.room_type]; return copy; });
      setChildrenCounts(prev => { const copy = { ...prev }; delete copy[roomToRemove.room_type]; return copy; });
      setGuestCounts(prev => { const copy = { ...prev }; delete copy[roomToRemove.room_type]; return copy; });
      setBedCounts(prev => { const copy = { ...prev }; delete copy[roomToRemove.room_type]; return copy; });
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
    const extraBedCharges = selectedRooms.reduce((t, r) => {
      const roomTypeId = r.room_type;
      const capacity = r.roomtype_capacity || 0;
      const maxExtra = r.roomtype_maxbeds || 0;
      const guests = (adultCounts[roomTypeId] || 0) + (childrenCounts[roomTypeId] || 0);
      const over = Math.max(0, guests - capacity);
      const extraGuests = Math.min(over, maxExtra);
      return t + extraGuests * 420 * numberOfNights;
    }, 0);
    const extraGuestCount = selectedRooms.reduce((t, r) => {
      const roomTypeId = r.room_type;
      const capacity = r.roomtype_capacity || 0;
      const maxExtra = r.roomtype_maxbeds || 0;
      const guests = (adultCounts[roomTypeId] || 0) + (childrenCounts[roomTypeId] || 0);
      const over = Math.max(0, guests - capacity);
      const extraGuests = Math.min(over, maxExtra);
      return t + extraGuests;
    }, 0);
    const vat = subtotal - (subtotal / 1.12);
    const total = subtotal + extraBedCharges;
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
                <span className="font-medium">{selectedRooms.reduce((total, room) => total + (adultCounts[room.room_type] || 0) + (childrenCounts[room.room_type] || 0), 0)} guest{selectedRooms.reduce((total, room) => total + (adultCounts[room.room_type] || 0) + (childrenCounts[room.room_type] || 0), 0) !== 1 ? 's' : ''}</span>
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
                {extraGuestCount > 0 && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span>{extraGuestCount} extra person{extraGuestCount !== 1 ? 's' : ''} × ₱420:</span>
                      <span className='font-bold'>₱{(extraGuestCount * 420 * numberOfNights).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>× {numberOfNights} night{numberOfNights !== 1 ? 's' : ''}:</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span>VAT (12%) included:</span>
                  <span>₱{vat.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Amount:</span>
                  <span>₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {/* <div className="flex justify-between items-center font-bold text-blue-600">
                  <span>Down Payment (50%):</span>
                  <span>₱{down.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div> */}
                {/* <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> 50% down payment required to confirm booking.
                  </p>
                </div> */}
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
          <ScrollArea className="h-[calc(100vh-400px)]">
            <div>
              {selectedRooms.length > 0 ? (
                <div>
                  {selectedRooms.map((room, index) => (
                    <Card key={index} className="mb-3 m-3">
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
                                      const roomTypeId = room.room_type;
                                      const current = adultCounts[roomTypeId] || 0;
                                      setAdultCounts((prev) => ({
                                        ...prev,
                                        [roomTypeId]: Math.max(0, current - 1),
                                      }));
                                    }}
                                    disabled={(adultCounts[room.room_type] || 0) <= 1}
                                  >
                                    <MinusIcon />
                                  </Button>
                                  {adultCounts[room.room_type] || 0}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-full"
                                    onClick={() => {
                                      const roomTypeId = room.room_type;
                                      const current = adultCounts[roomTypeId] || 0;
                                      const currentChildren = childrenCounts[roomTypeId] || 0;
                                      const maxGuests = (room.roomtype_capacity || Number.MAX_SAFE_INTEGER) + (room.roomtype_maxbeds || 0);
                                      if (
                                        current + currentChildren < maxGuests
                                      ) {
                                        setAdultCounts((prev) => ({
                                          ...prev,
                                          [roomTypeId]: current + 1,
                                        }));
                                      }
                                    }}
                                    disabled={
                                      (adultCounts[room.room_type] || 0) +
                                      (childrenCounts[room.room_type] || 0) >=
                                      ((room.roomtype_capacity || Number.MAX_SAFE_INTEGER) + (room.roomtype_maxbeds || 0))
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
                                      const roomTypeId = room.room_type;
                                      const current = childrenCounts[roomTypeId] || 0;
                                      setChildrenCounts((prev) => ({
                                        ...prev,
                                        [roomTypeId]: Math.max(0, current - 1),
                                      }));
                                    }}
                                    disabled={(childrenCounts[room.room_type] || 0) <= 0}
                                  >
                                    <MinusIcon />
                                  </Button>
                                  {childrenCounts[room.room_type] || 0}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-full"
                                    onClick={() => {
                                      const roomTypeId = room.room_type;
                                      const current = childrenCounts[roomTypeId] || 0;
                                      const currentAdults = adultCounts[roomTypeId] || 0;
                                      const maxGuests = (room.roomtype_capacity || Number.MAX_SAFE_INTEGER) + (room.roomtype_maxbeds || 0);
                                      if (
                                        currentAdults + current < maxGuests
                                      ) {
                                        setChildrenCounts((prev) => ({
                                          ...prev,
                                          [roomTypeId]: current + 1,
                                        }));
                                      }
                                    }}
                                    disabled={
                                      (adultCounts[room.room_type] || 0) +
                                      (childrenCounts[room.room_type] || 0) >=
                                      ((room.roomtype_capacity || Number.MAX_SAFE_INTEGER) + (room.roomtype_maxbeds || 0))
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
                                  <Label className="mb-2">Add Beds{" (₱420 each bed)"}</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-full"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const roomTypeId = room.room_type;
                                      const current = bedCounts[roomTypeId] || 0;
                                      setBedCounts((prev) => ({
                                        ...prev,
                                        [roomTypeId]: Math.max(0, current - 1),
                                      }));
                                    }}
                                    disabled={(bedCounts[room.room_type] || 0) <= 0}
                                  >
                                    <MinusIcon />
                                  </Button>
                                  {bedCounts[room.room_type] || 0}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-full"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const roomTypeId = room.room_type;
                                      const current = bedCounts[roomTypeId] || 0;
                                      const maxBeds = room.roomtype_maxbeds || 1;
                                      if (current < maxBeds) {
                                        setBedCounts((prev) => ({
                                          ...prev,
                                          [roomTypeId]: current + 1,
                                        }));
                                      }
                                    }}
                                    disabled={
                                      (bedCounts[room.room_type] || 0) >=
                                      (room.roomtype_maxbeds || 1)
                                    }
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
                                {(adultCounts[room.room_type] || 0) +
                                  (childrenCounts[room.room_type] || 0)}
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

  const GuestInformationStep = () => (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-white shadow-md">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Guest Information</h3>
          <Form {...form}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="walkinfirstname"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your first name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="walkinlastname"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your last name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={11}
                        placeholder="11-digit PH number (e.g., 09XXXXXXXXX)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </CardContent>
      </Card>

    </div>
  );

  const BookingConfirmationStep = () => {
    const subtotal = selectedRooms.reduce((t, r) => t + Number(r.roomtype_price) * numberOfNights, 0);
    const extraBedCharges = selectedRooms.reduce((t, r) => {
      const roomTypeId = r.room_type;
      const capacity = r.roomtype_capacity || 0;
      const maxExtra = r.roomtype_maxbeds || 0;
      const guests = (adultCounts[roomTypeId] || 0) + (childrenCounts[roomTypeId] || 0);
      const over = Math.max(0, guests - capacity);
      const extraGuests = Math.min(over, maxExtra);
      return t + extraGuests * 420 * numberOfNights;
    }, 0);
    const extraGuestCount = selectedRooms.reduce((t, r) => {
      const roomTypeId = r.room_type;
      const capacity = r.roomtype_capacity || 0;
      const maxExtra = r.roomtype_maxbeds || 0;
      const guests = (adultCounts[roomTypeId] || 0) + (childrenCounts[roomTypeId] || 0);
      const over = Math.max(0, guests - capacity);
      const extraGuests = Math.min(over, maxExtra);
      return t + extraGuests;
    }, 0);
    const vat = subtotal - (subtotal / 1.12);
    const total = subtotal + extraBedCharges;
    const down = total * 0.5;
    const formValues = form.getValues();


    return (
      <div className="h-[calc(100vh-350px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScrollArea className="h-[calc(100vh-350px)]">

            {/* Guest Information */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <Card className="bg-white shadow-md">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Guest Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">First Name</p>
                      <p className="font-medium">{formValues.walkinfirstname}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Name</p>
                      <p className="font-medium">{formValues.walkinlastname}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{formValues.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Contact Number</p>
                        <p className="font-medium">{formValues.contactNumber}</p>
                      </div>

                    </div>


                  </div>
                </CardContent>
              </Card>

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
                      <p className="font-medium">{selectedRooms.reduce((total, room) => total + (adultCounts[room.room_type] || 0) + (childrenCounts[room.room_type] || 0), 0)} guest{selectedRooms.reduce((total, room) => total + (adultCounts[room.room_type] || 0) + (childrenCounts[room.room_type] || 0), 0) !== 1 ? 's' : ''}</p>
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
                            <span>Adults: {adultCounts[room.room_type] || 0}</span>
                            <span>Children: {childrenCounts[room.room_type] || 0}</span>
                            <span>Extra Persons: {Math.min(Math.max(0, (adultCounts[room.room_type] || 0) + (childrenCounts[room.room_type] || 0) - (room.roomtype_capacity || 0)), room.roomtype_maxbeds || 0)}</span>
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
                    <CreditCard onSubmit={customerBookingNoAccount} totalAmount={total} isRoomAvailable={isRoomAvailable} />
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
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Subtotal:</span>
                    <span>₱{subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>VAT (12%) included:</span>
                    <span>₱{vat.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  {extraBedCharges > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span>{extraGuestCount} extra person{extraGuestCount !== 1 ? 's' : ''} × ₱420:</span>
                        <span>₱{(extraGuestCount * 420).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>× {numberOfNights} night{numberOfNights !== 1 ? 's' : ''}:</span>
                        <span>₱{extraBedCharges.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span>₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  {/* <div className="flex justify-between items-center text-lg font-bold text-blue-600">
                    <span>Down Payment (50%):</span>
                    <span>₱{down.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div> */}
                  {/* <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> A 50% down payment is required to confirm your booking.
                      The remaining balance will be collected upon check-in.
                    </p>
                  </div> */}
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
        className="w-full max-w-none h-full rounded-t-3xl p-0 flex flex-col"
      >
        {/* Scrollable area */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-[#113F67] mb-2">Book Your Stay</h2>
              <p className="text-gray-600">
                Complete your booking in {steps.length} easy steps
              </p>
            </div>
          </div>

          {/* Stepper */}
          <div className="mb-6">
            <Stepper steps={steps} currentStep={currentStep} />
          </div>

          {/* Step Content */}
          <div>
            {currentStep === 1 && <RoomSelectionStep />}
            {currentStep === 2 && <GuestInformationStep />}
            {currentStep === 3 && <BookingConfirmationStep />}
          </div>
        </div>

        {/* Sticky footer */}
        <SheetFooter className="sticky bottom-0 bg-white border-t p-3">
          <div className="flex justify-end items-center gap-3">
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

export default BookingNoaccount