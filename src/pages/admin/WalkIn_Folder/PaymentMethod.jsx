import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useWalkIn } from './WalkInContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { NumberFormatter } from '../Function_Files/NumberFormatter';
import { DateFormatter } from '../Function_Files/DateFormatter';

const PaymentMethod = () => {
  const APIConn = `${localStorage.url}admin.php`;
  const { walkInData, setWalkInData } = useWalkIn();
  const navigate = useNavigate();

  const [method, setMethod] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [discount, setDiscount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Fetch payment methods from API
  const getAllPaymentMethods = async () => {
    const payMethods = new FormData();
    payMethods.append('method', 'getAllPayMethods');

    try {
      const res = await axios.post(APIConn, payMethods);
      setPaymentMethods(res.data);
      console.log('All Payment Methods: ', res.data);
    } catch (err) {
      console.error('❌ Error fetching payment methods:', err);
    }
  };

  useEffect(() => {
    getAllPaymentMethods();
  }, []);

  // Calculate nights between check-in and check-out
  const checkInDate = new Date(walkInData.checkIn || null);
  const checkOutDate = new Date(walkInData.checkOut || null);
  const nights =
    walkInData.checkIn && walkInData.checkOut
      ? Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
      : 0;

  const formatDate = (date) =>
    date ? DateFormatter.formatLongDate(date) : '';

  // Calculate total room rate from multiple selected rooms or single room
  const roomRate = walkInData.selectedRooms
    ? walkInData.selectedRooms.reduce((sum, room) => sum + (room.roomtype_price || room.price || 0), 0)
    : walkInData.selectedRoom?.roomtype_price || walkInData.selectedRoom?.price || 0;

  const subtotal = roomRate * nights;
  const vat = subtotal * 0.12;
  const total = subtotal + vat - (Number(discount) || 0);

  // Set default amount to 50% of total when method changes
  useEffect(() => {
    if (method && !amountPaid) {
      const fiftyPercent = total * 0.5;
      setAmountPaid(Number.isFinite(fiftyPercent) ? fiftyPercent.toFixed(2) : '');
    }
  }, [method, total]);

  const handleNext = () => {
    const numericAmountPaid = parseFloat(String(amountPaid).replace(/,/g, ''));

    if (!method || !amountPaid || !Number.isFinite(numericAmountPaid)) {
      alert('Please fill in all required fields.');
      return;
    }

    if (method.toLowerCase() !== 'cash' && !referenceNumber.trim()) {
      alert('Reference Number is required for this payment method.');
      return;
    }

    const minimumPayment = total * 0.5; // 50% of total
    if (numericAmountPaid < minimumPayment) {
      alert(`The amount paid must be at least 50% of the total (₱${minimumPayment.toLocaleString()})`);
      return;
    }

    const updatedData = {
      ...walkInData,
      payment: {
        method,
        amountPaid: numericAmountPaid,
        discount: parseFloat(discount) || 0,
        referenceNumber: referenceNumber.trim(),
      },
      billing: {
        roomRate,
        subtotal,
        vat,
        total,
        nights,
      },
    };

    setWalkInData(updatedData);

    // Navigate to confirmation page after saving payment info
    navigate('/admin/confirmation');
  };

  return (
    <div className="lg:ml-72 flex flex-col lg:flex-row gap-6 p-6 max-w-5xl mx-auto">
      {/* Payment Form */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payment Method */}
          <div className="space-y-2">
            <Label>
              Payment Method <span className="text-red-500">*</span>
            </Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods
                  .filter(
                    (pm) =>
                      pm &&
                      typeof pm.payment_method_name === 'string' &&
                      pm.payment_method_name.trim() !== ''
                  )
                  .map((pm) => {
                    const value = pm.payment_method_name.toLowerCase();
                    return (
                      <SelectItem key={pm.payment_method_id} value={value}>
                        {pm.payment_method_name}
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Paid */}
          <div className="space-y-2">
            <Label>
              Amount Paid <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Enter amount"
              value={amountPaid}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setAmountPaid(value);
                }
              }}
            />
          </div>

          {/* Discount */}
          <div className="space-y-2">
            <Label>
              Discount <span className="text-gray-500 text-sm">(optional)</span>
            </Label>
            <Input
              type="text"
              placeholder="Enter discount"
              value={discount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setDiscount(value);
                }
              }}
            />
          </div>

          {/* Reference Number */}
          {method && method.toLowerCase() !== 'cash' && (
            <div className="space-y-2">
              <Label>
                Reference Number <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Enter reference number"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>
          )}

          <Button
            className="w-full mt-4"
            onClick={handleNext}
            disabled={
              !method ||
              !amountPaid ||
              !Number.isFinite(parseFloat(String(amountPaid).replace(/,/g, ''))) ||
              parseFloat(String(amountPaid).replace(/,/g, '')) < (total * 0.5) ||
              (method && method.toLowerCase() !== 'cash' && !referenceNumber.trim())
            }
          >
            Continue
          </Button>
          
      <p>Anything but Cash is yet to be Working</p>
        </CardContent>
      </Card>

      {/* Receipt Preview */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Receipt Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Rooms:</strong></p>
          <ul className="list-disc list-inside mb-2">
            {walkInData.selectedRooms?.length > 0
              ? walkInData.selectedRooms.map((room, idx) => (
                  <li key={idx}>
                    Room #{room.roomnumber_id || room.id} (Floor {room.roomfloor || room.floor}) - {room.rooms_type_name || room.name || 'Room'} - {NumberFormatter.formatCurrency(room.roomtype_price || room.price || 0)}
                  </li>
                ))
              : walkInData.selectedRoom
              ? (
                <li>
                  Room #{walkInData.selectedRoom.roomnumber_id || walkInData.selectedRoom.id} - {walkInData.selectedRoom.roomtype_name || walkInData.selectedRoom.name} - {NumberFormatter.formatCurrency(walkInData.selectedRoom.roomtype_price || walkInData.selectedRoom.price || 0)}
                </li>
              )
              : <li>No rooms selected</li>}
          </ul>

          <p><strong>Check-In:</strong> {formatDate(walkInData.checkIn)}</p>
          <p><strong>Check-Out:</strong> {formatDate(walkInData.checkOut)}</p>
          <p><strong>Nights:</strong> {nights}</p>
          <p><strong>Guests:</strong> {walkInData.guests || 1}</p>
          <hr />
          <p><strong>Room Rate:</strong> {NumberFormatter.formatCurrency(roomRate)} per night</p>
          <p>
            <strong>Subtotal:</strong> {NumberFormatter.formatCurrency(subtotal)}
            <span className="text-gray-500"> ({NumberFormatter.formatCurrency(roomRate)} × {nights} nights)</span>
          </p>
          <p><strong>VAT (12%):</strong> {NumberFormatter.formatCurrency(vat)}</p>
          <p><strong>Discount:</strong> {NumberFormatter.formatCurrency(Number(discount) || 0)}</p>
          <hr />
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
            <p className="text-xl font-bold text-green-700 dark:text-green-300 text-center">
              Total: {NumberFormatter.formatCurrency(total)}
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Minimum Payment (50%):</strong> {NumberFormatter.formatCurrency(total * 0.5)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentMethod;
