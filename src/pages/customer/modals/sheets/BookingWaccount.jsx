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
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Stepper } from '@/components/ui/stepper'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import ComboBox from '@/components/ui/combo-box'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import ShowAlert from '@/components/ui/show-alert'
import Moreinfo from './Moreinfo'

const schema = z.object({
  // Payment type toggle (gcash | bank)
  payType: z.enum(['gcash', 'bank']).default(''),
  // GCash fields
  gcashNumber: z.string().optional(),
  gcashName: z.string().optional(),
  // Bank Transfer fields
  bankName: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankReferenceNumber: z.string().optional(),
  // Proof of payment (file)
  proofOfPayment: z.any().optional(),
  // Amount to pay
  totalPay: z.string().min(1, { message: 'Total pay is required' }),
})

function BookingWaccount({ rooms, selectedRoom, guestNumber: initialGuestNumber, handleClearData, adultNumber, childrenNumber }) {
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

  // Inputs now managed via react-hook-form; local input state removed

  const handleRemoveFile = () => {
    setProofOfPayment(null)
    setPreviewUrl('')
    try { form.setValue('proofOfPayment', null, { shouldValidate: true }) } catch { }
    try { form.clearErrors('proofOfPayment') } catch { }
    if (fileInputRef.current) {
      fileInputRef.current.value = null
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    console.log('[ProofOfPayment] Selected file:', file)
    if (file) {
      console.log('[ProofOfPayment] name:', file.name, 'size:', file.size, 'type:', file.type)
      if (file.type.match('image.*')) {
        setProofOfPayment(file)
        try { form.setValue('proofOfPayment', file, { shouldValidate: true }) } catch { }
        try { form.clearErrors('proofOfPayment') } catch { }

        // Create a preview URL for the image
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviewUrl(e.target.result)
          console.log('[ProofOfPayment] preview URL generated')
        }
        reader.readAsDataURL(file)

        // Clear any previous errors
        setError('')
      } else {
        console.warn('[ProofOfPayment] Invalid file type:', file.type)
        setError('Please upload an image file (JPG, PNG, etc.)')
        setProofOfPayment(null)
        setPreviewUrl('')
        try {
          form.setValue('proofOfPayment', null, { shouldValidate: true })
          form.setError('proofOfPayment', { type: 'manual', message: 'Please upload an image file (JPG, PNG, etc.)' })
        } catch { }
        e.target.value = null
      }
    }
  }

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleShowAlert = async () => {
    // First validate the entire form
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    const formValues = form.getValues();
    const { totalPay, paymentMethod } = formValues;
    const subtotal = selectedRooms.reduce((total, room) => total + (Number(room.roomtype_price) * numberOfNights), 0)
    const extraBedCharges = selectedRooms.reduce((t, r) => t + (bedCounts[r.room_type] || 0) * 420 * numberOfNights, 0);
    const totalWithBeds = subtotal + extraBedCharges;
    const downPayment = (totalWithBeds * 0.5).toFixed(2)

    // Additional payment validations
    if (paymentMethod === 0) {
      toast.error("Please select a payment method");
      return;
    } else if (totalPay === "") {
      toast.error("Please enter total amount");
      return;
    } else if (Number(totalPay) < downPayment) {
      toast.error(`Total amount must be at least 50% of the total (₱${downPayment})`);
      return;
    }

    // Validate payment-specific fields and proof of payment
    if (!validatePaymentFields()) {
      return;
    }

    setAlertMessage("All payments are non-refundable. However, bookings may be canceled within 24 hours of confirmation.");
    setShowAlert(true);
  };
  const handleCloseAlert = async (status) => {
    if (status === 1) {
      // Validate the form before proceeding
      const isValid = await form.trigger();
      if (isValid) {
        handleConfirmBooking();
      } else {
        toast.error("Please fill in all required fields correctly.");
      }
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
      gcashNumber: '',
      gcashName: '',
      bankName: '',
      bankAccountName: '',
      bankAccountNumber: '',
      bankReferenceNumber: '',
      proofOfPayment: null,
      totalPay: '',
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
    try {
      // const today = new Date(); today.setHours(0, 0, 0, 0);
      // if (new Date(checkIn).getTime() <= today.getTime()) {
      //   toast.error("Check-in date cannot be today or earlier.");
      //   return;
      // }

      const url = localStorage.getItem('url') + "customer.php";
      const customerId = localStorage.getItem("userId");
      const childrenNumberLS = localStorage.getItem("children") || 0;
      const adultNumberLS = localStorage.getItem("adult") || 1;

      const subtotal = selectedRooms.reduce((t, r) => t + Number(r.roomtype_price) * numberOfNights, 0);
      const extraBedCharges = selectedRooms.reduce((t, r) => t + (bedCounts[r.room_type] || 0) * 420 * numberOfNights, 0);
      const total = subtotal + extraBedCharges;

      const displayedVat = subtotal - (subtotal / 1.12);
      const totalAmount = total.toFixed(2);
      // const downPayment = (subtotal * 0.5).toFixed(2);
      const down = total * 0.5;
      const downPayment = down.toFixed(2);

      const { totalPay, payType } = form.getValues();


      const bookingDetails = {
        checkIn: formatYMD(checkIn),
        checkOut: formatYMD(checkOut),
        downpayment: downPayment,
        totalAmount: totalAmount,
        displayedVat: displayedVat.toFixed(2),
        children: childrenNumberLS,
        adult: adultNumberLS,
        totalPay: totalPay,
        payment_method_id: payType === 'gcash' ? 1 : 2,
      };

      const roomDetails = selectedRooms.map((room) => {
        const adultCount = adultCounts[room.room_type] || 0;
        const childrenCount = childrenCounts[room.room_type] || 0;
        const bedCount = bedCounts[room.room_type] || 0;
        return {
          roomTypeId: room.room_type,
          guestCount: adultCount + childrenCount,
          adultCount: adultCount,
          childrenCount: childrenCount,
          bedCount: bedCount
        };
      });

      const jsonData = { customerId, bookingDetails, roomDetails };
      console.log("jsonData ni customerBookingWithAccount", jsonData);
      const formData = new FormData();
      formData.append("operation", "customerBookingWithAccount");
      formData.append("json", JSON.stringify(jsonData));

      // Attach proof of payment file in a simple way
      const file = form.getValues().proofOfPayment;
      if (file) {
        formData.append('file', file, file.name);
        console.log('[customerBookingWithAccount] file appended:', file.name);
      } else {
        console.log('[customerBookingWithAccount] No file to append');
      }

      const res = await axios({
        url,
        data: formData,
        method: 'post',
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log("res ni customerBookingWithAccount", res);
      if (res.data === -1) {
        toast.error("The room is not available anymore");
      } else if (res.data === 1) {
        toast.success("Booking successful");
        setOpen(false);
        localStorage.removeItem('checkIn');
        localStorage.removeItem('checkOut');
        setSelectedRooms([]);
        setAdultCounts({});
        setChildrenCounts({});
        setGuestCounts({});
        handleClearData();
        localStorage.setItem('refreshBookings', Date.now().toString());
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error("Booking error");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  };

  // Helper: simple validators for payment fields
  const normalizePhone = (raw) => (raw || '').replace(/[^0-9]/g, '');
  const isValidPHMobile = (raw) => {
    const d = normalizePhone(raw);
    // Accept 11-digit starting 09, or 12-digit starting 639
    if (/^09\d{9}$/.test(d)) return true;
    if (/^639\d{9}$/.test(d)) return true;
    return false;
  };
  const isValidEmail = (email) => {
    const v = (email || '').trim();
    // Lightweight email check
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  };
  const isDigitsBetween = (raw, min = 10, max = 20) => {
    const d = normalizePhone(raw);
    return new RegExp(`^\\d{${min},${max}}$`).test(d);
  };

  // Helper: validate payment-specific required fields and proof of payment using form values
  const validatePaymentFields = () => {
    const values = form.getValues();
    const payType = values.payType || paymentMethod;

    // Ensure a proof of payment image is uploaded
    if (!values.proofOfPayment) {
      toast.error("Please upload proof of payment.");
      try { form.setError('proofOfPayment', { type: 'manual', message: 'Proof of payment is required.' }) } catch { }
      return false;
    }

    if (payType === 'gcash') {
      if (!values.gcashNumber || !values.gcashName) {
        toast.error("Please complete all GCash details.");
        if (!values.gcashNumber) form.setError('gcashNumber', { type: 'manual', message: 'GCash number is required.' });
        if (!values.gcashName) form.setError('gcashName', { type: 'manual', message: 'Account name is required.' });
        return false;
      }
      if (!isValidPHMobile(values.gcashNumber)) {
        toast.error("Enter a valid PH mobile number (e.g., 09XXXXXXXXX or +639XXXXXXXXX).");
        form.setError('gcashNumber', { type: 'manual', message: 'Invalid PH mobile number.' });
        return false;
      }
      if ((values.gcashName || '').trim().length < 2) {
        toast.error("Account name looks too short.");
        form.setError('gcashName', { type: 'manual', message: 'Account name looks too short.' });
        return false;
      }
    } else if (payType === 'bank') {
      if (!values.bankName || !values.bankAccountName || !values.bankAccountNumber || !values.bankReferenceNumber) {
        toast.error("Please complete all Bank Transfer details.");
        if (!values.bankName) form.setError('bankName', { type: 'manual', message: 'Bank name is required.' });
        if (!values.bankAccountName) form.setError('bankAccountName', { type: 'manual', message: 'Account holder name is required.' });
        if (!values.bankAccountNumber) form.setError('bankAccountNumber', { type: 'manual', message: 'Account number is required.' });
        if (!values.bankReferenceNumber) form.setError('bankReferenceNumber', { type: 'manual', message: 'Reference number is required.' });
        return false;
      }
      if ((values.bankAccountName || '').trim().length < 2) {
        toast.error("Account holder name looks too short.");
        form.setError('bankAccountName', { type: 'manual', message: 'Account holder name looks too short.' });
        return false;
      }
      if (!isDigitsBetween(values.bankAccountNumber, 10, 20)) {
        toast.error("Account number must be 10–20 digits.");
        form.setError('bankAccountNumber', { type: 'manual', message: 'Account number must be 10–20 digits.' });
        return false;
      }
      if (!/^[A-Za-z0-9-]{6,}$/.test((values.bankReferenceNumber || '').trim())) {
        toast.error("Reference number must be at least 6 characters (letters, numbers, dashes).");
        form.setError('bankReferenceNumber', { type: 'manual', message: 'Reference number must be at least 6 characters.' });
        return false;
      }
    }

    return true;
  }

  const getPaymentMethod = async () => {
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const formData = new FormData();
      formData.append("operation", "getPaymentMethod");
      const res = await axios.post(url, formData);
      console.log("res ni get payment method", res);
      if (res.data !== 0) {
        const formattedData = res.data.map((item) => ({
          value: item.payment_method_id,
          label: item.payment_method_name,
        }));
        setPaymentMethod(formattedData);
      }
      // setPaymentMethod(res.data !== 0 ? res.data : []);
    } catch (error) {
      toast.error("Network error");
      console.error(error);
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

        setGuestCounts(g => ({ ...g, [roomTypeId]: Math.min(guestNum, selected.roomtype_capacity || 1) }));
        setAdultCounts(a => ({ ...a, [roomTypeId]: Math.min(storedAdult, selected.roomtype_capacity || Number.MAX_SAFE_INTEGER) }));
        setChildrenCounts(c => ({ ...c, [roomTypeId]: Math.min(storedChildren, selected.roomtype_capacity || Number.MAX_SAFE_INTEGER) }));
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
        setGuestCounts(prev => ({
          ...prev,
          [roomTypeId]: Math.min(parseInt(localStorage.getItem('guestNumber')) || 1, room.roomtype_capacity || 1)
        }));
      }

      if (adultCounts[roomTypeId] === undefined) {
        setAdultCounts(prev => ({
          ...prev,
          [roomTypeId]: Math.min(Math.max(0, parseInt(localStorage.getItem('adult')) || 1), room.roomtype_capacity || Number.MAX_SAFE_INTEGER)
        }));
      }

      if (childrenCounts[roomTypeId] === undefined) {
        const storedChildren = parseInt(localStorage.getItem('children')) || 0;
        const currAdults = adultCounts[roomTypeId] || 0;
        const remaining = Math.max(0, (room.roomtype_capacity || Number.MAX_SAFE_INTEGER) - currAdults);
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

  useEffect(() => {
    getPaymentMethod();
  }, []);

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
        toast.error("Please fill in all required fields correctly.");
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

  const handleConfirmBooking = () => {
    customerBookingWithAccount();
  };


  // Booking Summary Component
  const BookingSummary = () => {
    const subtotal = selectedRooms.reduce((t, r) => t + Number(r.roomtype_price) * numberOfNights, 0);
    const extraBedCharges = selectedRooms.reduce((t, r) => t + (bedCounts[r.room_type] || 0) * 420 * numberOfNights, 0);
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
                  <span>Subtotalss:</span>
                  <span>₱{subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {selectedRooms.reduce((total, room) => total + (bedCounts[room.room_type] || 0), 0) > 0 && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span>{selectedRooms.reduce((total, room) => total + (bedCounts[room.room_type] || 0), 0)} bed{selectedRooms.reduce((total, room) => total + (bedCounts[room.room_type] || 0), 0) !== 1 ? 's' : ''} × ₱420:</span>
                      <span className='font-bold'>₱{(selectedRooms.reduce((total, room) => total + (bedCounts[room.room_type] || 0), 0) * 420 * numberOfNights).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                <div className="flex justify-between items-center font-bold text-blue-600">
                  <span>Down Payment (50%):</span>
                  <span>₱{down.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> 50% down payment required to confirm booking.
                  </p>
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
                                      if (
                                        current + currentChildren <
                                        (room.roomtype_capacity || Number.MAX_SAFE_INTEGER)
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
                                      (room.roomtype_capacity || Number.MAX_SAFE_INTEGER)
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
                                      if (
                                        currentAdults + current <
                                        (room.roomtype_capacity || Number.MAX_SAFE_INTEGER)
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
                                      (room.roomtype_capacity || Number.MAX_SAFE_INTEGER)
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
  )
  const BookingConfirmationStep = () => {
    const subtotal = selectedRooms.reduce((t, r) => t + Number(r.roomtype_price) * numberOfNights, 0);
    const extraBedCharges = selectedRooms.reduce((t, r) => t + (bedCounts[r.room_type] || 0) * 420 * numberOfNights, 0);
    const vat = subtotal - (subtotal / 1.12);
    const total = subtotal + extraBedCharges;
    const down = total * 0.5;
    const formValues = form.getValues();


    return (
      <div className="h-[calc(100vh-400px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScrollArea className="h-[calc(100vh-400px)]">

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
                            <span>Extra Beds: {bedCounts[room.room_type] || 0}</span>
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
                        <span>{selectedRooms.reduce((total, room) => total + (bedCounts[room.room_type] || 0), 0)} bed{selectedRooms.reduce((total, room) => total + (bedCounts[room.room_type] || 0), 0) !== 1 ? 's' : ''} × ₱420:</span>
                        <span>₱{(selectedRooms.reduce((total, room) => total + (bedCounts[room.room_type] || 0), 0) * 420).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                  <div className="flex justify-between items-center text-lg font-bold text-blue-600">
                    <span>Down Payment (50%):</span>
                    <span>₱{down.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> A 50% down payment is required to confirm your booking.
                      The remaining balance will be collected upon check-in.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollArea>

          <ScrollArea className="h-[calc(100vh-400px)]">
            <Card className="bg-white shadow-md rounded-2xl overflow-hidden">
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
                      Bank Transfer
                    </Button>
                  </div>

                  {/* Payment Form */}
                  {paymentMethod === 'gcash' && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">Please complete your payment using GCash.</p>

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="gcashNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="gcash-number">GCash Number</FormLabel>
                              <FormControl>
                                <Input
                                  id="gcash-number"
                                  type="text"
                                  placeholder="09XX XXX XXXX"
                                  className="mt-1"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="gcashName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="gcash-name">Account Name</FormLabel>
                              <FormControl>
                                <Input
                                  id="gcash-name"
                                  type="text"
                                  placeholder="Full Name"
                                  className="mt-1"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />


                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg mt-4">
                        <h3 className="font-medium text-center mb-2">Payment Instructions</h3>
                        <ol className="list-decimal list-inside text-sm space-y-2 text-gray-700">
                          <li>Open your GCash app on your mobile device</li>
                          <li>Tap on "Send Money"</li>
                          <li>Enter the hotel's GCash number: <span className="font-medium">0917 123 4567</span></li>
                          <li>Enter the amount: ₱ {down.toLocaleString('en-PH')}</li>
                          <li>In the message field, include your booking reference</li>
                          <li>Complete the payment in your GCash app</li>
                          <li>Take a screenshot of your payment confirmation</li>
                          <li>Upload the screenshot below and click "Continue to Payment"</li>
                        </ol>
                      </div>

                      <div className="mt-6">
                        <FormField
                          control={form.control}
                          name="proofOfPayment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="proof-of-payment" className="font-medium">Upload Proof of Payment</FormLabel>
                              <FormControl>
                                <Input
                                  id="proof-of-payment"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    field.onChange(file);
                                    handleFileChange(e);
                                  }}
                                  name={field.name}
                                  ref={field.ref}
                                  onBlur={field.onBlur}
                                  className="mt-1"
                                />
                              </FormControl>
                              <FormMessage />
                              <p className="text-xs text-gray-600 mt-1">Selected file: {field.value?.name || 'No file chosen'}</p>
                              <p className="text-xs text-gray-500 mt-1">Upload a screenshot of your payment confirmation (JPG, PNG)</p>
                            </FormItem>
                          )}
                        />
                      </div>

                      {previewUrl && (
                        <div className="mt-4 relative">
                          <div className="border rounded-md overflow-hidden">
                            <img
                              src={previewUrl}
                              alt="Payment proof"
                              className="max-h-48 mx-auto"
                            />
                          </div>
                          <button
                            onClick={handleRemoveFile}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            type="button"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                      <div className="mt-6">
                        <FormField
                          control={form.control}
                          name="totalPay"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="total-pay-gcash">Amount to Pay</FormLabel>
                              <FormControl>
                                <Input
                                  id="total-pay-gcash"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="Enter amount (₱)"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                  {paymentMethod === 'bank' && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">Please complete your payment using Bank Transfer.</p>

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="bankName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="bank-name">Bank Name</FormLabel>
                              <FormControl>
                                <select
                                  id="bank-name"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  {...field}
                                >
                                  <option value="">Select your bank</option>
                                  <option value="bdo">BDO</option>
                                  <option value="bpi">BPI</option>
                                  <option value="metrobank">Metrobank</option>
                                  <option value="landbank">Landbank</option>
                                  <option value="pnb">PNB</option>
                                  <option value="securitybank">Security Bank</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bankAccountName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="account-name">Account Holder Name</FormLabel>
                              <FormControl>
                                <Input
                                  id="account-name"
                                  type="text"
                                  placeholder="Full Name"
                                  className="mt-1"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bankAccountNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="account-number">Account Number</FormLabel>
                              <FormControl>
                                <Input
                                  id="account-number"
                                  type="text"
                                  placeholder="XXXX-XXXX-XXXX"
                                  className="mt-1"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bankReferenceNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="reference-number">Reference Number</FormLabel>
                              <FormControl>
                                <Input
                                  id="reference-number"
                                  type="text"
                                  placeholder="Transaction Reference"
                                  className="mt-1"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg mt-4">
                        <h3 className="font-medium text-center mb-2">Hotel Bank Details</h3>
                        <div className="text-sm space-y-2 text-gray-700">
                          <p><span className="font-medium">Bank:</span> BDO (Banco de Oro)</p>
                          <p><span className="font-medium">Account Name:</span> Demiren Hotel and Restaurant</p>
                          <p><span className="font-medium">Account Number:</span> 1234-5678-9012</p>
                          <p><span className="font-medium">Branch:</span> Main Branch</p>
                          <p className="mt-3 text-xs">Please include your name and booking date in the reference/notes section when making the transfer.</p>
                          <p className="mt-3 text-xs">After completing your transfer, take a screenshot of the confirmation and upload it below.</p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <FormField
                          control={form.control}
                          name="proofOfPayment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="proof-of-payment-bank" className="font-medium">Upload Proof of Payment</FormLabel>
                              <FormControl>
                                <Input
                                  id="proof-of-payment-bank"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    field.onChange(file);
                                    handleFileChange(e);
                                  }}
                                  name={field.name}
                                  ref={field.ref}
                                  onBlur={field.onBlur}
                                  className="mt-1"
                                />
                              </FormControl>
                              <FormMessage />
                              <p className="text-xs text-gray-600 mt-1">Selected file: {field.value?.name || 'No file chosen'}</p>
                              <p className="text-xs text-gray-500 mt-1">Upload a screenshot of your payment confirmation (JPG, PNG)</p>
                            </FormItem>
                          )}
                        />

                        {previewUrl && (
                          <div className="mt-4 relative">
                            <div className="border rounded-md overflow-hidden">
                              <img
                                src={previewUrl}
                                alt="Payment proof"
                                className="max-h-48 mx-auto"
                              />
                            </div>
                            <button
                              onClick={handleRemoveFile}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              type="button"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="mt-6">
                        <FormField
                          control={form.control}
                          name="totalPay"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="total-pay-bank">Amount to Pay</FormLabel>
                              <FormControl>
                                <Input
                                  id="total-pay-bank"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="Enter amount (₱)"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                              <p className="text-xs text-gray-500 mt-1">Minimum is 50% of total. See summary above.</p>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
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
      <SheetContent side='bottom' className="w-full max-w-none overflow-y-auto h-full rounded-t-3xl p-3">
        <div className="flex flex-col h-full">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-[#113F67] mb-2">Book Your Stay</h2>
              <p className="text-gray-600">Complete your booking in {steps.length} easy steps</p>
            </div>


          </div>

          {/* Stepper */}
          <div className="mb-6">
            <Stepper steps={steps} currentStep={currentStep} />
          </div>

          {/* Step Content */}
          <div className="flex-1">
            {currentStep === 1 && <RoomSelectionStep />}
            {currentStep === 2 && <BookingConfirmationStep />}
          </div>
        </div>
        <ShowAlert open={showAlert} onHide={handleCloseAlert} message={alertMessage} />
        <SheetFooter>
          {/* Navigation Controls */}
          <div className={`flex justify-end items-center gap-3 ${currentStep === 1 ? 'mt-20' : 'mt-4'}`}>
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

            {currentStep < steps.length ? (
              <Button
                onClick={handleNextStep}
                className="bg-[#113F67] hover:bg-[#0d2f4f] flex items-center gap-2"
                size="sm"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleShowAlert}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                size="sm"
              >
                Confirm Booking
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );

}

export default BookingWaccount