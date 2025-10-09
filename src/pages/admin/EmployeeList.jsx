import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Search, Edit, Users, Eye, EyeOff } from "lucide-react";
import AdminHeader from "./components/AdminHeader";
import { NumberFormatter } from './Function_Files/NumberFormatter';
import { DateFormatter } from './Function_Files/DateFormatter';

// Form validation schema
const employeeSchema = z.object({
  employee_fname: z.string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces"),
  employee_lname: z.string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces"),
  employee_username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  employee_phone: z.string()
    .length(11, "Phone number must be exactly 11 digits")
    .regex(/^\d{11}$/, "Phone number must be exactly 11 digits"),
  employee_email: z.string()
    .email("Invalid email address")
    .max(100, "Email must be less than 100 characters")
    .toLowerCase(),
  employee_password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number")
    .optional(),
  employee_address: z.string()
    .min(1, "Address is required")
    .min(10, "Address must be at least 10 characters")
    .max(255, "Address must be less than 255 characters"),
  employee_birthdate: z.string()
    .min(1, "Birthdate is required")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 100;
    }, "Employee must be between 18 and 100 years old"),
  employee_gender: z.string()
    .min(1, "Gender is required")
    .refine((val) => ["Male", "Female", "Other"].includes(val), "Please select a valid gender"),
});

