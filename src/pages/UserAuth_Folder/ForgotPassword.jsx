import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { ArrowLeft, Mail } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    
    try {
      const url = localStorage.getItem("url") + "customer.php";
      const otpForm = new FormData();
      otpForm.append("operation", "checkAndSendOTP");
      otpForm.append("json", JSON.stringify({ guest_email: email }));
      
      console.log("Sending OTP for password reset:", { email });
      
      const res = await axios.post(url, otpForm);
      
      if (res.data?.success) {
        toast.success("OTP sent to your email! Please check your inbox.");
        // Navigate to reset password page with email
        navigate("/reset-password", { state: { email: email } });
      } else {
        toast.error(res.data?.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Forgot password error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#f7fbfc] to-[#eaf0f6]">
      {/* Left side (placeholder / image / gradient) */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-[#769FCD]">
        <div className="text-center text-white">
          <Mail className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Reset Password</h1>
          <p className="text-lg opacity-90">We'll help you get back into your account</p>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-white">
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login")}
              className="mb-4 p-0 h-auto text-[#769FCD] hover:text-[#5578a6]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
            <CardTitle className="text-2xl font-bold text-[#769FCD] mb-2">
              Forgot Password?
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              No worries! Enter your email address and we'll send you an OTP to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
              />
            </div>

            {/* Send OTP Button */}
            <Button
              type="submit"
              className="w-full bg-[#769FCD] hover:bg-[#5578a6] text-white font-semibold py-2 rounded-lg shadow"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>

            {/* Back to Login */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="underline underline-offset-4 text-[#769FCD] hover:text-[#5578a6]"
                >
                  Back to Login
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
