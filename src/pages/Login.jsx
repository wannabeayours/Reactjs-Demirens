import React from 'react'
import { Card, CardTitle } from '../components/ui/card';
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
import { Link } from 'react-router-dom';


const schema = z.object({
    email: z.string().email({ message: "Please enter a valid email" }),
    password: z.string().min(1, { message: "Password is required" })
})


function Login() {
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const onSubmit = (values) => {
        console.log("Login values:", values)
    }


    return (
        <div className="flex h-screen">
            {/* Left Side - Image */}
            <div className="w-1/2 bg-cover bg-center ">


            </div>

            {/* Right Side - Form */}
            <div className="w-1/2 flex justify-start items-center p-8">
                <Card className="w-full max-w-sm p-6">
                    <CardTitle className="text-2xl font-bold mb-4">Login to Continue</CardTitle>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email or Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="you@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Enter Password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full">
                                Login
                            </Button>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Don't have an account?{" "}
                                    <Link to="/register" className="text-primary underline">
                                        Sign Up
                                    </Link>
                                </p>
                            </div>

                        </form>
                    </Form>
                </Card>
            </div>
        </div>
    )
}
//ipa explain sa ni chatgpt or unsa ba kani na kuan
// then registeration na dayn ka
//after ana font
//og ipa hawa sa ang header dayun sa ani na page


export default Login