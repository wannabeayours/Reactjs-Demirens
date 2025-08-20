import React, { useState, useEffect } from "react";
import AdminHeader from "../components/AdminHeader";
import { useNavigate } from "react-router-dom";
import { useWalkIn } from "./WalkInContext";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
    setWalkInData((prev) => ({ ...prev, [name]: value }));
  };

  const validateCustomerInfo = () => {
    const nextErrors = {};

    if (!walkInData.customers_fname || !walkInData.customers_fname.trim()) {
      nextErrors.customers_fname = "First name is required";
    }
    if (!walkInData.customers_lname || !walkInData.customers_lname.trim()) {
      nextErrors.customers_lname = "Last name is required";
    }
    if (!walkInData.customers_email || !walkInData.customers_email.trim()) {
      nextErrors.customers_email = "Email is required";
    } else {
      const emailOk = /\S+@\S+\.\S+/.test(walkInData.customers_email.trim());
      if (!emailOk) nextErrors.customers_email = "Enter a valid email address";
    }
    if (!walkInData.customers_phone_number || !walkInData.customers_phone_number.trim()) {
      nextErrors.customers_phone_number = "Phone number is required";
    }
    if (!walkInData.customers_address || !walkInData.customers_address.trim()) {
      nextErrors.customers_address = "Address is required";
    }
    if (!walkInData.customers_date_of_birth || !walkInData.customers_date_of_birth.toString().trim()) {
      nextErrors.customers_date_of_birth = "Date of birth is required";
    }
    if (!walkInData.nationality_id || `${walkInData.nationality_id}`.trim() === "") {
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
      <div className="p-6 max-w-3xl mx-auto">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Walk-In — Step 2: Customer Information

            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* First Name */}
            <div>
              <Label htmlFor="customers_fname">First Name <span className="text-red-500">*</span></Label>
              <Input
                id="customers_fname"
                name="customers_fname"
                value={walkInData.customers_fname || ""}
                onChange={handleChange}
                placeholder="Enter first name"
                className={errors.customers_fname ? "border-red-500" : ""}
              />
              {errors.customers_fname && (
                <div className="text-xs text-red-600 mt-1">{errors.customers_fname}</div>
              )}
            </div>

            {/* Last Name */}
            <div>
              <Label htmlFor="customers_lname">Last Name <span className="text-red-500">*</span></Label>
              <Input
                id="customers_lname"
                name="customers_lname"
                value={walkInData.customers_lname || ""}
                onChange={handleChange}
                placeholder="Enter last name"
                className={errors.customers_lname ? "border-red-500" : ""}
              />
              {errors.customers_lname && (
                <div className="text-xs text-red-600 mt-1">{errors.customers_lname}</div>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="customers_email">Email <span className="text-red-500">*</span></Label>
              <Input
                type="email"
                id="customers_email"
                name="customers_email"
                value={walkInData.customers_email || ""}
                onChange={handleChange}
                placeholder="Enter email address"
                className={errors.customers_email ? "border-red-500" : ""}
              />
              {errors.customers_email && (
                <div className="text-xs text-red-600 mt-1">{errors.customers_email}</div>
              )}
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="customers_phone_number">Phone Number <span className="text-red-500">*</span></Label>
              <Input
                id="customers_phone_number"
                name="customers_phone_number"
                value={walkInData.customers_phone_number || ""}
                onChange={handleChange}
                placeholder="Enter phone number"
                className={errors.customers_phone_number ? "border-red-500" : ""}
              />
              {errors.customers_phone_number && (
                <div className="text-xs text-red-600 mt-1">{errors.customers_phone_number}</div>
              )}
            </div>

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
              />
              {errors.customers_date_of_birth && (
                <div className="text-xs text-red-600 mt-1">{errors.customers_date_of_birth}</div>
              )}
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="customers_address">Address <span className="text-red-500">*</span></Label>
              <Input
                id="customers_address"
                name="customers_address"
                value={walkInData.customers_address || ""}
                onChange={handleChange}
                placeholder="Enter address"
                className={errors.customers_address ? "border-red-500" : ""}
              />
              {errors.customers_address && (
                <div className="text-xs text-red-600 mt-1">{errors.customers_address}</div>
              )}
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
              {errors.nationality_id && (
                <div className="text-xs text-red-600 mt-1">{errors.nationality_id}</div>
              )}
            </div>

            {/* Next Button */}
            <div className="flex justify-end pt-4">
              <Button onClick={handleNext}>
                Next: Payment →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AddWalkIn;
