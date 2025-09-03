import React, { useState } from "react";
import FrontHeader from "@/components/layout/FrontHeader";
import FrontdeskModal from "./sheets/FrontdeskModal";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";

// ShadCN
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FrontdeskProfile = () => {
  const { register, handleSubmit, formState } = useForm();
  const [modalSettings, setModalSettings] = useState({
    
  });
  const { errors } = formState;

  const [isEditing, setIsEditing] = useState(false);

  const [formValues, setFormValues] = useState({
    first_name: "",
    last_name: "",
    email: "",
    contact: "",
    username: "",
  });

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const changePassword = () => {

  };

  const onSubmit = async (data) => {
    console.log(data);
    const jsonData = {
      firstName: data.first_name,
      lastName: data.last_name,
      emailAddress: data.email,
      phoneNumber: data.contact,
      userName: data.username,
      // userID: user_ID
    }
    // const formData = new FormData();
    // formData.append("method", "updateProfile");
    // formData.append("json", JSON.stringify(jsonData));

    // for (const key in data) {
    //   formData.append(key, data[key]);
    // }

    // try {
    //   const res = await axios.post(`${localStorage.url}front-desk.php`, formData);
    //   console.log("Update Success:", res.data);
    //   setIsEditing(false);
    // } catch (err) {
    //   console.error("Update Error:", err);
    // }
  };

  return (
    <>
      <div>
        <FrontHeader />

        <div className="p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Info */}
                <div className="flex flex-col items-center justify-center md:w-1/3 text-center space-y-4">
                  <div className="w-32 h-32 bg-gray-200 rounded-full" />
                  <p className="text-lg font-medium">email@domain.com</p>
                  {!isEditing ? (
                    <Button variant="outline" onClick={handleEditToggle}>
                      Edit Profile
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={handleEditToggle}>
                      Cancel
                    </Button>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <button
                      onClick={() => console.log("Clicked Settings and Privacy")}
                      className="flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings and Privacy</span>
                    </button>
                  </div>
                </div>

                {/* Form Section */}
                <div className="w-full md:w-2/3">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>First Name</Label>
                        <Input
                          {...register("first_name")}
                          disabled={!isEditing}
                          placeholder="Juan"
                        />
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <Input
                          {...register("last_name")}
                          disabled={!isEditing}
                          placeholder="Dela Cruz"
                        />
                      </div>
                      <div>
                        <Label>Email Address</Label>
                        <Input
                          {...register("email")}
                          disabled={!isEditing}
                          type="email"
                          placeholder="email@example.com"
                        />
                      </div>
                      <div>
                        <Label>Contact Number</Label>
                        <Input
                          {...register("contact")}
                          disabled={!isEditing}
                          placeholder="09XX-XXX-XXXX"
                        />
                      </div>
                      <div>
                        <Label>Username</Label>
                        <Input
                          {...register("username")}
                          disabled={!isEditing}
                          placeholder="frontdesk_jc"
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <CardFooter className="justify-end mt-6 p-0">
                        <Button type="submit">Save Changes</Button>
                      </CardFooter>
                    )}
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <FrontdeskModal />
    </>
  );
};

export default FrontdeskProfile;
