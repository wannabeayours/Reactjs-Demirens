import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

const OTP_Auth = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  const location = useLocation();
  const navigate = useNavigate();
  const customer = location.state?.customer;

  // Countdown effect
  useEffect(() => {
    if (timeLeft <= 0) return; // stop when time is up
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP code.");
      return;
    }
    if (timeLeft <= 0) {
      toast.error("OTP has expired. Please request a new one.");
      return;
    }

    setLoading(true);
    try {
      const url = localStorage.getItem("url") + "customer.php";
      const otpForm = new FormData();
      otpForm.append("operation", "customerRegistration");
      otpForm.append(
        "json",
        JSON.stringify({
          ...customer,
          otp_code: otp,
        })
      );

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
          <p className="text-muted-foreground text-sm text-center mb-2">
            Enter the 6-digit code sent to your email to verify your account.
          </p>
          <p className="text-sm font-semibold text-[#5578a6]">
            Time remaining: {formatTime(timeLeft)}
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
            disabled={loading || timeLeft <= 0}
          >
            {loading ? "Validating..." : timeLeft > 0 ? "Verify" : "Expired"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default OTP_Auth;
