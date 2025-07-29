import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { CalendarIcon, LucideEdit } from 'lucide-react'
import React, { useEffect, useState } from 'react'
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
    FormMessage,
    FormDescription
} from "@/components/ui/form"
import { cn } from '@/lib/utils'
import Spinner from '@/components/ui/spinner'
import { toast } from 'sonner'
import axios from 'axios'
import ComboBox, { Combobox } from '@/components/ui/combo-box'
import DatePicker from '@/components/ui/date-picker'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'


const schema = z.object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email({ message: "Please enter a valid email" }),
    username: z.string().min(1, { message: "Username is required" }),
    phone: z.string().min(1, { message: "Contact number is required" }).refine((val) => !isNaN(val), { message: "This field must be a number" }),
    nationality: z.number().min(1, { message: "Please select a nationality" }),
    dob:z.string().min(1, { message: "Date of birth is required" }),
})

function UpdateProfile({ data, getProfile }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [nationality, setNationality] = useState({})
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            username: "",
            phone: "",
            nationality: "",
            dob: "",
        },
    })

    const getNationality = async () => {
        setLoading(true);
        try {
            const url = localStorage.getItem('url') + "customer.php";
            const formData = new FormData();
            formData.append("operation", "getNationality");
            const res = await axios.post(url, formData);
            console.log("res ni getNationality", res);
            if (res !== 0) {
                const formattedData = res.data.map((item) => ({
                    label: item.nationality_name,
                    value: item.nationality_id
                }))
                setNationality(formattedData);
            }
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);
        } finally {
            setLoading(false)
        }
    }

    const onSubmit = async (values) => {
        if (values.firstName === data.customers_fname && values.lastName === data.customers_lname && values.email === data.customers_email && values.username === data.customers_online_username && values.phone === data.customers_phone_number && values.nationality === data.nationality_id && values.dob === data.customers_date_of_birth) {
            toast.info("No changes made");
            return
        }
        console.log("Registersss values:", values);
        setLoading(true);
        try {
            const url = localStorage.getItem('url') + "customer.php";
            const customerId = localStorage.getItem("userId");
            const formData = new FormData();
            const jsonData = {
                "customers_id": customerId,
                "customers_fname": values.firstName,
                "customers_lname": values.lastName,
                "customers_phone_number": values.phone,
                "customers_email": values.email,
                "nationality_id": values.nationality,
                "customers_online_username": values.username,
                "customers_date_of_birth": values.dob
            }

            console.log("jsonData", JSON.stringify(jsonData));
            formData.append("operation", "customerUpdateProfile");
            formData.append("json", JSON.stringify(jsonData));
            const res = await axios.post(url, formData);
            console.log("res ni onSubmit", res);
            if (res.data === 1) {
                toast.success("Profile updated successfully");
                getProfile();
                setOpen(false);
            }
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            form.reset({
                firstName: data.customers_fname,
                lastName: data.customers_lname,
                email: data.customers_email,
                username: data.customers_online_username,
                phone: data.customers_phone_number,
                nationality: data.nationality_id,
                dob: data.customers_date_of_birth
            })
        }
    }, [form, data, open])

    useEffect(() => {
        getNationality();
    }, [])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button className="mr-2 bg-[#FDF5AA] hover:bg-yellow-600">
                    <LucideEdit className="w-4 h-4 mr-2 text-black" />
                    <h1 className="text-black">Edit Profile</h1>
                </Button>
            </DialogTrigger>
            <DialogContent>
                {loading ? <Spinner /> :
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className='text-lg font-bold flex justify-center'>
                                Update Profile
                            </div>

                            {/* First Name */}
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your first name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Last Name */}
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your last name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Email */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="you@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username:</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter Username" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number:</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter Phone Number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                name="nationality"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nationality</FormLabel>
                                        <div>
                                            <ComboBox
                                                list={nationality}
                                                subject="nationality"
                                                value={field.value}
                                                onChange={field.onChange}
                                                styles={"bg-background"}
                                            />
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            <FormField
                                control={form.control}
                                name="dob"
                                render={({ field }) => (
                                    <FormItem>
                                        <DatePicker
                                            form={form}
                                            name={field.name}
                                            label="Date of birth"
                                            pastAllowed={true}
                                            futureAllowed={false}
                                        />
                                    </FormItem>
                                )}
                            />


                            <div className='flex justify-end'>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" className="ml-2 bg-[#FDF5AA] hover:bg-yellow-600 text-black" >
                                    Update
                                </Button>
                            </div>
                        </form>
                    </Form>
                }
            </DialogContent>
        </Dialog>
    )
}

export default UpdateProfile