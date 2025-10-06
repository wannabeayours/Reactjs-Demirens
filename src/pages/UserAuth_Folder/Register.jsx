import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [getNationalities, setGetNationalities] = useState([]);

  // Utility: check password rules
  const checkPasswordRules = (password) => {
    const rules = {
      length: password.length >= 8 && password.length <= 12,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      maxThreeNumbers: (password.match(/[0-9]/g) || []).length <= 3,
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      noSpaces: !/\s/.test(password),
    };

    const passed = Object.values(rules).filter(Boolean).length;
    return { rules, passed, total: Object.keys(rules).length };
  };

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
    // Apply input restrictions based on field type
    let processedValue = value;
    
    switch (name) {
      case 'firstName':
      case 'lastName':
        // Only allow letters, spaces, hyphens, and apostrophes
        processedValue = value.replace(/[^a-zA-Z\s'-]/g, '');
        break;
      case 'username':
        // Only allow letters, numbers, and underscores
        processedValue = value.replace(/[^a-zA-Z0-9_]/g, '');
        break;
      case 'email':
        // Allow email characters
        processedValue = value.replace(/[^a-zA-Z0-9@._%+-]/g, '');
        break;
      case 'phone':
        // Only allow digits, spaces, hyphens, parentheses, and plus sign
        processedValue = value.replace(/[^0-9+\-\s()]/g, '');
        break;
      default:
        processedValue = value;
    }
    
    setFormData({
      ...formData,
      [name]: processedValue,
    });
  };

  const validateForm = () => {
    // Validate First Name
    if (!formData.firstName.trim()) {
      toast.error("First name is required");
      return false;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName.trim())) {
      toast.error("First name can only contain letters, spaces, hyphens, and apostrophes");
      return false;
    }
    if (formData.firstName.trim().length < 2) {
      toast.error("First name must be at least 2 characters");
      return false;
    }
    if (formData.firstName.trim().length > 50) {
      toast.error("First name must be less than 50 characters");
      return false;
    }

    // Validate Last Name
    if (!formData.lastName.trim()) {
      toast.error("Last name is required");
      return false;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName.trim())) {
      toast.error("Last name can only contain letters, spaces, hyphens, and apostrophes");
      return false;
    }
    if (formData.lastName.trim().length < 2) {
      toast.error("Last name must be at least 2 characters");
      return false;
    }
    if (formData.lastName.trim().length > 50) {
      toast.error("Last name must be less than 50 characters");
      return false;
    }

    // Validate Username
    if (!formData.username.trim()) {
      toast.error("Username is required");
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      toast.error("Username can only contain letters, numbers, and underscores");
      return false;
    }
    if (formData.username.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return false;
    }
    if (formData.username.trim().length > 20) {
      toast.error("Username must be less than 20 characters");
      return false;
    }

    // Validate Email
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (formData.email.trim().length > 100) {
      toast.error("Email must be less than 100 characters");
      return false;
    }

    // Validate Nationality
    if (!formData.nationality) {
      toast.error("Nationality is required");
      return false;
    }

    // Validate Date of Birth
    if (!formData.dob) {
      toast.error("Date of birth is required");
      return false;
    }
    const birthDate = new Date(formData.dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      // Haven't had birthday this year yet
      const actualAge = age - 1;
      if (actualAge < 13) {
        toast.error("You must be at least 13 years old to register");
        return false;
      }
      if (actualAge > 120) {
        toast.error("Please enter a valid date of birth");
        return false;
      }
    } else {
      if (age < 13) {
        toast.error("You must be at least 13 years old to register");
        return false;
      }
      if (age > 120) {
        toast.error("Please enter a valid date of birth");
        return false;
      }
    }
    
    // Check if date is in the future
    if (birthDate > today) {
      toast.error("Date of birth cannot be in the future");
      return false;
    }

    // Validate Phone Number
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    // Remove all non-digit characters for validation
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      toast.error("Phone number must be at least 10 digits");
      return false;
    }
    if (phoneDigits.length > 15) {
      toast.error("Phone number must be less than 15 digits");
      return false;
    }
    if (!/^[0-9+\-\s()]+$/.test(formData.phone.trim())) {
      toast.error("Phone number contains invalid characters");
      return false;
    }

    // Validate Password
    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    if (formData.password.length > 128) {
      toast.error("Password must be less than 128 characters");
      return false;
    }
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(formData.password)) {
      toast.error("Password must contain at least one uppercase letter");
      return false;
    }
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(formData.password)) {
      toast.error("Password must contain at least one lowercase letter");
      return false;
    }
    // Check for at least one number
    if (!/[0-9]/.test(formData.password)) {
      toast.error("Password must contain at least one number");
      return false;
    }
    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      toast.error("Password must contain at least one special character");
      return false;
    }

    // Validate Confirm Password
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
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Encrypt OTP (simple encryption for demo - use proper encryption in production)
      const encryptedOTP = btoa(otp + formData.email);
      
      // Store encrypted OTP in sessionStorage
      sessionStorage.setItem('registrationOTP', encryptedOTP);
      sessionStorage.setItem('registrationEmail', formData.email);
      sessionStorage.setItem('otpExpiry', Date.now() + 300000); // 5 minutes

      const url = localStorage.getItem("url") + "customer.php";
      const otpForm = new FormData();
      otpForm.append("operation", "checkAndSendOTP");
      otpForm.append("json", JSON.stringify({ 
        guest_email: formData.email,
        otp_code: otp 
      }));

      const res = await axios.post(url, otpForm);

      console.log("OTP Response:", res.data);

      // Handle the response - axios should automatically parse JSON
      const responseData = res.data;

      if (responseData?.success) {
        toast.success("OTP sent to your email!");
        navigate("/verify", { state: { customer: formData } });
      } else {
        console.error("OTP Error:", responseData);
        toast.error(responseData?.message || "Failed to send OTP");
        // Clear sessionStorage on failure
        sessionStorage.removeItem('registrationOTP');
        sessionStorage.removeItem('registrationEmail');
        sessionStorage.removeItem('otpExpiry');
      }
    } catch (err) {
      toast.error("Something went wrong.");
      console.error(err);
      // Clear sessionStorage on error
      sessionStorage.removeItem('registrationOTP');
      sessionStorage.removeItem('registrationEmail');
      sessionStorage.removeItem('otpExpiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center p-3 sm:p-4 lg:p-6 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs - responsive sizes */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-gradient-to-r from-purple-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Geometric patterns - responsive sizes */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-10 lg:right-10 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 border border-white/10 rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 lg:bottom-10 lg:left-10 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 border border-white/10 rotate-12 animate-bounce-slow"></div>
        <div className="absolute top-1/3 right-1/3 w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-white/5 rotate-45 animate-pulse"></div>
      </div>

      {/* Main Registration Card - responsive sizing */}
      <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl relative z-10 mx-auto">
        <CardHeader className="text-center pb-3 sm:pb-4 pt-4 sm:pt-6 px-4 sm:px-6">
          {/* Logo/Icon - responsive sizing */}
          <div className="mx-auto mb-2 sm:mb-3 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
          </div>

          <CardTitle className="text-xl sm:text-2xl font-bold text-white mb-1">Create Account</CardTitle>
          <CardDescription className="text-blue-100/80 text-xs sm:text-sm">
            Join us today and get started
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Name Fields Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-sm font-medium text-white/90">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className="h-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg transition-all duration-300"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-sm font-medium text-white/90">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className="h-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg transition-all duration-300"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-white/90">
                Email Address
              </Label>
              <Input
                id="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="h-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg transition-all duration-300"
              />
            </div>

            {/* Username Field */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium text-white/90">
                Username
              </Label>
              <Input
                id="username"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className="h-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg transition-all duration-300"
              />
            </div>

            {/* Nationality and DOB Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nationality" className="text-sm font-medium text-white/90">
                  Nationality
                </Label>
                <select
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleChange("nationality", e.target.value)}
                  className="w-full h-9 px-2 py-1 text-sm bg-white/10 border border-white/20 text-white rounded-lg focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300"
                  required
                >
                  <option value="" className="text-gray-900">Select Nationality</option>
                  {getNationalities.length > 0 ? (
                    getNationalities.map((nat) => (
                      <option key={nat.nationality_id} value={nat.nationality_id} className="text-gray-900">
                        {nat.nationality_name}
                      </option>
                    ))
                  ) : (
                    <option disabled className="text-gray-900">Loading...</option>
                  )}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dob" className="text-sm font-medium text-white/90">
                  Date of Birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleChange("dob", e.target.value)}
                  className="h-9 text-sm bg-white/10 border-white/20 text-white focus:border-blue-400 focus:ring-blue-400/20 rounded-lg transition-all duration-300"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium text-white/90">
                Phone Number
              </Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) =>
                  handleChange("phone", e.target.value.replace(/\D/g, "")) // ✅ only digits
                }
                maxLength={15}
                className="h-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg transition-all duration-300"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-white/90">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="h-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50 
        focus:border-blue-400 focus:ring-blue-400/20 rounded-lg transition-all duration-300 pr-8"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password validation progress */}
              {formData.password && (() => {
                const { rules, passed, total } = checkPasswordRules(formData.password);
                const percent = (passed / total) * 100;
                return (
                  <div className="space-y-2 mt-2">
                    <Progress value={percent} className="h-2 bg-white/20" />
                    <ul className="text-xs space-y-1 text-white/80">
                      <li className={rules.length ? "text-green-400" : "text-red-400"}>
                        {rules.length ? "✔" : "✘"} 8–12 characters
                      </li>
                      <li className={rules.upper ? "text-green-400" : "text-red-400"}>
                        {rules.upper ? "✔" : "✘"} At least 1 uppercase
                      </li>
                      <li className={rules.lower ? "text-green-400" : "text-red-400"}>
                        {rules.lower ? "✔" : "✘"} At least 1 lowercase
                      </li>
                      <li className={rules.number ? "text-green-400" : "text-red-400"}>
                        {rules.number ? "✔" : "✘"} At least 1 number
                      </li>
                      <li className={rules.maxThreeNumbers ? "text-green-400" : "text-red-400"}>
                        {rules.maxThreeNumbers ? "✔" : "✘"} Max 3 numbers
                      </li>
                      <li className={rules.special ? "text-green-400" : "text-red-400"}>
                        {rules.special ? "✔" : "✘"} At least 1 special character
                      </li>
                      <li className={rules.noSpaces ? "text-green-400" : "text-red-400"}>
                        {rules.noSpaces ? "✔" : "✘"} No spaces
                      </li>
                    </ul>
                  </div>
                );
              })()}
            </div>


            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-white/90">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  className="h-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg transition-all duration-300 pr-8"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              className="w-full mt-5 text-sm py-2 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
                {loading ? "Sending OTP..." : "Create Account"}
              </span>
            </Button>

            {/* Sign in section */}
            <div className="text-center mt-4 pt-4 border-t border-white/20">
              <p className="text-sm text-blue-100/80">
                Already have an account?{" "}
                <Button variant="link" asChild className="h-auto p-0 text-sm text-blue-300 hover:text-blue-200 font-semibold transition-colors underline">
                  <Link to="/login">Sign in here</Link>
                </Button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;