import React, { useState, useRef } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function CustomerPayment() {
  const [paymentMethod, setPaymentMethod] = useState('gcash')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [proofOfPayment, setProofOfPayment] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const fileInputRef = useRef(null)
  
  // Form state
  const [gcashForm, setGcashForm] = useState({
    number: '',
    name: '',
    email: ''
  })
  
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    referenceNumber: ''
  })
  
  // Mock booking details
  const bookingDetails = {
    roomType: 'Standard Twin Room',
    checkIn: '2023-10-15',
    checkOut: '2023-10-18',
    nights: 3,
    guests: 2,
    totalAmount: 12500.00,
    downPayment: 6250.00
  }

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method)
    setSuccess(false)
    setError('')
  }
  
  const handleGcashInputChange = (e) => {
    const { id, value } = e.target
    setGcashForm({
      ...gcashForm,
      [id === 'gcash-number' ? 'number' : 
       id === 'gcash-name' ? 'name' : 'email']: value
    })
  }
  
  const handleBankInputChange = (e) => {
    const { id, value } = e.target
    setBankForm({
      ...bankForm,
      [id === 'bank-name' ? 'bankName' : 
       id === 'account-name' ? 'accountName' : 
       id === 'account-number' ? 'accountNumber' : 'referenceNumber']: value
    })
  }
  
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type.match('image.*')) {
        setProofOfPayment(file)
        
        // Create a preview URL for the image
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviewUrl(e.target.result)
        }
        reader.readAsDataURL(file)
        
        // Clear any previous errors
        setError('')
      } else {
        setError('Please upload an image file (JPG, PNG, etc.)')
        setProofOfPayment(null)
        setPreviewUrl('')
        e.target.value = null
      }
    }
  }
  
  const handleRemoveFile = () => {
    setProofOfPayment(null)
    setPreviewUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = null
    }
  }

  const validateForm = () => {
    setError('')
    
    // Validate proof of payment first
    if (!proofOfPayment) {
      setError('Please upload a proof of payment screenshot')
      return false
    }
    
    if (paymentMethod === 'gcash') {
      if (!gcashForm.number || !gcashForm.name || !gcashForm.email) {
        setError('Please fill in all GCash payment details')
        return false
      }
      
      if (!gcashForm.number.match(/^09\d{9}$/)) {
        setError('Please enter a valid GCash number (e.g., 09XX XXX XXXX)')
        return false
      }
      
      if (!gcashForm.email.includes('@')) {
        setError('Please enter a valid email address')
        return false
      }
    } else {
      if (!bankForm.bankName || !bankForm.accountName || 
          !bankForm.accountNumber || !bankForm.referenceNumber) {
        setError('Please fill in all bank transfer details')
        return false
      }
      
      if (bankForm.accountNumber.length < 10) {
        setError('Please enter a valid account number')
        return false
      }
    }
    
    return true
  }

  const handleSubmitPayment = () => {
    if (!validateForm()) return
    
    setLoading(true)
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
    }, 2000)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Complete Your Payment</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Booking Summary */}
        <Card className="bg-white shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Room Type:</span>
                <span>{bookingDetails.roomType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Check-in:</span>
                <span>{bookingDetails.checkIn}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Check-out:</span>
                <span>{bookingDetails.checkOut}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Nights:</span>
                <span>{bookingDetails.nights}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Guests:</span>
                <span>{bookingDetails.guests}</span>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between font-medium">
                <span>Total Amount:</span>
                <span>₱{bookingDetails.totalAmount.toLocaleString('en-PH')}</span>
              </div>
              <div className="flex justify-between text-blue-600 font-bold mt-2">
                <span>Required Down Payment:</span>
                <span>₱{bookingDetails.downPayment.toLocaleString('en-PH')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <div className="space-y-6">
          <Card className="bg-white shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50">
              <CardTitle>Select Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
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

              {/* GCash Payment Form */}
              {paymentMethod === 'gcash' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Please complete your payment using GCash.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="gcash-number">GCash Number</Label>
                      <Input 
                        id="gcash-number" 
                        type="text" 
                        placeholder="09XX XXX XXXX" 
                        className="mt-1"
                        value={gcashForm.number}
                        onChange={handleGcashInputChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="gcash-name">Account Name</Label>
                      <Input 
                        id="gcash-name" 
                        type="text" 
                        placeholder="Full Name" 
                        className="mt-1"
                        value={gcashForm.name}
                        onChange={handleGcashInputChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="gcash-email">Email Address</Label>
                      <Input 
                        id="gcash-email" 
                        type="email" 
                        placeholder="email@example.com" 
                        className="mt-1"
                        value={gcashForm.email}
                        onChange={handleGcashInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mt-4">
                    <h3 className="font-medium text-center mb-2">Payment Instructions</h3>
                    <ol className="list-decimal list-inside text-sm space-y-2 text-gray-700">
                      <li>Open your GCash app on your mobile device</li>
                      <li>Tap on "Send Money"</li>
                      <li>Enter the hotel's GCash number: <span className="font-medium">0917 123 4567</span></li>
                      <li>Enter the amount: ₱{bookingDetails.downPayment.toLocaleString('en-PH')}</li>
                      <li>In the message field, include your booking reference</li>
                      <li>Complete the payment in your GCash app</li>
                      <li>Take a screenshot of your payment confirmation</li>
                      <li>Upload the screenshot below and click "Continue to Payment"</li>
                    </ol>
                  </div>
                  
                  <div className="mt-6">
                    <Label htmlFor="proof-of-payment" className="font-medium">Upload Proof of Payment</Label>
                    <div className="mt-2">
                      <Input 
                        id="proof-of-payment" 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Upload a screenshot of your payment confirmation (JPG, PNG)</p>
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
                  </div>
                </div>
              )}

              {paymentMethod === 'bank' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Please complete your payment using Bank Transfer.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bank-name">Bank Name</Label>
                      <select 
                        id="bank-name" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={bankForm.bankName}
                        onChange={handleBankInputChange}
                      >
                        <option value="">Select your bank</option>
                        <option value="bdo">BDO</option>
                        <option value="bpi">BPI</option>
                        <option value="metrobank">Metrobank</option>
                        <option value="landbank">Landbank</option>
                        <option value="pnb">PNB</option>
                        <option value="securitybank">Security Bank</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="account-name">Account Holder Name</Label>
                      <Input 
                        id="account-name" 
                        type="text" 
                        placeholder="Full Name" 
                        className="mt-1"
                        value={bankForm.accountName}
                        onChange={handleBankInputChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="account-number">Account Number</Label>
                      <Input 
                        id="account-number" 
                        type="text" 
                        placeholder="XXXX-XXXX-XXXX" 
                        className="mt-1"
                        value={bankForm.accountNumber}
                        onChange={handleBankInputChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="reference-number">Reference Number</Label>
                      <Input 
                        id="reference-number" 
                        type="text" 
                        placeholder="Transaction Reference" 
                        className="mt-1"
                        value={bankForm.referenceNumber}
                        onChange={handleBankInputChange}
                      />
                    </div>
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
                    <Label htmlFor="proof-of-payment-bank" className="font-medium">Upload Proof of Payment</Label>
                    <div className="mt-2">
                      <Input 
                        id="proof-of-payment-bank" 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Upload a screenshot of your payment confirmation (JPG, PNG)</p>
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
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-gray-50 flex flex-col">
              {error && (
                <div className="w-full mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="w-full flex justify-end">
                <Button 
                  onClick={handleSubmitPayment} 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </Button>
              </div>
            </CardFooter>
          </Card>

          {success && (
            <Card className="bg-green-50 border-green-200 shadow-md rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Payment Successful
                </CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <div className="text-center text-green-600 mb-4">
                  <p className="font-medium">Your payment has been processed successfully!</p>
                  <p className="text-sm mt-1">We've sent a confirmation email to your registered email address.</p>
                </div>
                
                <div className="border-t border-green-200 pt-4 mt-4">
                  <h3 className="font-medium text-center mb-3">Payment Receipt</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium">{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium">{paymentMethod === 'gcash' ? 'GCash' : 'Bank Transfer'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="font-medium">₱{bookingDetails.downPayment.toLocaleString('en-PH')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date & Time:</span>
                      <span className="font-medium">{new Date().toLocaleString('en-PH')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">Confirmed</span>
                    </div>
                  </div>
                  
                  {previewUrl && (
                    <div className="mt-4">
                      <h4 className="font-medium text-center mb-2">Proof of Payment</h4>
                      <div className="border rounded-md overflow-hidden">
                        <img 
                          src={previewUrl} 
                          alt="Payment proof" 
                          className="max-h-64 mx-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-green-100 flex justify-center">
                <Button className="bg-green-600 hover:bg-green-700">
                  View Booking Details
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerPayment