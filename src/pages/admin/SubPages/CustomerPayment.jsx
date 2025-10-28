import React, { useEffect, useMemo, useState } from 'react'
import { NumberFormatter } from '../Function_Files/NumberFormatter'
import { DateFormatter } from '../Function_Files/DateFormatter'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { ChevronsUpDownIcon, CheckIcon } from "lucide-react"
import AdminModal from '../components/AdminModal'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from '@/components/ui/scroll-area'
import axios from 'axios'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const CustomerPayment = ({ customer, onBack, paymentMethods = [] }) => {
  const APIConn = `${localStorage.url}admin.php`

  const [customerBills, setCustomerBills] = useState([]);
  const [selectedChargeId, setSelectedChargeId] = useState("")
  const [selectedDiscountId, setSelectedDiscountId] = useState("")
  const [quantity, setQuantity] = useState(1);
  const [openCharge, setOpenCharge] = useState(false)
  const [openDiscount, setOpenDiscount] = useState(false)
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [openRoom, setOpenRoom] = useState(false);
  const [customerRooms, setCustomerRooms] = useState([])

  const [chargeOptions, setChargeOptions] = useState([])
  const [discountOptions, setDiscountOptions] = useState([])
  const [modalSettings, setModalSettings] = useState({
    title: '',
    showModal: false
  })

  // New: payment form states
  const [amountReceived, setAmountReceived] = useState('')
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(null)
  // New: track payment processing state to disable UI while request is in-flight
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  // New: transactions endpoint for invoice-related operations
  const APIConnTransactions = `${localStorage.url}transactions.php`

  // Date helper for JSX
  const formatDate = DateFormatter.formatDate;

  // Modal controls
  const openModal = (title = '') => setModalSettings({ title, showModal: true });
  const closeModal = () => setModalSettings(prev => ({ ...prev, showModal: false }));

  // Totals and balances
  const totalCharges = useMemo(() => {
    if (Array.isArray(customerBills) && customerBills.length > 0) {
      return customerBills.reduce((sum, bill) => {
        const price = parseFloat(bill.item_price) || 0;
        const qty = parseFloat(bill.item_amount) || 1;
        return sum + price * qty;
      }, 0);
    }
    const fallback = parseFloat(customer?.booking_totalAmount || customer?.billing_total_amount || 0) || 0;
    return fallback;
  }, [customerBills, customer]);

  const downpayment = useMemo(() => {
    const dp = parseFloat(
      customer?.booking_downpayment ??
      customer?.booking_payment ??
      customer?.billing_downpayment ??
      0
    ) || 0;
    return dp;
  }, [customer]);

  const balance = useMemo(() => {
    const bal = totalCharges - downpayment;
    return bal < 0 ? 0 : bal;
  }, [totalCharges, downpayment]);

  const amountParsed = useMemo(() => NumberFormatter.parseCurrencyInput(amountReceived), [amountReceived]);
  const changeAmount = useMemo(() => {
    const diff = amountParsed - balance;
    return diff > 0 ? diff : 0;
  }, [amountParsed, balance]);

  // Payment actions
  const handlePay = async () => {
    if (!customer?.booking_id) { alert('Missing booking_id'); return; }
    const payment_amount = NumberFormatter.parseCurrencyInput(amountReceived);
    if (!selectedPaymentMethodId) { alert('Select a payment method'); return; }
    setIsProcessingPayment(true);
    try {
      const getCurrentEmployeeId = () => {
        const keys = ['employee_id','employeeId','userId','user_id','userID','admin_id'];
        for (const k of keys) {
          const v = localStorage.getItem(k);
          if (v && parseInt(v)) return parseInt(v);
        }
        return null;
      };
      const employee_id = getCurrentEmployeeId();
      if (!employee_id) { alert('Missing employee_id'); setIsProcessingPayment(false); return; }

      const payload = {
        booking_id: customer.booking_id,
        employee_id,
        payment_method_id: selectedPaymentMethodId,
        invoice_status_id: 1,
        discount_id: selectedDiscountId || null,
        vat_rate: 0,
        downpayment: payment_amount,
        delivery_mode: 'pdf',
      };
      const formData = new FormData();
      formData.append('operation', 'createInvoice');
      formData.append('json', JSON.stringify(payload));
      const res = await axios.post(APIConnTransactions, formData);
      if (res.data?.success) {
        alert('Payment recorded. Invoice created.');
      } else {
        alert(res.data?.message || 'Failed to create invoice');
      }
    } catch (err) {
      console.error('handlePay error:', err);
      alert('Error processing payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!customer?.booking_id) { alert('Missing booking_id'); return; }
    const baseUrl = localStorage.getItem('url') || '';
    const empRaw = localStorage.getItem('employee_id') || localStorage.getItem('userId') || '1';
    const employee_id = parseInt(empRaw) || 1;
    const params = new URLSearchParams({
      booking_id: String(customer.booking_id),
      delivery_mode: 'pdf',
      stream: '1',
      employee_id: String(employee_id),
    });
    const url = baseUrl + 'generate-invoice.php?' + params.toString();
    window.location.href = url;
  };

  // API Connections
  const getBillingInfo = async () => {
    const billReqInfo = new FormData();
    billReqInfo.append('method', 'getCustomerBilling');
    billReqInfo.append('json', JSON.stringify({ booking_id: customer.booking_id }));

    try {
      const response = await axios.post(APIConn, billReqInfo);
      const data = response.data;

      console.log('Billing info:', data);

      if (Array.isArray(data)) {
        setCustomerBills(data);
      } else {
        console.warn('Unexpected billing data format:', data);
        setCustomerBills([]);
      }

    } catch (err) {
      console.error('Failed to fetch billing info:', err);
      setCustomerBills([]);
    }

  };

  const getCharges = async () => {
    const chargeReq = new FormData()
    // Backend exposes get_available_charges in api/admin.php
    chargeReq.append('method', 'get_available_charges')

    try {
      const res = await axios.post(APIConn, chargeReq)
      if (res.data && Array.isArray(res.data)) {
        // Expected keys: charges_master_id, charges_master_name, charges_master_price, charges_category_name
        setChargeOptions(res.data)
      } else {
        console.warn("Unexpected response for charges:", res.data)
        setChargeOptions([])
      }
    } catch (err) {
      console.error("Error fetching charges:", err)
      setChargeOptions([])
    }
  }

  const getDiscounts = async () => {
    const discountReq = new FormData()
    // Use viewDiscounts per admin.php
    discountReq.append('method', 'viewDiscounts')

    try {
      const res = await axios.post(APIConn, discountReq)
      if (res.data && Array.isArray(res.data)) {
        setDiscountOptions(res.data)
      } else {
        console.warn("Unexpected response for discounts:", res.data)
        setDiscountOptions([])
      }
    } catch (err) {
      console.error("Error fetching discounts:", err)
      setDiscountOptions([])
    }
  }

  const getCustomerRooms = async () => {
    // Prefer booking-specific rooms so charges can be tied correctly
    const req = new FormData();
    req.append('method', 'get_booking_rooms_by_booking');
    req.append('json', JSON.stringify({ booking_id: customer.booking_id }));

    try {
      const response = await axios.post(APIConn, req);
      const data = response.data;
      if (Array.isArray(data)) {
        setCustomerRooms(data);
      } else if (data && Array.isArray(data?.rooms)) {
        // Some endpoints return { rooms: [...] }
        setCustomerRooms(data.rooms);
      } else {
        console.warn('Unexpected rooms response:', data);
        // Fallback: fetch all rooms if booking-specific fails
        try {
          const fallbackReq = new FormData();
          fallbackReq.append('method', 'viewAllRooms');
          const fallbackRes = await axios.post(APIConn, fallbackReq);
          setCustomerRooms(Array.isArray(fallbackRes.data) ? fallbackRes.data : []);
        } catch (fallbackErr) {
          console.error('Fallback rooms fetch failed:', fallbackErr);
          setCustomerRooms([]);
        }
      }
    } catch (err) {
      console.error('Error fetching customer rooms:', err);
      setCustomerRooms([]);
    }
  };

  const addCharges = async () => {
    const selectedCharge = chargeOptions.find(c => c.charges_master_id === selectedChargeId);
    const selectedDiscount = discountOptions.find(d => d.discounts_id === selectedDiscountId);
    const selectedRoom = customerRooms.find(r => r.roomnumber_id === selectedRoomId);

    const chargePayload = {
      booking_id: customer.booking_id,
      charge: {
        id: selectedChargeId,
        name: selectedCharge?.charges_master_name || null,
        amount: selectedCharge?.charges_master_price || 0,
      },
      discount: selectedDiscountId
        ? {
            id: selectedDiscountId,
            name: selectedDiscount?.discounts_name || null,
            percent: selectedDiscount?.discounts_percentage || 0,
          }
        : null,
      room: {
        id: selectedRoomId,
        number: selectedRoom?.roomnumber_id || null,
      },
      quantity: quantity,
      total_price: totalPrice,
    };

    console.log("🧾 Charge Payload to Submit:", chargePayload);

    const formData = new FormData();
    formData.append('method', 'addCustomerCharges');
    formData.append('json', JSON.stringify(chargePayload));

    try {
      const response = await axios.post(APIConn, formData);
      console.log("✅ Server response:", response.data);
    } catch (error) {
      console.error("❌ Error submitting charge:", error);
    }
  };

  useEffect(() => {
    const selectedCharge = chargeOptions.find(
      c => c.charges_master_id == selectedChargeId
    );
    const chargePrice = selectedCharge?.charges_master_price || 0;

    const selectedDiscount = discountOptions.find(
      d => d.discounts_id == selectedDiscountId
    );
    const discountPercent = selectedDiscount?.discounts_percentage || 0;

    const totalBeforeDiscount = chargePrice * quantity;
    const discountedAmount = totalBeforeDiscount * (discountPercent / 100);
    const calculatedTotal = totalBeforeDiscount - discountedAmount;

    setTotalPrice(calculatedTotal);
  }, [selectedChargeId, selectedDiscountId, quantity, chargeOptions, discountOptions]);

  return (
    <>
      <div id='MainPage'>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Basic Info, Charges, Total */}
          <div className="space-y-6">

            {/* Basic Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Customer Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Customer Name:</span>{" "}
                  {customer?.fullname || customer?.customers_online_username || "-"}
                </p>
                <p>
                  <span className="font-semibold">Invoice No:</span>{" "}
                  {customer?.reference_no || "-"}
                </p>
                <p>
                  <span className="font-semibold">Billing date:</span>{" "}
                  {customer?.booking_created_at ? formatDate(customer.booking_created_at) : "-"}
                </p>
              </CardContent>
            </Card>

            {/* Charges */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Charges</h3>
                <Button
                  className="bg-black text-white hover:bg-gray-800"
                  onClick={async () => {
                    try {
                      await Promise.all([getCharges(), getDiscounts(), getCustomerRooms()])
                    } catch (e) {
                      console.error('Failed prefetching charges/discounts/rooms', e)
                    }
                    openModal("Add Charges")
                  }}
                >
                  Add Charges
                </Button>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <ScrollArea className="w-full max-h-[300px] overflow-auto">
                    <div className="min-w-[600px]"> {/* Ensures horizontal scroll if needed */}
                      <Table>
                        <TableCaption>Breakdown of customer charges</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[80px]">Room No.</TableHead>
                            <TableHead>Charge Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customerBills.length > 0 ? (
                            customerBills.map((bill, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{bill.roomnumber_id}</TableCell>
                                <TableCell>{bill.item_name}</TableCell>
                                <TableCell>{bill.item_amount || 1}</TableCell>
                                <TableCell>
                                  {NumberFormatter.formatCurrency(bill.item_price)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {NumberFormatter.formatCurrency(parseFloat(bill.item_price) * (bill.item_amount || 1))}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                                No charges found for this customer.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>


              {/* Total Amount */}
              <Card>
                <CardHeader>
                  <CardTitle>Total Amount</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>
                    <span className="font-semibold">Total Amount:</span>{" "}
                    {NumberFormatter.formatCurrency(totalCharges)}
                  </p>
                  <p>
                    <span className="font-semibold">Downpayment:</span>{" "}
                    {NumberFormatter.formatCurrency(downpayment)}
                  </p>
                  <p>
                    <span className="font-semibold">Balance:</span>{" "}
                    {NumberFormatter.formatCurrency(balance)}
                  </p>

                </CardContent>
              </Card>
            </div>
          </div>

          {/* Column 2: Payment Card */}
          <div className="h-fit">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-2">
                  <Label htmlFor="amountReceived">Amount Received</Label>
                  <Input id="amountReceived" placeholder="₱ 0.00" value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)} />
                </div>
                <p><span className="font-semibold">Change:</span> {NumberFormatter.formatCurrency(changeAmount)}</p>

                {/* Dynamic Payment Methods */}
                {Array.isArray(paymentMethods) && paymentMethods.length > 0 ? (
                  <div className="space-y-2">
                    <Label htmlFor="payment_method">Payment Method</Label>
                    <Select
                      value={selectedPaymentMethodId ? selectedPaymentMethodId.toString() : ""}
                      onValueChange={(value) => setSelectedPaymentMethodId(value ? parseInt(value) : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map(pm => (
                          <SelectItem key={pm.payment_method_id} value={pm.payment_method_id.toString()}>
                            {pm.payment_method_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">No payment methods available.</div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-4">
                <Button
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={handlePay}
                  disabled={!selectedPaymentMethodId || !amountReceived || isProcessingPayment}
                >
                  Pay
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={handlePrintReceipt}
                >
                  Print Receipt
                </Button>
              </CardFooter>

            </Card>
          </div>
        </div>

        <Button
          onClick={onBack}
          className="mt-4"
        >
          ← Back
        </Button>
      </div>


      <AdminModal
        isVisible={modalSettings.showModal}
        onClose={closeModal}
        modalTitle={modalSettings.title}
      >
        <div className="space-y-6 px-2 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Charges Dropdown (ShadCN Combobox) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Charges Category
              </label>
              <Popover open={openCharge} onOpenChange={setOpenCharge}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCharge}
                    className="w-full justify-between"
                  >
                    {selectedChargeId
                      ? chargeOptions.find(c => c.charges_master_id == selectedChargeId)?.charges_master_name
                      : "Select charge..."}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search charges..." />
                    <CommandList>
                      <CommandEmpty>No charge found.</CommandEmpty>
                      <CommandGroup>
                        {chargeOptions.map((charge) => (
                          <CommandItem
                            key={charge.charges_master_id}
                            value={charge.charges_master_name} // ← now searchable by name
                            onSelect={(value) => {
                              const selected = chargeOptions.find(c => c.charges_master_name === value);
                              setSelectedChargeId(selected?.charges_master_id || null);
                              setOpenCharge(false);
                            }}
                          >
                            <CheckIcon className={cn("mr-2 h-4 w-4", selectedChargeId === charge.charges_master_id ? "opacity-100" : "opacity-0")} />
                            {charge.charges_master_name}
                          </CommandItem>

                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Discount Dropdown (ShadCN Combobox) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Discount Charges
              </label>
              <Popover open={openDiscount} onOpenChange={setOpenDiscount}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openDiscount}
                    className="w-full justify-between"
                  >
                    {selectedDiscountId
                      ? discountOptions.find(d => d.discounts_id == selectedDiscountId)?.discounts_type +
                      ` (${discountOptions.find(d => d.discounts_id == selectedDiscountId)?.discounts_percent}%)`
                      : "Select discount..."}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search discounts..." />
                    <CommandList>
                      <CommandEmpty>No discount found.</CommandEmpty>
                      <CommandGroup>
                        {/* No Discount Option */}
                        <CommandItem
                          value="none"
                          onSelect={() => {
                            setSelectedDiscountId(null)
                            setOpenDiscount(false)
                          }}
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedDiscountId === null ? "opacity-100" : "opacity-0"
                            )}
                          />
                          No Discount
                        </CommandItem>

                        {/* Other Discount Options */}
                        {discountOptions.map((discount) => (
                          <CommandItem
                            key={discount.discounts_id}
                            value={discount.discounts_type} // use name for searching
                            onSelect={(value) => {
                              const selected = discountOptions.find(d => d.discounts_type === value);
                              setSelectedDiscountId(selected?.discounts_id || null);
                              setOpenDiscount(false);
                            }}
                          >
                            <CheckIcon className={cn(
                              "mr-2 h-4 w-4",
                              selectedDiscountId === discount.discounts_id ? "opacity-100" : "opacity-0"
                            )} />
                            {discount.discounts_type} ({discount.discounts_percent}%)
                          </CommandItem>
                        ))}

                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Room Number Dropdown (ShadCN Combobox) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Room Number
            </label>
            <Popover open={openRoom} onOpenChange={setOpenRoom}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openRoom}
                  className="w-full justify-between"
                >
                  {selectedRoomId
                    ? customerRooms.find(r => r.roomnumber_id === selectedRoomId)?.roomnumber_id
                    : "Select room..."}
                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search rooms..." />
                  <CommandList>
                    <CommandEmpty>No room found.</CommandEmpty>
                    <CommandGroup>
                      {customerRooms.map((room) => (
                        <CommandItem
                          key={room.booking_room_id}
                          value={room.roomnumber_id?.toString()}
                          onSelect={() => {
                            setSelectedRoomId(room.roomnumber_id)
                            setOpenRoom(false)
                          }}
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedRoomId === room.roomnumber_id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          Room {room.roomnumber_id}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>




          <div className="space-y-4">
            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min={1}
                placeholder="Enter Quantity"
                className="w-full border rounded-md px-3 py-2 text-gray-800"
              />
            </div>

            {/* Computed Price Input (Read-Only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price</label>
              <input
                type="number"
                value={totalPrice}
                readOnly
                className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-800"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              className="bg-black text-white px-6 py-2 rounded-md shadow hover:bg-gray-800 transition"
              onClick={addCharges}
            >
              Add Charges
            </Button>

          </div>
        </div>
      </AdminModal>

    </>
  )
}

export default CustomerPayment
