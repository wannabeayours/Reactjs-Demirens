import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardTitle } from '@/components/ui/card'
import React, { useEffect, useState } from 'react'
import UpdateProfile from './modals/UpdateProfile'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import { toast } from 'sonner'
import Spinner from '@/components/ui/spinner'
import { User } from 'lucide-react'



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


  return (
    <>
  <div className="flex items-center pl-4">
        <h1 className="text-4xl font-bold flex items-center gap-2 ">
          <User className="w-6 h-6" />
          Profile Information
        </h1>
      </div>

      {loading ? (
        <Spinner />
      ) : (

        <Card className="px-8 py-8 mt-10 w-full shadow-xl min-h-[600px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
            <div className="flex flex-col items-center md:items-start md:border-r md:pr-6 border-blue-400">
              <Avatar className="w-40 h-40">
                <AvatarImage src="https://github.com/shadcn.png" alt="profile" />
                <AvatarFallback>Profile</AvatarFallback>
              </Avatar>

              <div className="w-full flex mt-4 gap-7">
              <h2 className="text-lg font-semibold p-2 font-playfair">
                  {userData.customers_online_username}
                </h2>
                <UpdateProfile data={userData} getProfile={getProfile} />
                
              </div>
            
            </div>
            {/* <Separator orientation="vertical" className="hidden md:block h-auto" /> */}

            <div>
              
              <CardTitle className="text-lg font-semibold mb-6 text-black  ">Personal Details</CardTitle>
              <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
                <div>
                  <Label className="mb-2">First Name:</Label>
                  <Input readOnly value={userData.customers_fname || ''} />
                </div>
                <div>
                  <Label className="mb-2">Last Name:</Label>
                  <Input readOnly value={userData.customers_lname || ''} />
                </div>
                <div>
                  <Label className="mb-2">Email:</Label>
                  <Input readOnly value={userData.customers_email || ''} />
                </div>
                <div>
                  <Label className="mb-2">Phone Number:</Label>
                  <Input readOnly value={userData.customers_phone_number || ''} />
                </div>
                <div>
                  <Label className="mb-2">Nationality:</Label>
                  <Input readOnly value={userData.nationality_name || ''} />
                </div>
                <div>
                  <Label className="mb-2">Date of Birth:</Label>
                  <Input readOnly value={userData.customers_date_of_birth || ''} />
                </div>
              </div>
            </div>
          </div>
        </Card>

      )}

    </>


  )
}

export default CustomerProfile