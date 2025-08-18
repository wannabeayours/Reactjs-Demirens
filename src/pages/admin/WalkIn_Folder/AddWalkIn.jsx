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

  // Fetch all nationalities from backend
  const getAllNationals = async () => {
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

  useEffect(() => {
    getAllNationals();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWalkInData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    navigate("/admin/choose-rooms");
  };

  return (
    <>
      <AdminHeader />
      <div className="p-6 max-w-3xl mx-auto">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Walk-In — Step 1: Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* First Name */}
            <div>
              <Label htmlFor="customers_fname">First Name</Label>
              <Input
                id="customers_fname"
                name="customers_fname"
                value={walkInData.customers_fname || ""}
                onChange={handleChange}
                placeholder="Enter first name"
              />
            </div>

            {/* Last Name */}
            <div>
              <Label htmlFor="customers_lname">Last Name</Label>
              <Input
                id="customers_lname"
                name="customers_lname"
                value={walkInData.customers_lname || ""}
                onChange={handleChange}
                placeholder="Enter last name"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="customers_email">Email</Label>
              <Input
                type="email"
                id="customers_email"
                name="customers_email"
                value={walkInData.customers_email || ""}
                onChange={handleChange}
                placeholder="Enter email address"
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="customers_phone_number">Phone Number</Label>
              <Input
                id="customers_phone_number"
                name="customers_phone_number"
                value={walkInData.customers_phone_number || ""}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <Label htmlFor="customers_date_of_birth">Date of Birth</Label>
              <Input
                type="date"
                id="customers_date_of_birth"
                name="customers_date_of_birth"
                value={walkInData.customers_date_of_birth || ""}
                onChange={handleChange}
              />
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="customers_address">Address</Label>
              <Input
                id="customers_address"
                name="customers_address"
                value={walkInData.customers_address || ""}
                onChange={handleChange}
                placeholder="Enter address"
              />
            </div>

            {/* Nationality */}
            <div>
              <Label>Nationality</Label>
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
            </div>

            {/* Next Button */}
            <div className="flex justify-end pt-4">
              <Button onClick={handleNext}>
                Next: Choose Room →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AddWalkIn;
