import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";

const ResetPassword = () => {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  // Redirect if no email is provided
  React.useEffect(() => {
    if (!email) {
      toast.error("No email provided. Please start the password reset process again.");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleOtpChange = (e) => {
    // Only allow numbers and max 6 digits
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
  };

  const validateForm = () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP code.");
      return false;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const url = localStorage.getItem("url") + "customer.php";
      
      // Create form data for password reset
      const resetForm = new FormData();
      resetForm.append("operation", "resetPassword");
      resetForm.append("json", JSON.stringify({
        email: email,
        otp_code: otp,
        new_password: newPassword
      }));
      
      console.log("Resetting password for:", { email, otp: otp });
      
      const res = await axios.post(url, resetForm);
      
      if (res.data?.success) {
        toast.success("Password reset successfully! You can now login with your new password.");
        navigate("/login");
      } else {
        toast.error(res.data?.message || "Failed to reset password. Please check your OTP and try again.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Reset password error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#f7fbfc] to-[#eaf0f6]">
      {/* Left side (placeholder / image / gradient) */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-[#769FCD]">
        <div className="text-center text-white">
          <Lock className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Reset Password</h1>
          <p className="text-lg opacity-90">Enter your OTP and new password</p>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-white">
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/forgot-password")}
              className="mb-4 p-0 h-auto text-[#769FCD] hover:text-[#5578a6]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <CardTitle className="text-2xl font-bold text-[#769FCD] mb-2">
              Reset Password
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Enter the 6-digit OTP sent to <strong>{email}</strong> and your new password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium mb-2">OTP Code</label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit OTP"
                className="text-center tracking-widest text-lg"
                autoFocus
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                * At least 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Reset Password Button */}
            <Button
              type="submit"
              className="w-full bg-[#769FCD] hover:bg-[#5578a6] text-white font-semibold py-2 rounded-lg shadow"
              disabled={loading}
            >
              {loading ? "Resetting Password..." : "Reset Password"}
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

export default ResetPassword;
