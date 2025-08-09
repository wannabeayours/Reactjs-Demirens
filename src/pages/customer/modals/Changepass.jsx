import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import React from 'react'
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from "@/components/ui/form"
import { cn } from '@/lib/utils'
import axios from 'axios'
import { toast } from 'sonner'

const schema = z.object({
    oldpass: z.string().min(1, { message: "Old password is required" }),
    newpass: z.string().min(1, { message: "New password is required" }),
    confirmpass: z.string().min(1, { message: "Confirm password is required" }),
})


function Changepass() {

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            oldpass: "",
            newpass: "",
            confirmpass: "",
        },
    })

    const onSubmit = async (values) => {
        if (values.newpass !== values.confirmpass) {
            toast.error("New password and confirm password does not match");
            return
        }
        try {
            const url = localStorage.getItem('url') + "customer.php";
            const customerOnlineId = localStorage.getItem("customerOnlineId");
            const formData = new FormData();
            const jsonData = {
                "customers_online_id": customerOnlineId,
                "current_password": values.oldpass,
                "new_password": values.newpass,
            }
            formData.append("operation", "customerChangePassword");
            formData.append("json", JSON.stringify(jsonData));
            const res = await axios.post(url, formData);
            console.log("res ni onSubmit", res);
            if (res.data === -1) {
                toast.error("Current password is incorrect");
            }else if(res.data === 1){
                toast.success("Password changed successfully");
            }
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);
        }
    }
    return (
        <Dialog>
            <DialogTrigger>
                <Button>
                    Change Password
                </Button>
            </DialogTrigger>
            <DialogContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className='text-lg font-bold flex justify-center'>
                            Change Password
                        </div>



                        <FormField
                           
                            control={form.control}
                            name="oldpass"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Old Password:</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Enter old password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <FormField
                            control={form.control}
                            name="newpass"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password:</FormLabel>
                                    <FormControl>
                                        <Input  type="password" placeholder="Enter new password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmpass"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm new Password:</FormLabel>
                                    <FormControl>
                                        <Input  type="password" placeholder="Confirm new password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div>
                            <div>
                                <Button variant="link">
                                    Forgot Password
                                </Button>
                            </div>
                            <div className="flex justify-end">

                                <Button type="submit">
                                    Change Password
                                </Button>
                            </div>

                        </div>

                    </form>
                </Form>


            </DialogContent>
        </Dialog>
    )
}

export default Changepass