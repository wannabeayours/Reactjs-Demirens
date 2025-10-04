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

function AdminProfile() {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form data for editing
  const [editData, setEditData] = useState({
    employee_fname: '',
    employee_lname: '',
    employee_username: '',
    employee_email: '',
    employee_phone: '',
    employee_address: '',
    employee_birthdate: '',
    employee_gender: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const APIConn = localStorage.getItem('url') + "admin.php";

  // Fetch admin data
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const userType = localStorage.getItem('userType');
      
      if (!userId || userType !== 'admin') {
        toast.error('Admin access required');
        return;
      }

      const formData = new FormData();
      formData.append('method', 'getAdminProfile');
      formData.append('json', JSON.stringify({ employee_id: userId }));

      const response = await axios.post(APIConn, formData);
      console.log('Admin Profile Response:', response.data);

      if (response.data.status === 'success') {
        setAdminData(response.data.data);
        // Initialize edit form with current data
        setEditData({
          employee_fname: response.data.data.employee_fname || '',
          employee_lname: response.data.data.employee_lname || '',
          employee_username: response.data.data.employee_username || '',
          employee_email: response.data.data.employee_email || '',
          employee_phone: response.data.data.employee_phone || '',
          employee_address: response.data.data.employee_address || '',
          employee_birthdate: response.data.data.employee_birthdate || '',
          employee_gender: response.data.data.employee_gender || '',
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        toast.error(response.data.message || 'Failed to fetch admin data');
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Error fetching admin data');
    } finally {
      setLoading(false);
    }
  };

  // Update admin profile
  const updateProfile = async () => {
    try {
      // Validate passwords if changing
      if (editData.new_password && editData.new_password !== editData.confirm_password) {
        toast.error('New passwords do not match');
        return;
      }

      if (editData.new_password && editData.new_password.length < 6) {
        toast.error('New password must be at least 6 characters');
        return;
      }

      const userId = localStorage.getItem('userId');
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

      // Add password fields if changing password
      if (editData.new_password) {
        updateData.current_password = editData.current_password;
        updateData.new_password = editData.new_password;
      }

      const formData = new FormData();
      formData.append('method', 'updateAdminProfile');
      formData.append('json', JSON.stringify(updateData));

      const response = await axios.post(APIConn, formData);
      console.log('Update Profile Response:', response.data);

      if (response.data.status === 'success') {
        toast.success('Profile updated successfully');
        setIsEditModalOpen(false);
        fetchAdminData(); // Refresh data
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div>
        <AdminHeader />
        <main id="MainPage" className="ml-72 p-4 space-y-6">
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
        <main id="MainPage" className="ml-72 p-4 space-y-6">
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

  return (
    <>
      <div>
        <AdminHeader />

        <main id="MainPage" className="ml-72 p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-[#34699a] dark:text-white">Admin Profile</h1>
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#34699a] hover:bg-[#2a5580] text-white">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Admin Profile</DialogTitle>
                  <DialogDescription>
                    Update your personal information and security settings.
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

                  {/* Password Change Section */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-4">Change Password</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="current_password">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="current_password"
                            type={showPassword ? "text" : "password"}
                            value={editData.current_password}
                            onChange={(e) => setEditData({...editData, current_password: e.target.value})}
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
                      </div>

                      <div>
                        <Label htmlFor="new_password">New Password</Label>
                        <div className="relative">
                          <Input
                            id="new_password"
                            type={showNewPassword ? "text" : "password"}
                            value={editData.new_password}
                            onChange={(e) => setEditData({...editData, new_password: e.target.value})}
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
                      </div>

                      <div>
                        <Label htmlFor="confirm_password">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            id="confirm_password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={editData.confirm_password}
                            onChange={(e) => setEditData({...editData, confirm_password: e.target.value})}
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
                      </div>
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

          {/* Responsive Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Side: Menu */}
            <div className="w-full lg:w-1/3">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Profile Navigation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">Menu Here:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Profile</li>
                    <li>Role & Access</li>
                    <li>Security Settings</li>
                    <li>Notifications & Preferences</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">Use the menu to navigate admin settings.</p>
                </CardFooter>
              </Card>
            </div>

            {/* Right Side: Profile Info */}
            <div className="w-full lg:w-2/3 space-y-6">
              {/* Admin Info Card */}
              <Card>
                <CardContent className="flex flex-col sm:flex-row items-center gap-4 p-6">
                  <img
                    src="/adminProfile.jpg"
                    alt="Admin Profile"
                    className="w-32 h-32 rounded-full object-cover border"
                  />
                  <div>
                    <h2 className="text-lg font-medium">{adminData.employee_fname} {adminData.employee_lname}</h2>
                    <p className="text-sm text-muted-foreground">{adminData.userlevel_name}</p>
                    <p className="text-sm text-muted-foreground">{adminData.employee_email}</p>
                    <p className="text-sm text-muted-foreground">Status: {adminData.employee_status}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Info / Action Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Overview</CardTitle>
                  <CardDescription>Details about this admin account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>✔️ Username: {adminData.employee_username}</p>
                  <p>✔️ Phone: {adminData.employee_phone}</p>
                  <p>✔️ Address: {adminData.employee_address}</p>
                  <p>✔️ Birthdate: {DateFormatter.formatDateOnly(adminData.employee_birthdate)}</p>
                  <p>✔️ Gender: {adminData.employee_gender}</p>
                  <p>✔️ Account Created: {DateFormatter.formatDateOnly(adminData.employee_created_at)}</p>
                  <p>✔️ Last Updated: {DateFormatter.formatDateOnly(adminData.employee_updated_at)}</p>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">Review admin access logs in the system tab.</p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default AdminProfile