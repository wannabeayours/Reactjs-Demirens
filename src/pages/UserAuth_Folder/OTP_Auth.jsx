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
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  const location = useLocation();
  const navigate = useNavigate();
  const customer = location.state?.customer;

  // Check if user has valid session data
  useEffect(() => {
    const storedOTP = sessionStorage.getItem('registrationOTP');
    const storedEmail = sessionStorage.getItem('registrationEmail');
    const storedExpiry = sessionStorage.getItem('otpExpiry');

    if (!storedOTP || !storedEmail || !storedExpiry) {
      toast.error("No valid registration session found. Please register again.");
      navigate("/register");
      return;
    }

    // Check if OTP has already expired
    if (Date.now() > parseInt(storedExpiry)) {
      toast.error("OTP session has expired. Please register again.");
      sessionStorage.removeItem('registrationOTP');
      sessionStorage.removeItem('registrationEmail');
      sessionStorage.removeItem('otpExpiry');
      navigate("/register");
      return;
    }

    // Calculate remaining time
    const remainingTime = Math.max(0, Math.floor((parseInt(storedExpiry) - Date.now()) / 1000));
    setTimeLeft(remainingTime);
  }, [navigate]);

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

  const handleResendOTP = async () => {
    const storedEmail = sessionStorage.getItem('registrationEmail');
    
    if (!storedEmail) {
      toast.error("No registration session found. Please register again.");
      navigate("/register");
      return;
    }

    setResendLoading(true);
    try {
      // Generate new OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Encrypt new OTP
      const encryptedOTP = btoa(newOtp + storedEmail);
      
      // Update sessionStorage with new OTP and reset timer
      sessionStorage.setItem('registrationOTP', encryptedOTP);
      sessionStorage.setItem('otpExpiry', Date.now() + 300000); // 5 minutes
      setTimeLeft(300); // Reset timer to 5 minutes
      setOtp(""); // Clear current OTP input

      const url = localStorage.getItem("url") + "customer.php";
      const otpForm = new FormData();
      otpForm.append("operation", "checkAndSendOTP");
      otpForm.append("json", JSON.stringify({ 
        guest_email: storedEmail,
        otp_code: newOtp 
      }));

      const res = await axios.post(url, otpForm);

      if (res.data?.success) {
        toast.success("New OTP sent to your email!");
      } else {
        toast.error(res.data?.message || "Failed to resend OTP");
      }
    } catch (err) {
      toast.error("Something went wrong while resending OTP.");
      console.error(err);
    } finally {
      setResendLoading(false);
    }
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

    // Get stored OTP data from sessionStorage
    const storedOTP = sessionStorage.getItem('registrationOTP');
    const storedEmail = sessionStorage.getItem('registrationEmail');
    const storedExpiry = sessionStorage.getItem('otpExpiry');

    if (!storedOTP || !storedEmail || !storedExpiry) {
      toast.error("No OTP session found. Please register again.");
      navigate("/register");
      return;
    }

    // Check if OTP has expired
    if (Date.now() > parseInt(storedExpiry)) {
      toast.error("OTP has expired. Please register again.");
      sessionStorage.removeItem('registrationOTP');
      sessionStorage.removeItem('registrationEmail');
      sessionStorage.removeItem('otpExpiry');
      navigate("/register");
      return;
    }

    // Verify OTP
    try {
      const decryptedOTP = atob(storedOTP);
      const originalOTP = decryptedOTP.substring(0, 6);
      
      if (otp !== originalOTP) {
        toast.error("Invalid OTP. Please try again.");
        return;
      }

      // OTP is valid, proceed with registration
      setLoading(true);
      const url = localStorage.getItem("url") + "customer.php";
      const otpForm = new FormData();
      otpForm.append("operation", "customerRegistration");
      otpForm.append(
        "json",
        JSON.stringify({
          ...customer,
        })
      );

      const res = await axios.post(url, otpForm);

      if (res.data === 1) {
        toast.success("Account verified and registered!");
        // Clear sessionStorage after successful registration
        sessionStorage.removeItem('registrationOTP');
        sessionStorage.removeItem('registrationEmail');
        sessionStorage.removeItem('otpExpiry');
        navigate("/login");
      } else {
        toast.error("Registration failed. Please try again.");
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
          
          <div className="flex flex-col items-center space-y-2 mt-4">
            <p className="text-sm text-gray-600">
              Didn't receive the code?
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleResendOTP}
              disabled={resendLoading || timeLeft > 240} // Can resend after 1 minute (60 seconds)
              className="text-[#769FCD] border-[#769FCD] hover:bg-[#769FCD] hover:text-white"
            >
              {resendLoading 
                ? "Sending..." 
                : timeLeft > 240 
                  ? `Resend in ${Math.ceil((timeLeft - 240) / 60)} min`
                  : "Resend OTP"
              }
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default OTP_Auth;