function EmployeeManagement() {
    const APIConn = localStorage.getItem('url') + "admin.php";
  const [employees, setEmployees] = useState([]);
  const [userLevels, setUserLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingEmployeeData, setPendingEmployeeData] = useState(null);
  const [statusFilter, setStatusFilter] = useState('active');

  const form = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employee_fname: "",
      employee_lname: "",
      employee_username: "",
      employee_phone: "",
      employee_email: "",
      employee_password: "",
      employee_address: "",
      employee_birthdate: "",
      employee_gender: ""
    }
  });

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('method', 'viewEmployees');
      
      const response = await axios.post(APIConn, formData);
      
      if (response.data.status === 'success') {
        setEmployees(response.data.data);
      } else {
        toast.error('Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Error fetching employees');
    } finally {
      setLoading(false);
    }
  }, [APIConn]);

  // Fetch user levels
  const fetchUserLevels = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append('method', 'getUserLevels');
      
      const response = await axios.post(APIConn, formData);
      
      if (response.data.status === 'success') {
        setUserLevels(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user levels:', error);
    }
  }, [APIConn]);

  useEffect(() => {
    fetchEmployees();
    fetchUserLevels();
  }, [fetchEmployees, fetchUserLevels]);

  // Handle form submission
  const onSubmit = async (data) => {
    // Console logging for debugging
    console.log('=== EMPLOYEE FORM SUBMISSION ===');
    console.log('Form Data:', data);
    console.log('Is Editing:', !!editingEmployee);
    console.log('Editing Employee ID:', editingEmployee?.employee_id);
    
    // Additional validation and data preparation
    const payload = { ...data };
    
    if (editingEmployee) {
      payload.employee_id = editingEmployee.employee_id;
      // Preserve existing user level for updates (no UI control)
      payload.employee_user_level_id = editingEmployee.employee_user_level_id?.toString() || "2";
      // Remove password if empty (for updates)
      if (!data.employee_password) {
        delete payload.employee_password;
        console.log('Password field removed for update (empty)');
      }
    } else {
      // For new employees, password is required
      if (!data.employee_password) {
        toast.error('Password is required for new employees');
        return;
      }
      // Ensure new employees are always Front-Desk (level 2)
      payload.employee_user_level_id = "2";
      // Default status to Active (1)
      payload.employee_status = 1;
    }

    // Additional data validation
    const userLevel = userLevels.find(level => level.userlevel_id.toString() === payload.employee_user_level_id);
    payload.user_level_name = userLevel?.userlevel_name || 'Unknown';
    
    console.log('Final Payload:', payload);
    console.log('User Level Info:', userLevel);
    
    // Show confirmation dialog for new employees
    if (!editingEmployee) {
      setPendingEmployeeData(payload);
      setShowConfirmDialog(true);
      return;
    }
    
    // For updates, proceed directly
    await submitEmployeeData(payload, 'updateEmployee');
  };

  // Submit employee data to API
  const submitEmployeeData = async (payload, method) => {
    try {
      console.log('=== SUBMITTING TO API ===');
      console.log('Method:', method);
      console.log('Payload:', payload);

      const formData = new FormData();
      formData.append('method', method);
      formData.append('json', JSON.stringify(payload));

      const response = await axios.post(APIConn, formData);
      
      console.log('API Response:', response.data);

      if (response.data.status === 'success') {
        toast.success(response.data.message);
        setIsDialogOpen(false);
        setEditingEmployee(null);
        setShowConfirmDialog(false);
        setPendingEmployeeData(null);
        form.reset();
        fetchEmployees();
      } else {
        toast.error(response.data.message);
        console.error('API Error:', response.data.message);
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Error saving employee');
    }
  };

  // Handle confirmation for new employee
  const handleConfirmAdd = async () => {
    if (pendingEmployeeData) {
      await submitEmployeeData(pendingEmployeeData, 'addEmployee');
    }
  };

  // Handle edit
  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    form.reset({
      employee_fname: employee.employee_fname,
      employee_lname: employee.employee_lname,
      employee_username: employee.employee_username,
      employee_phone: employee.employee_phone,
      employee_email: employee.employee_email,
      employee_password: "",
      employee_address: employee.employee_address,
      employee_birthdate: employee.employee_birthdate,
      employee_gender: employee.employee_gender
    });
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (employee) => {
    if (window.confirm(`Are you sure you want to deactivate ${employee.employee_fname} ${employee.employee_lname}?`)) {
      try {
        const formData = new FormData();
        formData.append('method', 'deleteEmployee');
        formData.append('json', JSON.stringify({ employee_id: employee.employee_id }));

        const response = await axios.post(APIConn, formData);

        if (response.data.status === 'success') {
          toast.success(response.data.message);
          fetchEmployees();
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast.error('Error deleting employee');
      }
    }
  };

  // Toggle Active/Inactive status
  const handleToggleStatus = async (employee) => {
    const isActive = employee.employee_status === 1 || employee.employee_status === 'Active' || employee.employee_status === true;
    const targetStatus = isActive ? 0 : 1;
    const actionText = isActive ? 'deactivate' : 'activate';

    if (!window.confirm(`Are you sure you want to ${actionText} ${employee.employee_fname} ${employee.employee_lname}?`)) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('method', 'changeEmployeeStatus');
      formData.append('json', JSON.stringify({ employee_id: employee.employee_id, employee_status: targetStatus }));

      const response = await axios.post(APIConn, formData);

      if (response.data.status === 'success') {
        toast.success(response.data.message || (targetStatus === 1 ? 'Employee activated' : 'Employee deactivated'));
        fetchEmployees();
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating employee status:', error);
      toast.error('Error updating employee status');
    }
  };

  // Filter employees based on search term and status filter
  const filteredEmployees = employees
    .filter(employee =>
      employee.employee_fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_lname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.userlevel_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(employee => {
      const isActive = employee.employee_status === 1 || employee.employee_status === 'Active' || employee.employee_status === true;
      return statusFilter === 'active' ? isActive : true;
    });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />
      <div className="ml-72 p-4 sm:p-6 space-y-6 max-w-7xl">
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#34699a]/10 dark:bg-[#34699a]/20 rounded-lg">
                <Users className="h-6 w-6 text-[#34699a] dark:text-[#34699a]" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold">Employee Management</CardTitle>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  Manage employees and administrators
                </p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-[#34699a] hover:bg-[#2a5580] text-white"
                  onClick={() => {
                    setEditingEmployee(null);
                    form.reset({
                      employee_fname: "",
                      employee_lname: "",
                      employee_username: "",
                      employee_phone: "",
                      employee_email: "",
                      employee_password: "",
                      employee_address: "",
                      employee_birthdate: "",
                      employee_gender: ""
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
                <DialogHeader>
                  <DialogTitle>
                    {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingEmployee ? 'Update employee information' : 'Fill in the details to add a new employee'}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="employee_fname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter first name (letters only)" 
                                {...field}
                                maxLength={50}
                                pattern="[a-zA-Z\s]+"
                                onInput={(e) => {
                                  e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="employee_lname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter last name (letters only)" 
                                {...field}
                                maxLength={50}
                                pattern="[a-zA-Z\s]+"
                                onInput={(e) => {
                                  e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="employee_username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter username (letters, numbers, _ only)" 
                                {...field}
                                maxLength={20}
                                pattern="[a-zA-Z0-9_]+"
                                onInput={(e) => {
                                  e.target.value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="employee_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter phone number (11 digits)" 
                                {...field}
                                maxLength={11}
                                pattern="[0-9]{11}"
                                onInput={(e) => {
                                  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="employee_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Enter email address" 
                              {...field}
                              maxLength={100}
                              onInput={(e) => {
                                e.target.value = e.target.value.toLowerCase();
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employee_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Password * {editingEmployee && <span className="text-sm text-muted-foreground">(leave empty to keep current)</span>}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder={editingEmployee ? "Enter new password (optional)" : "Enter password (min 6 chars, 1 uppercase, 1 lowercase, 1 number)"}
                                {...field}
                                maxLength={50}
                                minLength={6}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employee_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter full address (min 10 characters)" 
                              {...field}
                              maxLength={255}
                              minLength={10}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="employee_birthdate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Birthdate *</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field}
                                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="employee_gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Removed user level dropdown - default to Front-Desk (level 2) for new employees */}

                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-[#34699a] hover:bg-[#2a5580] text-white w-full sm:w-auto">
                        {editingEmployee ? 'Update Employee' : 'Add Employee'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* Confirmation Dialog for New Employee */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Confirm New Employee</DialogTitle>
                  <DialogDescription>
                    Please review the employee information before adding to the system.
                  </DialogDescription>
                </DialogHeader>
                
                {pendingEmployeeData && (
                  <div className="space-y-3 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Name:</span>
                        <p>{pendingEmployeeData.employee_fname} {pendingEmployeeData.employee_lname}</p>
                      </div>
                      <div>
                        <span className="font-medium">Username:</span>
                        <p>{pendingEmployeeData.employee_username}</p>
                      </div>
                      <div>
                        <span className="font-medium">Email:</span>
                        <p>{pendingEmployeeData.employee_email}</p>
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span>
                        <p>{pendingEmployeeData.employee_phone}</p>
                      </div>
                      <div>
                        <span className="font-medium">User Level:</span>
                        <p>{pendingEmployeeData.user_level_name}</p>
                      </div>
                      <div>
                        <span className="font-medium">Gender:</span>
                        <p>{pendingEmployeeData.employee_gender}</p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Address:</span>
                      <p>{pendingEmployeeData.employee_address}</p>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Birthdate:</span>
                      <p>{DateFormatter.formatDateOnly(pendingEmployeeData.employee_birthdate)}</p>
                    </div>
                  </div>
                )}

                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowConfirmDialog(false);
                      setPendingEmployeeData(null);
                    }}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleConfirmAdd}
                    className="bg-[#34699a] hover:bg-[#2a5580] text-white w-full sm:w-auto"
                  >
                    Confirm & Add Employee
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <div className="w-full sm:w-[220px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active only</SelectItem>
                  <SelectItem value="all">Include inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Employees Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#34699a]"></div>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>User Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No employees found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <TableRow key={employee.employee_id}>
                        <TableCell className="font-medium">
                          {employee.employee_fname} {employee.employee_lname}
                        </TableCell>
                        <TableCell>{employee.employee_username}</TableCell>
                        <TableCell>{employee.employee_email}</TableCell>
                        <TableCell>{employee.employee_phone}</TableCell>
                        <TableCell>
                          <Badge variant={employee.userlevel_name === 'Admin' ? 'default' : 'secondary'}>
                            {employee.userlevel_name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const isActive = employee.employee_status === 1 || employee.employee_status === 'Active' || employee.employee_status === true;
                            const label = isActive ? 'Active' : 'Inactive';
                            return (
                              <Badge variant={isActive ? 'default' : 'destructive'}>
                                {label}
                              </Badge>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(employee)}
                              className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline ml-1">Edit</span>
                            </Button>
                          {(() => {
                            const isActive = employee.employee_status === 1 || employee.employee_status === 'Active' || employee.employee_status === true;
                            return (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(employee)}
                                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                              >
                                {isActive ? (
                                  <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                                ) : (
                                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                )}
                                <span className="hidden sm:inline ml-1">{isActive ? 'Deactivate' : 'Activate'}</span>
                              </Button>
                            );
                          })()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export default EmployeeManagement;
