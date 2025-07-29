import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label';
import ShowAlert from '@/components/ui/show-alert';
import { Switch } from '@/components/ui/switch';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

function Authentication() {

    const [status, setStatus] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [showAlert, setShowAlert] = useState(false);

    const getCustomerAuthenticationStatus = async () => {
        try {
            const url = localStorage.getItem('url') + "customer.php";
            const customerOnlineId = localStorage.getItem("customerOnlineId");
            const jsonData = { "customers_online_id": customerOnlineId }
            const formData = new FormData();
            formData.append("json", JSON.stringify(jsonData));
            formData.append("operation", "getCustomerAuthenticationStatus")
            const res = await axios.post(url, formData)
            console.log("res ni onSubmit", res);
            setStatus(res.data === 1 ? true : false);

        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);

        }
    }
    
    const customerChangeAuthenticationStatus = async () =>{
        try {
            const url = localStorage.getItem('url') + "customer.php";
            const customerOnlineId = localStorage.getItem("customerOnlineId");
            const jsonData = { 
                "customers_online_id": customerOnlineId,
                "customers_online_authentication_status": status === true ? 0 : 1
            }
            const formData = new FormData();
            formData.append("json", JSON.stringify(jsonData));
            formData.append("operation", "customerChangeAuthenticationStatus")
            const res  = await axios.post(url, formData);
            setStatus(res.data === 1 ? true : false);
            toast.success("Authentication status changed successfully");


            
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);
        }
    }

    useEffect(() => {
        getCustomerAuthenticationStatus();

    },);




    const handleShowAlert = () => {
        // "This action cannot be undone. It will permanently delete the item and remove it from your list"
        setAlertMessage("Are you sure you want to change your authentication status?");
        setShowAlert(true);
    };
    const handleCloseAlert = (status) => {
        if (status === 1) {
            // if gi click ang confirm, execute tanan diri 
            customerChangeAuthenticationStatus();
        }
        setShowAlert(false);
    };



    return (

        
        <Dialog>

            <DialogTrigger>
                <Button className="bg-[#bba008] hover:bg-yellow-600">
                    Two-Factor Authentication
                </Button>
            </DialogTrigger>
            <DialogContent>

                <div
                    className='text-lg font-bold flex justify-center'>
                    Two-Factor Authentication
                </div>
                <div className="flex items-center justify-between space-x-2 ">
                    <Label >Enable Two-Factor Authentication</Label>
                    <Switch checked={status} onCheckedChange={handleShowAlert} />
                </div>
            </DialogContent>
            <ShowAlert open={showAlert} onHide={handleCloseAlert} message={alertMessage} duration={3}/>
        </Dialog>
    )
}

export default Authentication