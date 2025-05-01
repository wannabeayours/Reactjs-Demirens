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

const schema = z.object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email({ message: "Please enter a valid email" }),
    username: z.string().min(1, { message: "Username is required" }),
    phone: z.string().min(1, { message: "Contact number is required" }),
}).refine((val) => !isNaN(val), { message: "This field must be a number" })


function Changepass() {

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            oldpass: "",
            newpass: "",
            confirmpass: "",

        },
    })

    const onSubmit = (values) => {
        console.log("Register values:", values);
    }
    return (
        <Dialog>
            <DialogTrigger>
                <Button variant="outline">
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
                                        <Input placeholder="Enter old password" {...field} />
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
                                        <Input placeholder="Enter new password" {...field} />
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
                                        <Input placeholder="Confirm new password" {...field} />
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
                            <div  className="flex justify-end">

                            <Button>
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