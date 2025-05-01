import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { LucideEdit } from 'lucide-react'
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

function UpdateProfile() {

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            username: "",
            phone: "",

        },
    })

    const onSubmit = (values) => {
        console.log("Register values:", values);
    }
    return (

        <Dialog>
            <DialogTrigger>
                <Button className="mr-2">
                    <LucideEdit className="w-4 h-4 mr-2" />
                    Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent>

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


                        {/* Nationality
                                <FormField
                                    control={form.control}
                                    name="nationality"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Select Nationality</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className={cn(
                                                                "justify-between",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value
                                                                ? nationalities.find((n) => n.value === field.value)?.label
                                                                : "Select nationality"}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[200px] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search nationality..." className="h-9" />
                                                        <CommandList>
                                                            <CommandEmpty>No nationality found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {nationalities.map((n) => (
                                                                    <CommandItem
                                                                        key={n.value}
                                                                        value={n.label}
                                                                        onSelect={() => field.onChange(n.value)}
                                                                    >
                                                                        {n.label}
                                                                        <Check
                                                                            className={cn(
                                                                                "ml-auto",
                                                                                field.value === n.value ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                          
                             */}
                        {/* Date of Birth
                            <FormField
                                control={form.control}
                                name="dob"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date of Birth</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? format(field.value, "PPP") : "Pick a date"}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /> */}

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


                        <div className='flex justify-end'>
                            <Button type="submit" >
                                Update
                            </Button>
                        </div>


                    </form>
                </Form>

            </DialogContent>
        </Dialog>


    )
}

export default UpdateProfile