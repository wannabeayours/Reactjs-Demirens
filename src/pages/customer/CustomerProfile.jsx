import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardTitle, CardContent } from '@/components/ui/card'
import React, { useEffect, useState } from 'react'
import UpdateProfile from './modals/UpdateProfile'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import { toast } from 'sonner'
import Spinner from '@/components/ui/spinner'
import { User, Mail, Phone, Globe, Calendar, UserCheck, Sparkles } from 'lucide-react'

function CustomerProfile() {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);

  const getProfile = async () => {
    setLoading(true)
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const customerId = localStorage.getItem("userId");
      const jsonData = { "customers_id": customerId };
      console.log("jsonData", jsonData);
      const formData = new FormData();
      formData.append("operation", "customerProfile");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("noOOo", res);
      setUserData(res.data);
      localStorage.setItem("fname", res.data.customers_fname);
      localStorage.setItem("lname", res.data.customers_lname);
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getProfile();
  }, []);

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-[600px] space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-[#113f67]/20 border-t-[#113f67] rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#226597] rounded-full animate-spin animation-delay-150"></div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Profile</h3>
        <p className="text-sm text-gray-500">Please wait while we fetch your information...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex items-center justify-between py-6 mb-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#113f67] to-[#226597] rounded-xl flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#113f67]">
              Profile Information
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage your personal details and preferences</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
          <Sparkles className="w-4 h-4" />
          <span>Keep your profile updated</span>
        </div>
      </div>

      {loading ? (
        <Card className="w-full shadow-xl border-0 bg-white">
          <CardContent className="p-8">
            <LoadingSpinner />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Main Profile Card */}
          <Card className="w-full shadow-2xl border-0 bg-white overflow-hidden">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-[#113f67] via-[#226597] to-[#2980b9] h-2"></div>
            
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                
                {/* Avatar Section */}
                <div className="lg:col-span-4 xl:col-span-3">
                  <div className="flex flex-col items-center lg:items-start space-y-6">
                    {/* Avatar with decorative elements */}
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#113f67] via-[#226597] to-[#2980b9] rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                      <div className="relative">
                        <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-white shadow-2xl">
                          <AvatarImage src="https://github.com/shadcn.png" alt="profile" className="object-cover" />
                          <AvatarFallback className="bg-gradient-to-br from-[#113f67] to-[#226597] text-white text-2xl font-bold">
                            {userData.customers_fname?.charAt(0)}{userData.customers_lname?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                    
                      </div>
                    </div>

                    {/* Username and Update Button */}
                    <div className="w-full text-center lg:text-left space-y-4">
                      <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-playfair">
                          {userData.customers_online_username || 'Username'}
                        </h2>
                      
                      </div>
                      
                      <div className="flex justify-center lg:justify-start">
                        <UpdateProfile data={userData} getProfile={getProfile} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Details Section */}
                <div className="lg:col-span-8 xl:col-span-9">
                  <div className="space-y-6">
                    {/* Section Header */}
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#113f67] to-[#226597] rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-xl sm:text-2xl font-bold text-[#113f67]">
                        Personal Details
                      </CardTitle>
                    </div>

                    {/* Form Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* First Name */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <User className="w-4 h-4 text-[#113f67]" />
                          First Name
                        </Label>
                        <div className="relative">
                          <Input 
                            readOnly 
                            value={userData.customers_fname || ''} 
                            className="pl-4 pr-4 py-3 bg-gray-50 border-gray-200 focus:border-[#226597] focus:ring-[#226597]/20 rounded-xl text-gray-800 font-medium"
                          />
                        </div>
                      </div>

                      {/* Last Name */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <User className="w-4 h-4 text-[#113f67]" />
                          Last Name
                        </Label>
                        <div className="relative">
                          <Input 
                            readOnly 
                            value={userData.customers_lname || ''} 
                            className="pl-4 pr-4 py-3 bg-gray-50 border-gray-200 focus:border-[#226597] focus:ring-[#226597]/20 rounded-xl text-gray-800 font-medium"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Mail className="w-4 h-4 text-[#113f67]" />
                          Email Address
                        </Label>
                        <div className="relative">
                          <Input 
                            readOnly 
                            value={userData.customers_email || ''} 
                            className="pl-4 pr-4 py-3 bg-gray-50 border-gray-200 focus:border-[#226597] focus:ring-[#226597]/20 rounded-xl text-gray-800 font-medium"
                          />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Phone className="w-4 h-4 text-[#113f67]" />
                          Phone Number
                        </Label>
                        <div className="relative">
                          <Input 
                            readOnly 
                            value={userData.customers_online_phone || ''} 
                            className="pl-4 pr-4 py-3 bg-gray-50 border-gray-200 focus:border-[#226597] focus:ring-[#226597]/20 rounded-xl text-gray-800 font-medium"
                          />
                        </div>
                      </div>

                      {/* Nationality */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Globe className="w-4 h-4 text-[#113f67]" />
                          Nationality
                        </Label>
                        <div className="relative">
                          <Input 
                            readOnly 
                            value={userData.nationality_name || ''} 
                            className="pl-4 pr-4 py-3 bg-gray-50 border-gray-200 focus:border-[#226597] focus:ring-[#226597]/20 rounded-xl text-gray-800 font-medium"
                          />
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Calendar className="w-4 h-4 text-[#113f67]" />
                          Date of Birth
                        </Label>
                        <div className="relative">
                          <Input 
                            readOnly 
                            value={userData.customers_birthdate || ''} 
                            className="pl-4 pr-4 py-3 bg-gray-50 border-gray-200 focus:border-[#226597] focus:ring-[#226597]/20 rounded-xl text-gray-800 font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Profile Completion Indicator */}
                  
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default CustomerProfile