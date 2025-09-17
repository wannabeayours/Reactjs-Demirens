import React, { useState, useEffect } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [getNationalities, setGetNationalities] = useState([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    nationality: "",
    dob: "",
    password: "",
    confirmPassword: "",
  });

  // ✅ Fetch nationalities on mount
  useEffect(() => {
    const allNationalities = async () => {
      const formData = new FormData();
      formData.append("operation", "getNationality");

      try {
        const url = localStorage.getItem("url") + "customer.php";
        const res = await axios.post(url, formData);

        if (res.data !== 0 ) {
          setGetNationalities(res.data);
        } else {
          toast.error("Failed to load nationalities");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error loading nationalities");
      }
    };

    allNationalities();
  }, []);

  // simple handler
  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // simple validation
  const validateForm = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("First and last name are required");
      return false;
    }
    if (!formData.username.trim()) {
      toast.error("Username is required");
      return false;
    }
    if (!formData.email.includes("@")) {
      toast.error("Valid email is required");
      return false;
    }
    if (!formData.nationality) {
      toast.error("Nationality is required");
      return false;
    }
    if (!formData.dob) {
      toast.error("Date of birth is required");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const url = localStorage.getItem("url") + "customer.php";
      const otpForm = new FormData();
      otpForm.append("operation", "checkAndSendOTP");
      otpForm.append("json", JSON.stringify({ guest_email: formData.email }));
      console.log(otpForm)

      const res = await axios.post(url, otpForm);

      if (res.data?.success) {
        toast.success("OTP sent to your email!");
        // Pass full registration details to OTP page
        navigate("/verify", { state: { customer: formData } });
      } else {
        toast.error(res.data?.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Something went wrong.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="flex h-screen bg-gradient-to-br from-[#f7fbfc] to-[#eaf0f6]">
    {/* Left side (placeholder / image / gradient) */}
    <div className="hidden md:flex w-1/2 items-center justify-center bg-[#769FCD]">
      <h1 className="text-4xl font-bold text-white">Welcome!</h1>
    </div>

    {/* Right side - form */}
    <div className="flex w-full md:w-1/2 items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-white">
        <CardTitle className="text-2xl font-bold text-[#769FCD] mb-6 text-center">
          Register
        </CardTitle>

        {/* Your form stays the same here */}
        <form onSubmit={onSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium">First Name</label>
              <Input
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium">Last Name</label>
              <Input
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium">Email</label>
            <Input
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium">Username</label>
            <Input
              placeholder="Username"
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value)}
            />
          </div>

          {/* Nationality */}
          <div>
            <label className="block text-sm font-medium">Nationality</label>
            <select
              value={formData.nationality}
              onChange={(e) => handleChange("nationality", e.target.value)}
              className="w-full border rounded-lg p-2"
              required
            >
              <option value="">Select Nationality</option>
              {getNationalities.length > 0 ? (
                getNationalities.map((nat) => (
                  <option key={nat.nationality_id} value={nat.nationality_id}>
                    {nat.nationality_name}
                  </option>
                ))
              ) : (
                <option disabled>Loading...</option>
              )}
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium">Date of Birth</label>
            <Input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={(e) => handleChange("dob", e.target.value)}
            />
          </div>


          {/* Password */}
          <div>
            <label className="block text-sm font-medium">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
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
              * At least 6 characters, include special characters
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() =>
                  setShowConfirmPassword((prev) => !prev)
                }
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Send OTP */}
          <Button
            type="submit"
            className="w-full bg-[#769FCD] hover:bg-[#5578a6] text-white font-semibold py-2 rounded-lg shadow"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </Button>

          {/* Login link */}
          <p className="text-xs text-muted-foreground text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="underline underline-offset-4 text-[#769FCD] hover:text-[#5578a6]"
            >
              Login
            </Link>
          </p>
        </form>
      </Card>
    </div>
  </div>
  );
};

export default Register;
