import React, { useEffect, useState } from 'react'
import { Card, CardTitle } from '../components/ui/card'
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from "@/components/ui/form"
import { Link } from 'react-router-dom'
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import { Calendar } from '../components/ui/calendar'
import { format } from "date-fns"
import { cn } from '@/lib/utils' // important for shadcn utilities
import { toast } from 'sonner'
import axios from 'axios'
import ComboBox from '@/components/ui/combo-box'
import DatePicker from '@/components/ui/date-picker'









const schema = z.object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email({ message: "Please enter a valid email" }),
    password: z.string().min(1, { message: "Password is required" }),
    nationality: z.number({ required_error: "Please select a nationality" }),
    dob: z.string({ required_error: "A date of birth is required" }),
    username: z.string().min(1, { message: "Username is required" }),
})

const validIds = [
    { label: "Passport", value: "passport" },
    { label: "Driver’s License", value: "drivers_license" },
    { label: "SSS ID", value: "sss_id" },
    { label: "PhilHealth ID", value: "philhealth_id" },
    { label: "Voter’s ID", value: "voters_id" },
    { label: "PRC ID", value: "prc_id" },
]




function Register() {
    const [selectedId, setSelectedId] = useState(null)
    const [nationalities, setNationalities] = useState([]);





    const getNationality = async () => {
        try {
            const url = localStorage.getItem("url") + "customer.php";
            const formData = new FormData();
            formData.append("operation", "getNationality");
            const res = await axios.post(url, formData);
            if (res.data !== 0) {
                const formattedData = res.data.map((item) => ({
                    value: item.nationality_id,
                    label: item.nationality_name,
                }));
                setNationalities(formattedData);
            }
            else {
                setNationalities([]);
            }

            console.log("national", res.data);
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);

        }
    }

    useEffect(() => {
        getNationality();
    }, []);

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            nationality: "",
            dob: undefined,
            username: "",
        },
    })

    const onSubmit = async (values) => {
        try {
            const url = localStorage.getItem("url") + "customer.php";
            const jsonData = {
                customers_online_username: values.username,
                customers_fname: values.firstName,
                customers_lname: values.lastName,
                customers_email: values.email,
                customers_password: values.password,
                nationality_id: values.nationality,
                customers_date_of_birth: values.dob
            }
            const formData = new FormData();
            formData.append("operation", "customerRegistration");
            formData.append("json", JSON.stringify(jsonData));
            const res = await axios.post(url, formData);
            console.log("res", res);
            toast.success("Registration successful");

        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);

        }
        console.log("Register values:", values);
    }
    return (
        <div className="flex h-screen">
            {/* Left Side */}
            <div className="w-1/2 bg-cover bg-center">

            </div>

            {/* Right Side */}
            <div className="w-1/2 flex justify-start items-center p-8">
                <Card className="w-full max-w-lg p-2 space-y-6  bg-[#769FCD]">
                    <Card className="w-full max-w-lg p-6 space-y-6">
                        <div className="flex justify-center items-center">
                            <CardTitle className="text-2xl font-bold mb-4 text-[#769FCD]">Sign Up</CardTitle>

                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                <div className="flex space-x-4">
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
                                </div>

                                <div className="flex space-x-4">
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


                                    {/* Nationality */}
                                    <FormField
                                        name="nationality"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nationality</FormLabel>
                                                <div>
                                                    <ComboBox
                                                        list={nationalities}
                                                        subject="nationality"
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                    />
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Date of Birth */}
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

                                <div className="space-y-4">
                                    {/* Identification Dropdown */}
                                    <div>
                                        <FormLabel>Identification</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={`w-full justify-between ${!selectedId ? "text-muted-foreground" : ""}`}
                                                >
                                                    {selectedId
                                                        ? validIds.find((id) => id.value === selectedId)?.label
                                                        : "Select valid ID"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[300px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search ID..." />
                                                    <CommandList>
                                                        <CommandEmpty>No ID found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {validIds.map((id) => (
                                                                <CommandItem
                                                                    key={id.value}
                                                                    value={id.label}
                                                                    onSelect={() => setSelectedId(id.value)}
                                                                >
                                                                    {id.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>


                                    {/* Show ID Number input if selected */}
                                    {selectedId && (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="idNumber"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{validIds.find((id) => id.value === selectedId)?.label} Number</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter your ID number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Attach Photo */}
                                            <FormField
                                                control={form.control}
                                                name="idPhoto"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Attach Photo of ID</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => field.onChange(e.target.files[0])}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    )}
                                </div>
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
                                {/* Password */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Enter your password" {...field} />
                                            </FormControl>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                * Must be at least 6 characters
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                * Must include special characters
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password:</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Confirm Password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />



                                {/* Submit */}
                                <Button type="submit" className="w-full">
                                    Register
                                </Button>

                                {/* Link to Login */}
                                <p className="text-sm text-muted-foreground text-center">
                                    Already have an account?{" "}
                                    <Link to="/login" className="underline underline-offset-4">
                                        Login
                                    </Link>
                                </p>

                            </form>
                        </Form>

                    </Card>
                </Card>

            </div>
        </div>
    )
}

export default Register
