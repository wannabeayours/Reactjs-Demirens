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
        email: z.string().min(1, { message: "Please enter username" }),
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
            if (isCaptchaValid === false) {
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
        <div className="min-h-screen flex flex-col md:flex-row bg-[#F7FBFC]">
            {/* Left side - Hidden on mobile */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-b from-[#113f67] via-[#34699A] to-[#226597]344rd p-6 sm:p-8 md:p-10 flex-col justify-center items-center text-white">
                <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Welcome to Demirens Hotel</h1>
                    <p className="text-base sm:text-lg md:text-xl opacity-90">Login to access your account and manage your bookings.</p>

                    {/* SVG Icon */}
                    <div className="flex justify-center mt-6 sm:mt-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full md:w-1/2 px-4 py-6 sm:px-6 sm:py-8 md:p-10 flex items-center justify-center">
                <div className="w-full max-w-md space-y-4 sm:space-y-6">
                    <div className="text-center mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold  text-[#769FCD] ">Login to Your Account</h2>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">Enter your credentials to access your account</p>
                    </div>

                    {/* Form */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                            {/* Email */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-sm sm:text-base font-medium">Username</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter username"
                                                className="h-9 sm:h-10 px-3 py-2 text-sm sm:text-base rounded-lg focus:ring-2 focus:ring-[#769FCD] transition-all"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs sm:text-sm" />
                                    </FormItem>
                                )}
                            />

                            {/* Password */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <FormLabel className="text-sm sm:text-base font-medium">Password</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Enter Password"
                                                className="h-9 sm:h-10 px-3 py-2 text-sm sm:text-base rounded-lg focus:ring-2 focus:ring-[#769FCD] transition-all"
                                                {...field}
                                            />
                                        </FormControl>
                                        <div className="flex justify-end">
                                            <Button variant="link" asChild className="h-auto p-0 text-xs sm:text-sm text-[#769FCD]">
                                                <Link to="/forgot-password">Forgot Password?</Link>
                                            </Button>
                                        </div>
                                        <FormMessage className="text-xs sm:text-sm" />
                                    </FormItem>
                                )}
                            />

                            {/* Captcha */}
                            <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg mt-2 sm:mt-3">
                                <h2 className="text-base sm:text-lg font-semibold mb-2 text-gray-700">Security CAPTCHA</h2>
                                <div className="flex justify-center items-center gap-2 sm:gap-3 bg-white p-2 sm:p-3 rounded-md">
                                    {captchaCharacters.map((c, index) => (
                                        <span
                                            key={index}
                                            style={{
                                                color: c.color,
                                                fontSize: "clamp(20px, 4vw, 28px)",
                                                fontWeight: "bold",
                                                textShadow: "1px 1px 2px rgba(0,0,0,0.1)"
                                            }}
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
                                    className="border p-2 w-full rounded-lg mt-3 text-center h-9 sm:h-10 text-sm sm:text-base"
                                />

                                <div className="flex justify-center mt-2">
                                    <Button
                                        type="button"
                                        variant="link"
                                        onClick={generateCaptchaCharacters}
                                        className="text-[#769FCD] text-xs sm:text-sm underline h-auto p-0"
                                    >
                                        Refresh CAPTCHA
                                    </Button>
                                </div>

                                {!isCaptchaValid && userInput.length > 0 && (
                                    <p className="text-red-500 text-xs sm:text-sm mt-1">
                                        Incorrect CAPTCHA, try again.
                                    </p>
                                )}
                            </div>

                            {/* Login button */}
                            {isCaptchaValid ? (
                                <Button
                                    className="w-full mt-4 text-sm sm:text-base py-2 sm:py-2.5 h-10 sm:h-11 bg-[#769FCD] hover:bg-[#5885AF] text-white font-medium rounded-lg transition-all duration-200"
                                >
                                    Login
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    className="w-full mt-4 text-sm sm:text-base py-2 sm:py-2.5 h-10 sm:h-11 bg-gray-300 text-gray-500 font-medium rounded-lg cursor-not-allowed opacity-70"
                                    disabled
                                >
                                    Complete CAPTCHA to Login
                                </Button>
                            )}

                            {/* Sign up link */}
                            <div className="text-center pt-2">
                                <p className="text-xs sm:text-sm text-gray-600">
                                    Don't have an account?{" "}
                                    <Link to="/register" className="text-[#769FCD] font-medium hover:underline transition-all">
                                        Sign Up
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
        
    )
}



export default Login