import * as React from 'react';
import { useForm } from "react-hook-form"
import { useCallback } from 'react';
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
    FormMessage,
} from "@/components/ui/form"
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';

function Login() {
    const { useEffect, useState } = React;
    const [isCaptchaValid, setIsCaptchaValid] = useState(false);
    const [captchaCharacters, setCaptchaCharacters] = useState([]);
    const [userInput, setUserInput] = useState("");
    const navigateTo = useNavigate();

    const getRandomColor = () => {
        const colors = ["red", "blue", "green", "yellow", "purple", "orange"];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const generateCaptchaCharacters = useCallback(() => {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*";
        const newCaptcha = [];
        for (let i = 0; i < 5; i++) {
            newCaptcha.push({
                char: characters[Math.floor(Math.random() * characters.length)],
                color: getRandomColor(),
            });
        }
        setCaptchaCharacters(newCaptcha);
        setUserInput(""); // Reset input field
        setIsCaptchaValid(false);
    }, []);

    useEffect(() => {
        generateCaptchaCharacters();
    }, [generateCaptchaCharacters]);

    const handleInputChange = (e) => {
        setUserInput(e.target.value);
        if (e.target.value === captchaCharacters.map((c) => c.char).join("")) {
            setIsCaptchaValid(true);
        } else {
            setIsCaptchaValid(false);
        }
    };



    const schema = z.object({
        email: z.string().min(1,{ message: "Please enter username" }),
        password: z.string().min(1, { message: "Password is required" }),
        // captcha: z.string().min(1, { message: "Captcha is required" })
        //     .refine((val) => parseInt(val) === sum, { message: "Incorrect Captcha" })
    })

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
            password: "",
            // captcha: "" 
        }
    })

    const onSubmit = async (values) => {
        try {
            if (isCaptchaValid === false){
                toast.error("Invalid CAPTCHA");
                return;
            }
            const url = localStorage.getItem('url') + "customer.php";
            const jsonData = { username: values.email, password: values.password };
            console.log("Sending login data:", jsonData);
            console.log("API URL:", url);
            const formData = new FormData();
            formData.append("operation", "login");
            formData.append("json", JSON.stringify(jsonData));
            const res = await axios.post(url, formData);
            console.log("Full API Response:", res);
            console.log("Response Data (raw):", res.data);
            console.log("Response Status:", res.status);
            
            // Parse the JSON string response
            const responseData = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
            console.log("Response Data (parsed):", responseData);
            console.log("Success check:", responseData.success);
            console.log("User check:", responseData.user);

            if (responseData && responseData.success && responseData.user) {
                toast.success("Successfully log in");
                const user = responseData.user;
                localStorage.setItem("userId", user.customers_id);
                localStorage.setItem("customerOnlineId", user.customers_online_id);
                localStorage.setItem("fname", user.customers_fname);
                localStorage.setItem("lname", user.customers_lname);
                setTimeout(() => {
                    navigateTo("/customer");
                }, 1500);
            }
            else {
                console.log("Login failed - Response structure:", responseData);
                console.log("Why login failed - success:", responseData?.success, "user:", responseData?.user);
                if (responseData && responseData.message) {
                    toast.error(responseData.message);
                } else {
                    toast.error("Invalid username or password");
                }
            }

        } catch (error) {
            toast.error("Network error");
            console.log(error);
        }
    }


    return (
        <>

            <div className="h-screen flex justify-center items-center px-4">
                <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 h-full">

                        {/* Left side - Blue */}
           

                        {/* Right side - Form */}
                        <div className="flex justify-center items-center p-8">
                            <div className="w-full max-w-md">
                                {/* Title */}
                                <h2 className="text-3xl md:text-4xl font-bold text-[#769FCD] font-playfair text-center">
                                    DEMIREN HOTEL
                                </h2>
                                <p className="text-muted-foreground text-lg text-center mb-6">
                                    Login to your account
                                </p>

                                {/* Form */}
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        {/* Email */}
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Username</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter username" {...field} />
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
                                                    <div className="flex justify-between items-center">
                                                        <FormLabel>Password</FormLabel>

                                                    </div>
                                                    <FormControl>
                                                        <Input type="password" placeholder="Enter Password" {...field} />
                                                    </FormControl>
                                                    <div className="flex justify-end">
                                                        <Button variant="link" asChild>
                                                            <Link to="/forgot-password">Forgot Password?</Link>
                                                        </Button>
                                                    </div>

                                                    <FormMessage />

                                                </FormItem>
                                            )}
                                        />

                                        {/* Captcha */}
                                        <div className="text-center">
                                            <h2 className="text-lg font-semibold mb-2">Security CAPTCHA</h2>
                                            <div className="flex justify-center items-center gap-3">
                                                {captchaCharacters.map((c, index) => (
                                                    <span
                                                        key={index}
                                                        style={{ color: c.color, fontSize: "28px", fontWeight: "bold" }}
                                                    >
                                                        {c.char}
                                                    </span>
                                                ))}
                                            </div>

                                            <Input
                                                type="text"
                                                value={userInput}
                                                onChange={handleInputChange}
                                                placeholder="Enter CAPTCHA characters"
                                                className="border p-2 w-full rounded mt-3 text-center"
                                            />

                                            <div className="flex justify-center mt-2">
                                                <Button
                                                    type="button"
                                                    variant="link"
                                                    onClick={generateCaptchaCharacters}
                                                    className="text-blue-500 text-sm underline"
                                                >
                                                    Refresh CAPTCHA
                                                </Button>
                                            </div>

                                            {!isCaptchaValid && userInput.length > 0 && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    Incorrect CAPTCHA, try again.
                                                </p>
                                            )}
                                        </div>

                                        {/* Login button */}
                                        {isCaptchaValid && (
                                            <Button className="w-full mt-4 text-lg py-6">Login</Button>
                                        )}

                                        {/* Sign up link */}
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>



        </>
    )
}



export default Login