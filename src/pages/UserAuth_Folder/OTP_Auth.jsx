import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

const OTP_Auth = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const customer = location.state?.customer;

  const handleChange = (e) => {
    // Only allow numbers and max 6 digits
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP code.");
      return;
    }
    setLoading(true);

    try {
      const url = localStorage.getItem("url") + "customer.php";

      // ✅ Step 1: Validate OTP with backend (send email + otp)
      const otpForm = new FormData();
      otpForm.append("operation", "customerRegistration");
      otpForm.append(
        "json",
        JSON.stringify({
          ...customer,
          otp_code: otp, // ✅ include OTP from input
        })
      );
      console.log('Customer Info: ', otpForm);
      const res = await axios.post(url, otpForm);

      if (res.data?.success) {
        toast.success("Account verified and registered!");
        navigate("/login");
      } else {
        toast.error(res.data?.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#eaf6fb] to-[#dbe2ef] items-center justify-center">
      <Card className="w-full max-w-sm p-8 rounded-2xl shadow-xl bg-white">
        <div className="flex flex-col items-center mb-6">
          <CardTitle className="text-2xl font-bold text-[#769FCD] mb-2">
            OTP Verification
          </CardTitle>
          <p className="text-muted-foreground text-sm text-center">
            Enter the 6-digit code sent to your email to verify your account.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={6}
            value={otp}
            onChange={handleChange}
            placeholder="Enter OTP"
            className="text-center tracking-widest text-lg"
            autoFocus
          />
          <Button
            type="submit"
            className="w-full bg-[#769FCD] hover:bg-[#5578a6] text-white font-semibold py-2 rounded-lg shadow"
            disabled={loading}
          >
            {loading ? "Validating..." : "Verify"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default OTP_Auth;
