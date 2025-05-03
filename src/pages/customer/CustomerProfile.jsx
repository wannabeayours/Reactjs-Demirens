import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useEffect, useState } from 'react'
import UpdateProfile from './modals/UpdateProfile'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import { toast } from 'sonner'
import Spinner from '@/components/ui/spinner'

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
      localStorage.setItem("customers_fname", res.data.customers_fname);
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
        <div className="flex items-center justify-center flex-col">
          <Card className={"px-10 mt-10 w-full md:w-1/2"}>
            <div className="flex flex-col items-center justify-center">
              <Avatar className="w-40 h-40">
                <AvatarImage src="https://github.com/shadcn.png" alt="profile" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold mt-3">{userData.customers_email}</h2>
              </div>
              <div className='mt-6'>
                <UpdateProfile data={userData} getProfile={getProfile} />
              </div>
            </div>
          </Card>
          <Card className={"px-10 mt-10 w-full md:w-1/2"}>
            <CardContent>
              <CardTitle className="text-lg font-semibold">Personal Information</CardTitle>
              <div className="grid grid-cols-2 gap-4 mt-4">
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
                    Username:
                  </Label>
                  <Input
                    readOnly
                    value={userData.customers_online_username}
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
      )}

    </>
  )
}

export default CustomerProfile