import * as React from 'react';
import { Card, CardDescription, CardTitle } from '../components/ui/card';
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
    FormMessage,
    FormDescription
} from "@/components/ui/form"
import { Link } from 'react-router-dom';
import ThemeToggle from '@/components/layout/ThemeToggle';





function Login() {
    const { useEffect, useState } = React;
    const [isCaptchaValid, setIsCaptchaValid] = useState(false);
    const [captchaCharacters, setCaptchaCharacters] = useState([]);
    const [userInput, setUserInput] = useState("");

    useEffect(() => {
        generateCaptchaCharacters();
    }, []);

    const generateCaptchaCharacters = () => {
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
    };

    const getRandomColor = () => {
        const colors = ["red", "blue", "green", "yellow", "purple", "orange"];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const handleInputChange = (e) => {
        setUserInput(e.target.value);
        if (e.target.value === captchaCharacters.map((c) => c.char).join("")) {
            setIsCaptchaValid(true);
        } else {
            setIsCaptchaValid(false);
        }
    };


    //     const [firstnum , setfirstnum] = useState(Math.floor(Math.random() * 90) + 1);
    //     const [secondnum , setsecondnum] = useState(Math.floor(Math.random() * 10) + 1);
    //     const [sum, setsum] = useState(firstnum + secondnum);
    //     const [isCorrect, setIsCorrect] = useState(false);


    //    const handleSetCorrect = () => {
    //        if (firstnum + secondnum === sum) {
    //            setIsCorrect(true);
    //        }
    //     };



    const schema = z.object({
        email: z.string().email({ message: "Please enter a valid email" }),
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

    const onSubmit = (values) => {
        console.log("Login values:", values)
    }


    return (
        <>
            <div className="flex items-end justify-end">
                <ThemeToggle />
            </div>
            <div className=" h-screen grid grid-cols-1 md:grid-cols-2  ">
                {/* Left Side - Image */}
                <div className="bg-cover bg-center flex justify-center items-center w-full h-full ">
                    <div className="lg:block hidden ml-32">
                        <img
                            src="./assets/images/demsdems.png"
                            alt="logo ko to"
                            className="w-full max-w-[600px] h-auto object-contain"
                        />
                    </div>
                </div>
                {/* Right Side - Form */}
                <div className="flex justify-start items-center p-8   ">
                    <Card className="w-full max-w-md p-2 bg-[#769FCD]">
                        <Card className="w-full max-w-md p-6 ">
                            <div className="flex flex-col justify-center items-center">
                            <CardTitle className="text-2xl font-bold text-[#769FCD]">DEMIREN HOTEL</CardTitle>
                            <CardDescription className=" text-muted-foreground">
                                Login to your account
                            </CardDescription>
                            </div>
                       
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
                                            <FormItem >
                                                <div className="flex justify-between items-center">
                                                    <FormLabel>Password</FormLabel>
                                                    <Button variant="link">Forgot Password?</Button>
                                                </div>

                                                <FormControl>
                                                    <Input type="password" placeholder="Enter Password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="text-center">
                                        <h2 className="text-lg font-semibold mb-2">Security CAPTCHA</h2>
                                        <div className="flex justify-center items-center gap-3">
                                            {captchaCharacters.map((c, index) => (
                                                <span key={index} style={{ color: c.color, fontSize: "24px", fontWeight: "bold" }}>
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
                                            <p className="text-red-500 text-sm mt-1">Incorrect CAPTCHA, try again.</p>
                                        )}
                                    </div>

                                    {/* Show login button only if CAPTCHA is solved */}
                                    {isCaptchaValid && (
                                        <Button className="w-full mt-4 ">
                                            Login
                                        </Button>
                                    )}


                                    {/* <div className="text-center">
                                <h3>{`${firstnum} + ${secondnum} = ?`}</h3>
                            </div>

                            <FormField
                                control={form.control}
                                name="captcha"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input type="text" placeholder="Enter CAPTCHA" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /> */}

                                    {/* 
                            <Button type="submit" className="w-full">
                                Login
                            </Button> */}
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
                    </Card>

                </div>
            </div>
        </>
    )
}
//ipa explain sa ni chatgpt or unsa ba kani na kuan
// then registeration na dayn ka
//after ana font
//og ipa hawa sa ang header dayun sa ani na page
//wowowowowowwow


export default Login