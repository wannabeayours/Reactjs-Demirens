import React, { useCallback, useEffect } from 'react'
import { CheckCircle2Icon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'

export const SuccessPayment = () => {
  const navigateTo = useNavigate()

  const handleSubmitBooking = useCallback(async () => {
    const loading = toast.loading("Redirecting...");
    try {
      const url = localStorage.getItem("url") + "customer.php";
      const customerId = localStorage.getItem("userId");
      const hasAccount = Number(localStorage.getItem("hasAccount"));
      const jsonDataRaw = localStorage.getItem("jsonData");
      const jsonData = jsonDataRaw ? JSON.parse(jsonDataRaw) : {};
      // Inject customerId into the payload
      jsonData.customerId = customerId;
      console.log("jsonData:", jsonData);
      const formData = new FormData();
      formData.append("operation", hasAccount === 0 ? "customerBookingNoAccount" : "customerBookingWithAccount");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res:", res);
      if (res.data === 1) {
        localStorage.removeItem("jsonData");
        if (hasAccount === 0) {
          setTimeout(() => {
            navigateTo("/");
          }, 1500);
        } else {
          setTimeout(() => {
            navigateTo("/customer");
          }, 1500);
        }
        localStorage.removeItem("hasAccount");
      }
    } catch (error) {
      toast.error("Network Error");
    } finally {
      toast.dismiss(loading);
    }
  }, [navigateTo])

  useEffect(() => {
      handleSubmitBooking();
  }, [handleSubmitBooking])
  return (
    <div className="w-full h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-8 border border-green-100">
        <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2Icon className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-green-700">Payment Successful</h2>
        <p className="mt-2 text-gray-600">Thank you! Your payment has been processed.</p>
      </div>
    </div>
  )
}
