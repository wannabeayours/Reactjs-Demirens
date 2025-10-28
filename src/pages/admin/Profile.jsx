import React, { useState, useEffect } from 'react'
import AdminHeader from './components/AdminHeader'
import axios from 'axios'
import { toast } from 'sonner'
import { DateFormatter } from './Function_Files/DateFormatter';

// Shad CN
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye, EyeOff, Edit, Save, X } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Shield, KeyRound } from "lucide-react"

function AdminProfile() {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Removed: twoFAEnabled, biometricEnabled, securityQuestionsEnabled, isBiometricModalOpen
  // Form data for editing
  const [editData, setEditData] = useState({
    employee_fname: '',
    employee_lname: '',
    employee_username: '',
    employee_email: '',
    employee_phone: '',
    employee_address: '',
    employee_birthdate: '',
    employee_gender: ''
  });

  // Separate password data
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Inline field-level errors and hints for password inputs
  const [passwordErrors, setPasswordErrors] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
    strength: ''
  });

  // OTP verification state
  const [otpInput, setOtpInput] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpEnabled, setOtpEnabled] = useState(() => {
    // Load OTP toggle state from localStorage, default to false
    const saved = localStorage.getItem('admin_otp_enabled');
    return saved === 'true';
  });

  useEffect(() => {
    const { current_password, new_password, confirm_password } = passwordData;
    const isChanging = !!(current_password || new_password || confirm_password);

    const errors = { current_password: '', new_password: '', confirm_password: '', strength: '' };

    if (isChanging) {
      if (!current_password) {
        errors.current_password = 'Current password is required to change your password';
      }

      if (!new_password) {
        errors.new_password = 'New password is required';
      } else {
        if (/\s/.test(new_password)) {
          errors.new_password = 'New password cannot contain spaces';
        } else {
          const hasLower = /[a-z]/.test(new_password);
          const hasUpper = /[A-Z]/.test(new_password);
          const hasNumber = /\d/.test(new_password);
          const hasSpecial = /[\W_]/.test(new_password);
          const lengthOk = new_password.length >= 8;

          const criteriaCount = [hasLower, hasUpper, hasNumber, hasSpecial, lengthOk].filter(Boolean).length;
          let strength = 'Weak';
          if (criteriaCount >= 4 && new_password.length >= 10) strength = 'Strong';
          else if (criteriaCount >= 3) strength = 'Medium';
          errors.strength = `Strength: ${strength}`;

          if (!(hasLower && hasUpper && hasNumber && hasSpecial && lengthOk)) {
            errors.new_password = 'Must be at least 8 characters and include uppercase, lowercase, number, and special character';
          } else if (current_password && current_password === new_password) {
            errors.new_password = 'New password must be different from current password';
          } else {
            errors.new_password = '';
          }
        }
      }

      if (!confirm_password) {
        errors.confirm_password = 'Please confirm your new password';
      } else if (new_password && confirm_password && new_password !== confirm_password) {
        errors.confirm_password = 'New passwords do not match';
      }
    } else {
      errors.strength = '';
    }

    setPasswordErrors(errors);
  }, [passwordData.current_password, passwordData.new_password, passwordData.confirm_password]);

  const APIConn = localStorage.getItem('url') + "admin.php";
  const OTP_HASH_KEY = 'admin_otp_hash';
  const OTP_EMAIL_KEY = 'admin_otp_email';
  const OTP_EXPIRY_KEY = 'admin_otp_expiry';
  const OTP_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

  const getAdminEmail = () => {
    return (adminData?.employee_email || editData.employee_email || localStorage.getItem('email') || '').trim();
  };

  const sha256Hex = async (text) => {
    const enc = new TextEncoder();
    const data = enc.encode(text);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hash));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const sendOTP = async () => {
    if (otpSending) return;
    const email = getAdminEmail();
    if (!email || !email.includes('@')) {
      toast.error('Valid email is required to send OTP');
      return;
    }

    // Generate a secure 6-character OTP (alphanumeric)
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // avoid ambiguous chars
    const buf = new Uint32Array(6);
    crypto.getRandomValues(buf);
    let otp = '';
    for (let i = 0; i < buf.length; i++) otp += chars[buf[i] % chars.length];

    const salt = (localStorage.getItem('userId') || '') + '|DEMIREN_OTP_SALT_v1';
    const hash = await sha256Hex(`${otp}|${email}|${salt}`);

    // Store encrypted OTP (hash) and expiry (Admin scheme)
    sessionStorage.setItem(OTP_HASH_KEY, hash);
    sessionStorage.setItem(OTP_EMAIL_KEY, email);
    sessionStorage.setItem(OTP_EXPIRY_KEY, String(Date.now() + OTP_VALIDITY_MS));

    // Also store using Customer scheme for compatibility
    sessionStorage.setItem('registrationEmail', email);
    sessionStorage.setItem('registrationOTP', btoa(otp + email));
    sessionStorage.setItem('otpExpiry', Date.now() + OTP_VALIDITY_MS);

    // Send email via backend (admin route)
    try {
      setOtpSending(true);
      const url = (localStorage.getItem('url') || '') + 'admin.php';
      const form = new FormData();
      form.append('method', 'sendAdminOTP');
      form.append('json', JSON.stringify({ email, otp_code: otp }));
      const res = await axios.post(url, form);
      if (res?.data?.success) {
        toast.success('OTP sent to your email');
        setOtpSent(true);
      } else {
        toast.error(res?.data?.message || 'Failed to send OTP');
      }
    } catch (e) {
      console.error('Send OTP error:', e);
      toast.error('Error sending OTP');
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOTPBeforeChange = async () => {
    // First try Admin scheme
    const storedHash = sessionStorage.getItem(OTP_HASH_KEY);
    const storedEmail = sessionStorage.getItem(OTP_EMAIL_KEY);
    const expiryStr = sessionStorage.getItem(OTP_EXPIRY_KEY);
    if (storedHash && storedEmail && expiryStr) {
      const expiry = parseInt(expiryStr, 10);
      if (Date.now() > expiry) {
        toast.error('OTP expired. Please send a new code');
        return false;
      }
      const salt = (localStorage.getItem('userId') || '') + '|DEMIREN_OTP_SALT_v1';
      const inputHash = await sha256Hex(`${otpInput}|${storedEmail}|${salt}`);
      if (inputHash !== storedHash) {
        toast.error('Incorrect OTP');
        return false;
      }
      return true;
    }

    // Fallback: Customer scheme (registrationOTP + registrationEmail)
    const regOTP = sessionStorage.getItem('registrationOTP');
    const regEmail = sessionStorage.getItem('registrationEmail');
    const regExpiryStr = sessionStorage.getItem('otpExpiry');
    if (!regOTP || !regEmail || !regExpiryStr) {
      toast.error('Please click "Send OTP" and enter the code');
      return false;
    }
    const regExpiry = parseInt(regExpiryStr, 10);
    if (Date.now() > regExpiry) {
      toast.error('OTP expired. Please send a new code');
      return false;
    }
    try {
      const decrypted = atob(regOTP);
      const originalOTP = decrypted.substring(0, 6);
      if (otpInput !== originalOTP) {
        toast.error('Incorrect OTP');
        return false;
      }
      return true;
    } catch (e) {
      console.error('OTP decode error:', e);
      toast.error('Invalid OTP session. Please resend the code');
      return false;
    }
  };

  // Fetch admin data
  const fetchAdminData = async () => {
    try {
      setLoading(true);

      const userId = localStorage.getItem('userId');
      const rawType = (localStorage.getItem('userType') || '').toLowerCase().replace(/[\s_-]/g, '');
      const rawLevel = (localStorage.getItem('userLevel') || '').toLowerCase().replace(/[\s_-]/g, '');
      const typeAllowed = ['admin','employee','frontdesk'].includes(rawType);
      const levelAllowed = ['admin','frontdesk'].includes(rawLevel);
      
      if (!userId || (!typeAllowed && !levelAllowed)) {
        toast.error('Employee or Admin access required');
        return;
      }

      const formData = new FormData();
      formData.append('method', 'getAdminProfile');
      formData.append('json', JSON.stringify({ employee_id: userId }));

      const response = await axios.post(APIConn, formData);
      console.log('Admin Profile Response:', response.data);

      // Robustly parse JSON responses (string or object) and accept success/status
      const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

      if ((data?.status === 'success' || data?.success === true) && data?.data) {
        setAdminData(data.data);
        // Initialize edit form with current data
        setEditData({
          employee_fname: data.data.employee_fname || '',
          employee_lname: data.data.employee_lname || '',
          employee_username: data.data.employee_username || '',
          employee_email: data.data.employee_email || '',
          employee_phone: data.data.employee_phone || '',
          employee_address: data.data.employee_address || '',
          employee_birthdate: data.data.employee_birthdate || '',
          employee_gender: data.data.employee_gender || ''
        });
        // Sync 2FA toggle with server value if available
        setOtpEnabled(((data.data.employee_online_authentication_status ?? 0) === 1));
      } else {
        toast.error(data?.message || 'Failed to fetch admin data');
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Error fetching admin data');
    } finally {
      setLoading(false);
    }
  };

  // Update admin profile (without password)
  const updateProfile = async () => {
    try {
      const otpOk = await verifyOTPBeforeChange();
      if (!otpOk) {
        return;
      }
      const userId = localStorage.getItem('userId');
      const userType = (localStorage.getItem('userType') || '').toLowerCase().replace(/[\s_-]/g, '')
      const userLevel = (localStorage.getItem('userLevel') || '').toLowerCase().replace(/[\s_-]/g, '')
      const typeAllowed = ['admin','employee','frontdesk'].includes(userType)
      const levelAllowed = ['admin','frontdesk'].includes(userLevel)

      if (!userId || (!typeAllowed && !levelAllowed)) {
        toast.error('Employee or Admin access required');
        return;
      }

      const updateData = {
        employee_id: userId,
        employee_fname: editData.employee_fname,
        employee_lname: editData.employee_lname,
        employee_username: editData.employee_username,
        employee_email: editData.employee_email,
        employee_phone: editData.employee_phone,
        employee_address: editData.employee_address,
        employee_birthdate: editData.employee_birthdate,
        employee_gender: editData.employee_gender
      };

      const formData = new FormData();
      formData.append('method', 'updateAdminProfile');
      formData.append('json', JSON.stringify(updateData));

      const response = await axios.post(APIConn, formData);
      console.log('Update Profile Response:', response.data);

      // Robustly parse JSON responses (string or object) and accept success/status
      const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

      if (data?.status === 'success' || data?.success === true) {
        toast.success('Profile updated successfully');
        setIsEditModalOpen(false);
        fetchAdminData(); // Refresh data
      } else {
        toast.error(data?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    }
  };

  // Separate password change function
  const changePassword = async () => {
    try {
      // Password validation
      if (!passwordData.current_password) {
        toast.error('Current password is required to change your password');
        return;
      }
      if (!passwordData.new_password) {
        toast.error('New password is required');
        return;
      }
      if (!passwordData.confirm_password) {
        toast.error('Please confirm your new password');
        return;
      }
      if (/\s/.test(passwordData.new_password)) {
        toast.error('New password cannot contain spaces');
        return;
      }
      if (passwordData.new_password !== passwordData.confirm_password) {
        toast.error('New passwords do not match');
        return;
      }
      // Strong password: min 8 chars, includes uppercase, lowercase, number, and special character
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!strongPasswordRegex.test(passwordData.new_password)) {
        toast.error('New password must be at least 8 characters and include uppercase, lowercase, number, and special character');
        return;
      }
      if (passwordData.current_password === passwordData.new_password) {
        toast.error('New password must be different from current password');
        return;
      }

      // If OTP feature is enabled, require a code and verify it
      if (otpEnabled) {
        if (!otpInput) {
          toast.error('OTP Code is Needed, Please Try again');
          return;
        }
        const ok = await verifyOTPBeforeChange();
        if (!ok) return;
      }

      const userId = localStorage.getItem('userId');
      const userType = (localStorage.getItem('userType') || '').toLowerCase().replace(/[\s_-]/g, '')
      const userLevel = (localStorage.getItem('userLevel') || '').toLowerCase().replace(/[\s_-]/g, '')
      const typeAllowed = ['admin','employee','frontdesk'].includes(userType)
      const levelAllowed = ['admin','frontdesk'].includes(userLevel)

      if (!userId || (!typeAllowed && !levelAllowed)) {
        toast.error('Employee or Admin access required');
        return;
      }

      const updateData = {
        employee_id: userId,
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      };

      const formData = new FormData();
      formData.append('method', 'updateAdminProfile');
      formData.append('json', JSON.stringify(updateData));

      const response = await axios.post(APIConn, formData);
      console.log('Change Password Response:', response.data);

      // Robustly parse JSON responses (string or object) and accept success/status
      const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

      if (data?.status === 'success' || data?.success === true) {
        toast.success('Password changed successfully');
        setIsPasswordModalOpen(false);
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        setShowPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        // Clear OTP session after success
        sessionStorage.removeItem(OTP_HASH_KEY);
        sessionStorage.removeItem(OTP_EMAIL_KEY);
        sessionStorage.removeItem(OTP_EXPIRY_KEY);
        setOtpInput('');
        setOtpSent(false);
      } else {
        toast.error(data?.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Error changing password');
    }
  };

  // ... existing code ...

  // Persist 2FA toggle to backend: employee_online_authentication_status (1/0)
  const handleToggle2FA = async (next) => {
    // Optimistically update UI
    setOtpEnabled(next);
    try {
      const userId = localStorage.getItem('userId');
      const userType = (localStorage.getItem('userType') || '').toLowerCase().replace(/[\s_-]/g, '')
      const userLevel = (localStorage.getItem('userLevel') || '').toLowerCase().replace(/[\s_-]/g, '')
      const typeAllowed = ['admin','employee','frontdesk'].includes(userType)
      const levelAllowed = ['admin','frontdesk'].includes(userLevel)

      if (!userId || (!typeAllowed && !levelAllowed)) {
        toast.error('Employee or Admin access required');
        setOtpEnabled(!next);
        return;
      }

      const formData = new FormData();
      formData.append('method', 'updateAdminProfile');
      formData.append('json', JSON.stringify({
        employee_id: userId,
        employee_online_authentication_status: next ? 1 : 0,
      }));

      const response = await axios.post(APIConn, formData);
      const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

      if (data?.status === 'success' || data?.success === true) {
        toast.success(next ? 'Two-Factor Authentication activated' : 'Two-Factor Authentication deactivated');
        setAdminData((prev) => prev ? { ...prev, employee_online_authentication_status: next ? 1 : 0 } : prev);
      } else {
        toast.error(data?.message || 'Failed to update 2FA setting');
        setOtpEnabled(!next); // revert on failure
      }
    } catch (error) {
      console.error('Update 2FA setting error:', error);
      toast.error('Error updating 2FA setting');
      setOtpEnabled(!next); // revert on error
    }
  };

  // Save OTP toggle state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('admin_otp_enabled', otpEnabled.toString());
  }, [otpEnabled]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div>
        <AdminHeader />
        <main id="MainPage" className="ml-0 lg:ml-72 px-2 sm:px-4 lg:px-6 py-4 space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#34699a]"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div>
        <AdminHeader />
        <main id="MainPage" className="ml-0 lg:ml-72 px-2 sm:px-4 lg:px-6 py-4 space-y-6">
          <div className="text-center">
            <p className="text-red-500">Failed to load admin data</p>
            <Button onClick={fetchAdminData} className="mt-4">
              Retry
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Compute role for clear visual indicator
  const isAdmin = String(adminData.userlevel_name || '').toLowerCase().includes('admin');

  return (
    <>
      <div>
        <AdminHeader />

        <main id="MainPage" className="ml-0 lg:ml-72 px-2 sm:px-4 lg:px-6 py-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-[#34699a] dark:text-white">My Account</h1>
              <span className={`px-2 py-1 text-xs rounded-full ${isAdmin ? 'bg-emerald-600' : 'bg-indigo-600'} text-white`}>
                {isAdmin ? 'Admin' : 'Front-Desk'}
              </span>
            </div>
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              {/* Trigger removed: Edit button exists in profile hero card */}
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Admin Profile</DialogTitle>
                  <DialogDescription>
                    Update your personal information.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employee_fname">First Name</Label>
                      <Input
                        id="employee_fname"
                        value={editData.employee_fname}
                        onChange={(e) => setEditData({...editData, employee_fname: e.target.value})}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="employee_lname">Last Name</Label>
                      <Input
                        id="employee_lname"
                        value={editData.employee_lname}
                        onChange={(e) => setEditData({...editData, employee_lname: e.target.value})}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employee_username">Username</Label>
                      <Input
                        id="employee_username"
                        value={editData.employee_username}
                        onChange={(e) => setEditData({...editData, employee_username: e.target.value})}
                        placeholder="Enter username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="employee_email">Email</Label>
                      <Input
                        id="employee_email"
                        type="email"
                        value={editData.employee_email}
                        onChange={(e) => setEditData({...editData, employee_email: e.target.value})}
                        placeholder="Enter email"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="employee_phone">Phone Number</Label>
                    <Input
                      id="employee_phone"
                      value={editData.employee_phone}
                      onChange={(e) => setEditData({...editData, employee_phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="employee_address">Address</Label>
                    <Input
                      id="employee_address"
                      value={editData.employee_address}
                      onChange={(e) => setEditData({...editData, employee_address: e.target.value})}
                      placeholder="Enter address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employee_birthdate">Birthdate</Label>
                      <Input
                        id="employee_birthdate"
                        type="date"
                        value={editData.employee_birthdate}
                        onChange={(e) => setEditData({...editData, employee_birthdate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="employee_gender">Gender</Label>
                      <Select value={editData.employee_gender} onValueChange={(value) => setEditData({...editData, employee_gender: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={updateProfile} className="bg-[#34699a] hover:bg-[#2a5580] text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </DialogFooter>
                </DialogContent>
                </Dialog>
                </div>

          {/* Password Change Modal */}
          <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  Update your current password to ensure your account remains secure.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">

                <div>
                  <Label htmlFor="current_password_modal">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current_password_modal"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className={`text-xs mt-1 ${passwordErrors.current_password ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {passwordErrors.current_password || 'Enter your current password to authorize the change'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="new_password_modal">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new_password_modal"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className={`text-xs mt-1 ${passwordErrors.new_password ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {passwordErrors.new_password || 'Use a strong password: at least 8 characters, include uppercase, lowercase, number, and special character. No spaces.'}
                  </p>
                  {passwordErrors.strength && (
                    <p className="text-xs mt-1 text-muted-foreground">{passwordErrors.strength}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirm_password_modal">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password_modal"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className={`text-xs mt-1 ${passwordErrors.confirm_password ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {passwordErrors.confirm_password || 'Retype your new password to confirm'}
                  </p>
                </div>
              </div>

              {/* OTP Verification - only when enabled */}
              {otpEnabled && (
                <div>
                  <Label htmlFor="otp_code_modal">OTP Code (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="otp_code_modal"
                      type="text"
                      inputMode="text"
                      pattern="[A-Za-z0-9]*"
                      placeholder="Enter 6-character OTP"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 6))}
                    />
                    <Button type="button" variant="outline" onClick={sendOTP} disabled={otpSending}>
                      {otpSending ? 'Sending...' : 'Send OTP'}
                    </Button>
                  </div>
                  <p className="text-xs mt-1 text-muted-foreground">A 6-digit code will be sent to your email and expires in 5 minutes.</p>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
                  setShowPassword(false);
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                  // Clear OTP session
                  sessionStorage.removeItem(OTP_HASH_KEY);
                  sessionStorage.removeItem(OTP_EMAIL_KEY);
                  sessionStorage.removeItem(OTP_EXPIRY_KEY);
                  setOtpInput('');
                  setOtpSent(false);
                }}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={changePassword} className="bg-[#34699a] hover:bg-[#2a5580] text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* New grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Security Settings (left) */}
            <Card className="lg:col-span-1">
              <CardHeader className="flex flex-row items-center gap-2">
                <Shield className="w-5 h-5 text-[#34699a]" />
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Change Password */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <KeyRound className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Change Password</p>
                      <p className="text-xs text-muted-foreground">Update your current password to ensure your account remains secure.</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setIsPasswordModalOpen(true)}>Manage</Button>
                </div>

                {/* Require OTP row */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Activate 2 Factor Authentication</p>
                    <p className="text-xs text-muted-foreground">Toggle to require an emai  l OTP before changing password.</p>
                  </div>
                  <Switch checked={otpEnabled} onCheckedChange={handleToggle2FA} />
                </div>

              </CardContent>
            </Card>

            {/* Profile & Overview (right) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile hero card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{adminData.employee_fname} {adminData.employee_lname}</CardTitle>
                    <CardDescription>
                      {isAdmin ? 'Administrator' : 'Front-Desk'} · {adminData.employee_email}
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground">Username</p>
                      <p className="text-sm font-medium">{adminData.employee_username}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{adminData.employee_phone || '—'}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground">Role</p>
                      <p className="text-sm font-medium">{adminData.userlevel_name}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-sm font-medium">{String(adminData.employee_status || 'Active')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Overview card */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Overview</CardTitle>
                  <CardDescription>Details about this admin account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm font-medium">{adminData.employee_address || '—'}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground">Birthdate</p>
                      <p className="text-sm font-medium">{DateFormatter.formatDateOnly(adminData.employee_birthdate)}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground">Gender</p>
                      <p className="text-sm font-medium">{adminData.employee_gender || '—'}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground">Last Updated</p>
                      <p className="text-sm font-medium">{DateFormatter.formatDateOnly(adminData.last_update || adminData.updated_at || '')}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Review admin access logs in the system tab.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default AdminProfile