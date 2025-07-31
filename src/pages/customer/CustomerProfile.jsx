import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useEffect, useState } from 'react'
import UpdateProfile from './modals/UpdateProfile'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import { toast } from 'sonner'
import Spinner from '@/components/ui/spinner'
import CustomerLayout from '@/components/layout/CustomerHeader'
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
      const formData = new FormData();
      formData.append("operation", "customerProfile");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("noOOo", res);
      setUserData(res.data);
      localStorage.setItem("fname", res.data.customers_fname);
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


      {loading ? (
        <Spinner />
      ) : (

        <div className="flex  flex-col ">

        <div className="flex items-center pl-4">
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <User className="w-6 h-6" />
            Personal Information
          </h1>
        </div>
          <div className="flex items-center justify-center flex-col ">
            <Card className={"px-10 mt-20 w-full bg-transparent border-b-[#FDF5AA]"}>
              <div className="flex flex-col items-center justify-center">
                <Avatar className="w-40 h-40">
                  <AvatarImage src="https://github.com/shadcn.png" alt="profile" />
                  <AvatarFallback>Profile</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold mt-3 text-white">{userData.customers_online_username}</h2>
                </div>
                <div className='mt-6'>
                  <UpdateProfile data={userData} getProfile={getProfile} />
                </div>
              </div>
            </Card>
            <Card className={"px-10 mt-10 w-full bg-transparent border-[#FDF5AA]"}>
              <CardContent>
                <CardTitle className="text-lg font-semibold text-white">Personal Details</CardTitle>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mt-4 text-white">
                  <div >
                    <Label className="mb-2">
                      First Name:
                    </Label>
                    <Input
                      readOnly
                      value={userData.customers_fname}
                    />
                  </div>
                  <div>
                    <Label className="mb-2">
                      Last Name:
                    </Label>
                    <Input
                      readOnly
                      value={userData.customers_lname}
                    />
                  </div>
                  <div>
                    <Label className="mb-2">
                      Email:
                    </Label>
                    <Input
                      readOnly
                      value={userData.customers_email}
                    />
                  </div>
                  <div>
                    <Label className="mb-2">
                      Phone Number:
                    </Label>
                    <Input
                      readOnly
                      value={userData.customers_phone_number}
                    />
                  </div>
                  <div>
                    <Label className="mb-2">
                      Nationality:
                    </Label>
                    <Input
                      readOnly
                      value={userData.nationality_name}
                    />
                  </div>
                  <div>
                    <Label className="mb-2">
                      Date of Birth:
                    </Label>
                    <Input
                      readOnly
                      value={userData.customers_date_of_birth}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


        </div>
      )}

    </>


  )
}

export default CustomerProfile