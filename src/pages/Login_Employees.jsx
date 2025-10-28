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
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeftCircleIcon, HomeIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function EmployeeLogin() {
    const { useEffect, useState } = React;

    // Captcha state
    const [isCaptchaValid, setIsCaptchaValid] = useState(false);
    const [captchaCharacters, setCaptchaCharacters] = useState([]);
    const [userInput, setUserInput] = useState("");

    // Navigation
    const navigateTo = useNavigate();

    // Login attempt lock configuration and state
    const MAX_ATTEMPTS = 3;
    const LOCK_SECONDS = 30;
    const lockKey = 'employeeLoginLock';
    const [attempts, setAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockRemaining, setLockRemaining] = useState(0);

    // 2FA OTP state
    const [pendingUser, setPendingUser] = useState(null);
    const [pendingUserType, setPendingUserType] = useState('');
    const [otpPhase, setOtpPhase] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [otpSending, setOtpSending] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpExpiry, setOtpExpiry] = useState(0);
    const [otpRemaining, setOtpRemaining] = useState(0);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [otpDialogOpen, setOtpDialogOpen] = useState(false);

    // Lock countdown
    const startLockCountdown = (lockUntil) => {
        const tick = () => {
            const now = Date.now();
            if (now >= lockUntil) {
                setIsLocked(false);
                setLockRemaining(0);
                localStorage.removeItem(lockKey);
                clearInterval(window.__employeeLockTimer);
            } else {
                setLockRemaining(Math.ceil((lockUntil - now) / 1000));
            }
        };
        clearInterval(window.__employeeLockTimer);
        window.__employeeLockTimer = setInterval(tick, 1000);
        tick();
    };

    useEffect(() => {
        const raw = localStorage.getItem(lockKey);
        if (!raw) return;
        try {
            const { lockUntil, attempts: storedAttempts } = JSON.parse(raw);
            if (lockUntil && Date.now() < lockUntil) {
                setAttempts(storedAttempts || MAX_ATTEMPTS);
                setIsLocked(true);
                startLockCountdown(lockUntil);
            } else {
                localStorage.removeItem(lockKey);
            }
        } catch {}
    }, []);

    // Captcha helpers
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
        setUserInput("");
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

    // Form schema
    const schema = z.object({
        email: z.string().min(1, { message: "Please enter username" }),
        password: z.string().min(1, { message: "Password is required" }),
    });

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: "", password: "" }
    });

    // OTP helpers (scoped inside component)
    const LOGIN_OTP_HASH_KEY = 'login_otp_hash';
    const LOGIN_OTP_EMAIL_KEY = 'login_otp_email';
    const LOGIN_OTP_EXPIRY_KEY = 'login_otp_expiry';
    const LOGIN_OTP_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

    const sha256Hex = async (text) => {
        const enc = new TextEncoder();
        const data = enc.encode(text);
        const hash = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hash));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const generateOtpCode = () => {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        const buf = new Uint32Array(6);
        crypto.getRandomValues(buf);
        let otp = '';
        for (let i = 0; i < buf.length; i++) otp += chars[buf[i] % chars.length];
        return otp;
    };

    const clearOtpSession = () => {
        sessionStorage.removeItem(LOGIN_OTP_HASH_KEY);
        sessionStorage.removeItem(LOGIN_OTP_EMAIL_KEY);
        sessionStorage.removeItem(LOGIN_OTP_EXPIRY_KEY);
        setOtpPhase(false);
        setOtpValue('');
        setOtpSent(false);
        setResendCooldown(0);
        setOtpRemaining(0);
    };

    const initiateOtpProcess = async (user, userType) => {
        const email = (user?.employee_email || '').trim();
        if (!email || !email.includes('@')) {
            toast.error('Valid email is required for OTP');
            return;
        }
        const otp = generateOtpCode();
        const salt = (user?.employee_id || '') + '|LOGIN_OTP_SALT_v1';
        const hash = await sha256Hex(`${otp}|${email}|${salt}`);
        sessionStorage.setItem(LOGIN_OTP_HASH_KEY, hash);
        sessionStorage.setItem(LOGIN_OTP_EMAIL_KEY, email);
        const expiry = Date.now() + LOGIN_OTP_VALIDITY_MS;
        sessionStorage.setItem(LOGIN_OTP_EXPIRY_KEY, String(expiry));
        setOtpExpiry(expiry);
        setPendingUser(user);
        setPendingUserType(userType);
        setOtpPhase(true);
        setOtpValue('');
        setResendCooldown(30);

        try {
            setOtpSending(true);
            const url = (localStorage.getItem('url') || '') + 'admin.php';
            const formData = new FormData();
            formData.append('method', 'sendAdminOTP');
            formData.append('json', JSON.stringify({ email, otp_code: otp }));
            const res = await axios.post(url, formData);
            const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
            if (data?.success) {
                toast.success('OTP sent to your email');
                setOtpSent(true);
            } else {
                toast.error(data?.message || 'Failed to send OTP');
            }
        } catch (e) {
            console.error('Send OTP error:', e);
            toast.error('Error sending OTP');
        } finally {
            setOtpSending(false);
        }
    };

    const verifyLoginOtp = async () => {
        const hash = sessionStorage.getItem(LOGIN_OTP_HASH_KEY);
        const email = sessionStorage.getItem(LOGIN_OTP_EMAIL_KEY);
        const expiryStr = sessionStorage.getItem(LOGIN_OTP_EXPIRY_KEY);
        if (!hash || !email || !expiryStr) {
            toast.error('OTP session missing. Please resend the code');
            return;
        }
        const expiry = parseInt(expiryStr, 10);
        if (Date.now() > expiry) {
            toast.error('OTP expired. Please resend a new code');
            clearOtpSession();
            return;
        }
        const salt = (pendingUser?.employee_id || '') + '|LOGIN_OTP_SALT_v1';
        const inputHash = await sha256Hex(`${otpValue}|${email}|${salt}`);
        if (inputHash !== hash) {
            toast.error('Incorrect OTP');
            return;
        }
        const user = pendingUser;
        const userType = pendingUserType;
        if (!user) return;
        localStorage.setItem('userId', user.employee_id);
        localStorage.setItem('fname', user.employee_fname);
        localStorage.setItem('lname', user.employee_lname);
        localStorage.setItem('userType', userType === 'front-desk' ? 'employee' : 'admin');
        localStorage.setItem('userLevel', user.userlevel_name);
        setAttempts(0);
        setIsLocked(false);
        setLockRemaining(0);
        localStorage.removeItem(lockKey);
        clearOtpSession();
        navigateTo('/admin/dashboard');
    };

    const resendLoginOtp = async () => {
        if (resendCooldown > 0 || otpSending) return;
        if (!pendingUser) return;
        await initiateOtpProcess(pendingUser, pendingUserType);
    };

    // OTP countdown timers
    useEffect(() => {
        if (!otpPhase) return;
        const id = setInterval(() => {
            const now = Date.now();
            if (otpExpiry && now < otpExpiry) {
                setOtpRemaining(Math.max(0, Math.ceil((otpExpiry - now) / 1000)));
            } else if (otpExpiry) {
                clearOtpSession();
                toast.error('OTP expired. Please resend a new code');
            }
            setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(id);
    }, [otpPhase, otpExpiry]);

    // Submit handler
    const onSubmit = async (values) => {
        try {
            if (isLocked) {
                toast.error(`Too many attempts. Try again in ${lockRemaining}s`);
                return;
            }
            if (isCaptchaValid === false) {
                toast.error("Invalid CAPTCHA");
                return;
            }
            const url = localStorage.getItem('url') + "admin.php";
            const jsonData = { username: values.email, password: values.password };
            const formData = new FormData();
            formData.append("method", "login");
            formData.append("json", JSON.stringify(jsonData));
            const res = await axios.post(url, formData);
            const responseData = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;

            if (responseData && responseData.success && responseData.user) {
                const user = responseData.user;
                const userType = responseData.user_type;

                if (userType === "customer") {
                    toast.error("Customer login is not allowed here. Please use the Customer portal.");
                    return;
                }

                const twoFAEnabled = Number(user.employee_online_authentication_status) === 1 || String(user.employee_online_authentication_status).toLowerCase() === '1' || user.employee_online_authentication_status === true;
                if (twoFAEnabled) {
                    await initiateOtpProcess(user, userType);
                    setOtpDialogOpen(true);
                    toast.warning("Two-Factor Authentication required. OTP sent to your email.");
                } else {
                    localStorage.setItem('userId', user.employee_id);
                    localStorage.setItem('fname', user.employee_fname);
                    localStorage.setItem('lname', user.employee_lname);
                    localStorage.setItem('userType', userType === 'front-desk' ? 'employee' : 'admin');
                    localStorage.setItem('userLevel', user.userlevel_name);
                    setAttempts(0);
                    setIsLocked(false);
                    setLockRemaining(0);
                    localStorage.removeItem(lockKey);
                    navigateTo('/admin/dashboard');
                }
            } else {
                const message = (responseData && responseData.message) ? responseData.message : "Invalid username or password";
                toast.error(message);
                setAttempts((prev) => {
                    const next = prev + 1;
                    if (next >= MAX_ATTEMPTS) {
                        const lockUntil = Date.now() + LOCK_SECONDS * 1000;
                        localStorage.setItem(lockKey, JSON.stringify({ lockUntil, attempts: next }));
                        setIsLocked(true);
                        startLockCountdown(lockUntil);
                        toast.error(`Too many attempts. Locked for ${LOCK_SECONDS}s`);
                    } else {
                        toast.error(`Attempt ${next}/${MAX_ATTEMPTS}`);
                    }
                    return next;
                });
            }
        } catch (error) {
            console.log("=== LOGIN ERROR ===", error);
            toast.error("Network error");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center p-3 sm:p-4 lg:p-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-gradient-to-r from-purple-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-10 lg:right-10 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 border border-white/10 rotate-45 animate-spin-slow"></div>
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 lg:bottom-10 lg:left-10 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 border border-white/10 rotate-12 animate-bounce-slow"></div>
                <div className="absolute top-1/3 right-1/3 w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-white/5 rotate-45 animate-pulse"></div>
            </div>

            {/* Card */}
            <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl relative z-10 mx-auto">
                <CardContent className="w-full space-y-4 p-4 sm:p-6">
                    <div className="text-center mb-4 sm:mb-5">
                        <div className="flex items-center justify-start">
                            <Button variant="outline" className="bg-transparent text-white" onClick={() => navigateTo("/")}>
                                <ArrowLeftCircleIcon />
                            </Button>
                        </div>
                        <div className="mb-3 sm:mb-4 flex justify-center">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                            </div>
                        </div>
                        <div className="mb-3">
                            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Welcome Back, Employee!</h1>
                            <div className="w-12 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 mx-auto mt-2 rounded-full"></div>
                        </div>
                        <p className="text-xs sm:text-sm text-blue-100/80">Please sign in to your account</p>
                    </div>

                    {/* Form */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-sm font-medium text-white/90">Email / Username</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    placeholder="Enter your email or username"
                                                    className="h-9 px-3 py-2 text-sm rounded-lg border-2 border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 bg-white/10 shadow-sm hover:shadow-md text-white placeholder:text-white/50"
                                                    {...field}
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                                    </svg>
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <FormLabel className="text-sm font-medium text-white/90">Password</FormLabel>
                                        </div>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="password"
                                                    placeholder="Enter your password"
                                                    className="h-9 px-3 py-2 text-sm rounded-lg border-2 border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 bg-white/10 shadow-sm hover:shadow-md text-white placeholder:text-white/50"
                                                    {...field}
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                                    </svg>
                                                </div>
                                            </div>
                                        </FormControl>
                                        <div className="flex justify-end">
                                            <Button variant="link" asChild className="h-auto p-0 text-xs text-blue-300 hover:text-blue-200 transition-colors">
                                                <Link to="/forgot-password">Forgot Password?</Link>
                                            </Button>
                                        </div>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />

                            {/* Captcha */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-inner">
                                <h2 className="text-sm font-bold mb-3 text-white/90 text-center flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                    </svg>
                                    Security Verification
                                </h2>
                                <div className="bg-white/20 rounded-lg p-3 shadow-sm border-2 border-dashed border-blue-300/50 mb-3">
                                    <div className="flex justify-center items-center gap-2">
                                        {captchaCharacters.map((c, index) => (
                                            <span
                                                key={index}
                                                style={{
                                                    color: c.color,
                                                    fontSize: "20px",
                                                    fontWeight: "bold",
                                                    textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                                                    transform: `rotate(${Math.random() * 15 - 7.5}deg)`
                                                }}
                                                className="select-none"
                                            >
                                                {c.char}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <Input
                                    type="text"
                                    value={userInput}
                                    onChange={handleInputChange}
                                    placeholder="Enter the characters above"
                                    className="border-2 border-white/20 p-2 w-full rounded-lg text-center h-9 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 bg-white/10 shadow-sm text-white placeholder:text-white/50"
                                />

                                <div className="flex justify-center mt-2">
                                    <Button type="button" variant="link" onClick={generateCaptchaCharacters} className="text-blue-300 hover:text-blue-200 text-xs underline h-auto p-0 transition-colors">
                                        🔄 Generate New Code
                                    </Button>
                                </div>

                                {!isCaptchaValid && userInput.length > 0 && (
                                    <div className="mt-2 p-2 bg-red-500/20 border border-red-400/30 rounded-lg">
                                        <p className="text-red-200 text-xs text-center font-medium">❌ Incorrect verification code, please try again.</p>
                                    </div>
                                )}

                                {isCaptchaValid && (
                                    <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded-lg">
                                        <p className="text-green-200 text-xs text-center font-medium">✅ Verification successful!</p>
                                    </div>
                                )}
                            </div>

                            {/* Sign In */}
                            <Button
                                type="submit"
                                disabled={!isCaptchaValid || isLocked}
                                className={`w-full h-12 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] ${(isCaptchaValid && !isLocked)
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                }`}
                            >
                                {isLocked ? `Locked (${lockRemaining}s)` : 'Sign In'}
                            </Button>
                            <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Two-Factor Authentication Required</DialogTitle>
                                        <DialogDescription>
                                            Enter the 6-character OTP sent to your email. The code expires in {otpRemaining}s.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-3">
                                        <Input
                                            value={otpValue}
                                            maxLength={6}
                                            onChange={(e) => setOtpValue(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                            placeholder="Enter OTP"
                                            className="h-10 px-3 py-2 text-sm rounded-lg border-2 border-white/20 bg-white/10 text-white placeholder:text-white/50"
                                        />
                                        <div className="flex items-center justify-between text-xs text-white/80">
                                            <span>Expires in: {otpRemaining}s</span>
                                            <span>{otpSent ? 'OTP sent to your email' : ''}</span>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="outline" disabled={otpSending || resendCooldown > 0} onClick={resendLoginOtp}>
                                                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                                            </Button>
                                            <Button onClick={verifyLoginOtp} disabled={!otpValue || otpValue.length !== 6}>Verify</Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                            {/* OTP UI removed: using modal only */}
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

export default EmployeeLogin;