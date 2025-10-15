import React, { useState, useEffect } from "react";
import AdminHeader from "../components/AdminHeader";
import { useNavigate } from "react-router-dom";
import { useWalkIn } from "./WalkInContext";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const AddWalkIn = () => {
  const APIConn = `${localStorage.url}admin.php`;
  const navigate = useNavigate();
  const { walkInData, setWalkInData } = useWalkIn();

  const [nationalities, setNationalities] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch all nationalities from backend
    const fetchNationals = async () => {
      const reqNationals = new FormData();
      reqNationals.append("method", "viewNationalities");

      try {
        const res = await axios.post(APIConn, reqNationals);
        if (Array.isArray(res.data)) {
          setNationalities(res.data);
        } else {
          console.error("Unexpected response format:", res.data);
        }
      } catch (err) {
        console.error("Error fetching nationalities:", err);
      }
    };

    fetchNationals();
  }, [APIConn]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Real-time validation and input sanitization
    let sanitizedValue = value;
    
    switch (name) {
      case 'customers_fname':
      case 'customers_lname':
        // Only allow letters, spaces, hyphens, and apostrophes
        sanitizedValue = value.replace(/[^a-zA-Z\s'-]/g, '');
        // Limit length
        if (sanitizedValue.length > 50) {
          sanitizedValue = sanitizedValue.substring(0, 50);
        }
        break;
        
      case 'customers_email':
        // Convert to lowercase and remove extra spaces
        sanitizedValue = value.toLowerCase().trim();
        // Limit length
        if (sanitizedValue.length > 100) {
          sanitizedValue = sanitizedValue.substring(0, 100);
        }
        break;
        
      case 'customers_phone_number':
        // Only allow numbers; enforce exactly 11 digits max
        sanitizedValue = value.replace(/[^0-9]/g, '');
        // Limit length to 11 digits
        if (sanitizedValue.length > 11) {
          sanitizedValue = sanitizedValue.substring(0, 11);
        }
        break;
        
      case 'customers_address':
        // Allow alphanumeric, spaces, and common address characters
        sanitizedValue = value.replace(/[^a-zA-Z0-9\s\.,\-#\/]/g, '');
        // Limit length
        if (sanitizedValue.length > 200) {
          sanitizedValue = sanitizedValue.substring(0, 200);
        }
        break;
        
      default:
        sanitizedValue = value;
    }
    
    setWalkInData((prev) => ({ ...prev, [name]: sanitizedValue }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateCustomerInfo = () => {
    const nextErrors = {};

    // First Name - Strict validation
    if (!walkInData.customers_fname?.trim()) {
      nextErrors.customers_fname = "First name is required";
    } else if (walkInData.customers_fname.trim().length < 2) {
      nextErrors.customers_fname = "First name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s'-]+$/.test(walkInData.customers_fname.trim())) {
      nextErrors.customers_fname = "First name can only contain letters, spaces, hyphens, and apostrophes";
    } else if (walkInData.customers_fname.trim().length > 50) {
      nextErrors.customers_fname = "First name must be less than 50 characters";
    }

    // Last Name - Strict validation
    if (!walkInData.customers_lname?.trim()) {
      nextErrors.customers_lname = "Last name is required";
    } else if (walkInData.customers_lname.trim().length < 2) {
      nextErrors.customers_lname = "Last name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s'-]+$/.test(walkInData.customers_lname.trim())) {
      nextErrors.customers_lname = "Last name can only contain letters, spaces, hyphens, and apostrophes";
    } else if (walkInData.customers_lname.trim().length > 50) {
      nextErrors.customers_lname = "Last name must be less than 50 characters";
    }

    // Email - Strict validation
    if (!walkInData.customers_email?.trim()) {
      nextErrors.customers_email = "Email is required";
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(walkInData.customers_email.trim())) {
        nextErrors.customers_email = "Please enter a valid email address";
      } else if (walkInData.customers_email.trim().length > 100) {
        nextErrors.customers_email = "Email must be less than 100 characters";
      }
    }

    // Phone Number - Strict validation
    if (!walkInData.customers_phone_number?.trim()) {
      nextErrors.customers_phone_number = "Phone number is required";
    } else {
      const phoneRegex = /^[0-9]{11}$/;
      if (!phoneRegex.test(walkInData.customers_phone_number.trim())) {
        nextErrors.customers_phone_number = "Please enter a valid 11-digit phone number";
      }
    }

    // Address - Strict validation
    if (!walkInData.customers_address?.trim()) {
      nextErrors.customers_address = "Address is required";
    } else if (walkInData.customers_address.trim().length < 10) {
      nextErrors.customers_address = "Address must be at least 10 characters";
    } else if (walkInData.customers_address.trim().length > 200) {
      nextErrors.customers_address = "Address must be less than 200 characters";
    }

    // Date of Birth - Strict validation
    if (!walkInData.customers_date_of_birth?.toString().trim()) {
      nextErrors.customers_date_of_birth = "Date of birth is required";
    } else {
      const birthDate = new Date(walkInData.customers_date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        // Birthday hasn't occurred this year
        const actualAge = age - 1;
        if (actualAge < 18) {
          nextErrors.customers_date_of_birth = "Customer must be at least 18 years old";
        } else if (actualAge > 120) {
          nextErrors.customers_date_of_birth = "Please enter a valid birth date";
        }
      } else {
        if (age < 18) {
          nextErrors.customers_date_of_birth = "Customer must be at least 18 years old";
        } else if (age > 120) {
          nextErrors.customers_date_of_birth = "Please enter a valid birth date";
        }
      }
      
      // Check if date is in the future
      if (birthDate > today) {
        nextErrors.customers_date_of_birth = "Birth date cannot be in the future";
      }
    }

    // Nationality - Strict validation
    if (!walkInData.nationality_id?.toString().trim()) {
      nextErrors.nationality_id = "Nationality is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCustomerInfo()) {
      alert("Please complete the required fields before proceeding.");
      return;
    }
    navigate("/admin/payment-method");
  };

  return (
    <>
      <AdminHeader />
      <div className="lg:ml-72 p-6 max-w-4xl mx-auto">
        <Card className="shadow-lg border rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Walk-In — Step 2: Customer Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Personal Details */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <Label htmlFor="customers_fname">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="customers_fname"
                    name="customers_fname"
                    value={walkInData.customers_fname || ""}
                    onChange={handleChange}
                    placeholder="Enter first name (letters only)"
                    className={errors.customers_fname ? "border-red-500" : ""}
                    maxLength={50}
                    pattern="[a-zA-Z\s\-']+"
                    title="Only letters, spaces, hyphens, and apostrophes are allowed"
                  />
                  {errors.customers_fname && <p className="text-xs text-red-600 mt-1">{errors.customers_fname}</p>}
                </div>

                {/* Last Name */}
                <div>
                  <Label htmlFor="customers_lname">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="customers_lname"
                    name="customers_lname"
                    value={walkInData.customers_lname || ""}
                    onChange={handleChange}
                    placeholder="Enter last name (letters only)"
                    className={errors.customers_lname ? "border-red-500" : ""}
                    maxLength={50}
                    pattern="[a-zA-Z\s\-']+"
                    title="Only letters, spaces, hyphens, and apostrophes are allowed"
                  />
                  {errors.customers_lname && <p className="text-xs text-red-600 mt-1">{errors.customers_lname}</p>}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <Label htmlFor="customers_email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    type="email"
                    id="customers_email"
                    name="customers_email"
                    value={walkInData.customers_email || ""}
                    onChange={handleChange}
                    placeholder="Enter valid email address"
                    className={errors.customers_email ? "border-red-500" : ""}
                    maxLength={100}
                    autoComplete="email"
                  />
                  {errors.customers_email && <p className="text-xs text-red-600 mt-1">{errors.customers_email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="customers_phone_number">Phone Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="customers_phone_number"
                    name="customers_phone_number"
                    value={walkInData.customers_phone_number || ""}
                    onChange={handleChange}
                    placeholder="Enter phone number (11 digits)"
                    className={errors.customers_phone_number ? "border-red-500" : ""}
                    maxLength={11}
                    pattern="[0-9]{11}"
                    title="Enter a valid phone number (11 digits)"
                    autoComplete="tel"
                  />
                  {errors.customers_phone_number && <p className="text-xs text-red-600 mt-1">{errors.customers_phone_number}</p>}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date of Birth */}
                <div>
                  <Label htmlFor="customers_date_of_birth">Date of Birth <span className="text-red-500">*</span></Label>
                  <Input
                    type="date"
                    id="customers_date_of_birth"
                    name="customers_date_of_birth"
                    value={walkInData.customers_date_of_birth || ""}
                    onChange={handleChange}
                    className={errors.customers_date_of_birth ? "border-red-500" : ""}
                    max={new Date().toISOString().split('T')[0]}
                    title="Must be at least 18 years old"
                  />
                  {errors.customers_date_of_birth && <p className="text-xs text-red-600 mt-1">{errors.customers_date_of_birth}</p>}
                </div>

                {/* Nationality */}
                <div>
                  <Label>Nationality <span className="text-red-500">*</span></Label>
                  <Select
                    value={walkInData.nationality_id || ""}
                    onValueChange={(value) =>
                      setWalkInData((prev) => ({ ...prev, nationality_id: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      {nationalities.length > 0 ? (
                        nationalities.map((nation) => (
                          <SelectItem key={nation.nationality_id} value={nation.nationality_id.toString()}>
                            {nation.nationality_name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled>No nationalities found</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.nationality_id && <p className="text-xs text-red-600 mt-1">{errors.nationality_id}</p>}
                </div>
              </div>

              {/* Address full width */}
              <div className="mt-4">
                <Label htmlFor="customers_address">Address <span className="text-red-500">*</span></Label>
                <Input
                  id="customers_address"
                  name="customers_address"
                  value={walkInData.customers_address || ""}
                  onChange={handleChange}
                  placeholder="Enter complete address (minimum 10 characters)"
                  className={errors.customers_address ? "border-red-500" : ""}
                  maxLength={200}
                  autoComplete="street-address"
                />
                {errors.customers_address && <p className="text-xs text-red-600 mt-1">{errors.customers_address}</p>}
              </div>
            </div>
          </CardContent>

          {/* Footer with Next Button */}
          <CardFooter className="flex justify-end border-t pt-4">
            <Button onClick={handleNext} className="px-6">
              Next: Payment →
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default AddWalkIn;
