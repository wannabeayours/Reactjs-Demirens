import React, { useState, useEffect } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

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
    phone: "",  // ✅ Added phone field
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const allNationalities = async () => {
      const formData = new FormData();
      formData.append("operation", "getNationality");

      try {
        const url = localStorage.getItem("url") + "customer.php";
        const res = await axios.post(url, formData);

        if (res.data !== 0) {
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

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

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
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
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
      console.log(otpForm);

      const res = await axios.post(url, otpForm);

      if (res.data?.success) {
        toast.success("OTP sent to your email!");
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
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#f7fbfc] to-[#eaf0f6]">
      {/* Left side - Hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-b from-[#113f67] via-[#34699A] to-[#226597]344rd p-6 md:p-8 lg:p-10 flex-col justify-center items-center text-white">
        <div className="max-w-md mx-auto space-y-4 md:space-y-6">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center">Welcome to Demirens Hotel</h1>
          <p className="text-base md:text-lg lg:text-xl opacity-90 text-center">Create your account to enjoy exclusive benefits and seamless booking experience.</p>

          {/* SVG Icon */}
          <div className="flex justify-center mt-6 md:mt-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-28 md:w-32 lg:w-36 h-28 md:h-32 lg:h-36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-4 py-6 sm:px-6 md:px-8 lg:px-10 md:py-8">
        <div className="w-full max-w-md p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl ">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#769FCD] mb-3 sm:mb-4 md:mb-6 text-center">
            Create Your Account
          </div>

          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm sm:text-base font-medium text-gray-700">First Name</label>
                <Input
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className="h-9 sm:h-10 px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 focus:border-[#769FCD] focus:ring focus:ring-[#769FCD] focus:ring-opacity-25 transition-all"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm sm:text-base font-medium text-gray-700">Last Name</label>
                <Input
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className="h-9 sm:h-10 px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 focus:border-[#769FCD] focus:ring focus:ring-[#769FCD] focus:ring-opacity-25 transition-all"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm sm:text-base font-medium text-gray-700">Email</label>
                <Input
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="h-9 sm:h-10 px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 focus:border-[#769FCD] focus:ring focus:ring-[#769FCD] focus:ring-opacity-25 transition-all"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm sm:text-base font-medium text-gray-700">Nationality</label>
                <select
                  value={formData.nationality}
                  onChange={(e) => handleChange("nationality", e.target.value)}
                  className="w-full h-9 sm:h-10 px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 focus:border-[#769FCD] focus:ring focus:ring-[#769FCD] focus:ring-opacity-25 transition-all"
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
                      <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm sm:text-base font-medium text-gray-700">Date of Birth</label>
              <Input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
                className="h-9 sm:h-10 px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 focus:border-[#769FCD] focus:ring focus:ring-[#769FCD] focus:ring-opacity-25 transition-all"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm sm:text-base font-medium text-gray-700">Phone Number</label>
              <Input
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) =>
                  handleChange("phone", e.target.value.replace(/\D/g, "")) // ✅ only digits
                }
                maxLength={15}
                className="h-9 sm:h-10 px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 focus:border-[#769FCD] focus:ring focus:ring-[#769FCD] focus:ring-opacity-25 transition-all"
              />
            </div>
            </div>


            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm sm:text-base font-medium text-gray-700">Username</label>
              <Input
                placeholder="Username"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className="h-9 sm:h-10 px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 focus:border-[#769FCD] focus:ring focus:ring-[#769FCD] focus:ring-opacity-25 transition-all"
              />
            </div>


    


            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm sm:text-base font-medium text-gray-700">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="h-9 sm:h-10 px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 focus:border-[#769FCD] focus:ring focus:ring-[#769FCD] focus:ring-opacity-25 transition-all pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                * At least 6 characters, include special characters
              </p>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm sm:text-base font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  className="h-9 sm:h-10 px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 focus:border-[#769FCD] focus:ring focus:ring-[#769FCD] focus:ring-opacity-25 transition-all pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-9 sm:h-11 px-4 py-2 text-sm sm:text-base bg-[#769FCD] hover:bg-[#5578a6] text-white font-semibold rounded-md shadow transition-colors mt-2 sm:mt-3"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>

            <p className="text-xs sm:text-sm text-muted-foreground text-center mt-4 sm:mt-6">
              Already have an account?{" "}
              <Link
                to="/login"
                className="underline underline-offset-4 text-[#769FCD] hover:text-[#5578a6] font-medium transition-all"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
